"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RevealText from '@/components/landing/ui/RevealText';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   EXACT 1:1 copies of the real overlay visual components,
   hard-coded with demo data. Each overlay keeps its original
   Tailwind classes + inline styles from the overlay pages.
   ================================================================ */

// ── 1. Balance Normal ───────────────────────────────────
function BalanceOverlay() {
  return (
    <div className="inline-block w-full">
      <div
        className="rounded-lg overflow-hidden space-y-2"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
          padding: "12px 18px",
        }}
      >
        {/* Deposits */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold"
            style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.25)" }}
          >
            +
          </div>
          <span className="text-white font-bold text-base">$12,500</span>
        </div>
        {/* Withdrawals */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold"
            style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
          >
            &minus;
          </div>
          <span className="text-white font-bold text-base">$4,200</span>
        </div>
        {/* Balance / LeftOver */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold"
            style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", border: "1px solid rgba(139, 92, 246, 0.25)" }}
          >
            &#8645;
          </div>
          <span className="text-white font-bold text-base">$8,300</span>
        </div>
      </div>
    </div>
  );
}

// ── 2. Wager Bar Normal ─────────────────────────────────
function WagerBarOverlay() {
  const pct = 63.6;
  return (
    <div className="inline-block w-full">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0c1018 0%, #111827 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-2.5 flex items-center justify-center"
          style={{
            background: "linear-gradient(90deg, rgba(239,68,68,0.08), rgba(239,68,68,0.18), rgba(239,68,68,0.08))",
            borderBottom: "1px solid rgba(239, 68, 68, 0.12)",
          }}
        >
          <span
            className="font-bold text-sm tracking-[0.15em]"
            style={{
              background: "linear-gradient(90deg, #fca5a5, #ffffff, #fca5a5)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
            }}
          >
            PULSEFRAMELABS.COM
          </span>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Wager progress */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <span
                className="font-bold text-sm px-3 py-1 rounded"
                style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}
              >
                $31,800 / $50,000
              </span>
              <span
                className="font-semibold text-sm px-2.5 py-1 rounded"
                style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}
              >
                {pct.toFixed(1)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div
                className="h-full rounded-full relative"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #ef4444, #f97316, #eab308)",
                  transition: "width 1.5s ease-in-out",
                }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s linear infinite",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="rounded-lg p-3 space-y-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium" style={{ color: "#64748b" }}>TOTAL</span>
              <span className="text-white font-semibold">$50,000</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "#64748b" }}>WEBSITE: <span className="font-semibold text-blue-400">STAKE.COM</span></span>
              <span style={{ color: "#64748b" }}>LEFT: <span className="text-amber-400 font-semibold">$18,200</span></span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "#64748b" }}>START: <span className="text-emerald-400 font-semibold">$5,000</span></span>
              <span style={{ color: "#64748b" }}>WAGERED: <span className="text-red-400 font-semibold">$31,800</span></span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center pt-1">
            <span className="text-[9px] tracking-[0.12em] font-medium uppercase" style={{ color: "rgba(100, 116, 139, 0.4)" }}>
              Powered by Pulseframelabs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 3. Bonushunt Large ──────────────────────────────────
function BonushuntOverlay() {
  return (
    <div className="inline-block w-full">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm block" style={{ background: "linear-gradient(90deg, #ef4444, #f97316, #ef4444)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>
                Bonus Hunt #5
              </span>
              <span className="text-[10px] font-semibold text-slate-500">HUNT #A7B</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
              3/12
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          {[
            { icon: "grid", value: "$2.5K" },
            { icon: "play", value: "$5,000" },
            { icon: "chart", value: "187.0X+" },
            { icon: "x", value: "42.5X" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-2.5 gap-1" style={{ background: "linear-gradient(180deg, rgba(15,21,33,0.8) 0%, rgba(12,16,24,0.9) 100%)" }}>
              <div style={{ color: "#ef4444" }}>
                {stat.icon === "grid" && <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>}
                {stat.icon === "play" && <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
                {stat.icon === "chart" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
                {stat.icon === "x" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
              </div>
              <span className="text-white font-bold text-xs">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="px-4 py-3 space-y-1.5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z" />
            </svg>
            <span className="text-slate-400 text-xs font-semibold">Sweet Bonanza — 187.0X</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
              <path d="M12 2C8 6 4 9.5 4 13a8 8 0 0016 0c0-3.5-4-7-8-11z" />
            </svg>
            <span className="text-slate-400 text-xs font-semibold">Starlight Princess — 8.4X</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 4. Slot Battle Normal ───────────────────────────────
function SlotBattleOverlay() {
  const statsRows = [
    { left: "3/3", label: "# BONUS", right: "3/3" },
    { left: "150$", label: "COST", right: "150$" },
    { left: "847$", label: "BEST WIN", right: "623$" },
    { left: "5.6X", label: "BEST X", right: "4.2X" },
    { left: "3.42", label: "SCORE", right: "2.18", highlight: true },
  ];

  return (
    <div className="inline-block w-full">
      <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)", border: "1px solid rgba(59, 130, 246, 0.15)", boxShadow: "0 4px 32px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div className="px-5 pt-4 pb-2 text-center">
          <span className="font-black text-base tracking-wider" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>
            SLOT BATTLE
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] font-bold text-slate-400">BONUS <span className="text-white">3/3</span></span>
            <span className="text-[10px] font-bold text-slate-400">START <span className="text-white">500$</span></span>
          </div>
        </div>

        {/* VS Section */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-xs block">Sweet Bonanza</span>
                <span className="text-[9px] text-slate-500 block">Pragmatic Play</span>
              </div>
            </div>
            <span className="text-slate-600 font-black text-sm shrink-0">VS</span>
            <div className="flex-1 rounded-lg px-3 py-2.5 flex items-center gap-2 justify-end" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.04), rgba(16,185,129,0.12))", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <div className="text-right">
                <span className="text-white font-bold text-xs block">Gates of Olympus</span>
                <span className="text-[9px] text-slate-500 block">Pragmatic Play</span>
              </div>
              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Table */}
        <div className="px-4 pb-3">
          {statsRows.map((row, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3" style={{ borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.03)", background: row.highlight ? "rgba(255,255,255,0.02)" : "transparent" }}>
              <span className={`text-xs font-bold ${row.highlight ? "text-blue-400" : "text-white"}`}>{row.left}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{row.label}</span>
              <span className={`text-xs font-bold ${row.highlight ? "text-green-400" : "text-white"}`}>{row.right}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-[8px] uppercase tracking-widest text-slate-600">SCORE = OVERALL PAYBACK / (BUY AMOUNT x COST)</span>
        </div>
      </div>
    </div>
  );
}

// ── 5. Tournament Normal ────────────────────────────────
function TournamentOverlay() {
  return (
    <div className="inline-block w-full">
      <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)", border: "1px solid rgba(59, 130, 246, 0.15)", boxShadow: "0 4px 32px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span className="font-black text-base tracking-wide" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>
              VIEWER TOURNAMENT
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">TOURNAMENT FINISHED</span>
        </div>

        {/* Winner Card */}
        <div className="px-5 pb-4">
          <div className="relative rounded-lg overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)", border: "1px solid rgba(239, 68, 68, 0.25)", boxShadow: "0 0 20px rgba(239, 68, 68, 0.1)" }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #78350f, #92400e)", border: "2px solid rgba(245, 158, 11, 0.4)", boxShadow: "0 0 12px rgba(245, 158, 11, 0.2)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                  <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-white font-bold text-sm block">SlotKing99</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">HIGHEST X-FACTOR</span>
              </div>
              <div className="px-2.5 py-1 rounded-md text-xs font-black" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                187X
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-sm font-black tracking-wider" style={{ color: "#10b981" }}>SlotKing99</span>
        </div>
      </div>
    </div>
  );
}

// ── 6. Now Playing Normal ───────────────────────────────
function NowPlayingOverlay() {
  return (
    <div className="inline-block w-full">
      <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)", border: "1px solid rgba(59, 130, 246, 0.2)", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
        <div className="flex items-stretch">
          {/* Game Image placeholder */}
          <div className="w-[100px] shrink-0 relative overflow-hidden">
            <div className="h-full w-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a73e833, #1a73e811)" }}>
              <span className="text-[10px] font-bold text-white/50 text-center px-2">Sweet Bonanza</span>
            </div>
            <div className="absolute inset-y-0 right-0 w-6" style={{ background: "linear-gradient(to right, transparent, #0c1018)" }} />
          </div>

          {/* Info Section */}
          <div className="flex-1 flex items-stretch divide-x divide-white/[0.06]">
            {/* Current Game */}
            <div className="flex-1 px-3 py-3 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px]" style={{ color: "#ef4444" }}>&#9654;</span>
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#94a3b8" }}>CURRENT GAME</span>
              </div>
              <p className="text-white font-bold text-xs leading-tight">Sweet Bonanza</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#64748b" }}>PRAGMATIC PLAY</p>
            </div>

            {/* Info */}
            <div className="flex-1 px-3 py-3 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-3 w-3 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}>i</div>
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#3b82f6" }}>INFO</span>
              </div>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between"><span style={{ color: "#64748b" }}>POTENTIAL</span><span className="text-white font-bold">21100X</span></div>
                <div className="flex justify-between"><span style={{ color: "#64748b" }}>RTP</span><span className="text-white font-bold">96.5%</span></div>
              </div>
            </div>

            {/* Personal Record */}
            <div className="flex-1 px-3 py-3 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-3 w-3 rounded-full flex items-center justify-center text-[7px]" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>&#9679;</div>
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#ef4444" }}>RECORD</span>
              </div>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between"><span style={{ color: "#64748b" }}>WIN</span><span className="text-white font-bold">4,200$</span></div>
                <div className="flex justify-between"><span style={{ color: "#64748b" }}>X</span><span className="text-white font-bold">187X</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 7. Chat Normal ──────────────────────────────────────
function ChatOverlay() {
  const messages = [
    { role: "viewer", user: "SlotKing99", msg: "Let's go!! Big win incoming" },
    { role: "moderator", user: "ModDave", msg: "Welcome everyone!" },
    { role: "subscriber", user: "BigWinMax", msg: "Thanks for the sub!" },
    { role: "viewer", user: "LuckyRoller", msg: "POGCHAMP" },
    { role: "viewer", user: "GoldSpinner", msg: "!guess 250" },
  ];

  const roleColor = {
    viewer: { text: "text-blue-400", bg: "bg-blue-500/20", letter: "V" },
    moderator: { text: "text-green-400", bg: "bg-green-500/20", letter: "M" },
    subscriber: { text: "text-purple-400", bg: "bg-purple-500/20", letter: "S" },
  };

  return (
    <div className="inline-block w-full">
      <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)", border: "1px solid rgba(59, 130, 246, 0.15)", boxShadow: "0 4px 32px rgba(0,0,0,0.6)" }}>
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
        <div className="px-4 py-3 space-y-3">
          {messages.map((msg, i) => {
            const rc = roleColor[msg.role];
            return (
              <div key={i} className="flex gap-2.5 items-start">
                <div className={`h-5 w-5 rounded-full ${rc.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className={`text-[8px] font-bold ${rc.text}`}>{rc.letter}</span>
                </div>
                <div>
                  <span className={`text-[11px] font-bold ${rc.text}`}>{msg.user}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{msg.msg}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 8. Duel Normal ──────────────────────────────────────
function DuelOverlay() {
  const players = [
    { name: "Player 1", game: "Sweet Bonanza", buyIn: "100$", result: "342$", rank: 1, color: "#ef4444" },
    { name: "Player 2", game: "Gates of Olympus", buyIn: "100$", result: "187$", rank: 2, color: "#10b981" },
  ];

  return (
    <div className="inline-block w-full">
      <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)", border: "1px solid rgba(59, 130, 246, 0.15)", boxShadow: "0 4px 32px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div className="px-5 pt-4 pb-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span className="font-black text-base tracking-wider" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>
              DUEL
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">2 Players</span>
        </div>

        {/* Table Header */}
        <div className="grid px-4 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500" style={{ gridTemplateColumns: "1fr 1.2fr 0.8fr 0.8fr 0.5fr", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span>Player</span><span>Game</span><span>Buy-In</span><span>Result</span><span className="text-center">#</span>
        </div>

        {/* Players */}
        <div className="px-4 pb-3">
          {players.map((p, i) => (
            <div key={i} className="grid py-2 items-center" style={{ gridTemplateColumns: "1fr 1.2fr 0.8fr 0.8fr 0.5fr", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: `${p.color}1f`, border: `1px solid ${p.color}33` }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={p.color} stroke="none">
                    <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                </div>
                <span className="text-white font-semibold text-[10px]">{p.name}</span>
              </div>
              <span className="text-slate-400 text-[10px]">{p.game}</span>
              <span className="text-white text-[10px] font-semibold">{p.buyIn}</span>
              <span className="text-slate-500 text-[10px]">{p.result}</span>
              <span className="text-amber-400 text-[10px] font-bold text-center">{p.rank}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-[8px] uppercase tracking-widest text-slate-600">!duel GameName to join</span>
        </div>
      </div>
    </div>
  );
}

// ── 9. Hot Words ────────────────────────────────────────
function HotWordsOverlay() {
  const words = ["GG", "HYPE", "LET'S GO", "WIN", "CLUTCH"];
  const colors = [
    { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.25)", text: "#ef4444" },
    { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.25)", text: "#10b981" },
    { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.25)", text: "#3b82f6" },
    { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.25)", text: "#f59e0b" },
    { bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.25)", text: "#8b5cf6" },
  ];

  return (
    <div className="inline-block w-full">
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          padding: "16px 22px",
        }}
      >
        {/* Header */}
        <div className="mb-3 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="font-bold text-sm tracking-widest" style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>
            HOT WORDS
          </span>
        </div>

        {/* Words */}
        <div className="flex flex-wrap gap-2">
          {words.map((word, i) => {
            const c = colors[i % colors.length];
            return (
              <span key={i} className="px-3 py-1 rounded-full text-xs font-bold tracking-wide inline-flex items-center gap-1.5" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                {word}
                <span className="text-[9px] font-semibold opacity-70">({Math.floor(Math.random() * 100 + 20)})</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Overlay label ───────────────────────────────────────
function OverlayLabel({ children }) {
  return (
    <div className="text-center mt-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-tertiary)' }}>
        {children}
      </span>
    </div>
  );
}

// ── Main Section ────────────────────────────────────────
export default function WidgetShowcase() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;
    const cardEls = cards.querySelectorAll(':scope > div');
    gsap.fromTo(cardEls, { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
    });
  }, []);

  return (
    <section id="widgets" ref={sectionRef} className="section" style={{ padding: 'clamp(100px, 14vw, 180px) 0', position: 'relative' }}>
      {/* Header */}
      <div className="container" style={{ textAlign: 'center', marginBottom: 'clamp(36px, 5vw, 56px)' }}>
        <RevealText as="div" style={{ marginBottom: '16px' }}>
          <span className="text-label" style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '30px', height: '1px', background: 'var(--gradient-gold)' }} />
            {t.widgets.label}
            <span style={{ width: '30px', height: '1px', background: 'var(--gradient-gold)' }} />
          </span>
        </RevealText>
        <RevealText as="h2" delay={0.1} className="text-display font-display">
          {t.widgets.title}
        </RevealText>
        <RevealText as="p" delay={0.2} className="text-body" style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '20px auto 0' }}>
          {t.widgets.subtitle}
        </RevealText>
        <div style={{ width: '60px', height: '1px', background: 'var(--gradient-gold)', margin: '28px auto 0', opacity: 0.6 }} />
      </div>

      {/* Widget type tags */}
      <div className="container" style={{ marginBottom: 'clamp(40px, 5vw, 64px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {t.widgets.types.map((wt) => (
            <span
              key={wt}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontSize: '0.72rem', fontWeight: 500, padding: '8px 18px',
                borderRadius: '6px', border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)', background: 'var(--bg-card)',
                fontFamily: "'Inter', sans-serif", letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--border-gold)', flexShrink: 0 }} />
              {wt}
            </span>
          ))}
        </div>
      </div>

      {/* 3x3 Overlay Grid — exact copies of real overlays */}
      <div className="container-wide">
        <div
          ref={cardsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(16px, 2.5vw, 28px)',
          }}
        >
          {/* Row 1 */}
          <div><BalanceOverlay /><OverlayLabel>Balance</OverlayLabel></div>
          <div><WagerBarOverlay /><OverlayLabel>Wager Bar</OverlayLabel></div>
          <div><BonushuntOverlay /><OverlayLabel>Bonus Hunt</OverlayLabel></div>

          {/* Row 2 */}
          <div><SlotBattleOverlay /><OverlayLabel>Slot Battle</OverlayLabel></div>
          <div><TournamentOverlay /><OverlayLabel>Tournament</OverlayLabel></div>
          <div><NowPlayingOverlay /><OverlayLabel>Now Playing</OverlayLabel></div>

          {/* Row 3 */}
          <div><ChatOverlay /><OverlayLabel>Live Chat</OverlayLabel></div>
          <div><DuelOverlay /><OverlayLabel>Duel</OverlayLabel></div>
          <div><HotWordsOverlay /><OverlayLabel>Hot Words</OverlayLabel></div>
        </div>
      </div>
    </section>
  );
}
