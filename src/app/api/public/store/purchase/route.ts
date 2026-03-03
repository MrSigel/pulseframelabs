import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

/**
 * POST /api/public/store/purchase
 *
 * Allows a viewer to buy a store item using their stream points.
 * Body: { item_id, viewer_username, streamer_user_id, viewer_email? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_id, viewer_username, streamer_user_id, viewer_email } = body;

    if (!item_id || !viewer_username || !streamer_user_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: item_id, viewer_username, streamer_user_id" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const supabase = createAdminClient();

    // 1. Load the item
    const { data: item, error: itemError } = await supabase
      .from("store_items")
      .select("*")
      .eq("id", item_id)
      .eq("user_id", streamer_user_id)
      .eq("visible", true)
      .maybeSingle();

    if (itemError) throw itemError;
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found or not available" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // 2. Check stock
    if (item.quantity_available === 0) {
      return NextResponse.json(
        { success: false, error: "Item is sold out" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 3. Check email required
    if (item.email_required && !viewer_email) {
      return NextResponse.json(
        { success: false, error: "Email is required for this item" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 4. Load the viewer
    const { data: viewer, error: viewerError } = await supabase
      .from("stream_viewers")
      .select("*")
      .eq("user_id", streamer_user_id)
      .ilike("username", viewer_username)
      .maybeSingle();

    if (viewerError) throw viewerError;
    if (!viewer) {
      return NextResponse.json(
        { success: false, error: "Viewer not found. You need to have points before purchasing." },
        { status: 404, headers: corsHeaders() }
      );
    }

    // 5. Check points
    if ((viewer.total_points ?? 0) < item.price_points) {
      return NextResponse.json(
        { success: false, error: `Not enough points. You have ${viewer.total_points ?? 0}, need ${item.price_points}.` },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 6. Check redemption limit
    if (item.redemption_limit && item.redemption_limit > 0) {
      const { count } = await supabase
        .from("store_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("item_id", item_id)
        .ilike("viewer_username", viewer_username);

      if ((count ?? 0) >= item.redemption_limit) {
        return NextResponse.json(
          { success: false, error: "You have reached the redemption limit for this item." },
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    // 7. Check excluded users
    if (item.excluded_users && Array.isArray(item.excluded_users)) {
      const excluded = item.excluded_users.map((u: string) => u.toLowerCase());
      if (excluded.includes(viewer_username.toLowerCase())) {
        return NextResponse.json(
          { success: false, error: "You are not eligible for this item." },
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    // 8. Execute purchase
    // 8a. Deduct points
    const { error: pointsError } = await supabase
      .from("stream_viewers")
      .update({ total_points: (viewer.total_points ?? 0) - item.price_points })
      .eq("id", viewer.id);

    if (pointsError) throw pointsError;

    // 8b. Create redemption
    const { error: redemptionError } = await supabase
      .from("store_redemptions")
      .insert({
        user_id: streamer_user_id,
        item_id: item_id,
        viewer_username: viewer.username,
        viewer_email: viewer_email || null,
        status: "pending",
      });

    if (redemptionError) throw redemptionError;

    // 8c. Log transaction
    await supabase.from("points_transactions").insert({
      user_id: streamer_user_id,
      viewer_id: viewer.id,
      amount: item.price_points,
      reason: `Purchased: ${item.name}`,
      type: "remove",
    });

    // 8d. Decrease quantity (if not unlimited = -1)
    if (item.quantity_available > 0) {
      await supabase
        .from("store_items")
        .update({ quantity_available: item.quantity_available - 1 })
        .eq("id", item_id);
    }

    const remainingPoints = (viewer.total_points ?? 0) - item.price_points;

    return NextResponse.json(
      { success: true, remaining_points: remainingPoints },
      { headers: corsHeaders() }
    );
  } catch (err) {
    console.error("Store purchase error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
