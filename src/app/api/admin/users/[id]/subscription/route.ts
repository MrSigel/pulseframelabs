import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

// POST — Assign a package to a user (create subscription without deducting credits)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: targetUserId } = await params;
  const body = await request.json();
  const { package_id } = body;

  if (!package_id) {
    return NextResponse.json({ error: "package_id is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get the package
  const { data: pkg, error: pkgError } = await admin
    .from("packages")
    .select("*")
    .eq("id", package_id)
    .single();

  if (pkgError || !pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  // Check for existing active subscription and extend
  const { data: activeSub } = await admin
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", targetUserId)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const startsAt = activeSub
    ? new Date(activeSub.expires_at)
    : new Date();

  const expiresAt = new Date(startsAt);
  expiresAt.setDate(expiresAt.getDate() + pkg.duration_days);

  const { data: sub, error: subError } = await admin
    .from("user_subscriptions")
    .insert({
      user_id: targetUserId,
      package_id: pkg.id,
      status: "active",
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  // Audit log
  await admin.from("admin_audit_logs").insert({
    admin_user_id: user.id,
    action: "assign_package",
    target_user_id: targetUserId,
    details: {
      package_id: pkg.id,
      package_name: pkg.name,
      duration_days: pkg.duration_days,
      expires_at: expiresAt.toISOString(),
    },
  });

  return NextResponse.json({ subscription: sub });
}
