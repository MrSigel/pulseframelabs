import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { getReport } from "@/lib/royal-partners";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const date_from = searchParams.get("date_from") ?? "";
  const date_to = searchParams.get("date_to") ?? "";
  const group_by = (searchParams.get("group_by") as "day" | "week" | "month" | "campaign") || "day";
  const campaign_id = searchParams.get("campaign_id") ?? undefined;

  if (!date_from || !date_to) {
    return NextResponse.json({ error: "date_from and date_to are required" }, { status: 400 });
  }

  try {
    const report = await getReport({ date_from, date_to, group_by, campaign_id });
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
