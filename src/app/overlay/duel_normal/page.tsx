"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import type { DuelSession, DuelPlayer } from "@/lib/supabase/types";

const fallbackPlayers = [
  { name: "Player 1", game: "Sweet Bonanza",     buyIn: "100$", result: "---", rank: 1 },
  { name: "Player 2", game: "Gates of Olympus",  buyIn: "100$", result: "---", rank: 2 },
];

const playerColors = ["#ef4444", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

function DuelContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();

  /* ---- Supabase realtime data ---- */
  const { data: session } = useOverlayData<DuelSession>({
    table: "duel_sessions",
    userId: uid,
    filter: { status: "active" },
    single: true,
  });

  const { data: allPlayers } = useOverlayData<DuelPlayer[]>({
    table: "duel_players",
    userId: uid,
    orderBy: "position",
    ascending: true,
  });

  /* ---- Filter players to active session ---- */
  const sessionPlayers = session && allPlayers
    ? allPlayers.filter((p) => p.session_id === session.id)
    : [];

  /* ---- Resolve display values: Supabase -> URL fallback ---- */
  const title = uid && session ? "DUEL" : (params.get("title") || "DUEL");

  const players = uid && sessionPlayers.length > 0
    ? sessionPlayers.map((p) => ({
        name: p.name,
        game: p.game,
        buyIn: p.buy_in,
        result: p.result || "---",
        rank: Number(p.rank) || p.position,
      }))
    : fallbackPlayers;

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
          minWidth: "400px",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span
              className="font-black text-base tracking-wider"
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {players.length} Players
          </span>
        </div>

        {/* Table Header */}
        <div
          className="grid px-4 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500"
          style={{
            gridTemplateColumns: "1fr 1.2fr 0.8fr 0.8fr 0.5fr",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span>Player</span>
          <span>Game</span>
          <span>Buy-In</span>
          <span>Result</span>
          <span className="text-center">#</span>
        </div>

        {/* Players */}
        <div className="px-4 pb-3">
          {players.map((p, i) => {
            const color = playerColors[i % playerColors.length];
            return (
              <div
                key={i}
                className="grid py-2 items-center"
                style={{
                  gridTemplateColumns: "1fr 1.2fr 0.8fr 0.8fr 0.5fr",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center"
                    style={{
                      background: `${color}1f`,
                      border: `1px solid ${color}33`,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill={color} stroke="none">
                      <circle cx="12" cy="8" r="5" />
                      <path d="M20 21a8 8 0 0 0-16 0" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold text-[10px]">{p.name}</span>
                </div>
                <span className="text-slate-400 text-[10px]">{p.game}</span>
                <span className="text-white text-[10px] font-semibold">{p.buyIn}</span>
                <span className="text-slate-500 text-[10px]">{p.result}</span>
                <span className="text-amber-400 text-[10px] font-bold text-center">{p.rank}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-[8px] uppercase tracking-widest text-slate-600">
            !duel GameName to join
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DuelOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <DuelContent />
      </Suspense>
    </div>
  );
}
