import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const username = new URL(request.url).searchParams.get("username");
  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: connection } = await supabase
    .from("twitch_connections")
    .select("access_token")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!connection?.access_token) {
    return NextResponse.json({ profile_image_url: null });
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ profile_image_url: null });
  }

  try {
    const res = await fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(username)}`,
      {
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
          "Client-Id": clientId,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ profile_image_url: null });
    }

    const data = await res.json();
    const profileImageUrl = data?.data?.[0]?.profile_image_url || null;
    return NextResponse.json({ profile_image_url: profileImageUrl });
  } catch {
    return NextResponse.json({ profile_image_url: null });
  }
}
