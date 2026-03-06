"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverlayLink } from "@/components/overlay-link";
import { bossfightSessions } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useAuthUid } from "@/hooks/useAuthUid";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { twitchBot } from "@/lib/twitch/bot";
import type { BossfightSession, BossfightPlayer, BossfightBet } from "@/lib/supabase/types";
import {
  Monitor, X, Users, Play, Square, Trophy, Loader2, RefreshCw,
  Shield, Swords, Heart, Skull, Crown, Dices,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function BossfightPage() {
  useFeatureGate();
  const uid = useAuthUid();

  const [overlayOpen, setOverlayOpen] = useState(false);

  const { data: activeSession, refetch: refetchSession } = useDbQuery<BossfightSession | null>(
    () => bossfightSessions.getActive(),
    [],
  );

  const { data: players, refetch: refetchPlayers } = useDbQuery<BossfightPlayer[]>(
    () => activeSession ? bossfightSessions.players.list(activeSession.id) : Promise.resolve([]),
    [activeSession?.id],
  );

  const { data: bets, refetch: refetchBets } = useDbQuery<BossfightBet[]>(
    () => activeSession ? bossfightSessions.bets.list(activeSession.id) : Promise.resolve([]),
    [activeSession?.id],
  );

  // Join pool = bossfight_players with position = -1 (not yet drawn)
  const joinPool = useMemo(() => {
    if (!players) return [];
    return players.filter((p) => p.position === -1);
  }, [players]);

  // Drawn players = bossfight_players with position >= 0
  const drawnPlayers = useMemo(() => {
    if (!players) return [];
    return players.filter((p) => p.position >= 0);
  }, [players]);

  const overlayUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/overlay/bossfight?uid=${uid || ""}`;
  }, [uid]);

  const boss = drawnPlayers.find((p) => p.is_boss) ?? null;
  const fighters = drawnPlayers.filter((p) => !p.is_boss);
  const aliveFighters = fighters.filter((p) => !p.is_eliminated);
  const currentFighterIdx = activeSession?.current_player_index ?? 0;
  const currentFighter = aliveFighters[currentFighterIdx % aliveFighters.length] ?? null;
  const bossBets = bets?.filter((b) => b.team === "boss") ?? [];
  const playerBets = bets?.filter((b) => b.team === "players") ?? [];

  async function handleCreate() {
    try {
      await bossfightSessions.create({ status: "join_open", boss_max_lives: 9 });
      await refetchSession();
      twitchBot.say("BOSSFIGHT is now open! Type !join GameName to enter!");
    } catch (err) {
      console.error("Failed to create bossfight:", err);
    }
  }

  async function handleDraw() {
    if (!activeSession || joinPool.length < 2) return;
    try {
      // Shuffle and pick 9 players (or less if not enough)
      const shuffled = [...joinPool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(9, shuffled.length));
      const notSelected = shuffled.slice(Math.min(9, shuffled.length));

      // Assign positions to selected players (promotes them from join pool)
      for (let i = 0; i < selected.length; i++) {
        await bossfightSessions.players.update(selected[i].id, { position: i });
      }

      // Remove non-selected players from the pool
      for (const p of notSelected) {
        await bossfightSessions.players.update(p.id, { is_eliminated: true, position: -2 });
      }

      await bossfightSessions.update(activeSession.id, { status: "draw" });
      await refetchSession();
      await refetchPlayers();

      const names = selected.map((p) => p.username).join(", ");
      twitchBot.say(`${selected.length} fighters drawn: ${names}! Now select the Boss!`);
    } catch (err) {
      console.error("Failed to draw:", err);
    }
  }

  async function handleSetBoss(username: string) {
    if (!activeSession) return;
    try {
      // Find the player and set as boss
      const player = drawnPlayers.find((p) => p.username === username);
      if (player) {
        await bossfightSessions.players.update(player.id, { is_boss: true });
      }
      await bossfightSessions.update(activeSession.id, {
        boss_name: username,
        boss_game: player?.game ?? "",
        boss_lives: 9,
        status: "betting",
      });
      await refetchSession();
      await refetchPlayers();
      twitchBot.say(`${username} is the BOSS with 9 lives! Betting is now OPEN! Type !team boss <amount> or !team player <amount>`);
    } catch (err) {
      console.error("Failed to set boss:", err);
    }
  }

  async function handleStartFight() {
    if (!activeSession) return;
    try {
      await bossfightSessions.update(activeSession.id, { status: "live", current_player_index: 0 });
      await refetchSession();
      twitchBot.say("BOSSFIGHT is LIVE! Let the duels begin!");
    } catch (err) {
      console.error("Failed to start:", err);
    }
  }

  async function handleBossWins() {
    // Boss wins this round — player is eliminated
    if (!activeSession || !currentFighter) return;
    try {
      await bossfightSessions.players.update(currentFighter.id, { is_eliminated: true });

      const remainingFighters = aliveFighters.filter((p) => p.id !== currentFighter.id);
      if (remainingFighters.length === 0) {
        // Boss wins the entire fight
        await bossfightSessions.update(activeSession.id, { winner_side: "boss", status: "finished" });
        twitchBot.say(`The BOSS ${boss?.username} wins! All players eliminated!`);
      } else {
        // Next player
        const nextIdx = currentFighterIdx >= remainingFighters.length - 1 ? 0 : currentFighterIdx;
        await bossfightSessions.update(activeSession.id, { current_player_index: nextIdx });
        twitchBot.say(`${currentFighter.username} is eliminated! ${remainingFighters.length} players remaining.`);
      }
      await refetchSession();
      await refetchPlayers();
    } catch (err) {
      console.error("Failed:", err);
    }
  }

  async function handlePlayerWins() {
    // Player wins this round — boss loses a life
    if (!activeSession || !boss) return;
    const newLives = (activeSession.boss_lives ?? 1) - 1;
    try {
      if (newLives <= 0) {
        // Players win
        await bossfightSessions.update(activeSession.id, { boss_lives: 0, winner_side: "players", status: "finished" });
        twitchBot.say("The PLAYERS win! The Boss has been defeated!");
      } else {
        const nextIdx = (currentFighterIdx + 1) % aliveFighters.length;
        await bossfightSessions.update(activeSession.id, { boss_lives: newLives, current_player_index: nextIdx });
        twitchBot.say(`Boss loses a life! ${newLives} lives remaining. Next player up!`);
      }
      await refetchSession();
      await refetchPlayers();
    } catch (err) {
      console.error("Failed:", err);
    }
  }

  async function handleReset() {
    if (activeSession) {
      try {
        await bossfightSessions.update(activeSession.id, { status: "finished" });
      } catch { /* ignore */ }
    }
    await refetchSession();
    await refetchPlayers();
    await refetchBets();
  }

  const status = activeSession?.status;

  return (
    <div>
      <PageHeader
        title="Bossfight"
        actions={
          <>
            <Button variant="destructive" className="gap-2" onClick={handleReset}>
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            <Button variant="success" className="gap-2" onClick={() => setOverlayOpen(true)}>
              <Monitor className="h-4 w-4" />
              Overlay
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-400" />
                Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Phase-specific controls */}
              {!activeSession || status === "finished" ? (
                <Button variant="success" className="w-full gap-2" onClick={handleCreate}>
                  <Play className="h-4 w-4" />
                  Start Bossfight (!join opens)
                </Button>
              ) : status === "join_open" ? (
                <>
                  <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                    Join is open — viewers type !join GameName
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{joinPool.length} in pool</span>
                  </div>
                  <Button
                    variant="accent"
                    className="w-full gap-2"
                    onClick={handleDraw}
                    disabled={joinPool.length < 2}
                  >
                    <Dices className="h-4 w-4" />
                    Draw 9 Players
                  </Button>
                </>
              ) : status === "draw" ? (
                <>
                  <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                    Select the Boss from the drawn players
                  </div>
                  <div className="space-y-1">
                    {fighters.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSetBoss(p.username)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white hover:bg-red-500/10 hover:border-red-500/20 transition-colors flex items-center gap-2"
                      >
                        <Crown className="h-3.5 w-3.5 text-slate-600" />
                        <span className="font-medium">{p.username}</span>
                        <span className="text-slate-500 text-xs ml-auto">{p.game}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : status === "betting" ? (
                <>
                  <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                    Betting is open — !team boss/player &lt;amount&gt;
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                      <div className="text-red-400 font-bold">{bossBets.length}</div>
                      <div className="text-slate-500">Boss bets</div>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                      <div className="text-blue-400 font-bold">{playerBets.length}</div>
                      <div className="text-slate-500">Player bets</div>
                    </div>
                  </div>
                  <Button variant="success" className="w-full gap-2" onClick={handleStartFight}>
                    <Swords className="h-4 w-4" />
                    Start Fight!
                  </Button>
                </>
              ) : status === "live" ? (
                <>
                  {/* Boss status */}
                  <div className="px-3 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-red-400" />
                      <span className="text-white font-bold text-sm">{boss?.username}</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: activeSession.boss_max_lives }).map((_, i) => (
                        <Heart
                          key={i}
                          className={`h-4 w-4 ${i < (activeSession.boss_lives ?? 0) ? "text-red-400 fill-red-400" : "text-slate-700"}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Current match */}
                  {currentFighter && (
                    <div className="px-3 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1">Current Duel</div>
                      <div className="text-white font-bold text-sm flex items-center justify-between">
                        <span>{boss?.username}</span>
                        <span className="text-xs text-slate-500">VS</span>
                        <span>{currentFighter.username}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex justify-between mt-1">
                        <span>{boss?.game}</span>
                        <span>{currentFighter.game}</span>
                      </div>
                    </div>
                  )}

                  {/* Round result buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="destructive" className="gap-1" onClick={handleBossWins}>
                      <Shield className="h-3.5 w-3.5" />
                      Boss Wins
                    </Button>
                    <Button variant="success" className="gap-1" onClick={handlePlayerWins}>
                      <Trophy className="h-3.5 w-3.5" />
                      Player Wins
                    </Button>
                  </div>

                  <div className="text-xs text-slate-500">
                    {aliveFighters.length} players remaining
                  </div>
                </>
              ) : null}

              {/* Winner announcement */}
              {status === "finished" && activeSession?.winner_side && (
                <div className="px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Winner</span>
                  <p className="text-xl font-black text-amber-400 mt-1">
                    {activeSession.winner_side === "boss" ? `Boss: ${boss?.username}` : "Players Win!"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Players */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center justify-between">
                <span>Fighters</span>
                <Button size="sm" className="gap-1" onClick={() => { refetchSession(); refetchPlayers(); refetchBets(); }}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reload
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {drawnPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Swords className="h-8 w-8 mb-2 text-slate-600" />
                  <p className="text-sm">No fighters drawn yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Boss */}
                  {boss && (
                    <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                      <Shield className="h-5 w-5 text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-bold block">{boss.username}</span>
                        <span className="text-xs text-slate-500">{boss.game}</span>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: activeSession?.boss_max_lives ?? 9 }).map((_, i) => (
                          <Heart
                            key={i}
                            className={`h-3 w-3 ${i < (activeSession?.boss_lives ?? 0) ? "text-red-400 fill-red-400" : "text-slate-700"}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-red-400 font-bold uppercase shrink-0">BOSS</span>
                    </div>
                  )}

                  {/* Fighters */}
                  {fighters.map((p, i) => {
                    const isCurrent = status === "live" && currentFighter?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`px-4 py-2.5 rounded-lg flex items-center gap-3 ${
                          p.is_eliminated
                            ? "bg-white/[0.02] border border-white/[0.04] opacity-40"
                            : isCurrent
                              ? "bg-blue-500/10 border border-blue-500/20"
                              : "bg-white/[0.03] border border-white/[0.06]"
                        }`}
                      >
                        <span className="text-[10px] text-slate-600 w-4 text-right shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium block truncate ${p.is_eliminated ? "line-through text-slate-600" : "text-white"}`}>
                            {p.username}
                          </span>
                          <span className="text-[10px] text-slate-500">{p.game}</span>
                        </div>
                        {p.is_eliminated && <Skull className="h-3.5 w-3.5 text-red-500/50 shrink-0" />}
                        {isCurrent && <Swords className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overlay Modal */}
      {overlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOverlayOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <button onClick={() => setOverlayOpen(false)} className="absolute top-3 right-3 text-slate-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Bossfight Overlay</h3>
            <OverlayLink url={overlayUrl} />
          </div>
        </div>
      )}
    </div>
  );
}
