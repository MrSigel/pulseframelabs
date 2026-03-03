import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const after = searchParams.get("after");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    let query = admin
      .from("live_chat_messages")
      .select("id, sender, message, created_at")
      .eq("session_id", sessionId)
      .eq("sender", "support")
      .order("created_at", { ascending: true })
      .limit(50);

    if (after) {
      query = query.gt("created_at", after);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Poll query error:", error);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
  } catch (err) {
    console.error("Poll error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
