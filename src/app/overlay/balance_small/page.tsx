"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useOverlayUid } from "@/hooks/useOverlayUid";

interface BalanceProfile {
  deposits: number;
  deposits_add: number;
  withdrawals: number;
  withdrawals_add: number;
  leftover: number;
  leftover_add: number;
  currency: string;
}

const currencySymbol = (code: string | null | undefined) =>
  ({ USD: "$", EUR: "\u20ac", GBP: "\u00a3" }[code ?? ""] || code || "$");

function BalanceSmallContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();

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
    const currency = currencySymbol(data?.currency);

    return (
      <BalanceSmallView
        deposits={deposits}
        withdrawals={withdrawals}
        currency={currency}
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
    />
  );
}

/* ---------- pure visual component (unchanged layout) ---------- */
function BalanceSmallView({
  deposits,
  withdrawals,
  currency,
}: {
  deposits: number;
  withdrawals: number;
  currency: string;
}) {
  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-lg overflow-hidden flex items-center gap-5"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
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
