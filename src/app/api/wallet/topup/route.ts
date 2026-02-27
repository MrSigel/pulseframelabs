import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaymentAddress, convertToCrypto, getReceivingAddress, getQRCode } from "@/lib/cryptapi";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { amount, coin } = body;

    if (!amount || typeof amount !== "number" || amount < 5) {
      return NextResponse.json({ error: "Minimum top-up is 5 credits (5 EUR)" }, { status: 400 });
    }
    if (!coin || typeof coin !== "string") {
      return NextResponse.json({ error: "Invalid coin" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const webhookSecret = process.env.CRYPTAPI_WEBHOOK_SECRET;
    const addressOut = getReceivingAddress(coin);

    // Create payment_request row first to get its ID
    const { data: paymentReq, error: insertError } = await supabase
      .from("payment_requests")
      .insert({
        user_id: user.id,
        coin,
        amount_fiat: amount,
        address_out: addressOut,
        callback_url: `${siteUrl}/api/cryptapi/webhook`,
        credits_to_add: amount,
        status: "pending",
        metadata: {},
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Build callback URL with payment request ID and secret
    const callbackUrl = `${siteUrl}/api/cryptapi/webhook?payment_id=${paymentReq.id}&secret=${webhookSecret}`;

    // Create CryptAPI address
    const cryptapiResp = await createPaymentAddress(coin, addressOut, callbackUrl);

    // Convert EUR to crypto amount
    const cryptoAmount = await convertToCrypto(coin, amount);

    // Get QR code
    const qrResp = await getQRCode(coin, cryptapiResp.address_in, cryptoAmount);

    // Update payment request with address_in and crypto amount
    await supabase
      .from("payment_requests")
      .update({
        address_in: cryptapiResp.address_in,
        amount_crypto: cryptoAmount,
        callback_url: callbackUrl,
      })
      .eq("id", paymentReq.id);

    return NextResponse.json({
      payment_id: paymentReq.id,
      address_in: cryptapiResp.address_in,
      amount_crypto: cryptoAmount,
      amount_fiat: amount,
      coin,
      qr_code: qrResp.qr_code,
      payment_uri: qrResp.payment_uri,
    });
  } catch (err) {
    console.error("Topup error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Top-up failed" },
      { status: 500 }
    );
  }
}
