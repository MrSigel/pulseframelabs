"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import type { Bonushunt, BonushuntEntry } from "@/lib/supabase/types";

const currencySymbol = (code: string | undefined) =>
  ({ USD: "$", EUR: "\u20ac", GBP: "\u00a3", CAD: "C$", AUD: "A$" }[code || ""] || code || "$");

function BonushuntHorizontalContent() {
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
  const nonZeroMults = entries.filter((e) => e.multiplier > 0);
  const bestMultiplier = nonZeroMults.length ? Math.max(...nonZeroMults.map((e) => e.multiplier)) : 0;
  const avgMultiplier = nonZeroMults.length
    ? nonZeroMults.reduce((s, e) => s + e.multiplier, 0) / nonZeroMults.length
    : 0;

  const fmtAmount = (n: number) =>
    n >= 1000 ? `${sym}${(n / 1000).toFixed(1)}K` : `${sym}${n.toFixed(0)}`;

  /* ---- Resolve display values: Supabase -> URL fallback ---- */
  const title = uid && hunt ? hunt.name : (params.get("title") || "%TITLE%");
  const huntLabel = uid && hunt ? `HUNT #${hunt.id.slice(0, 3).toUpperCase()}` : (params.get("hunt") || "HUNT #000");
  const slots = uid ? String(slotsCount) : (params.get("slots") || "0");
  const total = uid ? String(entries.length) : (params.get("total") || "0");
  const buyin = uid ? fmtAmount(totalBuyIn) : (params.get("buyin") || "$0K");
  const start = uid && hunt ? `${sym}${hunt.start_balance.toLocaleString()}` : (params.get("start") || "$0");
  const bestX = uid ? `${bestMultiplier.toFixed(1)}X+` : (params.get("bestx") || "0X+");
  const avgX = uid ? `${avgMultiplier.toFixed(1)}X` : (params.get("avgx") || "0X");

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Icon + Title */}
          <div className="flex items-center gap-2.5 shrink-0">
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
                className="font-bold text-xs block"
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
              <span className="text-[9px] font-semibold text-slate-500">{huntLabel}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Stats */}
          <div className="flex items-center gap-4">
            {[
              { label: "Buy-in", value: buyin },
              { label: "Start", value: start },
              { label: "Best", value: bestX },
              { label: "Avg", value: avgX },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <span className="text-[8px] uppercase tracking-wider text-slate-600 block">{s.label}</span>
                <span className="text-white font-bold text-xs">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Slots counter */}
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
    </div>
  );
}

export default function BonushuntHorizontalOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <BonushuntHorizontalContent />
      </Suspense>
    </div>
  );
}
