"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useOverlayTheme } from "@/hooks/useOverlayTheme";

/* ─── Types ─── */

interface TournamentRow {
  id: string;
  name: string;
  description: string | null;
  participant_count: number;
  bracket_data: BracketData | null;
  status: string;
}

interface BracketPlayer {
  name: string;
  game: string;
  win_amount?: number;
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
  player1: BracketPlayer;
  player2: BracketPlayer;
  winner?: string;
}

interface ParticipantRow {
  tournament_id: string;
  viewer_username: string;
  game_name: string;
  badge_image_url: string | null;
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
  if (p <= 8) return { matchH: 80, matchW: 220, vGap: 24, hGap: 50, fs: 14 };
  if (p <= 16) return { matchH: 68, matchW: 200, vGap: 16, hGap: 42, fs: 13 };
  return { matchH: 56, matchW: 180, vGap: 10, hGap: 36, fs: 11 };
}

/** Normalize player data — handles both old string format and new object format */
function normalizePlayer(p: unknown): BracketPlayer {
  if (typeof p === "string") return { name: p, game: "" };
  if (p && typeof p === "object" && "name" in p) return p as BracketPlayer;
  return { name: "TBD", game: "" };
}

/* ─── Player Slot Component ─── */

function PlayerSlot({
  player,
  participant,
  fontSize,
  isTop,
  isWinner,
  isLoser,
}: {
  player: BracketPlayer;
  participant?: ParticipantRow;
  fontSize: number;
  isTop: boolean;
  isWinner: boolean;
  isLoser: boolean;
}) {
  const name = player.name;
  const isTBD = !name || name === "TBD";
  const isBYE = name === "BYE";
  const badge = participant?.badge_image_url;
  const game = player.game || participant?.game_name;
  const winAmount = player.win_amount;

  return (
    <div
      className="relative flex items-center px-2.5 overflow-hidden"
      style={{
        height: "50%",
        borderBottom: isTop ? "1px solid rgba(255,255,255,0.12)" : undefined,
        background: isWinner ? "rgba(16,185,129,0.08)" : "transparent",
        opacity: isLoser ? 0.4 : 1,
      }}
    >
      {/* Badge background */}
      {badge && (
        <img
          src={badge}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.25, filter: "blur(0.5px)" }}
        />
      )}
      <div className="relative z-10 flex items-center justify-between min-w-0 w-full gap-1">
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-center gap-1">
            {isWinner && <span style={{ fontSize: Math.max(fontSize - 2, 7), color: "#10b981" }}>✓</span>}
            <span
              className="font-semibold truncate leading-tight"
              style={{
                fontSize,
                color: isTBD || isBYE ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.95)",
                fontStyle: isBYE ? "italic" : undefined,
              }}
            >
              {name || "---"}
            </span>
          </div>
          {game && !isTBD && !isBYE && (
            <span
              className="truncate leading-tight"
              style={{
                fontSize: Math.max(fontSize - 2, 7),
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {game}
            </span>
          )}
        </div>
        {winAmount != null && !isTBD && !isBYE && (
          <span
            className="shrink-0 font-bold"
            style={{
              fontSize: Math.max(fontSize - 1, 8),
              color: isWinner ? "#10b981" : "rgba(255,255,255,0.5)",
            }}
          >
            ${winAmount}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Main Content ─── */

function TournamentBracketContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();
  const { cssVars } = useOverlayTheme(uid);

  // Fetch all tournaments and pick the most relevant one with bracket data
  const { data: allTournaments, loading } = useOverlayData<TournamentRow[]>({
    table: "tournaments",
    userId: uid,
    orderBy: "updated_at",
    ascending: false,
  });

  const dbTournament = useMemo(() => {
    if (!Array.isArray(allTournaments)) return null;
    // Priority: ongoing > draw > finished — always show one with real bracket data
    for (const status of ["ongoing", "draw", "finished"]) {
      const t = allTournaments.find(
        (t) => t.status === status && t.bracket_data?.rounds && t.bracket_data.rounds.length > 0
      );
      if (t) return t;
    }
    return null;
  }, [allTournaments]);

  // Fetch participants for badge lookup
  const { data: participantsArr } = useOverlayData<ParticipantRow[]>({
    table: "tournament_participants",
    userId: uid,
    orderBy: "joined_at",
    ascending: true,
  });

  // Build participant lookup map — filtered by selected tournament
  const participantMap = useMemo(() => {
    const map = new Map<string, ParticipantRow>();
    if (Array.isArray(participantsArr) && dbTournament) {
      for (const p of participantsArr) {
        if (p.tournament_id === dbTournament.id) {
          map.set(p.viewer_username, p);
        }
      }
    }
    return map;
  }, [participantsArr, dbTournament]);

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

  // Build round data (DB or placeholders) — normalize player format
  const roundsData = useMemo(() => {
    const rounds: BracketRound[] = [];
    for (let r = 0; r < totalRounds; r++) {
      const expected = participants / Math.pow(2, r + 1);
      if (bracketData?.rounds?.[r]) {
        const db = bracketData.rounds[r];
        const matchups = db.matchups.map((m) => ({
          player1: normalizePlayer(m.player1),
          player2: normalizePlayer(m.player2),
          winner: (m as BracketMatchup).winner,
        }));
        while (matchups.length < expected) matchups.push({ player1: { name: "TBD", game: "" }, player2: { name: "TBD", game: "" }, winner: undefined });
        rounds.push({ name: db.name || getRoundName(r, totalRounds), matchups: matchups.slice(0, expected) });
      } else {
        rounds.push({
          name: getRoundName(r, totalRounds),
          matchups: Array.from({ length: expected }, () => ({
            player1: { name: "TBD", game: "" } as BracketPlayer,
            player2: { name: "TBD", game: "" } as BracketPlayer,
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

    const w = totalRounds * matchW + (totalRounds - 1) * hGap + hGap + 130;
    const h = all[0][all[0].length - 1].y + matchH;
    return { positions: all, totalW: w, totalH: h };
  }, [roundsData, totalRounds, matchH, matchW, vGap, hGap]);

  if (uid && loading) {
    return <div className="text-white text-sm animate-pulse">Loading bracket...</div>;
  }

  const winnerBoxX = (totalRounds - 1) * (matchW + hGap) + matchW + hGap;
  const finalPos = positions[positions.length - 1][0];
  const winnerBoxY = finalPos.y + matchH / 2 - 32;

  return (
    <div className="inline-block" style={cssVars}>
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 mb-4">
        <TrophyIcon size={24} color="var(--overlay-icon-color, #f59e0b)" />
        <span
          className="font-bold text-lg tracking-wide"
          style={{
            background: `linear-gradient(90deg, var(--overlay-highlight, #f59e0b), var(--overlay-icon-color, #ef4444))`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </span>
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          {participants} Players · {totalRounds} Rounds
        </span>
      </div>

      {/* ── Round Labels ── */}
      <div className="flex items-center mb-2">
        {roundsData.map((round, i) => (
          <div
            key={i}
            className="text-[11px] font-bold uppercase tracking-wider text-white/40 text-center shrink-0"
            style={{ width: matchW, marginRight: hGap }}
          >
            {round.name}
          </div>
        ))}
        <div
          className="text-[11px] font-bold uppercase tracking-wider text-center shrink-0"
          style={{ width: 130, color: "var(--overlay-highlight, rgba(245,158,11,0.7))", opacity: 0.8 }}
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
              const c = "rgba(255,255,255,0.2)";

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
            stroke="rgba(245,158,11,0.4)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Match cards */}
        {positions.map((round, rIdx) =>
          round.map((pos, mIdx) => {
            const m = roundsData[rIdx]?.matchups[mIdx] ?? { player1: { name: "TBD", game: "" }, player2: { name: "TBD", game: "" } };
            const isFinal = rIdx === totalRounds - 1;
            const hasWinner = !!m.winner;
            return (
              <div
                key={`m-${rIdx}-${mIdx}`}
                className="absolute"
                style={{ left: pos.x, top: pos.y, width: matchW, height: matchH }}
              >
                <div
                  className="h-full rounded-md overflow-hidden"
                  style={{
                    background: isFinal
                      ? `color-mix(in srgb, var(--overlay-highlight, #f59e0b) 10%, var(--overlay-bg-dark, rgba(12,14,18,0.92)))`
                      : hasWinner
                        ? "color-mix(in srgb, rgba(16,185,129,0.06), var(--overlay-bg-dark, rgba(12,14,18,0.92)))"
                        : "var(--overlay-bg-dark, rgba(12,14,18,0.92))",
                    border: isFinal
                      ? `1px solid color-mix(in srgb, var(--overlay-highlight, #f59e0b) 15%, transparent)`
                      : hasWinner
                        ? "1px solid rgba(16,185,129,0.2)"
                        : "1px solid var(--overlay-border, rgba(255,255,255,0.12))",
                    boxShadow: "var(--overlay-shadow-sm, 0 2px 8px rgba(0,0,0,0.25))",
                    borderRadius: "var(--overlay-border-radius, 6px)",
                  }}
                >
                  <PlayerSlot
                    player={m.player1}
                    participant={participantMap.get(m.player1.name)}
                    fontSize={fs}
                    isTop={true}
                    isWinner={m.winner === m.player1.name}
                    isLoser={!!m.winner && m.winner !== m.player1.name && m.player1.name !== "TBD" && m.player1.name !== "BYE"}
                  />
                  <PlayerSlot
                    player={m.player2}
                    participant={participantMap.get(m.player2.name)}
                    fontSize={fs}
                    isTop={false}
                    isWinner={m.winner === m.player2.name}
                    isLoser={!!m.winner && m.winner !== m.player2.name && m.player2.name !== "TBD" && m.player2.name !== "BYE"}
                  />
                </div>
              </div>
            );
          })
        )}

        {/* Winner box */}
        <div className="absolute" style={{ left: winnerBoxX, top: winnerBoxY, width: 130 }}>
          <div
            className="rounded-lg px-3 py-3 text-center"
            style={{
              background: winner
                ? `linear-gradient(135deg, color-mix(in srgb, var(--overlay-highlight, #f59e0b) 12%, transparent), color-mix(in srgb, var(--overlay-icon-color, #ef4444) 8%, transparent))`
                : "var(--overlay-bg-dark, rgba(12,14,18,0.92))",
              border: winner
                ? `1px solid color-mix(in srgb, var(--overlay-highlight, #f59e0b) 25%, transparent)`
                : "1px solid rgba(255,255,255,0.15)",
              boxShadow: winner ? `0 0 24px color-mix(in srgb, var(--overlay-highlight, #f59e0b) 8%, transparent)` : "none",
            }}
          >
            <TrophyIcon size={16} color={winner ? "var(--overlay-highlight, #f59e0b)" : "rgba(255,255,255,0.3)"} />
            <div
              className="font-bold text-sm mt-1"
              style={{ color: winner ? "var(--overlay-highlight, #fbbf24)" : "rgba(255,255,255,0.35)" }}
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
