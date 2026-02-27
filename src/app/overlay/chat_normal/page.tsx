"use client";

import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import type { ChatMessage } from "@/lib/supabase/types";

const roleColor: Record<string, { text: string; bg: string; letter: string }> = {
  viewer:     { text: "text-blue-400",   bg: "bg-blue-500/20",   letter: "V" },
  moderator:  { text: "text-green-400",  bg: "bg-green-500/20",  letter: "M" },
  subscriber: { text: "text-purple-400", bg: "bg-purple-500/20", letter: "S" },
};

const fallbackMessages = [
  { username: "Viewer1",    user_role: "viewer"     as const, message: "Hello chat!" },
  { username: "Moderator",  user_role: "moderator"  as const, message: "Welcome everyone!" },
  { username: "Subscriber", user_role: "subscriber" as const, message: "Let\u2019s go!" },
];

function ChatNormalContent() {
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
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
          minWidth: "340px",
          maxWidth: "400px",
        }}
      >
        <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
          <span className="text-xs font-bold text-white uppercase tracking-wider">Live Chat</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] text-slate-500 font-semibold">LIVE</span>
          </div>
        </div>
        <div className="px-4 py-3 space-y-3 min-h-[180px]">
          {displayMessages
            ? displayMessages.map((msg) => {
                const rc = roleColor[msg.user_role] || roleColor.viewer;
                return (
                  <div key={msg.id} className="flex gap-2.5 items-start">
                    <div className={`h-5 w-5 rounded-full ${rc.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className={`text-[8px] font-bold ${rc.text}`}>{rc.letter}</span>
                    </div>
                    <div>
                      <span className={`text-[11px] font-bold ${rc.text}`}>{msg.username}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{msg.message}</p>
                    </div>
                  </div>
                );
              })
            : fallbackMessages.map((msg, i) => {
                const rc = roleColor[msg.user_role] || roleColor.viewer;
                return (
                  <div key={i} className="flex gap-2.5 items-start">
                    <div className={`h-5 w-5 rounded-full ${rc.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className={`text-[8px] font-bold ${rc.text}`}>{rc.letter}</span>
                    </div>
                    <div>
                      <span className={`text-[11px] font-bold ${rc.text}`}>{msg.username}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

export default function ChatNormalOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <ChatNormalContent />
      </Suspense>
    </div>
  );
}
