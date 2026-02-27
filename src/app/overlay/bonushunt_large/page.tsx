"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import type { Bonushunt, BonushuntEntry } from "@/lib/supabase/types";

const currencySymbol = (code: string | undefined) =>
  ({ USD: "$", EUR: "\u20ac", GBP: "\u00a3", CAD: "C$", AUD: "A$" }[code || ""] || code || "$");

function BonushuntLargeContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();

  /* ---- Supabase realtime data ---- */
  const { data: hunt } = useOverlayData<Bonushunt>({
    table: "bonushunts",
    userId: uid,
    filter: { status: "active" },
    single: true,
  });

  const { data: allEntries } = useOverlayData<BonushuntEntry[]>({
    table: "bonushunt_entries",
    userId: uid,
    orderBy: "position",
    ascending: true,
  });

  /* ---- Compute values from Supabase data ---- */
  const entries = hunt && allEntries
    ? allEntries.filter((e) => e.bonushunt_id === hunt.id)
    : [];

  const sym = hunt ? currencySymbol(hunt.currency) : "$";
  const slotsCount = entries.length;
  const totalBuyIn = entries.reduce((s, e) => s + e.buy_in, 0);
  const totalWins = entries.reduce((s, e) => s + e.win_amount, 0);
  const nonZeroMults = entries.filter((e) => e.multiplier > 0);
  const bestMultiplier = nonZeroMults.length ? Math.max(...nonZeroMults.map((e) => e.multiplier)) : 0;
  const avgMultiplier = nonZeroMults.length
    ? nonZeroMults.reduce((s, e) => s + e.multiplier, 0) / nonZeroMults.length
    : 0;

  /* ---- Top / Worst entries for leaderboard ---- */
  const sortedByMult = [...entries].sort((a, b) => b.multiplier - a.multiplier);
  const bestEntry = sortedByMult[0] ?? null;
  const worstEntry = sortedByMult.length > 0 ? sortedByMult[sortedByMult.length - 1] : null;

  const fmtAmount = (n: number) =>
    n >= 1000 ? `${sym}${(n / 1000).toFixed(1)}K` : `${sym}${n.toFixed(0)}`;

  /* ---- Resolve display values: Supabase → URL fallback ---- */
  const title = uid && hunt ? hunt.name : (params.get("title") || "%TITLE%");
  const huntLabel = uid && hunt ? `HUNT #${hunt.id.slice(0, 3).toUpperCase()}` : (params.get("hunt") || "HUNT #000");
  const slots = uid ? String(slotsCount) : (params.get("slots") || "0");
  const total = uid ? String(totalWins) : (params.get("total") || "0");
  const buyin = uid ? fmtAmount(totalBuyIn) : (params.get("buyin") || "$0K");
  const start = uid && hunt ? `${sym}${hunt.start_balance.toLocaleString()}` : (params.get("start") || "$0");
  const bestX = uid ? `${bestMultiplier.toFixed(1)}X+` : (params.get("bestx") || "0X+");
  const avgX = uid ? `${avgMultiplier.toFixed(1)}X` : (params.get("avgx") || "0X");

  const bestLabel = bestEntry
    ? `${bestEntry.game_name} — ${bestEntry.multiplier.toFixed(1)}X`
    : "0.";
  const worstLabel = worstEntry
    ? `${worstEntry.game_name} — ${worstEntry.multiplier.toFixed(1)}X`
    : "0.";

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
          minWidth: "380px",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.2)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <span
                className="font-bold text-sm block"
                style={{
                  background: "linear-gradient(90deg, #ef4444, #f97316, #ef4444)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmer 3s ease-in-out infinite",
                }}
              >
                {title}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">{huntLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-md flex items-center justify-center"
              style={{ background: "rgba(239, 68, 68, 0.1)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
                <rect x="2" y="6" width="8" height="12" rx="1" />
                <rect x="14" y="6" width="8" height="12" rx="1" />
                <circle cx="6" cy="10" r="1" fill="#0c1018" />
                <circle cx="18" cy="10" r="1" fill="#0c1018" />
              </svg>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.15)",
              }}
            >
              {slots}/{total}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div
          className="grid grid-cols-4 gap-px"
          style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          {[
            { icon: "grid", value: buyin, color: "#ef4444" },
            { icon: "play", value: start, color: "#ef4444" },
            { icon: "chart", value: bestX, color: "#ef4444" },
            { icon: "x", value: avgX, color: "#ef4444" },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center py-2.5 gap-1"
              style={{ background: "linear-gradient(180deg, rgba(15,21,33,0.8) 0%, rgba(12,16,24,0.9) 100%)" }}
            >
              <div style={{ color: stat.color }}>
                {stat.icon === "grid" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                )}
                {stat.icon === "play" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
                {stat.icon === "chart" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                )}
                {stat.icon === "x" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                )}
              </div>
              <span className="text-white font-bold text-xs">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="px-4 py-3 space-y-1.5">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z" />
            </svg>
            <span className="text-slate-400 text-xs font-semibold">{bestLabel}</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
              <path d="M12 2C8 6 4 9.5 4 13a8 8 0 0016 0c0-3.5-4-7-8-11z" />
            </svg>
            <span className="text-slate-400 text-xs font-semibold">{worstLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BonushuntLargeOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <BonushuntLargeContent />
      </Suspense>
    </div>
  );
}
