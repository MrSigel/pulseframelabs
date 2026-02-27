import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${siteUrl}/bot?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${siteUrl}/bot?error=missing_params`);
  }

  // Verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/login`);
  }

  // Verify state matches user ID
  const stateUserId = Buffer.from(state, "base64url").toString();
  if (stateUserId !== user.id) {
    return NextResponse.redirect(`${siteUrl}/bot?error=state_mismatch`);
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${siteUrl}/bot?error=server_config`);
  }

  const redirectUri = `${siteUrl}/api/twitch/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Twitch token exchange failed:", errBody);
      return NextResponse.redirect(`${siteUrl}/bot?error=token_exchange`);
    }

    const tokens = await tokenRes.json();

    // Fetch Twitch user info
    const userRes = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Client-Id": clientId,
      },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${siteUrl}/bot?error=user_fetch`);
    }

    const userData = await userRes.json();
    const twitchUser = userData.data?.[0];

    if (!twitchUser) {
      return NextResponse.redirect(`${siteUrl}/bot?error=no_twitch_user`);
    }

    // Upsert twitch_connections
    const { error: dbError } = await supabase
      .from("twitch_connections")
      .upsert({
        user_id: user.id,
        twitch_user_id: twitchUser.id,
        twitch_username: twitchUser.login,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scopes: tokens.scope || [],
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (dbError) {
      console.error("Failed to save Twitch connection:", dbError);
      return NextResponse.redirect(`${siteUrl}/bot?error=db_save`);
    }

    return NextResponse.redirect(`${siteUrl}/bot?connected=true`);
  } catch (err) {
    console.error("Twitch callback error:", err);
    return NextResponse.redirect(`${siteUrl}/bot?error=unknown`);
  }
}
