import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "TWITCH_CLIENT_ID not configured" }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectUri = `${siteUrl}/api/twitch/callback`;
  const scopes = "chat:read chat:edit channel:read:subscriptions";

  // Use user ID as state for CSRF protection
  const state = Buffer.from(user.id).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    state,
    force_verify: "true",
  });

  return NextResponse.redirect(`https://id.twitch.tv/oauth2/authorize?${params.toString()}`);
}
