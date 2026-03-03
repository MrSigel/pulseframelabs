import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(req: NextRequest) {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json({ error: "Chat not configured" }, { status: 503 });
    }

    const { name, email, message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const text = [
      "📩 *New Support Message*",
      "",
      `👤 *Name:* ${name || "Anonymous"}`,
      email ? `📧 *Email:* ${email}` : "",
      "",
      `💬 *Message:*`,
      message.trim(),
      "",
      `🕐 *Time:* ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`,
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Chat send error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
