import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { getCampaigns } from "@/lib/royal-partners";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const campaigns = await getCampaigns();
    return NextResponse.json({ campaigns });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch campaigns";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
