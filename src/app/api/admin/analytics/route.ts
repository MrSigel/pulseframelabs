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
  const group_by_raw = searchParams.get("group_by") || "day";
  const campaign_id = searchParams.get("campaign_id") ?? undefined;

  if (!date_from || !date_to) {
    return NextResponse.json({ error: "date_from and date_to are required" }, { status: 400 });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRe.test(date_from) || !dateRe.test(date_to)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
  }

  // Validate group_by
  const validGroupBy = ["day", "week", "month", "campaign"] as const;
  if (!validGroupBy.includes(group_by_raw as typeof validGroupBy[number])) {
    return NextResponse.json({ error: "Invalid group_by value" }, { status: 400 });
  }
  const group_by = group_by_raw as typeof validGroupBy[number];

  try {
    const report = await getReport({ date_from, date_to, group_by, campaign_id });
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
