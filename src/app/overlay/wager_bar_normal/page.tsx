"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useGlobalCurrency, currencySymbol } from "@/hooks/useGlobalCurrency";
import { useOverlayTheme } from "@/hooks/useOverlayTheme";

interface WagerSession {
  casino_name: string;
  header_text: string;
  wager_amount: number;
  wagered_amount: number;
  deposit_amount: number;
  bonus_amount: number;
  currency: string;
}

function WagerBarNormalContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();
  const { cssVars } = useOverlayTheme(uid);
  const { symbol: globalCurrency } = useGlobalCurrency(uid);

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
    const header = data?.header_text || "PULSEFRAMELABS.COM";
    const wager = data?.wager_amount || 0;
    const wagered = data?.wagered_amount || 0;
    const deposit = data?.deposit_amount || 0;
    const bonus = data?.bonus_amount || 0;
    const currency = data?.currency ? currencySymbol(data.currency) : globalCurrency;

    const left = Math.max(0, wager - wagered);
    const pct = wager > 0 ? Math.min(100, (wagered / wager) * 100) : 0;
    const start = deposit + bonus;

    return (
      <WagerBarNormalView
        casino={casino}
        header={header}
        wager={wager}
        wagered={wagered}
        left={left}
        pct={pct}
        start={start}
        currency={currency}
        cssVars={cssVars}
      />
    );
  }

  // URL params fallback
  const casino = params.get("casino") || "CASINONAME";
  const header = params.get("header") || "PULSEFRAMELABS.COM";
  const wager = parseFloat(params.get("wager") || "0");
  const wagered = parseFloat(params.get("wagered") || "0");
  const deposit = parseFloat(params.get("deposit") || "0");
  const bonus = parseFloat(params.get("bonus") || "0");
  const currency = params.get("currency") || "$";

  const left = Math.max(0, wager - wagered);
  const pct = wager > 0 ? Math.min(100, (wagered / wager) * 100) : 0;
  const start = deposit + bonus;

  return (
    <WagerBarNormalView
      casino={casino}
      header={header}
      wager={wager}
      wagered={wagered}
      left={left}
      pct={pct}
      start={start}
      currency={currency}
      cssVars={cssVars}
    />
  );
}

/* ---------- pure visual component (unchanged layout) ---------- */
function WagerBarNormalView({
  casino,
  header,
  wager,
  wagered,
  left,
  pct,
  start,
  currency,
  cssVars,
}: {
  casino: string;
  header: string;
  wager: number;
  wagered: number;
  left: number;
  pct: number;
  start: number;
  currency: string;
  cssVars?: React.CSSProperties;
}) {
  return (
    <div className="inline-block animate-fade-in-up" style={cssVars}>
      <div
        className="rounded-xl overflow-hidden overlay-card-vertical"
        style={{
          minWidth: "440px",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-2.5 flex items-center justify-center"
          style={{
            background: "linear-gradient(90deg, color-mix(in srgb, var(--overlay-highlight, #ef4444) 8%, transparent), color-mix(in srgb, var(--overlay-highlight, #ef4444) 18%, transparent), color-mix(in srgb, var(--overlay-highlight, #ef4444) 8%, transparent))",
            borderBottom: "1px solid color-mix(in srgb, var(--overlay-highlight, #ef4444) 12%, transparent)",
          }}
        >
          <span
            className="font-bold text-sm tracking-[0.15em]"
            style={{
              background: "linear-gradient(90deg, var(--overlay-highlight, #fca5a5), #ffffff, var(--overlay-highlight, #fca5a5))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
            }}
          >
            {header}
          </span>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Wager progress */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <span
                className="font-bold text-sm px-3 py-1 rounded"
                style={{
                  background: "color-mix(in srgb, var(--overlay-highlight, #ef4444) 15%, transparent)",
                  color: "var(--overlay-highlight, #ef4444)",
                  border: "1px solid color-mix(in srgb, var(--overlay-highlight, #ef4444) 20%, transparent)",
                }}
              >
                {currency}{wagered.toLocaleString()} / {currency}{wager.toLocaleString()}
              </span>
              <span
                className="font-semibold text-sm px-2.5 py-1 rounded"
                style={{
                  background: pct > 50 ? "rgba(16, 185, 129, 0.12)" : "color-mix(in srgb, var(--overlay-highlight, #ef4444) 12%, transparent)",
                  color: pct > 50 ? "#10b981" : "var(--overlay-highlight, #ef4444)",
                }}
              >
                {pct.toFixed(1)}%
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div
                className="h-full rounded-full relative"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, var(--overlay-highlight, #ef4444), var(--overlay-icon-color, #f97316), var(--overlay-highlight, #eab308))",
                  transition: "width 1.5s ease-in-out",
                }}
              >
                <div
                  className="absolute inset-0 rounded-full animate-progress-shimmer"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div
            className="rounded-lg p-3 space-y-1.5"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium" style={{ color: "#64748b" }}>TOTAL</span>
              <span className="text-white font-semibold">{currency}{wager.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "#64748b" }}>
                WEBSITE: <span className="font-semibold text-blue-400">{casino.toUpperCase()}</span>
              </span>
              <span style={{ color: "#64748b" }}>
                LEFT: <span className="text-amber-400 font-semibold">{currency}{left.toLocaleString()}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "#64748b" }}>
                START: <span className="text-emerald-400 font-semibold">{currency}{start.toLocaleString()}</span>
              </span>
              <span style={{ color: "#64748b" }}>
                WAGERED: <span className="text-red-400 font-semibold">{currency}{wagered.toLocaleString()}</span>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center pt-1">
            <span
              className="text-[9px] tracking-[0.12em] font-medium uppercase"
              style={{ color: "rgba(100, 116, 139, 0.4)" }}
            >
              Powered by Pulseframelabs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WagerBarNormalPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <WagerBarNormalContent />
      </Suspense>
    </div>
  );
}
