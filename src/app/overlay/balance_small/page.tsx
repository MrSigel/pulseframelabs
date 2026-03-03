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

function BalanceSmallContent() {
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
    const currency = data?.currency ? currencySymbol(data.currency) : globalCurrency;

    return (
      <BalanceSmallView
        deposits={deposits}
        withdrawals={withdrawals}
        currency={currency}
        cssVars={cssVars}
      />
    );
  }

  // URL params fallback
  const deposits = parseFloat(params.get("deposits") || "0");
  const withdrawals = parseFloat(params.get("withdrawals") || "0");
  const currency = params.get("currency") || "$";

  return (
    <BalanceSmallView
      deposits={deposits}
      withdrawals={withdrawals}
      currency={currency}
      cssVars={cssVars}
    />
  );
}

/* ---------- pure visual component (unchanged layout) ---------- */
function BalanceSmallView({
  deposits,
  withdrawals,
  currency,
  cssVars,
}: {
  deposits: number;
  withdrawals: number;
  currency: string;
  cssVars?: React.CSSProperties;
}) {
  return (
    <div className="inline-block animate-fade-in-up" style={cssVars}>
      <div
        className="rounded-lg overflow-hidden flex items-center gap-5 overlay-card-sm"
        style={{
          padding: "10px 16px",
        }}
      >
        {/* Deposits */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold"
            style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.25)" }}
          >
            +
          </div>
          <span className="text-white font-bold text-sm">{currency}{deposits.toLocaleString()}</span>
        </div>

        {/* Withdrawals */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold"
            style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
          >
            &minus;
          </div>
          <span className="text-white font-bold text-sm">{currency}{withdrawals.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function BalanceSmallPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <BalanceSmallContent />
      </Suspense>
    </div>
  );
}
