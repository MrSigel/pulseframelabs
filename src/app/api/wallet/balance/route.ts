import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    let { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Auto-create wallet if it doesn't exist
    if (!wallet) {
      const { data: newWallet, error: insertError } = await supabase
        .from("wallets")
        .insert({ user_id: user.id, balance: 0, total_deposited: 0, total_spent: 0 })
        .select()
        .single();
      if (insertError) throw insertError;
      wallet = newWallet;
    }

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
