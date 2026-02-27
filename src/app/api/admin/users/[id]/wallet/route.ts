import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

// POST — Credit or debit a user's wallet
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
  const { action, amount, description } = body;

  if (!action || !["credit", "debit"].includes(action)) {
    return NextResponse.json({ error: "action must be 'credit' or 'debit'" }, { status: 400 });
  }

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
  }

  const admin = createAdminClient();

  const rpcName = action === "credit" ? "admin_credit_wallet" : "admin_debit_wallet";
  const { error } = await admin.rpc(rpcName, {
    p_admin_id: user.id,
    p_target_user_id: targetUserId,
    p_amount: Math.floor(amount),
    p_description: description || `Admin ${action}`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
