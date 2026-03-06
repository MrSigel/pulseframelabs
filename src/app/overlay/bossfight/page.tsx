"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useOverlayTheme } from "@/hooks/useOverlayTheme";

interface BossfightSession {
  id: string;
  status: string;
  boss_name: string | null;
  boss_game: string | null;
  boss_lives: number;
  boss_max_lives: number;
  current_player_index: number;
  winner_side: string | null;
}

interface BossfightPlayer {
  id: string;
  session_id: string;
  username: string;
  game: string;
  is_boss: boolean;
  is_eliminated: boolean;
  position: number;
}

function BossfightContent() {
  const uid = useOverlayUid();
  const { cssVars } = useOverlayTheme(uid);

  const { data: allSessions } = useOverlayData<BossfightSession[]>({
    table: "bossfight_sessions",
    userId: uid,
    orderBy: "created_at",
    ascending: false,
  });

  const session = useMemo(() => {
    if (!Array.isArray(allSessions)) return null;
    return allSessions.find((s) => s.status !== "finished") ?? null;
  }, [allSessions]);

  const { data: allPlayers } = useOverlayData<BossfightPlayer[]>({
    table: "bossfight_players",
    userId: uid,
    orderBy: "position",
    ascending: true,
  });

  const players = useMemo(() => {
    if (!Array.isArray(allPlayers) || !session) return [];
    return allPlayers.filter((p) => p.session_id === session.id);
  }, [allPlayers, session]);

  const boss = players.find((p) => p.is_boss) ?? null;
  const fighters = players.filter((p) => !p.is_boss);
  const aliveFighters = fighters.filter((p) => !p.is_eliminated);
  const currentIdx = session?.current_player_index ?? 0;
  const currentFighter = aliveFighters[currentIdx % aliveFighters.length] ?? null;

  if (!session || session.status === "join_open") return null;

  return (
    <div className="p-4 animate-fade-in-up" style={cssVars}>
      <div className="overlay-card-lg rounded-xl overflow-hidden" style={{ minWidth: 380, maxWidth: 440 }}>
        {/* Header */}
        <div className="px-5 pt-4 pb-3 text-center">
          <span
            className="font-black text-base tracking-wider"
            style={{
              background: "linear-gradient(90deg, #ef4444, var(--overlay-highlight, #f59e0b), #ef4444)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          >
            BOSSFIGHT
          </span>
        </div>

        {/* Boss section */}
        {boss && (
          <div className="mx-4 mb-3 px-4 py-3 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <div className="flex items-center gap-2 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z" />
              </svg>
              <span className="text-white font-bold text-sm">{boss.username}</span>
              <span className="text-slate-500 text-[10px] ml-auto">{boss.game}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: session.boss_max_lives }).map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < session.boss_lives ? "#ef4444" : "rgba(255,255,255,0.08)"} stroke="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              ))}
            </div>
          </div>
        )}

        {/* VS indicator for live matches */}
        {session.status === "live" && currentFighter && boss && (
          <div className="text-center pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {boss.username} <span className="text-red-400 mx-1">VS</span> {currentFighter.username}
            </span>
          </div>
        )}

        {/* Fighters list */}
        <div className="px-4 pb-3 space-y-1">
          {fighters.map((p, i) => {
            const isCurrent = session.status === "live" && currentFighter?.id === p.id;
            return (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: p.is_eliminated
                    ? "rgba(255,255,255,0.02)"
                    : isCurrent
                      ? "rgba(59,130,246,0.08)"
                      : "rgba(255,255,255,0.04)",
                  border: isCurrent ? "1px solid rgba(59,130,246,0.15)" : "1px solid transparent",
                  opacity: p.is_eliminated ? 0.35 : 1,
                }}
              >
                <span className="text-[10px] text-slate-600 w-3 text-right shrink-0">{i + 1}</span>
                <span className={`text-[11px] font-semibold flex-1 truncate ${p.is_eliminated ? "line-through text-slate-600" : "text-white"}`}>
                  {p.username}
                </span>
                <span className="text-[9px] text-slate-500 truncate max-w-20">{p.game}</span>
                {p.is_eliminated && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(239,68,68,0.4)" stroke="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z" />
                  </svg>
                )}
                {isCurrent && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#3b82f6" stroke="none">
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Winner announcement */}
        {session.winner_side && (
          <div className="mx-4 mb-4 px-4 py-3 rounded-lg text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">Winner</div>
            <div className="text-lg font-black text-amber-400">
              {session.winner_side === "boss" ? `Boss: ${boss?.username}` : "Players Win!"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BossfightOverlayPage() {
  return (
    <div style={{ background: "transparent" }}>
      <Suspense fallback={null}>
        <BossfightContent />
      </Suspense>
    </div>
  );
}
