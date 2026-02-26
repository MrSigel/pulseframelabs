"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function WagerBarNormalContent() {
  const params = useSearchParams();
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
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0c1018 0%, #111827 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          minWidth: "440px",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-2.5 flex items-center justify-center"
          style={{
            background: "linear-gradient(90deg, rgba(239,68,68,0.08), rgba(239,68,68,0.18), rgba(239,68,68,0.08))",
            borderBottom: "1px solid rgba(239, 68, 68, 0.12)",
          }}
        >
          <span
            className="font-bold text-sm tracking-[0.15em]"
            style={{
              background: "linear-gradient(90deg, #fca5a5, #ffffff, #fca5a5)",
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
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                {currency}{wagered.toLocaleString()} / {currency}{wager.toLocaleString()}
              </span>
              <span
                className="font-semibold text-sm px-2.5 py-1 rounded"
                style={{
                  background: pct > 50 ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                  color: pct > 50 ? "#10b981" : "#ef4444",
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
                  background: "linear-gradient(90deg, #ef4444, #f97316, #eab308)",
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
