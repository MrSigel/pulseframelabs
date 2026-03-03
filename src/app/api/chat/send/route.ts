import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(req: NextRequest) {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json({ error: "Chat not configured" }, { status: 503 });
    }

    const { name, email, message, sessionId } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Save visitor message to database
    try {
      const admin = createAdminClient();
      await admin.from("live_chat_messages").insert({
        session_id: sessionId,
        sender: "visitor",
        message: message.trim(),
        visitor_name: name || null,
        visitor_email: email || null,
      });
    } catch {
      // Continue even if DB save fails
    }

    // Format message for Telegram — include session_id for reply tracking
    const text = [
      "\u{1f4e9} *New Support Message*",
      "",
      `\u{1f4cb} *Session:* \`${sessionId}\``,
      `\u{1f464} *Name:* ${name || "Anonymous"}`,
      email ? `\u{1f4e7} *Email:* ${email}` : "",
      "",
      `\u{1f4ac} *Message:*`,
      message.trim(),
      "",
      `\u{1f550} *Time:* ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!res.ok) {
      console.error("Telegram API error:", await res.text());
      return NextResponse.json({ error: "Failed to send message" }, { status: 502 });
    }

    // Store telegram_message_id for reference
    try {
      const telegramResponse = await res.json();
      const telegramMessageId = telegramResponse?.result?.message_id;
      if (telegramMessageId) {
        const admin = createAdminClient();
        await admin
          .from("live_chat_messages")
          .update({ telegram_message_id: telegramMessageId })
          .eq("session_id", sessionId)
          .eq("sender", "visitor")
          .is("telegram_message_id", null)
          .order("created_at", { ascending: false })
          .limit(1);
      }
    } catch {
      // Non-critical — ignore
    }

    return NextResponse.json({ success: true, sessionId });
  } catch (err) {
    console.error("Chat send error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
