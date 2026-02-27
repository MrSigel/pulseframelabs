"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { OverlayLink } from "@/components/overlay-link";
import { Monitor, RotateCcw, RefreshCw, Gift, Plus, Save, Trash2, X, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { duelSessions } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { DuelSession, DuelPlayer as DuelPlayerType } from "@/lib/supabase/types";

interface DuelPlayer {
  id: number;
  name: string;
  game: string;
  buyIn: string;
  result: string;
  rank: string;
}

export default function DuelPage() {
  const [maxPlayers, setMaxPlayers] = useState("10");
  const [rafflePool, setRafflePool] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [players, setPlayers] = useState<DuelPlayer[]>([]);
  const [nextId, setNextId] = useState(1);
  const [saving, setSaving] = useState(false);

  const { data: activeSession, refetch: refetchSession } = useDbQuery<DuelSession | null>(
    () => duelSessions.getActive(),
    [],
  );
  const { data: dbPlayers, refetch: refetchPlayers } = useDbQuery<DuelPlayerType[]>(
    () => activeSession ? duelSessions.players.list(activeSession.id) : Promise.resolve([]),
    [activeSession?.id],
  );

  useEffect(() => {
    if (activeSession) {
      setMaxPlayers(String(activeSession.max_players));
      setRafflePool(activeSession.raffle_pool);
    }
  }, [activeSession]);

  useEffect(() => {
    if (dbPlayers && dbPlayers.length > 0) {
      setPlayers(dbPlayers.map((p, i) => ({
        id: i + 1,
        name: p.name,
        game: p.game,
        buyIn: p.buy_in,
        result: p.result,
        rank: p.rank,
      })));
    }
  }, [dbPlayers]);

  const overlayUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/overlay/duel_normal?title=DUEL`;
  }, []);

  async function handleAddPlayer() {
    const newPlayer = { id: nextId, name: "", game: "", buyIn: "", result: "", rank: "" };
    setPlayers((prev) => [...prev, newPlayer]);
    setNextId((n) => n + 1);
    if (activeSession) {
      try {
        await duelSessions.players.create({
          session_id: activeSession.id,
          name: "",
          position: players.length,
        });
        await refetchPlayers();
      } catch (err) {
        console.error("Failed to add player:", err);
      }
    }
  }

  async function handleRemovePlayer(id: number) {
    const index = players.findIndex((p) => p.id === id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    if (activeSession && dbPlayers && index >= 0 && index < dbPlayers.length) {
      try {
        await duelSessions.players.remove(dbPlayers[index].id);
        await refetchPlayers();
      } catch (err) {
        console.error("Failed to delete player:", err);
      }
    }
  }

  const updatePlayer = (id: number, field: keyof DuelPlayer, value: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleReset = () => {
    setPlayers([]);
    setNextId(1);
  };

  const handleRaffle = () => {
    if (players.length === 0) return;
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setPlayers(shuffled.map((p, i) => ({ ...p, rank: String(i + 1) })));
  };

  async function handleSaveSession() {
    setSaving(true);
    try {
      if (activeSession) {
        await duelSessions.update(activeSession.id, {
          max_players: Number(maxPlayers),
          raffle_pool: rafflePool,
        });
      } else {
        await duelSessions.create({ max_players: Number(maxPlayers), raffle_pool: rafflePool });
      }
      // Save all player data
      if (activeSession && dbPlayers) {
        for (let i = 0; i < Math.min(players.length, dbPlayers.length); i++) {
          await duelSessions.players.update(dbPlayers[i].id, {
            name: players[i].name,
            game: players[i].game,
            buy_in: players[i].buyIn,
            result: players[i].result,
            rank: players[i].rank,
          });
        }
      }
      await refetchSession();
      await refetchPlayers();
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Duel Management"
        actions={
          <>
            <Button variant="destructive" className="gap-2" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button variant="success" className="gap-2" onClick={() => setOverlayOpen(true)}>
              <Monitor className="h-4 w-4" />
              Duel Overlay
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Duel Players */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg text-white">Duel Players</CardTitle>
              <p className="text-sm text-slate-500">
                Make changes, then click Update (!duel GameName to join duel)
              </p>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-5rem)]">
              <div className="flex gap-2 mb-6">
                <Button className="gap-1" size="sm" onClick={() => { refetchSession(); refetchPlayers(); }}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reload
                </Button>
                <Button variant="accent" className="gap-1" size="sm" onClick={handleRaffle}>
                  <Gift className="h-3.5 w-3.5" />
                  Raffle
                </Button>
                <Button variant="success" className="gap-1" size="sm" onClick={handleAddPlayer}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Row
                </Button>
                <Button className="gap-1" size="sm" onClick={handleSaveSession} disabled={saving}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saving ? "Saving..." : "Update"}
                </Button>
              </div>

              <div className="grid gap-3 text-xs text-slate-500 font-semibold uppercase border-b border-border pb-3 mb-3" style={{ gridTemplateColumns: "1.2fr 1.2fr 0.8fr 0.8fr 0.6fr 40px" }}>
                <span>Player Name</span>
                <span>Game</span>
                <span>Buy-In ($)</span>
                <span>Result ($)</span>
                <span>Rank</span>
                <span></span>
              </div>

              <div className="flex-1 min-h-0">
                {players.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    No players added yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {players.map((p) => (
                      <div
                        key={p.id}
                        className="grid gap-3 items-center"
                        style={{ gridTemplateColumns: "1.2fr 1.2fr 0.8fr 0.8fr 0.6fr 40px" }}
                      >
                        <Input
                          placeholder="Player name"
                          value={p.name}
                          onChange={(e) => updatePlayer(p.id, "name", e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Input
                          placeholder="Game name"
                          value={p.game}
                          onChange={(e) => updatePlayer(p.id, "game", e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Input
                          placeholder="0"
                          value={p.buyIn}
                          onChange={(e) => updatePlayer(p.id, "buyIn", e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Input
                          placeholder="0"
                          value={p.result}
                          onChange={(e) => updatePlayer(p.id, "result", e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Input
                          placeholder="#"
                          value={p.rank}
                          onChange={(e) => updatePlayer(p.id, "rank", e.target.value)}
                          className="h-8 text-xs"
                        />
                        <button
                          onClick={() => handleRemovePlayer(p.id)}
                          className="h-8 w-8 rounded-md flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Options */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg text-[#c9a84c]">Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div>
              <Label className="text-white font-semibold mb-2 block">Max Players</Label>
              <Input
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                type="number"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">Maximum number of players allowed in the duel.</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-semibold block">Raffle Pool Active</Label>
                <p className="text-[11px] text-slate-500 mt-0.5">Enable to randomly assign order.</p>
              </div>
              <Switch checked={rafflePool} onCheckedChange={setRafflePool} />
            </div>

            <Button className="w-full" onClick={handleSaveSession} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ====== Duel Overlay Modal ====== */}
      {overlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setOverlayOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-xl rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Duel Overlay</h2>
              <button
                onClick={() => setOverlayOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab */}
            <div className="px-6 pt-4 border-b border-white/[0.06]">
              <button className="pb-3 text-sm font-medium text-white relative">
                Overlay Normal
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#c9a84c]" style={{ animation: "tabSlide 0.2s ease-out" }} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <OverlayLink url={overlayUrl} />

              <div>
                <Label className="text-sm font-semibold text-slate-400 mb-2 block">Preview</Label>
                <div
                  className="rounded-lg p-5 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #080c14 0%, #0f1521 50%, #080c14 100%)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    minHeight: "300px",
                  }}
                >
                  <div className="animate-fade-in-up">
                    <DuelPreview />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <Button variant="outline" onClick={() => setOverlayOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Duel Overlay Preview ── */

function DuelPreview() {
  const players = [
    { name: "Player 1", game: "Sweet Bonanza", buyIn: "100$", result: "---", rank: 1 },
    { name: "Player 2", game: "Gates of Olympus", buyIn: "100$", result: "---", rank: 2 },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
        border: "1px solid rgba(59, 130, 246, 0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        minWidth: "340px",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
          <span
            className="font-black text-sm tracking-wider"
            style={{
              background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          >
            DUEL
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
          {players.length} Players
        </span>
      </div>

      {/* Table Header */}
      <div
        className="grid px-3.5 py-1.5 text-[8px] font-bold uppercase tracking-wider text-slate-500"
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
      <div className="px-3.5 pb-2.5">
        {players.map((p, i) => (
          <div
            key={i}
            className="grid py-1.5 items-center"
            style={{
              gridTemplateColumns: "1fr 1.2fr 0.8fr 0.8fr 0.5fr",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <div
                className="h-5 w-5 rounded-full flex items-center justify-center"
                style={{
                  background: i === 0 ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
                  border: `1px solid ${i === 0 ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill={i === 0 ? "#ef4444" : "#10b981"} stroke="none">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <span className="text-white font-semibold text-[9px]">{p.name}</span>
            </div>
            <span className="text-slate-400 text-[9px]">{p.game}</span>
            <span className="text-white text-[9px] font-semibold">{p.buyIn}</span>
            <span className="text-slate-500 text-[9px]">{p.result}</span>
            <span className="text-amber-400 text-[9px] font-bold text-center">{p.rank}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3.5 py-1.5 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <span className="text-[7px] uppercase tracking-widest text-slate-600">
          !duel GameName to join
        </span>
      </div>
    </div>
  );
}
