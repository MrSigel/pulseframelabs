import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/public/points?uid=STREAMER_USER_ID&username=VIEWER_NAME
 *
 * Returns the current stream points for a viewer from a specific streamer's channel.
 * Used by external websites to display/check viewer point balances.
 *
 * Response: { points: number, username: string, found: boolean }
 */
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");
  const username = request.nextUrl.searchParams.get("username");

  if (!uid || !username) {
    return NextResponse.json(
      { error: "Missing required parameters: uid, username", found: false },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("stream_viewers")
      .select("total_points, username")
      .eq("user_id", uid)
      .ilike("username", username)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { points: 0, username, found: false },
        { headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { points: data.total_points ?? 0, username: data.username, found: true },
      { headers: corsHeaders() }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error", found: false }, { status: 500 });
  }
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "no-store",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}
