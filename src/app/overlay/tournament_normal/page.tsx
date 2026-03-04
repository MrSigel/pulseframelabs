"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useOverlayTheme } from "@/hooks/useOverlayTheme";

interface TournamentRow {
  id: string;
  name: string;
  description: string | null;
  participant_count: number;
  bracket_data: { winner?: string } | null;
  status: string;
}

interface ParticipantRow {
  tournament_id: string;
  viewer_username: string;
  game_name: string;
  badge_image_url: string | null;
}

function TournamentNormalContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();
  const { cssVars } = useOverlayTheme(uid);

  // Fetch all tournaments and pick the most relevant one
  const { data: allTournaments, loading } = useOverlayData<TournamentRow[]>({
    table: "tournaments",
    userId: uid,
    orderBy: "updated_at",
    ascending: false,
  });

  const dbTournament = useMemo(() => {
    if (!Array.isArray(allTournaments)) return null;
    // Priority: join_open > ongoing > draw > finished
    for (const status of ["join_open", "ongoing", "draw", "finished"]) {
      const t = allTournaments.find((t) => t.status === status);
      if (t) return t;
    }
    return null;
  }, [allTournaments]);

  // Fetch participants
  const { data: participantsArr } = useOverlayData<ParticipantRow[]>({
    table: "tournament_participants",
    userId: uid,
    orderBy: "joined_at",
    ascending: true,
  });

  // Filter participants to only the selected tournament
  const participants = useMemo(() => {
    if (!Array.isArray(participantsArr) || !dbTournament) return [];
    return participantsArr.filter((p) => p.tournament_id === dbTournament.id);
  }, [participantsArr, dbTournament]);

  // DB values or URL param fallback
  const title = uid && dbTournament ? dbTournament.name : (params.get("title") || "TOURNAMENT");
  const rawStatus = uid && dbTournament ? dbTournament.status : (params.get("status") || "tournament");
  const statusLabels: Record<string, string> = {
    pending: "PENDING",
    join_open: "JOIN OPEN",
    draw: "DRAW",
    ongoing: "ONGOING",
    finished: "FINISHED",
  };
  const status = statusLabels[rawStatus] || rawStatus.toUpperCase();
  const winner = (uid && dbTournament?.bracket_data?.winner) || params.get("winner") || "";
  const subtitle = params.get("subtitle") || "";
  const multiplier = params.get("multiplier") || "";

  if (uid && loading) {
    return <div className="text-white text-sm animate-pulse">Loading...</div>;
  }

  return (
    <div className="inline-block animate-fade-in-up" style={cssVars}>
      <div
        className="rounded-xl overflow-hidden overlay-card-lg"
        style={{ minWidth: "340px", maxWidth: "420px" }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--overlay-highlight, #f59e0b)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                background: `linear-gradient(90deg, var(--overlay-highlight, #f59e0b), var(--overlay-icon-color, #ef4444), var(--overlay-highlight, #f59e0b))`,
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

        {/* Participants List */}
        {participants.length > 0 && (
          <div className="px-5 pb-3 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/25 mb-2">
              Participants ({participants.length})
            </div>
            <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1">
              {participants.map((p) => (
                <div
                  key={p.viewer_username}
                  className="relative flex items-center gap-2.5 px-3 py-2 rounded-lg overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Badge background */}
                  {p.badge_image_url && (
                    <img
                      src={p.badge_image_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ opacity: 0.2 }}
                    />
                  )}
                  <div className="relative z-10 flex-1 min-w-0">
                    <span className="text-white font-semibold text-xs block truncate">
                      {p.viewer_username}
                    </span>
                    {p.game_name && (
                      <span className="text-[10px] text-white/40 truncate block">
                        {p.game_name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Winner Card (shown when winner param is set) */}
        {winner && (
          <div className="px-5 pb-4">
            <div
              className="relative rounded-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, var(--overlay-icon-color, #ef4444) 15%, transparent), color-mix(in srgb, var(--overlay-icon-color, #ef4444) 5%, transparent))`,
                border: `1px solid color-mix(in srgb, var(--overlay-icon-color, #ef4444) 25%, transparent)`,
                boxShadow: `0 0 20px color-mix(in srgb, var(--overlay-icon-color, #ef4444) 10%, transparent)`,
              }}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Avatar */}
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, var(--overlay-highlight, #f59e0b) 40%, #000), color-mix(in srgb, var(--overlay-highlight, #f59e0b) 50%, #000))`,
                    border: `2px solid color-mix(in srgb, var(--overlay-highlight, #f59e0b) 40%, transparent)`,
                    boxShadow: `0 0 12px color-mix(in srgb, var(--overlay-highlight, #f59e0b) 20%, transparent)`,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--overlay-highlight, #f59e0b)" stroke="none">
                    <circle cx="12" cy="8" r="5" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-white font-bold text-sm block">{winner}</span>
                  {subtitle && (
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{subtitle}</span>
                  )}
                </div>
                {multiplier && (
                  <div
                    className="px-2.5 py-1 rounded-md text-xs font-black"
                    style={{
                      background: `color-mix(in srgb, var(--overlay-icon-color, #ef4444) 15%, transparent)`,
                      color: "var(--overlay-icon-color, #ef4444)",
                      border: `1px solid color-mix(in srgb, var(--overlay-icon-color, #ef4444) 20%, transparent)`,
                    }}
                  >
                    {multiplier}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {winner && (
          <div
            className="px-5 py-3 text-center"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span
              className="text-sm font-black tracking-wider"
              style={{ color: "var(--overlay-icon-color, #10b981)" }}
            >
              {winner}
            </span>
          </div>
        )}
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
