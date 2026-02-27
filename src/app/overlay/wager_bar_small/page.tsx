"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useOverlayUid } from "@/hooks/useOverlayUid";

interface WagerSession {
  casino_name: string;
  header_text: string;
  wager_amount: number;
  wagered_amount: number;
  deposit_amount: number;
  bonus_amount: number;
  currency: string;
}

const currencySymbol = (code: string | null | undefined) =>
  ({ USD: "$", EUR: "\u20ac", GBP: "\u00a3" }[code ?? ""] || code || "$");

function WagerBarSmallContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();

  const { data, loading } = useOverlayData<WagerSession>({
    table: "wager_sessions",
    userId: uid,
    filter: { is_active: true },
    single: true,
  });

  // Supabase realtime path
  if (uid) {
    if (loading) return null;

    const casino = data?.casino_name || "CASINONAME";
    const wager = data?.wager_amount || 0;
    const wagered = data?.wagered_amount || 0;
    const deposit = data?.deposit_amount || 0;
    const bonus = data?.bonus_amount || 0;
    const currency = currencySymbol(data?.currency);
    const game = ""; // game/provider not in wager_sessions table
    const provider = "";

    const left = Math.max(0, wager - wagered);
    const pct = wager > 0 ? Math.min(100, (wagered / wager) * 100) : 0;
    const multiplier = deposit > 0 ? (wagered / deposit).toFixed(1) : "0.0";

    return (
      <WagerBarSmallView
        casino={casino}
        wager={wager}
        wagered={wagered}
        bonus={bonus}
        left={left}
        pct={pct}
        multiplier={multiplier}
        currency={currency}
        game={game}
        provider={provider}
      />
    );
  }

  // URL params fallback
  const casino = params.get("casino") || "CASINONAME";
  const wager = parseFloat(params.get("wager") || "0");
  const wagered = parseFloat(params.get("wagered") || "0");
  const deposit = parseFloat(params.get("deposit") || "0");
  const bonus = parseFloat(params.get("bonus") || "0");
  const game = params.get("game") || "Sweet Bonanza";
  const provider = params.get("provider") || "PRAGMATIC PLAY";
  const currency = params.get("currency") || "$";

  const left = Math.max(0, wager - wagered);
  const pct = wager > 0 ? Math.min(100, (wagered / wager) * 100) : 0;
  const multiplier = deposit > 0 ? (wagered / deposit).toFixed(1) : "0.0";

  return (
    <WagerBarSmallView
      casino={casino}
      wager={wager}
      wagered={wagered}
      bonus={bonus}
      left={left}
      pct={pct}
      multiplier={multiplier}
      currency={currency}
      game={game}
      provider={provider}
    />
  );
}

/* ---------- pure visual component (unchanged layout) ---------- */
function WagerBarSmallView({
  casino,
  wager,
  wagered,
  bonus,
  left,
  pct,
  multiplier,
  currency,
  game,
  provider,
}: {
  casino: string;
  wager: number;
  wagered: number;
  bonus: number;
  left: number;
  pct: number;
  multiplier: string;
  currency: string;
  game: string;
  provider: string;
}) {
  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
          minWidth: "420px",
          padding: "10px 14px",
        }}
      >
        {/* Top row: wager + left + percentage */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="font-bold text-xs tracking-wide"
            style={{ color: "#ef4444" }}
          >
            WAGER: {currency}{wager.toLocaleString()}
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span style={{ color: "#94a3b8" }}>
              LEFT: <span className="text-white font-semibold">{currency}{left.toLocaleString()}</span>
            </span>
            <span
              className="font-semibold px-2 py-0.5 rounded text-[10px]"
              style={{
                background: pct > 50 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: pct > 50 ? "#10b981" : "#ef4444",
              }}
            >
              {pct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="h-1 rounded-full mb-3 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full animate-progress-shimmer"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #ef4444, #f97316, #ef4444, #f97316)",
              transition: "width 1s ease-in-out",
            }}
          />
        </div>

        {/* Casino name + game info */}
        <div className="flex items-center gap-3">
          <span
            className="font-bold text-[11px] tracking-wider px-2 py-0.5 rounded"
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {casino.toUpperCase()}
          </span>

          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]" style={{ color: "#22c55e" }}>&#9654;</span>
              <div className="overflow-hidden flex-1">
                <div className="animate-carousel whitespace-nowrap">
                  <span className="text-white text-xs font-medium mr-8">{game}</span>
                  <span className="text-slate-500 text-[10px] mr-8">{provider}</span>
                  <span className="text-white text-xs font-medium mr-8">{game}</span>
                  <span className="text-slate-500 text-[10px] mr-8">{provider}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-xs font-semibold" style={{ color: "#ef4444" }}>
            {currency}{bonus.toLocaleString()}
          </span>
          <div className="flex items-center gap-2 text-[11px]" style={{ color: "#64748b" }}>
            <span className="text-amber-400 font-semibold">{multiplier}X</span>
            <span className="text-slate-700">|</span>
            <span>{currency}{wagered.toLocaleString()}</span>
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400 font-semibold">{multiplier}X</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WagerBarSmallPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <WagerBarSmallContent />
      </Suspense>
    </div>
  );
}
