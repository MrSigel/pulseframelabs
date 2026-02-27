import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Get all user profiles with wallet and subscription data
  const { data: profiles, error: profilesError } = await admin
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  // Get all wallets
  const { data: wallets } = await admin.from("wallets").select("*");

  // Get all active subscriptions
  const { data: subscriptions } = await admin
    .from("user_subscriptions")
    .select("*, packages(*)")
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString());

  // Get auth users for email info
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authUsers = authData?.users ?? [];

  // Merge data
  const users = (profiles ?? []).map((profile) => {
    const authUser = authUsers.find((u) => u.id === profile.user_id);
    const userWallet = (wallets ?? []).find((w) => w.user_id === profile.user_id);
    const userSub = (subscriptions ?? []).find((s) => s.user_id === profile.user_id);

    return {
      ...profile,
      email: authUser?.email ?? null,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      wallet: userWallet ?? null,
      subscription: userSub ?? null,
    };
  });

  return NextResponse.json({ users });
}
