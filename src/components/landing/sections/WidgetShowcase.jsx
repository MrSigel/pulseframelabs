"use client";

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import RevealText from '@/components/landing/ui/RevealText';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   Animated hooks for overlay demo data
   ================================================================ */

function useAnimatedCounter(target, duration = 3000, interval = 4000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame;
    const animate = () => {
      const start = performance.now();
      const from = 0;
      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(from + (target - from) * eased));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    animate();
    const id = setInterval(() => {
      setValue(0);
      setTimeout(animate, 200);
    }, interval);
    return () => { cancelAnimationFrame(frame); clearInterval(id); };
  }, [target, duration, interval]);
  return value;
}

function useCycleIndex(length, intervalMs = 2500) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs]);
  return idx;
}

/* ================================================================
   EXACT 1:1 copies of the real overlay visual components,
   with demo data + subtle animations. Each overlay keeps its
   original Tailwind classes + inline styles.
   ================================================================ */

// ── 1. Balance Normal ───────────────────────────────────
function BalanceOverlay() {
  const deposits = useAnimatedCounter(12500, 2500, 5000);
  const withdrawals = useAnimatedCounter(4200, 2500, 5000);
  const balance = deposits - withdrawals;

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
        <motion.div className="flex items-center gap-2.5" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div
            className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold"
            style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.25)" }}
          >
            +
          </div>
          <span className="text-white font-bold text-base">${deposits.toLocaleString()}</span>
        </motion.div>
        {/* Withdrawals */}
        <motion.div className="flex items-center gap-2.5" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <div
            className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold"
            style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
          >
            &minus;
          </div>
          <span className="text-white font-bold text-base">${withdrawals.toLocaleString()}</span>
        </motion.div>
        {/* Balance / LeftOver */}
        <motion.div className="flex items-center gap-2.5" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <div
            className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold"
            style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", border: "1px solid rgba(139, 92, 246, 0.25)" }}
          >
            &#8645;
          </div>
          <span className="text-white font-bold text-base">${balance.toLocaleString()}</span>
        </motion.div>
      </div>
    </div>
  );
}

// ── 2. Wager Bar Normal ─────────────────────────────────
function WagerBarOverlay() {
  const [pct, setPct] = useState(12);
  useEffect(() => {
    const timeout = setTimeout(() => setPct(63.6), 800);
    const interval = setInterval(() => {
      setPct(12);
      setTimeout(() => setPct(63.6 + Math.random() * 15), 800);
    }, 6000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);

  const wagered = Math.round(50000 * pct / 100);

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
                ${wagered.toLocaleString()} / $50,000
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
              <span style={{ color: "#64748b" }}>LEFT: <span className="text-amber-400 font-semibold">${(50000 - wagered).toLocaleString()}</span></span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "#64748b" }}>START: <span className="text-emerald-400 font-semibold">$5,000</span></span>
              <span style={{ color: "#64748b" }}>WAGERED: <span className="text-red-400 font-semibold">${wagered.toLocaleString()}</span></span>
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
  const [count, setCount] = useState(3);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c >= 12 ? 3 : c + 1), 3000);
    return () => clearInterval(id);
  }, []);

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
            <motion.span
              key={count}
              initial={{ scale: 1.3, color: "#ef4444" }}
              animate={{ scale: 1, color: "#ef4444" }}
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.15)" }}
            >
              {count}/12
            </motion.span>
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
  const [scoreL, setScoreL] = useState(2.1);
  const [scoreR, setScoreR] = useState(1.5);
  useEffect(() => {
    const id = setInterval(() => {
      setScoreL((s) => Math.min(s + 0.2 + Math.random() * 0.3, 5.0));
      setScoreR((s) => Math.min(s + 0.1 + Math.random() * 0.4, 5.0));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const statsRows = [
    { left: "3/3", label: "# BONUS", right: "3/3" },
    { left: "150$", label: "COST", right: "150$" },
    { left: "847$", label: "BEST WIN", right: "623$" },
    { left: "5.6X", label: "BEST X", right: "4.2X" },
    { left: scoreL.toFixed(2), label: "SCORE", right: scoreR.toFixed(2), highlight: true },
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
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-slate-600 font-black text-sm shrink-0"
            >
              VS
            </motion.span>
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
  const [multi, setMulti] = useState(187);
  useEffect(() => {
    const id = setInterval(() => setMulti((m) => m + Math.floor(Math.random() * 30 + 5)), 3500);
    return () => clearInterval(id);
  }, []);

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
              <motion.div
                key={multi}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="px-2.5 py-1 rounded-md text-xs font-black"
                style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}
              >
                {multi}X
              </motion.div>
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
              <motion.span
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-[10px] font-bold text-white/50 text-center px-2"
              >
                Sweet Bonanza
              </motion.span>
            </div>
            <div className="absolute inset-y-0 right-0 w-6" style={{ background: "linear-gradient(to right, transparent, #0c1018)" }} />
          </div>

          {/* Info Section */}
          <div className="flex-1 flex items-stretch divide-x divide-white/[0.06]">
            {/* Current Game */}
            <div className="flex-1 px-3 py-3 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-[10px]" style={{ color: "#ef4444" }}>&#9654;</motion.span>
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
  const allMessages = [
    { role: "viewer", user: "SlotKing99", msg: "Let's go!! Big win incoming" },
    { role: "moderator", user: "ModDave", msg: "Welcome everyone!" },
    { role: "subscriber", user: "BigWinMax", msg: "Thanks for the sub!" },
    { role: "viewer", user: "LuckyRoller", msg: "POGCHAMP" },
    { role: "viewer", user: "GoldSpinner", msg: "!guess 250" },
    { role: "subscriber", user: "ProGamer42", msg: "Insane hit!" },
    { role: "viewer", user: "CryptoKing", msg: "GG easy" },
    { role: "moderator", user: "ModSarah", msg: "Remember the rules!" },
  ];

  const offset = useCycleIndex(allMessages.length - 4, 2500);
  const messages = allMessages.slice(offset, offset + 5);

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
        <div className="px-4 py-3 space-y-3 min-h-[180px]">
          {messages.map((msg, i) => {
            const rc = roleColor[msg.role];
            return (
              <motion.div
                key={`${msg.user}-${offset}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex gap-2.5 items-start"
              >
                <div className={`h-5 w-5 rounded-full ${rc.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className={`text-[8px] font-bold ${rc.text}`}>{rc.letter}</span>
                </div>
                <div>
                  <span className={`text-[11px] font-bold ${rc.text}`}>{msg.user}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{msg.msg}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 8. Duel Normal ──────────────────────────────────────
function DuelOverlay() {
  const [r1, setR1] = useState(342);
  const [r2, setR2] = useState(187);
  useEffect(() => {
    const id = setInterval(() => {
      setR1((r) => r + Math.floor(Math.random() * 80 + 20));
      setR2((r) => r + Math.floor(Math.random() * 80 + 20));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const players = [
    { name: "Player 1", game: "Sweet Bonanza", buyIn: "100$", result: `${r1}$`, rank: 1, color: "#ef4444" },
    { name: "Player 2", game: "Gates of Olympus", buyIn: "100$", result: `${r2}$`, rank: 2, color: "#10b981" },
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
              <motion.span key={p.result} initial={{ color: "#22c55e" }} animate={{ color: "#64748b" }} transition={{ duration: 1 }} className="text-[10px]">{p.result}</motion.span>
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

  const [counts, setCounts] = useState([42, 87, 65, 31, 54]);
  useEffect(() => {
    const id = setInterval(() => {
      setCounts((prev) => prev.map((c) => c + Math.floor(Math.random() * 8 + 1)));
    }, 2000);
    return () => clearInterval(id);
  }, []);

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
              <motion.span
                key={i}
                whileHover={{ scale: 1.08 }}
                className="px-3 py-1 rounded-full text-xs font-bold tracking-wide inline-flex items-center gap-1.5"
                style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
              >
                {word}
                <motion.span
                  key={counts[i]}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-[9px] font-semibold opacity-70"
                >
                  ({counts[i]})
                </motion.span>
              </motion.span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Overlay Card wrapper with banner + hover animation ──
function OverlayCard({ children, label, icon, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ cursor: "default", position: "relative" }}
    >
      {/* Banner above */}
      <div
        className="flex items-center gap-2 mb-3 px-1"
        style={{ transition: "opacity 0.3s" }}
      >
        <div
          className="flex items-center justify-center h-7 w-7 rounded-lg"
          style={{
            background: hovered ? "rgba(59, 130, 246, 0.15)" : "rgba(255,255,255,0.04)",
            border: hovered ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(255,255,255,0.08)",
            transition: "all 0.3s ease",
          }}
        >
          <span style={{ fontSize: "14px", lineHeight: 1 }}>{icon}</span>
        </div>
        <span
          className="text-xs font-bold uppercase tracking-[0.1em]"
          style={{
            color: hovered ? "var(--gold, #c9a84c)" : "var(--text-secondary, #94a3b8)",
            transition: "color 0.3s ease",
          }}
        >
          {label}
        </span>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: hovered
              ? "linear-gradient(90deg, rgba(59,130,246,0.3), transparent)"
              : "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)",
            transition: "background 0.3s ease",
          }}
        />
      </div>

      {/* Overlay content with hover glow */}
      <div
        style={{
          position: "relative",
          borderRadius: "12px",
          transition: "box-shadow 0.3s ease, transform 0.3s ease",
          boxShadow: hovered
            ? "0 8px 40px rgba(59, 130, 246, 0.12), 0 0 0 1px rgba(59, 130, 246, 0.15)"
            : "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ── Main Section ────────────────────────────────────────
export default function WidgetShowcase() {
  const { t } = useLanguage();

  return (
    <section id="widgets" className="section" style={{ padding: 'clamp(100px, 14vw, 180px) 0', position: 'relative' }}>
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

      {/* 3x3 Overlay Grid — animated exact copies of real overlays */}
      <div className="container-wide">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(16px, 2.5vw, 28px)',
          }}
        >
          {/* Row 1 */}
          <OverlayCard label="Balance" icon="💰" index={0}><BalanceOverlay /></OverlayCard>
          <OverlayCard label="Wager Bar" icon="📊" index={1}><WagerBarOverlay /></OverlayCard>
          <OverlayCard label="Bonus Hunt" icon="🎯" index={2}><BonushuntOverlay /></OverlayCard>

          {/* Row 2 */}
          <OverlayCard label="Slot Battle" icon="⚔️" index={3}><SlotBattleOverlay /></OverlayCard>
          <OverlayCard label="Tournament" icon="🏆" index={4}><TournamentOverlay /></OverlayCard>
          <OverlayCard label="Now Playing" icon="🎰" index={5}><NowPlayingOverlay /></OverlayCard>

          {/* Row 3 */}
          <OverlayCard label="Live Chat" icon="💬" index={6}><ChatOverlay /></OverlayCard>
          <OverlayCard label="Duel" icon="🎲" index={7}><DuelOverlay /></OverlayCard>
          <OverlayCard label="Hot Words" icon="🔥" index={8}><HotWordsOverlay /></OverlayCard>
        </div>
      </div>
    </section>
  );
}
