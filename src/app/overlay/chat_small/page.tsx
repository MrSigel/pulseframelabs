"use client";

import { Suspense } from "react";

function ChatSmallContent() {
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
          <div className="flex gap-2 items-start">
            <span className="text-[10px] font-bold text-blue-400 shrink-0">Viewer1:</span>
            <span className="text-[10px] text-slate-400">Hello chat!</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-[10px] font-bold text-green-400 shrink-0">Mod:</span>
            <span className="text-[10px] text-slate-400">Welcome!</span>
          </div>
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
