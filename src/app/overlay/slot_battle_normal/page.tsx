"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SlotBattleContent() {
  const params = useSearchParams();
  const title = params.get("title") || "SLOT BATTLE";
  const bonus = params.get("bonus") || "0/0";
  const start = params.get("start") || "0$";

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
          minWidth: "360px",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-2 text-center">
          <span
            className="font-black text-base tracking-wider"
            style={{
              background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          >
            {title}
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] font-bold text-slate-400">BONUS <span className="text-white">{bonus}</span></span>
            <span className="text-[10px] font-bold text-slate-400">START <span className="text-white">{start}</span></span>
          </div>
        </div>

        {/* VS Section */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Player 1 */}
            <div
              className="flex-1 rounded-lg px-3 py-2.5 flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-xs block">Slot</span>
                <span className="text-[9px] text-slate-500">Sub</span>
                <span className="text-[9px] text-slate-500 block">Provider</span>
              </div>
            </div>

            {/* VS */}
            <span className="text-slate-600 font-black text-sm shrink-0">VS</span>

            {/* Player 2 */}
            <div
              className="flex-1 rounded-lg px-3 py-2.5 flex items-center gap-2 justify-end"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.04), rgba(16,185,129,0.12))",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <div className="text-right">
                <span className="text-white font-bold text-xs block">Slot</span>
                <span className="text-[9px] text-slate-500">Sub</span>
                <span className="text-[9px] text-slate-500 block">Provider</span>
              </div>
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Table */}
        <div className="px-4 pb-3">
          {[
            { left: "0/0", label: "# BONUS", right: "0/0" },
            { left: "0$", label: "COST", right: "0$" },
            { left: "0$", label: "BEST WIN", right: "0$" },
            { left: "0X", label: "BEST X", right: "0X" },
            { left: "0.00", label: "SCORE", right: "0.00", highlight: true },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3"
              style={{
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.03)",
                background: row.highlight ? "rgba(255,255,255,0.02)" : "transparent",
              }}
            >
              <span className={`text-xs font-bold ${row.highlight ? "text-blue-400" : "text-white"}`}>{row.left}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{row.label}</span>
              <span className={`text-xs font-bold ${row.highlight ? "text-green-400" : "text-white"}`}>{row.right}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-[8px] uppercase tracking-widest text-slate-600">
            SCORE = OVERALL PAYBACK / (BUY AMOUNT x COST)
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SlotBattleNormalOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <SlotBattleContent />
      </Suspense>
    </div>
  );
}
