import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/overlay/check-access?uid=<user_id>
 * Returns { allowed: true } if the user has an active, non-expired subscription.
 * Used by overlay pages to verify the user's subscription before rendering data.
 */
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ allowed: false }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("id, status, expires_at")
      .eq("user_id", uid)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();

    const allowed = !!subscription;

    return NextResponse.json(
      { allowed },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      },
    );
  } catch {
    return NextResponse.json({ allowed: false }, { status: 500 });
  }
}
