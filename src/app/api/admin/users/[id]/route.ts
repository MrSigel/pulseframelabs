import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

// PATCH — Lock/unlock user, edit profile fields
export async function PATCH(
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

  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  // Build update object from allowed fields
  const updates: Record<string, unknown> = {};

  if (typeof body.is_locked === "boolean") {
    updates.is_locked = body.is_locked;
    updates.locked_at = body.is_locked ? new Date().toISOString() : null;
    updates.locked_reason = body.is_locked ? (body.locked_reason ?? null) : null;
  }

  if (body.display_name !== undefined) {
    updates.display_name = body.display_name;
  }

  if (body.ip_whitelist !== undefined) {
    updates.ip_whitelist = body.ip_whitelist;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await admin
    .from("user_profiles")
    .update(updates)
    .eq("user_id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit log
  const action = body.is_locked === true
    ? "lock_user"
    : body.is_locked === false
      ? "unlock_user"
      : "edit_user";

  await admin.from("admin_audit_logs").insert({
    admin_user_id: user.id,
    action,
    target_user_id: id,
    details: updates,
  });

  return NextResponse.json({ user: data });
}

// DELETE — Delete user (auth + profile)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  // Audit log first (before deletion)
  await admin.from("admin_audit_logs").insert({
    admin_user_id: user.id,
    action: "delete_user",
    target_user_id: id,
    details: {},
  });

  // Delete auth user (cascades profile via trigger/FK)
  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
