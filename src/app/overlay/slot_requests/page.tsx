"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SlotRequestsOverlayContent() {
  const params = useSearchParams();
  const title = params.get("title") || "!SR SLOT";
  const participants = parseInt(params.get("participants") || "0");

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          minWidth: "340px",
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
              style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.2)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </div>
            <span
              className="font-bold text-sm tracking-wide"
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
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold" style={{ color: "#64748b" }}>Participants</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: participants > 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.1)",
                color: participants > 0 ? "#10b981" : "#ef4444",
                border: `1px solid ${participants > 0 ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.15)"}`,
              }}
            >
              {participants}
            </span>
          </div>
        </div>

        {/* Participant list area */}
        <div
          className="px-4 py-3 min-h-[120px]"
          style={{ borderTop: "1px solid rgba(239, 68, 68, 0.08)" }}
        >
          {participants === 0 ? (
            <div className="flex items-center justify-center h-[100px]">
              <span className="text-xs text-slate-600">Waiting for requests...</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Placeholder for participant entries */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SlotRequestsOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <SlotRequestsOverlayContent />
      </Suspense>
    </div>
  );
}
