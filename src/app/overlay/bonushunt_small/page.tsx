"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useGlobalCurrency, currencySymbol } from "@/hooks/useGlobalCurrency";
import { useOverlayTheme } from "@/hooks/useOverlayTheme";
import type { Bonushunt, BonushuntEntry } from "@/lib/supabase/types";

function BonushuntSmallContent() {
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

  /* ---- Derive computed values from Supabase data ---- */
  const entries = hunt && allEntries
    ? allEntries.filter((e) => e.bonushunt_id === hunt.id)
    : [];

  const sym = hunt?.currency ? currencySymbol(hunt.currency) : globalCurrency;
  const slotsCount = entries.length;
  const totalBuyIn = entries.reduce((s, e) => s + e.buy_in, 0);

  /* ---- Resolve display values: Supabase → URL fallback ---- */
  const title = uid && hunt ? hunt.name : (params.get("title") || "%TITLE%");
  const huntLabel = uid && hunt ? `HUNT #${hunt.id.slice(0, 3).toUpperCase()}` : (params.get("hunt") || "HUNT #000");
  const slots = uid ? String(slotsCount) : (params.get("slots") || "0");
  const total = uid
    ? `${sym}${totalBuyIn >= 1000 ? (totalBuyIn / 1000).toFixed(1) + "K" : totalBuyIn.toFixed(0)}`
    : (params.get("total") || "0");

  return (
    <div className="inline-block animate-fade-in-up" style={cssVars}>
      <div
        className="rounded-lg overflow-hidden flex items-center overlay-card-sm"
      >
        <div
          className="h-[52px] w-[52px] shrink-0 flex items-center justify-center"
          style={{ background: "rgba(239, 68, 68, 0.08)", borderRight: "1px solid rgba(255,255,255,0.04)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span
              className="font-bold text-xs"
              style={{
                background: "linear-gradient(90deg, #ef4444, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {title}
            </span>
            <span className="text-[10px] font-semibold text-slate-600">{huntLabel}</span>
          </div>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#64748b" }}>
            Slots: {slots}/{total}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BonushuntSmallOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <BonushuntSmallContent />
      </Suspense>
    </div>
  );
}
