"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useGlobalCurrency, currencySymbol } from "@/hooks/useGlobalCurrency";
import { useOverlayTheme } from "@/hooks/useOverlayTheme";

interface BalanceProfile {
  deposits: number;
  deposits_add: number;
  withdrawals: number;
  withdrawals_add: number;
  leftover: number;
  leftover_add: number;
  currency: string;
}

function BalanceLargeContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();
  const { cssVars } = useOverlayTheme(uid);
  const { symbol: globalCurrency } = useGlobalCurrency(uid);

  const { data, loading } = useOverlayData<BalanceProfile>({
    table: "balance_profiles",
    userId: uid,
    single: true,
  });

  // Supabase realtime path
  if (uid) {
    if (loading) return null;

    const deposits = data ? data.deposits + data.deposits_add : 0;
    const withdrawals = data ? data.withdrawals + data.withdrawals_add : 0;
    const leftover = data ? data.leftover + data.leftover_add : 0;
    const currency = data?.currency ? currencySymbol(data.currency) : globalCurrency;

    return (
      <BalanceLargeView
        deposits={deposits}
        withdrawals={withdrawals}
        leftover={leftover}
        currency={currency}
        cssVars={cssVars}
      />
    );
  }

  // URL params fallback
  const deposits = parseFloat(params.get("deposits") || "0");
  const withdrawals = parseFloat(params.get("withdrawals") || "0");
  const leftover = parseFloat(params.get("leftover") || "0");
  const currency = params.get("currency") || "$";

  return (
    <BalanceLargeView
      deposits={deposits}
      withdrawals={withdrawals}
      leftover={leftover}
      currency={currency}
      cssVars={cssVars}
    />
  );
}

/* ---------- pure visual component (unchanged layout) ---------- */
function BalanceLargeView({
  deposits,
  withdrawals,
  leftover,
  currency,
  cssVars,
}: {
  deposits: number;
  withdrawals: number;
  leftover: number;
  currency: string;
  cssVars?: React.CSSProperties;
}) {
  return (
    <div className="inline-block animate-fade-in-up" style={cssVars}>
      <div
        className="rounded-xl overflow-hidden flex items-center gap-6 overlay-card"
        style={{
          padding: "14px 22px",
        }}
      >
        {/* Deposits */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center h-8 w-8 rounded-full text-base font-bold"
            style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.25)" }}
          >
            +
          </div>
          <span className="text-white font-bold text-lg">{currency}{deposits.toLocaleString()}</span>
        </div>

        {/* Withdrawals */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center h-8 w-8 rounded-full text-base font-bold"
            style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
          >
            &minus;
          </div>
          <span className="text-white font-bold text-lg">{currency}{withdrawals.toLocaleString()}</span>
        </div>

        {/* Balance / LeftOver */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center h-8 w-8 rounded-full text-base font-bold"
            style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", border: "1px solid rgba(139, 92, 246, 0.25)" }}
          >
            &#8645;
          </div>
          <span className="text-white font-bold text-lg">{currency}{leftover.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function BalanceLargePage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <BalanceLargeContent />
      </Suspense>
    </div>
  );
}
