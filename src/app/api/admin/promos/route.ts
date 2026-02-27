import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { getPromos } from "@/lib/royal-partners";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaign_id") ?? undefined;

  try {
    const promos = await getPromos(campaignId);
    return NextResponse.json({ promos });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch promos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
