"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useOverlayTheme } from "@/hooks/useOverlayTheme";

interface SlotRequest {
  id: string;
  viewer_username: string;
  slot_name: string;
  status: string;
  requested_at: string;
}

function SlotRequestsOverlayContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();
  const { cssVars } = useOverlayTheme(uid);

  const { data: dbRequests, loading } = useOverlayData<SlotRequest[]>({
    table: "slot_requests",
    userId: uid,
    filter: { status: "pending" },
    orderBy: "requested_at",
    ascending: true,
  });

  // URL param fallback
  const title = params.get("title") || "!SR SLOT";
  const fallbackParticipants = parseInt(params.get("participants") || "0");

  // Use DB data if available
  const requests = uid && dbRequests ? dbRequests : [];
  const participants = uid && dbRequests ? dbRequests.length : fallbackParticipants;

  if (uid && loading) {
    return <div className="text-white text-sm animate-pulse">Loading...</div>;
  }

  return (
    <div className="inline-block animate-fade-in-up" style={cssVars}>
      <div
        className="rounded-xl overflow-hidden overlay-card"
        style={{
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
              style={{ background: "color-mix(in srgb, var(--overlay-highlight, #ef4444) 15%, transparent)", border: "1px solid color-mix(in srgb, var(--overlay-highlight, #ef4444) 20%, transparent)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--overlay-highlight, #ef4444)" }}>
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
                background: "linear-gradient(90deg, var(--overlay-highlight, #ef4444), var(--overlay-icon-color, #f97316), var(--overlay-highlight, #ef4444))",
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
                background: participants > 0 ? "rgba(16, 185, 129, 0.15)" : "color-mix(in srgb, var(--overlay-highlight, #ef4444) 10%, transparent)",
                color: participants > 0 ? "#10b981" : "var(--overlay-highlight, #ef4444)",
                border: `1px solid ${participants > 0 ? "rgba(16, 185, 129, 0.25)" : "color-mix(in srgb, var(--overlay-highlight, #ef4444) 15%, transparent)"}`,
              }}
            >
              {participants}
            </span>
          </div>
        </div>

        {/* Participant list area */}
        <div
          className="px-4 py-3 min-h-[120px]"
          style={{ borderTop: "1px solid color-mix(in srgb, var(--overlay-highlight, #ef4444) 8%, transparent)" }}
        >
          {participants === 0 ? (
            <div className="flex items-center justify-center h-[100px]">
              <span className="text-xs text-slate-600">Waiting for requests...</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {requests.map((req, i) => (
                <div
                  key={req.id || i}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ background: "color-mix(in srgb, var(--overlay-highlight, #ef4444) 12%, transparent)", color: "var(--overlay-highlight, #ef4444)" }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-white text-xs font-semibold">{req.viewer_username}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{req.slot_name}</span>
                </div>
              ))}
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
