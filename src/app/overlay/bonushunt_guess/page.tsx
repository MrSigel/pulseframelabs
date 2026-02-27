"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import type { Bonushunt, BonushuntEntry } from "@/lib/supabase/types";

const currencySymbol = (code: string | undefined) =>
  ({ USD: "$", EUR: "\u20ac", GBP: "\u00a3", CAD: "C$", AUD: "A$" }[code || ""] || code || "$");

function BonushuntGuessContent() {
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

  /* ---- Compute balance from Supabase data ---- */
  const entries = hunt && allEntries
    ? allEntries.filter((e) => e.bonushunt_id === hunt.id)
    : [];

  const sym = hunt ? currencySymbol(hunt.currency) : "$";
  const totalWins = entries.reduce((s, e) => s + e.win_amount, 0);
  const startBal = hunt ? hunt.start_balance : 0;
  const currentBalance = startBal + totalWins;

  /* ---- Resolve display values: Supabase -> URL fallback ---- */
  const title = uid && hunt ? hunt.name : (params.get("title") || "%TITLE%");
  const balance = uid
    ? `${sym}${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : (params.get("balance") || "$0.00");

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          minWidth: "300px",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-md flex items-center justify-center"
              style={{ background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.2)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400/80">Guess Balance</span>
          </div>
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
        </div>

        {/* Balance */}
        <div className="px-4 py-6 text-center">
          <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-1">Current Balance</p>
          <p
            className="text-2xl font-bold animate-pulse-value"
            style={{
              background: "linear-gradient(135deg, #10b981, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {balance}
          </p>
          <p className="text-[9px] text-slate-600 mt-2">Type !guess &lt;amount&gt; in chat</p>
        </div>
      </div>
    </div>
  );
}

export default function BonushuntGuessOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <BonushuntGuessContent />
      </Suspense>
    </div>
  );
}
