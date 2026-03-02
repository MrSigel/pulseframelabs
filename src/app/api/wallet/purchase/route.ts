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

    // Check if user already has an active subscription (needed for extension calc)
    const { data: existingSub } = await admin
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // DEBIT FIRST (atomic — debit_wallet checks balance with FOR UPDATE lock)
    const { error: debitError } = await admin.rpc("debit_wallet", {
      p_user_id: user.id,
      p_amount: pkg.price_credits,
      p_description: `Purchased ${pkg.name} package`,
      p_reference_id: null,
    });

    if (debitError) {
      // debit_wallet raises exception if insufficient balance
      const msg = debitError.message || "Debit failed";
      if (msg.includes("Insufficient")) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
      }
      throw debitError;
    }

    // If user has active subscription, extend from its expiry
    const startsAt = existingSub
      ? new Date(existingSub.expires_at)
      : new Date();
    const expiresAt = new Date(startsAt.getTime() + pkg.duration_days * 24 * 60 * 60 * 1000);

    // Create subscription (debit already succeeded)
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

    if (subError) {
      // Refund credits if subscription creation fails
      await admin.rpc("credit_wallet", {
        p_user_id: user.id,
        p_amount: pkg.price_credits,
        p_description: `Refund: subscription creation failed for ${pkg.name}`,
        p_reference_id: null,
      });
      throw subError;
    }

    // Get updated balance
    const { data: updatedWallet } = await admin
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      subscription: newSub,
      package: pkg,
      new_balance: updatedWallet?.balance ?? 0,
    });
  } catch (err) {
    console.error("Purchase error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Purchase failed" },
      { status: 500 }
    );
  }
}
