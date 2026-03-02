"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";

interface TournamentRow {
  name: string;
  description: string | null;
  participant_count: number;
  status: string;
}

function TournamentNormalContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();

  const { data: dbTournament, loading } = useOverlayData<TournamentRow>({
    table: "tournaments",
    userId: uid,
    orderBy: "created_at",
    ascending: false,
    single: true,
  });

  // DB values or URL param fallback
  const title = uid && dbTournament ? dbTournament.name : (params.get("title") || "SLOT BATTLE");
  const status = uid && dbTournament ? dbTournament.status.toUpperCase() : (params.get("status") || "TOURNAMENT FINISHED");
  const winner = params.get("winner") || "WINNER";
  const subtitle = params.get("subtitle") || "HIGHEST X-FACTOR";
  const multiplier = params.get("multiplier") || "0X";

  if (uid && loading) {
    return <div className="text-white text-sm animate-pulse">Loading...</div>;
  }

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
          minWidth: "340px",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span
              className="font-black text-base tracking-wide"
              style={{
                background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 3s ease-in-out infinite",
              }}
            >
              {title}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{status}</span>
        </div>

        {/* Winner Card */}
        <div className="px-5 pb-4">
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.1)",
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Avatar */}
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, #78350f, #92400e)",
                  border: "2px solid rgba(245, 158, 11, 0.4)",
                  boxShadow: "0 0 12px rgba(245, 158, 11, 0.2)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-white font-bold text-sm block">{winner}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{subtitle}</span>
              </div>
              <div
                className="px-2.5 py-1 rounded-md text-xs font-black"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                {multiplier}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span
            className="text-sm font-black tracking-wider"
            style={{ color: "#10b981" }}
          >
            {winner}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TournamentNormalOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <TournamentNormalContent />
      </Suspense>
    </div>
  );
}
