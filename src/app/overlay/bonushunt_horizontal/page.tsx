"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BonushuntHorizontalContent() {
  const params = useSearchParams();
  const title = params.get("title") || "%TITLE%";
  const hunt = params.get("hunt") || "HUNT #000";
  const slots = params.get("slots") || "0";
  const total = params.get("total") || "0";
  const buyin = params.get("buyin") || "$0K";
  const start = params.get("start") || "$0";
  const bestX = params.get("bestx") || "0X+";
  const avgX = params.get("avgx") || "0X";

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Icon + Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.2)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <span
                className="font-bold text-xs block"
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
              <span className="text-[9px] font-semibold text-slate-500">{hunt}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Stats */}
          <div className="flex items-center gap-4">
            {[
              { label: "Buy-in", value: buyin },
              { label: "Start", value: start },
              { label: "Best", value: bestX },
              { label: "Avg", value: avgX },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <span className="text-[8px] uppercase tracking-wider text-slate-600 block">{s.label}</span>
                <span className="text-white font-bold text-xs">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Slots counter */}
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.15)",
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
