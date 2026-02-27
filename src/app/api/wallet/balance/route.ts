import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data: wallet, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) throw error;

    // Also get active subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*, packages(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ wallet, subscription });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch balance" },
      { status: 500 }
    );
  }
}
