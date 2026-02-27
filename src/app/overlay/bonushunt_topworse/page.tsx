"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import type { Bonushunt, BonushuntEntry } from "@/lib/supabase/types";

function BonushuntTopWorseContent() {
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

  /* ---- Compute top / worst entries ---- */
  const entries = hunt && allEntries
    ? allEntries.filter((e) => e.bonushunt_id === hunt.id)
    : [];

  const sortedDesc = [...entries].sort((a, b) => b.multiplier - a.multiplier);
  const top3 = sortedDesc.slice(0, 3);
  const worst3 = [...entries].sort((a, b) => a.multiplier - b.multiplier).slice(0, 3);

  /* ---- Resolve display values: Supabase -> URL fallback ---- */
  const title = uid && hunt ? hunt.name : (params.get("title") || "%TITLE%");

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          minWidth: "320px",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span
            className="font-bold text-sm"
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
          <span className="text-[10px] font-semibold text-slate-500">TOP / WORSE</span>
        </div>

        {/* Top Section */}
        <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-2 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Top Wins</span>
          </div>
          <div className="space-y-1">
            {(uid && top3.length > 0 ? top3 : [null, null, null]).map((entry, n) => (
              <div
                key={n}
                className="flex items-center justify-between px-3 py-1.5 rounded-md"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <span className="text-slate-500 text-[10px] font-semibold">#{n + 1}</span>
                <span className="text-slate-600 text-[10px]">
                  {entry ? `${entry.game_name} — ${entry.multiplier.toFixed(1)}X` : "---"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Worse Section */}
        <div className="px-4 py-2.5">
          <div className="flex items-center gap-2 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
              <path d="M12 2C8 6 4 9.5 4 13a8 8 0 0016 0c0-3.5-4-7-8-11z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400/80">Worst</span>
          </div>
          <div className="space-y-1">
            {(uid && worst3.length > 0 ? worst3 : [null, null, null]).map((entry, n) => (
              <div
                key={n}
                className="flex items-center justify-between px-3 py-1.5 rounded-md"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <span className="text-slate-500 text-[10px] font-semibold">#{n + 1}</span>
                <span className="text-slate-600 text-[10px]">
                  {entry ? `${entry.game_name} — ${entry.multiplier.toFixed(1)}X` : "---"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BonushuntTopWorseOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <BonushuntTopWorseContent />
      </Suspense>
    </div>
  );
}
