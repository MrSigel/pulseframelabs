import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error) throw error;
    return NextResponse.json({ packages: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
