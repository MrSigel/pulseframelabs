import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { package_id } = body;

    if (!package_id) {
      return NextResponse.json({ error: "Missing package_id" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Get the package
    const { data: pkg, error: pkgError } = await admin
      .from("packages")
      .select("*")
      .eq("id", package_id)
      .eq("is_active", true)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Check wallet balance
    const { data: walletData, error: walletError } = await admin
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (walletError || !walletData) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (walletData.balance < pkg.price_credits) {
      return NextResponse.json({
        error: "Insufficient credits",
        balance: walletData.balance,
        required: pkg.price_credits,
      }, { status: 400 });
    }

    // Check if user already has an active subscription
    const { data: existingSub } = await admin
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // If user has active subscription, extend from its expiry
    const startsAt = existingSub
      ? new Date(existingSub.expires_at)
      : new Date();
    const expiresAt = new Date(startsAt.getTime() + pkg.duration_days * 24 * 60 * 60 * 1000);

    // Create subscription
    const { data: newSub, error: subError } = await admin
      .from("user_subscriptions")
      .insert({
        user_id: user.id,
        package_id: pkg.id,
        status: "active",
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (subError) throw subError;

    // Debit wallet atomically via RPC function
    const { error: debitError } = await admin.rpc("debit_wallet", {
      p_user_id: user.id,
      p_amount: pkg.price_credits,
      p_description: `Purchased ${pkg.name} package`,
      p_reference_id: newSub.id,
    });

    if (debitError) {
      // Rollback subscription if debit fails
      await admin.from("user_subscriptions").delete().eq("id", newSub.id);
      throw debitError;
    }

    return NextResponse.json({
      subscription: newSub,
      package: pkg,
      new_balance: walletData.balance - pkg.price_credits,
    });
  } catch (err) {
    console.error("Purchase error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Purchase failed" },
      { status: 500 }
    );
  }
}
