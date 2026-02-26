"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TournamentBracketContent() {
  const params = useSearchParams();
  const title = params.get("title") || "TOURNAMENT";
  const participants = parseInt(params.get("participants") || "8");

  const rounds = Math.ceil(Math.log2(participants));
  const slots = Array.from({ length: participants }, (_, i) => `Player ${i + 1}`);

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
          minWidth: "500px",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span
              className="font-bold text-sm"
              style={{
                background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {title}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            {participants} Players · {rounds} Rounds
          </span>
        </div>

        {/* Bracket */}
        <div className="px-5 py-4 flex gap-6 overflow-x-auto">
          {/* Round 1 */}
          <div className="space-y-2 shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block mb-2">Round 1</span>
            {Array.from({ length: Math.floor(participants / 2) }).map((_, i) => (
              <div key={i} className="space-y-0.5">
                <div
                  className="px-3 py-1.5 rounded-t text-[10px] font-semibold text-slate-400 w-28"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {slots[i * 2] || "---"}
                </div>
                <div
                  className="px-3 py-1.5 rounded-b text-[10px] font-semibold text-slate-400 w-28"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {slots[i * 2 + 1] || "---"}
                </div>
              </div>
            ))}
          </div>

          {/* Semis */}
          <div className="space-y-2 shrink-0 pt-4">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block mb-2">Semis</span>
            {Array.from({ length: Math.floor(participants / 4) }).map((_, i) => (
              <div key={i} className="space-y-0.5 mt-3">
                <div
                  className="px-3 py-1.5 rounded-t text-[10px] font-semibold text-slate-500 w-28"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  ---
                </div>
                <div
                  className="px-3 py-1.5 rounded-b text-[10px] font-semibold text-slate-500 w-28"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  ---
                </div>
              </div>
            ))}
          </div>

          {/* Final */}
          <div className="shrink-0 pt-10">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block mb-2">Final</span>
            <div className="space-y-0.5 mt-3">
              <div
                className="px-3 py-1.5 rounded-t text-[10px] font-semibold text-slate-500 w-28"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                ---
              </div>
              <div
                className="px-3 py-1.5 rounded-b text-[10px] font-semibold text-slate-500 w-28"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                ---
              </div>
            </div>
            <div
              className="mt-3 px-3 py-2 rounded-md text-center"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
            >
              <span className="text-[9px] uppercase tracking-widest text-slate-600 block">Winner</span>
              <span className="text-amber-400 font-bold text-[11px]">---</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TournamentBracketOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <TournamentBracketContent />
      </Suspense>
    </div>
  );
}
