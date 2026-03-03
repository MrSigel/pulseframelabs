"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";

/* ─── Types ─── */

interface TournamentRow {
  name: string;
  description: string | null;
  participant_count: number;
  bracket_data: BracketData | null;
  status: string;
}

interface BracketData {
  rounds?: BracketRound[];
  winner?: string;
}

interface BracketRound {
  name: string;
  matchups: BracketMatchup[];
}

interface BracketMatchup {
  player1: string;
  player2: string;
}

/* ─── Helpers ─── */

function getRoundName(roundIndex: number, totalRounds: number): string {
  const remaining = totalRounds - roundIndex;
  if (remaining === 1) return "Final";
  if (remaining === 2) return "Semi-Finals";
  if (remaining === 3) return "Quarter-Finals";
  if (remaining === 4) return "Round of 16";
  return `Round ${roundIndex + 1}`;
}

function getLayout(p: number) {
  if (p <= 8) return { matchH: 54, matchW: 150, vGap: 20, hGap: 40, fs: 11 };
  if (p <= 16) return { matchH: 46, matchW: 140, vGap: 12, hGap: 34, fs: 10 };
  return { matchH: 40, matchW: 130, vGap: 6, hGap: 28, fs: 9 };
}

/* ─── Main Content ─── */

function TournamentBracketContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();

  const { data: dbTournament, loading } = useOverlayData<TournamentRow>({
    table: "tournaments",
    userId: uid,
    orderBy: "created_at",
    ascending: false,
    single: true,
  });

  const fallbackTitle = params.get("title") || "TOURNAMENT";
  const fallbackParticipants = parseInt(params.get("participants") || "8");

  const title = uid && dbTournament ? dbTournament.name : fallbackTitle;
  const rawCount = uid && dbTournament ? dbTournament.participant_count : fallbackParticipants;
  const bracketData = uid && dbTournament ? dbTournament.bracket_data : null;
  const winner = bracketData?.winner;

  // Ensure power-of-2 (8, 16, 32)
  const participants = Math.pow(2, Math.ceil(Math.log2(Math.max(2, rawCount))));
  const totalRounds = Math.log2(participants);
  const { matchH, matchW, vGap, hGap, fs } = getLayout(participants);

  // Build round data (DB or placeholders)
  const roundsData = useMemo(() => {
    const rounds: BracketRound[] = [];
    for (let r = 0; r < totalRounds; r++) {
      const expected = participants / Math.pow(2, r + 1);
      if (bracketData?.rounds?.[r]) {
        const db = bracketData.rounds[r];
        const matchups = [...db.matchups];
        while (matchups.length < expected) matchups.push({ player1: "TBD", player2: "TBD" });
        rounds.push({ name: db.name || getRoundName(r, totalRounds), matchups: matchups.slice(0, expected) });
      } else {
        rounds.push({
          name: getRoundName(r, totalRounds),
          matchups: Array.from({ length: expected }, (_, i) => ({
            player1: r === 0 ? `Player ${i * 2 + 1}` : "TBD",
            player2: r === 0 ? `Player ${i * 2 + 2}` : "TBD",
          })),
        });
      }
    }
    return rounds;
  }, [totalRounds, participants, bracketData]);

  // Compute match positions (x, y per round)
  const { positions, totalW, totalH } = useMemo(() => {
    const all: { x: number; y: number }[][] = [];

    // Round 1 — evenly spaced
    all.push(
      roundsData[0].matchups.map((_, i) => ({ x: 0, y: i * (matchH + vGap) }))
    );

    // Later rounds — center between feeder pairs
    for (let r = 1; r < totalRounds; r++) {
      const prev = all[r - 1];
      const curr: { x: number; y: number }[] = [];
      for (let i = 0; i < prev.length / 2; i++) {
        const topC = prev[i * 2].y + matchH / 2;
        const botC = prev[i * 2 + 1].y + matchH / 2;
        curr.push({ x: r * (matchW + hGap), y: (topC + botC) / 2 - matchH / 2 });
      }
      all.push(curr);
    }

    const w = totalRounds * matchW + (totalRounds - 1) * hGap + hGap + 94;
    const h = all[0][all[0].length - 1].y + matchH;
    return { positions: all, totalW: w, totalH: h };
  }, [roundsData, totalRounds, matchH, matchW, vGap, hGap]);

  if (uid && loading) {
    return <div className="text-white text-sm animate-pulse">Loading bracket...</div>;
  }

  const winnerBoxX = (totalRounds - 1) * (matchW + hGap) + matchW + hGap;
  const finalPos = positions[positions.length - 1][0];
  const winnerBoxY = finalPos.y + matchH / 2 - 26;

  return (
    <div className="inline-block">
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 mb-4">
        <TrophyIcon size={20} color="#f59e0b" />
        <span
          className="font-bold text-[15px] tracking-wide"
          style={{
            background: "linear-gradient(90deg, #f59e0b, #ef4444)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </span>
        <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
          {participants} Players · {totalRounds} Rounds
        </span>
      </div>

      {/* ── Round Labels ── */}
      <div className="flex items-center mb-2">
        {roundsData.map((round, i) => (
          <div
            key={i}
            className="text-[9px] font-bold uppercase tracking-wider text-white/25 text-center shrink-0"
            style={{ width: matchW, marginRight: hGap }}
          >
            {round.name}
          </div>
        ))}
        <div
          className="text-[9px] font-bold uppercase tracking-wider text-amber-500/40 text-center shrink-0"
          style={{ width: 94 }}
        >
          Champion
        </div>
      </div>

      {/* ── Bracket ── */}
      <div className="relative" style={{ width: totalW, height: totalH }}>
        {/* SVG connector lines */}
        <svg className="absolute inset-0 pointer-events-none" width={totalW} height={totalH}>
          {positions.map((round, rIdx) => {
            if (rIdx === 0) return null;
            return round.map((pos, mIdx) => {
              const top = positions[rIdx - 1][mIdx * 2];
              const bot = positions[rIdx - 1][mIdx * 2 + 1];
              const rightX = (rIdx - 1) * (matchW + hGap) + matchW;
              const midX = rightX + hGap / 2;
              const leftX = rIdx * (matchW + hGap);
              const topY = top.y + matchH / 2;
              const botY = bot.y + matchH / 2;
              const tgtY = pos.y + matchH / 2;
              const c = "rgba(255,255,255,0.1)";

              return (
                <g key={`c-${rIdx}-${mIdx}`}>
                  <line x1={rightX} y1={topY} x2={midX} y2={topY} stroke={c} strokeWidth="1.5" />
                  <line x1={rightX} y1={botY} x2={midX} y2={botY} stroke={c} strokeWidth="1.5" />
                  <line x1={midX} y1={topY} x2={midX} y2={botY} stroke={c} strokeWidth="1.5" />
                  <line x1={midX} y1={tgtY} x2={leftX} y2={tgtY} stroke={c} strokeWidth="1.5" />
                </g>
              );
            });
          })}
          {/* Final → Winner connector */}
          <line
            x1={(totalRounds - 1) * (matchW + hGap) + matchW}
            y1={finalPos.y + matchH / 2}
            x2={winnerBoxX}
            y2={finalPos.y + matchH / 2}
            stroke="rgba(245,158,11,0.2)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Match cards */}
        {positions.map((round, rIdx) =>
          round.map((pos, mIdx) => {
            const m = roundsData[rIdx]?.matchups[mIdx] ?? { player1: "TBD", player2: "TBD" };
            const isFinal = rIdx === totalRounds - 1;
            return (
              <div
                key={`m-${rIdx}-${mIdx}`}
                className="absolute"
                style={{ left: pos.x, top: pos.y, width: matchW, height: matchH }}
              >
                <div
                  className="h-full rounded-md overflow-hidden"
                  style={{
                    background: isFinal ? "rgba(245,158,11,0.06)" : "rgba(12,14,18,0.9)",
                    border: isFinal
                      ? "1px solid rgba(245,158,11,0.15)"
                      : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    className="flex items-center px-2.5 font-semibold truncate"
                    style={{
                      height: "50%",
                      fontSize: fs,
                      color: m.player1 && m.player1 !== "TBD" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.22)",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {m.player1 || "---"}
                  </div>
                  <div
                    className="flex items-center px-2.5 font-semibold truncate"
                    style={{
                      height: "50%",
                      fontSize: fs,
                      color: m.player2 && m.player2 !== "TBD" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.22)",
                    }}
                  >
                    {m.player2 || "---"}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Winner box */}
        <div className="absolute" style={{ left: winnerBoxX, top: winnerBoxY, width: 94 }}>
          <div
            className="rounded-lg px-3 py-3 text-center"
            style={{
              background: winner
                ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.08))"
                : "rgba(255,255,255,0.02)",
              border: winner
                ? "1px solid rgba(245,158,11,0.2)"
                : "1px solid rgba(255,255,255,0.06)",
              boxShadow: winner ? "0 0 24px rgba(245,158,11,0.08)" : "none",
            }}
          >
            <TrophyIcon size={16} color={winner ? "#f59e0b" : "rgba(255,255,255,0.15)"} />
            <div
              className="font-bold text-[11px] mt-1"
              style={{ color: winner ? "#fbbf24" : "rgba(255,255,255,0.2)" }}
            >
              {winner || "TBD"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Trophy Icon ─── */

function TrophyIcon({ size = 16, color = "#f59e0b" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

/* ─── Page Export ─── */

export default function TournamentBracketOverlayPage() {
  return (
    <div className="p-6" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <TournamentBracketContent />
      </Suspense>
    </div>
  );
}
