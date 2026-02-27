"use client";

import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import AnimatedBackground3D from "@/components/landing/background/AnimatedBackground3D";
import NoiseOverlay from "@/components/landing/layout/NoiseOverlay";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

/* ── Animated Divider ──────────────────────────────────── */
function AnimatedDivider({ isDark }: { isDark: boolean }) {
  const goldColor = isDark ? "201, 168, 76" : "139, 109, 31";

  return (
    <div
      className="hidden lg:block"
      style={{
        position: "relative",
        width: "1px",
        zIndex: 3,
        alignSelf: "stretch",
      }}
    >
      {/* Static line */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 0%, rgba(${goldColor}, 0.2) 20%, rgba(${goldColor}, 0.3) 50%, rgba(${goldColor}, 0.2) 80%, transparent 100%)`,
        }}
      />

      {/* Traveling light - goes down */}
      <motion.div
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          left: "-1px",
          width: "3px",
          height: "80px",
          background: `linear-gradient(180deg, transparent, rgba(${goldColor}, 0.6), rgba(${goldColor}, 0.9), rgba(${goldColor}, 0.6), transparent)`,
          borderRadius: "2px",
          filter: `drop-shadow(0 0 6px rgba(${goldColor}, 0.4))`,
        }}
      />

      {/* Traveling light - goes up (offset) */}
      <motion.div
        animate={{ bottom: ["-10%", "110%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 2 }}
        style={{
          position: "absolute",
          left: "-0.5px",
          width: "2px",
          height: "50px",
          background: `linear-gradient(180deg, transparent, rgba(${goldColor}, 0.4), rgba(${goldColor}, 0.7), rgba(${goldColor}, 0.4), transparent)`,
          borderRadius: "2px",
          filter: `drop-shadow(0 0 4px rgba(${goldColor}, 0.3))`,
        }}
      />

      {/* Gold dots at intervals */}
      {[15, 35, 50, 65, 85].map((pos, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          style={{
            position: "absolute",
            top: `${pos}%`,
            left: "-2px",
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: `rgba(${goldColor}, 0.5)`,
            boxShadow: `0 0 8px rgba(${goldColor}, 0.3)`,
          }}
        />
      ))}

      {/* Glow spread */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          bottom: "20%",
          left: "-15px",
          width: "30px",
          background: `radial-gradient(ellipse at center, rgba(${goldColor}, 0.04) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ── Floating Overlay Mini-Cards ──────────────────────── */

function useAnimCounter(target: number, dur = 2500, interval = 5000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let frame: number;
    const run = () => {
      const s = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - s) / dur, 1);
        setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    run();
    const id = setInterval(() => { setVal(0); setTimeout(run, 150); }, interval);
    return () => { cancelAnimationFrame(frame); clearInterval(id); };
  }, [target, dur, interval]);
  return val;
}

function FloatingOverlays({ glowColor }: { glowColor: string }) {
  // Animated values
  const deposits = useAnimCounter(12500);
  const withdrawals = useAnimCounter(4200);
  const [pct, setPct] = useState(15);
  const [chatIdx, setChatIdx] = useState(0);
  const [scoreL, setScoreL] = useState(2.1);
  const [scoreR, setScoreR] = useState(1.5);
  const [counts, setCounts] = useState([42, 87, 65, 31, 54]);

  useEffect(() => {
    const t1 = setTimeout(() => setPct(63.6), 800);
    const i1 = setInterval(() => { setPct(15); setTimeout(() => setPct(63.6 + Math.random() * 15), 800); }, 6000);
    const i2 = setInterval(() => setChatIdx((i) => (i + 1) % 4), 2500);
    const i3 = setInterval(() => {
      setScoreL((s) => Math.min(s + 0.15 + Math.random() * 0.25, 5));
      setScoreR((s) => Math.min(s + 0.1 + Math.random() * 0.3, 5));
    }, 2500);
    const i4 = setInterval(() => setCounts((p) => p.map((c) => c + Math.floor(Math.random() * 8 + 1))), 2000);
    return () => { clearTimeout(t1); clearInterval(i1); clearInterval(i2); clearInterval(i3); clearInterval(i4); };
  }, []);

  const chatMsgs = [
    { role: "viewer" as const, user: "SlotKing99", msg: "Let's go!!" },
    { role: "moderator" as const, user: "ModDave", msg: "Welcome!" },
    { role: "subscriber" as const, user: "BigWinMax", msg: "GG!" },
    { role: "viewer" as const, user: "LuckyRoller", msg: "POGCHAMP" },
    { role: "viewer" as const, user: "GoldSpin", msg: "!guess 250" },
    { role: "subscriber" as const, user: "ProGamer", msg: "Insane!" },
    { role: "moderator" as const, user: "ModSarah", msg: "Rules!" },
  ];
  const chatSlice = chatMsgs.slice(chatIdx, chatIdx + 4);
  const roleCfg: Record<string, { text: string; bg: string; letter: string }> = {
    viewer: { text: "#60a5fa", bg: "rgba(59,130,246,0.2)", letter: "V" },
    moderator: { text: "#34d399", bg: "rgba(16,185,129,0.2)", letter: "M" },
    subscriber: { text: "#a78bfa", bg: "rgba(139,92,246,0.2)", letter: "S" },
  };
  const hwColors = ["#ef4444", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];
  const hwWords = ["GG", "HYPE", "LET'S GO", "WIN", "CLUTCH"];

  const wagered = Math.round(50000 * pct / 100);

  // 6 floating overlay cards positioned across the right panel
  const cards: { top: string; left: string; w: string; scale: number; delay: number; floatDur: number; floatY: number; content: React.ReactNode }[] = [
    // Balance — top left
    {
      top: "6%", left: "5%", w: "220px", scale: 0.92, delay: 0.3, floatDur: 6, floatY: 12,
      content: (
        <div className="rounded-lg overflow-hidden space-y-1.5" style={{ background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)", border: "1px solid rgba(59,130,246,0.2)", boxShadow: "0 2px 16px rgba(0,0,0,0.5)", padding: "10px 14px" }}>
          {[
            { icon: "+", val: `$${deposits.toLocaleString()}`, bg: "rgba(16,185,129,0.15)", color: "#10b981", border: "rgba(16,185,129,0.25)" },
            { icon: "\u2212", val: `$${withdrawals.toLocaleString()}`, bg: "rgba(239,68,68,0.15)", color: "#ef4444", border: "rgba(239,68,68,0.25)" },
            { icon: "\u21C5", val: `$${(deposits - withdrawals).toLocaleString()}`, bg: "rgba(139,92,246,0.15)", color: "#8b5cf6", border: "rgba(139,92,246,0.25)" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold" style={{ background: r.bg, color: r.color, border: `1px solid ${r.border}` }}>{r.icon}</div>
              <span className="text-white font-bold text-sm">{r.val}</span>
            </div>
          ))}
        </div>
      ),
    },
    // Wager Bar — top right
    {
      top: "3%", left: "55%", w: "280px", scale: 0.88, delay: 0.5, floatDur: 7, floatY: 10,
      content: (
        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(180deg, #0c1018 0%, #111827 100%)", border: "1px solid rgba(59,130,246,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
          <div className="px-4 py-2 flex items-center justify-center" style={{ background: "linear-gradient(90deg, rgba(239,68,68,0.08), rgba(239,68,68,0.18), rgba(239,68,68,0.08))", borderBottom: "1px solid rgba(239,68,68,0.12)" }}>
            <span className="font-bold text-xs tracking-[0.12em]" style={{ background: "linear-gradient(90deg,#fca5a5,#fff,#fca5a5)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s linear infinite" }}>PULSEFRAMELABS.COM</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="font-bold text-xs px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>${wagered.toLocaleString()} / $50,000</span>
              <span className="font-semibold text-xs px-2 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>{pct.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#ef4444,#f97316,#eab308)", transition: "width 1.5s ease-in-out" }} />
            </div>
          </div>
        </div>
      ),
    },
    // Chat — middle left
    {
      top: "32%", left: "2%", w: "240px", scale: 0.9, delay: 0.7, floatDur: 8, floatY: 14,
      content: (
        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)", border: "1px solid rgba(59,130,246,0.15)", boxShadow: "0 4px 32px rgba(0,0,0,0.6)" }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Chat</span>
            <div className="ml-auto flex items-center gap-1"><div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" /><span className="text-[8px] text-slate-500 font-semibold">LIVE</span></div>
          </div>
          <div className="px-3 py-2 space-y-2">
            {chatSlice.map((m, i) => {
              const rc = roleCfg[m.role];
              return (
                <motion.div key={`${m.user}-${chatIdx}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }} className="flex gap-2 items-start">
                  <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: rc.bg }}><span className="text-[7px] font-bold" style={{ color: rc.text }}>{rc.letter}</span></div>
                  <div><span className="text-[9px] font-bold" style={{ color: rc.text }}>{m.user}</span><p className="text-[9px] text-slate-400">{m.msg}</p></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ),
    },
    // Slot Battle — middle right
    {
      top: "30%", left: "52%", w: "300px", scale: 0.85, delay: 0.9, floatDur: 6.5, floatY: 11,
      content: (
        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)", border: "1px solid rgba(59,130,246,0.15)", boxShadow: "0 4px 32px rgba(0,0,0,0.6)" }}>
          <div className="px-4 pt-3 pb-2 text-center">
            <span className="font-black text-sm tracking-wider" style={{ background: "linear-gradient(90deg,#f59e0b,#ef4444,#f59e0b)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>SLOT BATTLE</span>
          </div>
          <div className="px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg px-2 py-1.5 flex items-center gap-1.5" style={{ background: "linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.04))", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                </div>
                <span className="text-white font-bold text-[9px]">Sweet Bonanza</span>
              </div>
              <span className="text-slate-600 font-black text-xs shrink-0">VS</span>
              <div className="flex-1 rounded-lg px-2 py-1.5 flex items-center gap-1.5 justify-end" style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.04),rgba(16,185,129,0.12))", border: "1px solid rgba(16,185,129,0.2)" }}>
                <span className="text-white font-bold text-[9px]">Gates of Olympus</span>
                <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="px-3 pb-2">
            {[
              { l: scoreL.toFixed(2), label: "SCORE", r: scoreR.toFixed(2) },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <span className="text-xs font-bold text-blue-400">{row.l}</span>
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{row.label}</span>
                <span className="text-xs font-bold text-green-400">{row.r}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Hot Words — bottom left
    {
      top: "66%", left: "8%", w: "260px", scale: 0.9, delay: 1.1, floatDur: 7.5, floatY: 13,
      content: (
        <div className="rounded-lg overflow-hidden" style={{ background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)", border: "1px solid rgba(59,130,246,0.2)", boxShadow: "0 4px 24px rgba(0,0,0,0.5)", padding: "12px 16px" }}>
          <div className="mb-2 pb-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="font-bold text-xs tracking-widest" style={{ background: "linear-gradient(90deg,#3b82f6,#8b5cf6,#3b82f6)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>HOT WORDS</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {hwWords.map((w, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide inline-flex items-center gap-1" style={{ background: `${hwColors[i]}26`, border: `1px solid ${hwColors[i]}40`, color: hwColors[i] }}>
                {w}
                <span className="text-[8px] font-semibold opacity-70">({counts[i]})</span>
              </span>
            ))}
          </div>
        </div>
      ),
    },
    // Bonus Hunt — bottom right
    {
      top: "62%", left: "55%", w: "270px", scale: 0.88, delay: 1.3, floatDur: 6, floatY: 10,
      content: (
        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)", border: "1px solid rgba(59,130,246,0.15)", boxShadow: "0 4px 32px rgba(0,0,0,0.6)" }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="h-5 w-5 rounded flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /></svg>
            </div>
            <span className="font-bold text-xs" style={{ background: "linear-gradient(90deg,#ef4444,#f97316,#ef4444)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>Bonus Hunt #5</span>
          </div>
          <div className="grid grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.04)" }}>
            {["$2.5K", "$5,000", "187X+", "42.5X"].map((v, i) => (
              <div key={i} className="flex flex-col items-center py-2 gap-0.5" style={{ background: "linear-gradient(180deg,rgba(15,21,33,0.8),rgba(12,16,24,0.9))" }}>
                <span className="text-white font-bold text-[10px]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Subtle glow */}
      <div style={{ position: "absolute", top: "30%", left: "30%", width: "40%", height: "40%", background: `radial-gradient(ellipse, rgba(${glowColor}, 0.04) 0%, transparent 70%)`, pointerEvents: "none" }} />

      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30, scale: card.scale * 0.9 }}
          animate={{ opacity: 1, y: 0, scale: card.scale }}
          transition={{ duration: 0.9, delay: card.delay, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", top: card.top, left: card.left, width: card.w, zIndex: 2 + i }}
        >
          <motion.div
            animate={{ y: [-card.floatY / 2, card.floatY / 2, -card.floatY / 2] }}
            transition={{ duration: card.floatDur, repeat: Infinity, ease: "easeInOut" }}
          >
            {card.content}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Main Layout ───────────────────────────────────────── */
function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const theme = useTheme();
  const auth = t.auth || {};
  const isDark = theme.isDark;

  // Theme-adaptive colors for the left panel
  const panelBg = isDark
    ? "linear-gradient(180deg, rgba(9, 9, 11, 0.92) 0%, rgba(15, 14, 18, 0.95) 50%, rgba(9, 9, 11, 0.92) 100%)"
    : "linear-gradient(180deg, rgba(250, 248, 244, 0.92) 0%, rgba(243, 240, 234, 0.95) 50%, rgba(250, 248, 244, 0.92) 100%)";

  const glowColor = isDark ? "201, 168, 76" : "139, 109, 31";

  return (
    <div data-theme={theme.theme} style={{ minHeight: "100vh", display: "flex", position: "relative" }}>
      <AnimatedBackground3D />
      <NoiseOverlay />

      {/* Left Side — Auth Form (30%) */}
      <div
        className="w-full lg:w-[30%] lg:min-w-[420px]"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          maxHeight: "100vh",
          overflowY: "auto",
          position: "relative",
          zIndex: 2,
          background: panelBg,
          backdropFilter: "blur(40px) saturate(1.2)",
          WebkitBackdropFilter: "blur(40px) saturate(1.2)",
          transition: "background 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Top glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "300px",
            pointerEvents: "none",
            background: `radial-gradient(ellipse at 50% 0%, rgba(${glowColor}, 0.06) 0%, transparent 70%)`,
          }}
        />

        {/* Bottom glow */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            pointerEvents: "none",
            background: `radial-gradient(ellipse at 50% 100%, rgba(${glowColor}, 0.03) 0%, transparent 70%)`,
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "relative", padding: "32px 32px 8px" }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display'), Georgia, serif",
              fontWeight: 700,
              fontSize: "1.15rem",
              letterSpacing: "0.02em",
              color: "var(--text-primary)",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Pulseframelabs
          </Link>
        </motion.div>

        {/* Form Content */}
        <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "safe center", justifyContent: "center", padding: "32px 32px 16px" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", maxWidth: "380px" }}
          >
            {children}
          </motion.div>
        </div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{ position: "relative", padding: "24px 32px", textAlign: "center" }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-inter, 'Inter'), system-ui, sans-serif",
              fontSize: "0.72rem",
              color: "var(--text-tertiary)",
              textDecoration: "none",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            &larr; {auth.backToHome}
          </Link>
        </motion.div>
      </div>

      {/* Animated Divider */}
      <AnimatedDivider isDark={isDark} />

      {/* Right Side — Floating Overlay Previews (70%) */}
      <div
        className="hidden lg:flex"
        style={{
          flex: 1,
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <FloatingOverlays glowColor={glowColor} />
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </LanguageProvider>
  );
}
