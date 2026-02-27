import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // Get current connection
  const { data: connection, error: fetchErr } = await supabase
    .from("twitch_connections")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr || !connection) {
    return NextResponse.json({ error: "No Twitch connection found" }, { status: 404 });
  }

  try {
    // Refresh the token
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: connection.refresh_token,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Twitch token refresh failed:", errBody);
      return NextResponse.json({ error: "Token refresh failed" }, { status: 502 });
    }

    const tokens = await tokenRes.json();

    // Update stored tokens
    const { error: updateErr } = await supabase
      .from("twitch_connections")
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateErr) {
      console.error("Failed to update tokens:", updateErr);
      return NextResponse.json({ error: "Failed to save new tokens" }, { status: 500 });
    }

    return NextResponse.json({
      access_token: tokens.access_token,
      twitch_username: connection.twitch_username,
    });
  } catch (err) {
    console.error("Token refresh error:", err);
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
