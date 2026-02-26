"use client";

import { Suspense } from "react";

function ChatNormalContent() {
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
          <div className="flex gap-2.5 items-start">
            <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] font-bold text-blue-400">V</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-400">Viewer1</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Hello chat!</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] font-bold text-green-400">M</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-green-400">Moderator</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Welcome everyone!</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] font-bold text-purple-400">S</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-purple-400">Subscriber</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Let&apos;s go!</p>
            </div>
          </div>
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
