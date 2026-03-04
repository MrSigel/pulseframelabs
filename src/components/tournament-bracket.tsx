"use client";

import { useState } from "react";
import { Pencil, Check, Trophy } from "lucide-react";
import type { BracketData, BracketPlayer } from "@/lib/supabase/types";

interface TournamentBracketProps {
  bracketData: BracketData;
  onUpdate: (data: BracketData) => void;
  readOnly?: boolean;
}

export default function TournamentBracket({
  bracketData,
  onUpdate,
  readOnly = false,
}: TournamentBracketProps) {
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [editingWin, setEditingWin] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const id = (r: number, m: number, p: string) => `${r}-${m}-${p}`;

  function saveGame(rIdx: number, mIdx: number, pKey: "player1" | "player2") {
    const d = structuredClone(bracketData);
    d.rounds[rIdx].matchups[mIdx][pKey].game = tempValue;
    onUpdate(d);
    setEditingGame(null);
  }

  function saveWin(rIdx: number, mIdx: number, pKey: "player1" | "player2") {
    const d = structuredClone(bracketData);
    d.rounds[rIdx].matchups[mIdx][pKey].win_amount = parseFloat(tempValue) || 0;
    onUpdate(d);
    setEditingWin(null);
  }

  function pickWinner(rIdx: number, mIdx: number, pKey: "player1" | "player2") {
    const d = structuredClone(bracketData);
    const match = d.rounds[rIdx].matchups[mIdx];
    const w = match[pKey];
    if (w.name === "TBD") return;

    match.winner = w.name;

    // Advance winner to next round
    if (rIdx + 1 < d.rounds.length) {
      const nm = Math.floor(mIdx / 2);
      const ns: "player1" | "player2" = mIdx % 2 === 0 ? "player1" : "player2";
      d.rounds[rIdx + 1].matchups[nm][ns] = { name: w.name, game: w.game };
    }

    // Check if final is decided
    const fm = d.rounds[d.rounds.length - 1].matchups[0];
    if (fm?.winner) d.winner = fm.winner;

    onUpdate(d);
  }

  function PlayerSlot({
    rIdx, mIdx, pKey, player, matchWinner,
  }: {
    rIdx: number; mIdx: number; pKey: "player1" | "player2";
    player: BracketPlayer; matchWinner?: string;
  }) {
    const k = id(rIdx, mIdx, pKey);
    const isTBD = player.name === "TBD";
    const isBYE = player.name === "BYE";
    const isW = matchWinner === player.name;
    const isL = !!matchWinner && !isW && !isTBD && !isBYE;

    return (
      <div
        className="px-3 py-2 flex items-center gap-2 group"
        style={{
          background: isW ? "rgba(16,185,129,0.06)" : "transparent",
          opacity: isL ? 0.4 : 1,
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isW && <span className="text-emerald-400 text-[10px]">✓</span>}
            <span className={`text-xs font-semibold truncate ${isTBD || isBYE ? "text-slate-600 italic" : "text-white"}`}>
              {player.name}
            </span>
          </div>
          {!isTBD && !isBYE && (
            <div className="flex items-center gap-1 mt-0.5">
              {editingGame === k ? (
                <div className="flex items-center gap-1">
                  <input
                    className="text-[10px] text-slate-300 bg-transparent border-b border-blue-500/50 outline-none w-24"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveGame(rIdx, mIdx, pKey);
                      if (e.key === "Escape") setEditingGame(null);
                    }}
                    autoFocus
                  />
                  <button onClick={() => saveGame(rIdx, mIdx, pKey)} className="text-emerald-400">
                    <Check className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-[10px] text-slate-500 truncate">{player.game || "—"}</span>
                  {!readOnly && !matchWinner && (
                    <button
                      onClick={() => { setEditingGame(k); setTempValue(player.game); }}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-blue-400 transition-opacity"
                    >
                      <Pencil className="h-2.5 w-2.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Win amount — editable */}
        {!isTBD && !isBYE && !readOnly && !matchWinner && (
          <div className="shrink-0">
            {editingWin === k ? (
              <div className="flex items-center gap-1">
                <input
                  className="text-[10px] text-white bg-white/5 border border-white/10 rounded px-1.5 py-0.5 w-16 outline-none"
                  type="number"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveWin(rIdx, mIdx, pKey);
                    if (e.key === "Escape") setEditingWin(null);
                  }}
                  autoFocus
                />
                <button onClick={() => saveWin(rIdx, mIdx, pKey)} className="text-emerald-400">
                  <Check className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingWin(k); setTempValue(String(player.win_amount ?? "")); }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                {player.win_amount != null ? `$${player.win_amount}` : "Win"}
              </button>
            )}
          </div>
        )}

        {/* Win amount — read only */}
        {!isTBD && !isBYE && (readOnly || !!matchWinner) && player.win_amount != null && (
          <span className="text-[10px] text-slate-500 shrink-0">${player.win_amount}</span>
        )}

        {/* Winner button */}
        {!readOnly && !matchWinner && !isTBD && !isBYE && (
          <button
            onClick={() => pickWinner(rIdx, mIdx, pKey)}
            className="shrink-0 h-6 w-6 rounded flex items-center justify-center text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all opacity-0 group-hover:opacity-100"
            title="Pick as winner"
          >
            <Trophy className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-2">
      {bracketData.rounds.map((round, rIdx) => (
        <div key={rIdx} className="shrink-0" style={{ paddingTop: `${rIdx * 28}px` }}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            {round.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: `${Math.pow(2, rIdx) * 8}px` }}>
            {round.matchups.map((match, mIdx) => (
              <div
                key={mIdx}
                className="rounded-lg overflow-hidden"
                style={{
                  border: match.winner
                    ? "1px solid rgba(16,185,129,0.15)"
                    : "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                  minWidth: "210px",
                }}
              >
                <PlayerSlot rIdx={rIdx} mIdx={mIdx} pKey="player1" player={match.player1} matchWinner={match.winner} />
                <div style={{ height: "1px", background: "rgba(255,255,255,0.04)" }} />
                <PlayerSlot rIdx={rIdx} mIdx={mIdx} pKey="player2" player={match.player2} matchWinner={match.winner} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {bracketData.winner && (
        <div className="shrink-0 flex flex-col justify-center" style={{ paddingTop: `${bracketData.rounds.length * 28}px` }}>
          <div
            className="rounded-lg px-4 py-3 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.04))",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <Trophy className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Winner</span>
            <span className="text-amber-400 font-bold text-sm">{bracketData.winner}</span>
          </div>
        </div>
      )}
    </div>
  );
}
