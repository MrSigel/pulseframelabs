"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useGlobalCurrency, currencySymbol } from "@/hooks/useGlobalCurrency";
import { useOverlayTheme } from "@/hooks/useOverlayTheme";
import type { Bonushunt, BonushuntEntry } from "@/lib/supabase/types";

function BonushuntHorizontalContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();
  const { cssVars } = useOverlayTheme(uid);
  const { symbol: globalCurrency } = useGlobalCurrency(uid);

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

  const sym = hunt?.currency ? currencySymbol(hunt.currency) : globalCurrency;
  const slotsCount = entries.length;
  const totalBuyIn = entries.reduce((s, e) => s + e.buy_in, 0);
  const totalWins = entries.reduce((s, e) => s + e.win_amount, 0);
  const startBalance = hunt?.start_balance ?? 0;
  const requiredX = totalBuyIn > 0 ? startBalance / totalBuyIn : 0;
  const achievedX = totalBuyIn > 0 ? totalWins / totalBuyIn : 0;

  const fmtAmount = (n: number) =>
    n >= 1000 ? `${sym}${(n / 1000).toFixed(1)}K` : `${sym}${n.toFixed(0)}`;

  /* ---- Resolve display values: Supabase -> URL fallback ---- */
  const title = uid && hunt ? hunt.name : (params.get("title") || "%TITLE%");
  const huntLabel = uid && hunt ? `HUNT #${hunt.id.slice(0, 3).toUpperCase()}` : (params.get("hunt") || "HUNT #000");
  const slots = uid ? String(slotsCount) : (params.get("slots") || "0");
  const total = uid ? String(entries.length) : (params.get("total") || "0");
  const buyin = uid ? fmtAmount(totalBuyIn) : (params.get("buyin") || "$0K");
  const start = uid && hunt ? `${sym}${hunt.start_balance.toLocaleString()}` : (params.get("start") || "$0");
  const reqX = uid ? `${requiredX.toFixed(1)}X` : (params.get("reqx") || "0X");
  const achX = uid ? `${achievedX.toFixed(1)}X` : (params.get("achx") || "0X");

  return (
    <div className="inline-block animate-fade-in-up" style={cssVars}>
      <div
        className="rounded-xl overflow-hidden overlay-card"
      >
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Icon + Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--overlay-highlight, #ef4444) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--overlay-highlight, #ef4444) 20%, transparent)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--overlay-highlight, #ef4444)" }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <span
                className="font-bold text-xs block"
                style={{
                  background: "linear-gradient(90deg, var(--overlay-highlight, #ef4444), var(--overlay-icon-color, #f97316), var(--overlay-highlight, #ef4444))",
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
          <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.15)" }} />

          {/* Stats */}
          <div className="flex items-center gap-4">
            {[
              { label: "Buy-in", value: buyin },
              { label: "Start", value: start },
              { label: "Ben. X", value: reqX },
              { label: "Err. X", value: achX },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <span className="text-[8px] uppercase tracking-wider text-slate-600 block">{s.label}</span>
                <span className="text-white font-bold text-xs">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.15)" }} />

          {/* Slots counter */}
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "color-mix(in srgb, var(--overlay-highlight, #ef4444) 10%, transparent)",
              color: "var(--overlay-highlight, #ef4444)",
              border: "1px solid color-mix(in srgb, var(--overlay-highlight, #ef4444) 15%, transparent)",
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
