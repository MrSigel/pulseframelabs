import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Extract session_id from a Telegram message formatted by /api/chat/send.
 * Telegram strips Markdown syntax from reply_to_message.text, so the text
 * contains "Session: <uuid>" without asterisks or backticks.
 * We match the UUID pattern directly after "Session".
 */
function extractSessionId(text: string): string | null {
  const match = text.match(
    /Session[:\s*`]*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  );
  return match?.[1] || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    // Only process replies (admin must use "Reply" in Telegram)
    const replyTo = message.reply_to_message;
    if (!replyTo?.text) {
      return NextResponse.json({ ok: true });
    }

    // Only accept messages from the configured chat
    if (String(message.chat?.id) !== TELEGRAM_CHAT_ID) {
      return NextResponse.json({ ok: true });
    }

    // Don't process bot's own messages
    if (message.from?.is_bot) {
      return NextResponse.json({ ok: true });
    }

    // Extract session_id from the original message
    const sessionId = extractSessionId(replyTo.text);
    if (!sessionId) {
      return NextResponse.json({ ok: true });
    }

    const replyText = message.text?.trim();
    if (!replyText) {
      return NextResponse.json({ ok: true });
    }

    const admin = createAdminClient();

    const { error } = await admin.from("live_chat_messages").insert({
      session_id: sessionId,
      sender: "support",
      message: replyText,
      telegram_message_id: message.message_id,
    });

    if (error) {
      console.error("Webhook DB insert error:", error);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    // Always return 200 to prevent Telegram retries
    return NextResponse.json({ ok: true });
  }
}
