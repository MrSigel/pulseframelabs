"use client";

import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import type { ChatMessage } from "@/lib/supabase/types";

const roleTextColor: Record<string, string> = {
  viewer: "text-blue-400",
  moderator: "text-green-400",
  subscriber: "text-purple-400",
};

const fallbackMessages = [
  { username: "Viewer1", user_role: "viewer" as const, message: "Hello chat!" },
  { username: "Mod",     user_role: "moderator" as const, message: "Welcome!" },
];

function ChatSmallContent() {
  const uid = useOverlayUid();

  /* ---- Supabase realtime data ---- */
  const { data: messages } = useOverlayData<ChatMessage[]>({
    table: "chat_messages",
    userId: uid,
    orderBy: "sent_at",
    ascending: false,
  });

  /* ---- Resolve: Supabase (last 10, reversed to chronological) or fallback ---- */
  const displayMessages = uid && messages
    ? messages.slice(0, 10).reverse()
    : null;

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          minWidth: "260px",
          maxWidth: "300px",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Chat</span>
        </div>
        <div className="px-3 py-3 space-y-2">
          {displayMessages
            ? displayMessages.map((msg) => (
                <div key={msg.id} className="flex gap-2 items-start">
                  <span className={`text-[10px] font-bold shrink-0 ${roleTextColor[msg.user_role] || roleTextColor.viewer}`}>
                    {msg.username}:
                  </span>
                  <span className="text-[10px] text-slate-400">{msg.message}</span>
                </div>
              ))
            : fallbackMessages.map((msg, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className={`text-[10px] font-bold shrink-0 ${roleTextColor[msg.user_role] || roleTextColor.viewer}`}>
                    {msg.username}:
                  </span>
                  <span className="text-[10px] text-slate-400">{msg.message}</span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatSmallOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <ChatSmallContent />
      </Suspense>
    </div>
  );
}
