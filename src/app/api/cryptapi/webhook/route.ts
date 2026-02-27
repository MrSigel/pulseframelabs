import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  return handleWebhook(request);
}

export async function GET(request: NextRequest) {
  return handleWebhook(request);
}

async function handleWebhook(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const paymentId = url.searchParams.get("payment_id");
    const secret = url.searchParams.get("secret");

    // Validate secret
    const expectedSecret = process.env.CRYPTAPI_WEBHOOK_SECRET;
    if (!secret || secret !== expectedSecret) {
      return new NextResponse("*ok*", { status: 200 });
    }

    if (!paymentId) {
      return new NextResponse("*ok*", { status: 200 });
    }

    // Parse CryptAPI callback params
    const txid = url.searchParams.get("txid_in") || "";
    const confirmations = parseInt(url.searchParams.get("confirmations") || "0", 10);
    const pending = url.searchParams.get("pending") === "1";

    const admin = createAdminClient();

    // Get the payment request
    const { data: payment, error: fetchError } = await admin
      .from("payment_requests")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (fetchError || !payment) {
      return new NextResponse("*ok*", { status: 200 });
    }

    // If already completed, skip
    if (payment.status === "completed") {
      return new NextResponse("*ok*", { status: 200 });
    }

    if (pending) {
      // Payment detected but not confirmed yet
      await admin
        .from("payment_requests")
        .update({
          status: "confirming",
          txid,
          confirmations,
        })
        .eq("id", paymentId);

      return new NextResponse("*ok*", { status: 200 });
    }

    // Payment is confirmed — credit the wallet
    await admin
      .from("payment_requests")
      .update({
        status: "completed",
        txid,
        confirmations,
      })
      .eq("id", paymentId);

    // Credit wallet atomically
    const { error: creditError } = await admin.rpc("credit_wallet", {
      p_user_id: payment.user_id,
      p_amount: payment.credits_to_add,
      p_description: `Crypto top-up via ${payment.coin} (${payment.amount_fiat} EUR)`,
      p_reference_id: payment.id,
    });

    if (creditError) {
      console.error("Credit wallet error:", creditError);
      await admin
        .from("payment_requests")
        .update({ status: "failed", metadata: { error: creditError.message } })
        .eq("id", paymentId);
    }

    return new NextResponse("*ok*", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new NextResponse("*ok*", { status: 200 });
  }
}
