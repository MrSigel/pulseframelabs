"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OverlayLink } from "@/components/overlay-link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Monitor, Plus, Search, ChevronLeft, ChevronRight, Inbox, X, Trash2,
  Loader2, Play, CheckCircle, Users, Dices, Eye,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { tournaments as tournamentsDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useAuthUid } from "@/hooks/useAuthUid";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import TournamentBracket from "@/components/tournament-bracket";
import type { Tournament, TournamentParticipant, BracketData, BracketPlayer, BracketRound, BracketMatchup } from "@/lib/supabase/types";

/* ====== Helper Functions ====== */

function getRoundNames(playerCount: number): string[] {
  const names: string[] = [];
  if (playerCount >= 32) names.push("Runde der 32");
  if (playerCount >= 16) names.push("Achtelfinale");
  if (playerCount >= 8) names.push("Viertelfinale");
  if (playerCount >= 4) names.push("Halbfinale");
  names.push("Finale");
  return names;
}

function buildBracket(drawn: BracketPlayer[], bracketSize: number): BracketData {
  const players = [...drawn];
  while (players.length < bracketSize) players.push({ name: "BYE", game: "" });

  const roundNames = getRoundNames(bracketSize);
  const rounds: BracketRound[] = [];

  // First round
  const r1: BracketMatchup[] = [];
  for (let i = 0; i < bracketSize; i += 2) {
    const m: BracketMatchup = { player1: players[i], player2: players[i + 1] };
    if (m.player1.name === "BYE") m.winner = m.player2.name;
    else if (m.player2.name === "BYE") m.winner = m.player1.name;
    r1.push(m);
  }
  rounds.push({ name: roundNames[0], matchups: r1 });

  // Subsequent rounds — pre-fill from auto-advanced BYE winners
  for (let rIdx = 1; rIdx < roundNames.length; rIdx++) {
    const prev = rounds[rIdx - 1];
    const matchups: BracketMatchup[] = [];
    for (let i = 0; i < prev.matchups.length; i += 2) {
      const prev1 = prev.matchups[i];
      const prev2 = prev.matchups[i + 1];
      const p1: BracketPlayer = prev1?.winner
        ? { name: prev1.winner, game: prev1.player1.name === prev1.winner ? prev1.player1.game : prev1.player2.game }
        : { name: "TBD", game: "" };
      const p2: BracketPlayer = prev2?.winner
        ? { name: prev2.winner, game: prev2.player1.name === prev2.winner ? prev2.player1.game : prev2.player2.game }
        : { name: "TBD", game: "" };
      matchups.push({ player1: p1, player2: p2 });
    }
    rounds.push({ name: roundNames[rIdx], matchups });
  }

  return { rounds };
}

function parseBracketData(raw: unknown): BracketData | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  if (!Array.isArray(d.rounds)) return null;
  return raw as BracketData;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ====== Overlay Tabs ====== */

const overlayTabs = [
  { key: "normal", label: "Overlay Normal" },
  { key: "bracket", label: "Overlay Bracket" },
] as const;

type OverlayTab = (typeof overlayTabs)[number]["key"];

/* ====== Status config ====== */

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  join_open: "bg-blue-500/10 text-blue-400",
  draw: "bg-purple-500/10 text-purple-400",
  ongoing: "bg-emerald-500/10 text-emerald-400",
  finished: "bg-slate-500/10 text-slate-400",
};

const statusLabels: Record<string, string> = {
  pending: "PENDING",
  join_open: "JOIN OPEN",
  draw: "DRAW",
  ongoing: "ONGOING",
  finished: "FINISHED",
};

/* ====== Main Component ====== */

export default function TournamentsPage() {
  const uid = useAuthUid();
  const { canModify } = useFeatureGate();

  /* ---- Modal state ---- */
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [participantsModal, setParticipantsModal] = useState<Tournament | null>(null);
  const [drawModal, setDrawModal] = useState<Tournament | null>(null);
  const [bracketModal, setBracketModal] = useState<Tournament | null>(null);

  /* ---- Form state ---- */
  const [activeTab, setActiveTab] = useState<OverlayTab>("normal");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [participants, setParticipants] = useState("8");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ---- Draw state ---- */
  const [drawStep, setDrawStep] = useState<"choose" | "drawing" | "done">("choose");
  const [drawnPlayers, setDrawnPlayers] = useState<TournamentParticipant[]>([]);
  const [raffleAnimating, setRaffleAnimating] = useState(false);
  const [raffleDisplay, setRaffleDisplay] = useState("");
  const [savingDraw, setSavingDraw] = useState(false);
  const raffleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- Bracket state ---- */
  const [liveBracket, setLiveBracket] = useState<BracketData | null>(null);

  /* ---- Data queries ---- */
  const { data: tournamentsList, loading, refetch } = useDbQuery<Tournament[]>(() => tournamentsDb.list(), []);

  const activeParticipantsTournamentId = participantsModal?.id || drawModal?.id || null;
  const { data: participantsList, refetch: refetchParticipants } = useDbQuery<TournamentParticipant[]>(
    () => activeParticipantsTournamentId ? tournamentsDb.participants.list(activeParticipantsTournamentId) : Promise.resolve([]),
    [activeParticipantsTournamentId]
  );

  const filteredTournaments = (tournamentsList ?? []).filter(
    (t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ---- Cleanup raffle timer ---- */
  useEffect(() => {
    return () => { if (raffleTimerRef.current) clearTimeout(raffleTimerRef.current); };
  }, []);

  /* ---- Reset draw state when modal closes ---- */
  useEffect(() => {
    if (!drawModal) {
      setDrawStep("choose");
      setDrawnPlayers([]);
      setRaffleDisplay("");
      setRaffleAnimating(false);
      if (raffleTimerRef.current) { clearTimeout(raffleTimerRef.current); raffleTimerRef.current = null; }
    }
  }, [drawModal]);

  /* ---- Reset bracket state when modal closes ---- */
  useEffect(() => {
    if (!bracketModal) setLiveBracket(null);
  }, [bracketModal]);

  /* ====== Handlers ====== */

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await tournamentsDb.create({
        name: name.trim(),
        description: desc.trim(),
        participant_count: parseInt(participants) || 8,
      });
      setCreateOpen(false);
      setName(""); setDesc(""); setParticipants("8");
      await refetch();
    } catch (err) {
      console.error("Failed to create:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await tournamentsDb.remove(id);
      await refetch();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  async function handleStatusChange(id: string, newStatus: Tournament["status"]) {
    try {
      await tournamentsDb.update(id, { status: newStatus });
      await refetch();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  async function handleClearParticipants(tournamentId: string) {
    try {
      await tournamentsDb.participants.clear(tournamentId);
      await refetchParticipants();
    } catch (err) {
      console.error("Failed to clear participants:", err);
    }
  }

  function handleDrawAll() {
    if (!drawModal || !participantsList) return;
    const count = drawModal.participant_count;
    const shuffled = shuffle(participantsList);
    const picked = shuffled.slice(0, count);
    setDrawnPlayers(picked);
    setDrawStep("done");
  }

  function startSingleRaffle() {
    if (!drawModal || !participantsList) return;
    const count = drawModal.participant_count;
    const remaining = participantsList.filter((p) => !drawnPlayers.find((d) => d.id === p.id));
    if (remaining.length === 0 || drawnPlayers.length >= count) return;

    const winnerIdx = Math.floor(Math.random() * remaining.length);
    const winner = remaining[winnerIdx];
    const names = remaining.map((p) => p.viewer_username);

    setRaffleAnimating(true);
    setDrawStep("drawing");
    let tick = 0;
    const totalTicks = 25 + Math.floor(Math.random() * 10);

    function animate() {
      tick++;
      setRaffleDisplay(names[tick % names.length]);

      if (tick >= totalTicks) {
        setRaffleDisplay(winner.viewer_username);
        setRaffleAnimating(false);
        setDrawnPlayers((prev) => {
          const next = [...prev, winner];
          if (next.length >= count) setDrawStep("done");
          return next;
        });
        return;
      }

      const delay = 50 + Math.pow(tick / totalTicks, 3) * 300;
      raffleTimerRef.current = setTimeout(animate, delay);
    }

    raffleTimerRef.current = setTimeout(animate, 50);
  }

  async function confirmDraw() {
    if (!drawModal || drawnPlayers.length === 0) return;
    setSavingDraw(true);
    try {
      const players: BracketPlayer[] = drawnPlayers.map((p) => ({
        name: p.viewer_username,
        game: p.game_name,
      }));
      const bracket = buildBracket(players, drawModal.participant_count);
      await tournamentsDb.updateBracket(drawModal.id, bracket);
      await tournamentsDb.update(drawModal.id, { status: "draw" });
      setDrawModal(null);
      await refetch();
    } catch (err) {
      console.error("Failed to save bracket:", err);
    } finally {
      setSavingDraw(false);
    }
  }

  function openBracketModal(t: Tournament) {
    const data = parseBracketData(t.bracket_data);
    setLiveBracket(data);
    setBracketModal(t);
  }

  async function handleBracketUpdate(data: BracketData) {
    setLiveBracket(data);
    if (bracketModal) {
      try {
        await tournamentsDb.updateBracket(bracketModal.id, data);
        // If winner is set, auto-finish the tournament
        if (data.winner) {
          await tournamentsDb.update(bracketModal.id, { status: "finished" });
          await refetch();
        }
      } catch (err) {
        console.error("Failed to update bracket:", err);
      }
    }
  }

  /* ====== Computed ====== */

  const overlayUrls = useMemo(() => {
    if (typeof window === "undefined") return {} as Record<OverlayTab, string>;
    const base = window.location.origin;
    return {
      normal: `${base}/overlay/tournament_normal?uid=${uid || ""}`,
      bracket: `${base}/overlay/tournament_bracket?uid=${uid || ""}`,
    };
  }, [uid]);

  /* ====== Render ====== */

  return (
    <div>
      <PageHeader
        title="Tournaments"
        actions={
          <>
            <Button variant="success" className="gap-2" onClick={() => setOverlayOpen(true)}>
              <Monitor className="h-4 w-4" />
              Tournament Overlay
            </Button>
            <Button variant="warning" className="gap-2" onClick={() => setCreateOpen(true)} disabled={!canModify}>
              <Plus className="h-4 w-4" />
              + Create Tournament
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-white">Tournaments</CardTitle>
          <div className="relative">
            <Input placeholder="Search for Tournament" className="w-64 pr-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div
            className="grid gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
            style={{
              gridTemplateColumns: "1.5fr 1.2fr 0.8fr 1fr 1fr 1fr",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span>Tournament</span>
            <span>Participants</span>
            <span>Status</span>
            <span>Created</span>
            <span>Last Update</span>
            <span className="text-right">Manage</span>
          </div>

          {/* Data rows */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Inbox className="h-10 w-10 mb-3 text-slate-600" />
              <p className="text-sm">No data available in table</p>
            </div>
          ) : (
            <div>
              {filteredTournaments.map((t) => (
                <div
                  key={t.id}
                  className="grid gap-4 px-4 py-3 text-sm items-center hover:bg-white/[0.02] transition-colors"
                  style={{
                    gridTemplateColumns: "1.5fr 1.2fr 0.8fr 1fr 1fr 1fr",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div>
                    <span className="font-semibold text-white">{t.name}</span>
                    {t.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.description}</p>}
                  </div>
                  <span className="text-slate-300">{t.participant_count}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${statusColors[t.status] || "bg-slate-500/10 text-slate-400"}`}>
                    {statusLabels[t.status] || t.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</span>
                  <span className="text-xs text-slate-500">{new Date(t.updated_at).toLocaleDateString()}</span>

                  {/* ---- Status-specific action buttons ---- */}
                  <div className="flex justify-end gap-1">
                    {t.status === "pending" && (
                      <button
                        onClick={() => handleStatusChange(t.id, "join_open")}
                        disabled={!canModify}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50 disabled:pointer-events-none"
                        title="Join öffnen (!join)"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                    )}

                    {t.status === "join_open" && (
                      <>
                        <button
                          onClick={() => setParticipantsModal(t)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-all"
                          title="Teilnehmer anzeigen"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDrawModal(t)}
                          disabled={!canModify}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-50 disabled:pointer-events-none"
                          title="Auslosen"
                        >
                          <Dices className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {t.status === "draw" && (
                      <>
                        <button
                          onClick={() => openBracketModal(t)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-all"
                          title="Bracket anzeigen"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(t.id, "ongoing")}
                          disabled={!canModify}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50 disabled:pointer-events-none"
                          title="Turnier starten"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {t.status === "ongoing" && (
                      <>
                        <button
                          onClick={() => openBracketModal(t)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                          title="Bracket bearbeiten"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(t.id, "finished")}
                          disabled={!canModify}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all disabled:opacity-50 disabled:pointer-events-none"
                          title="Turnier beenden"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {t.status === "finished" && (
                      <button
                        onClick={() => openBracketModal(t)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                        title="Bracket anzeigen"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={!canModify}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:pointer-events-none"
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Select defaultValue="10">
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-slate-600">
                {filteredTournaments.length === 0
                  ? "Showing no records"
                  : `Showing ${filteredTournaments.length} record${filteredTournaments.length !== 1 ? "s" : ""}`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon-sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====== Tournament Overlay Modal ====== */}
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Tournament Overlays</h2>
              <button onClick={() => setOverlayOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 pt-4 border-b border-white/[0.06] flex gap-1">
              {overlayTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="pb-3 px-3 text-sm font-medium relative whitespace-nowrap transition-colors"
                  style={{ color: activeTab === tab.key ? "#fff" : "#64748b" }}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" style={{ animation: "tabSlide 0.2s ease-out" }} />
                  )}
                </button>
              ))}
            </div>
            <div className="px-6 py-5 space-y-5">
              <OverlayLink url={overlayUrls[activeTab] || ""} obsSize={activeTab === "normal" ? "460 × 300" : "800 × 500"} />
              <div>
                <Label className="text-sm font-semibold text-slate-400 mb-2 block">Preview</Label>
                <div
                  className="rounded-lg p-6 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #080c14 0%, #0f1521 50%, #080c14 100%)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    minHeight: "260px",
                  }}
                >
                  <div className="animate-fade-in-up" key={activeTab}>
                    {activeTab === "normal" && <NormalPreview />}
                    {activeTab === "bracket" && <BracketPreview />}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <Button variant="outline" onClick={() => setOverlayOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Create Tournament Modal ====== */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setCreateOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-md rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Create Tournament</h2>
              <button onClick={() => setCreateOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Tournament Name</Label>
                <Input placeholder="Enter tournament name" value={name} onChange={(e) => setName(e.target.value)} />
                <p className="text-[11px] text-slate-500 mt-1.5">Provide a short, clear name for your tournament. This will be visible to viewers.</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Tournament Description</Label>
                <textarea
                  placeholder="Enter tournament description"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 resize-none"
                  style={{ background: "rgba(56, 79, 125, 0.12)", border: "1px solid rgba(56, 79, 125, 0.25)", outline: "none" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.15)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(56, 79, 125, 0.25)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">Provide a brief description of your tournament. This will be visible to viewers.</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Participants</Label>
                <Select value={participants} onValueChange={setParticipants}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 Participants</SelectItem>
                    <SelectItem value="8">8 Participants</SelectItem>
                    <SelectItem value="16">16 Participants</SelectItem>
                    <SelectItem value="32">32 Participants</SelectItem>
                    <SelectItem value="64">64 Participants</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-500 mt-1.5">Select the number of participants for your tournament.</p>
              </div>
              <Button className="w-full gap-2 py-5 text-sm font-semibold" onClick={handleCreate} disabled={creating || !name.trim() || !canModify}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? "Creating..." : "Create Tournament"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Participants Modal ====== */}
      {participantsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setParticipantsModal(null)}
          />
          <div
            className="relative z-10 w-full max-w-md rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-bold text-lg">Teilnehmer</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  !join aktiv
                </span>
              </div>
              <button onClick={() => setParticipantsModal(null)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 pt-4 pb-2">
              <p className="text-xs text-slate-400">
                Zuschauer können mit <span className="text-blue-400 font-semibold">!join Spielname</span> im Chat beitreten.
                Turnier: <span className="text-white font-semibold">{participantsModal.name}</span>
              </p>
            </div>
            <div className="px-6 pb-4 max-h-64 overflow-y-auto">
              {!participantsList || participantsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <Users className="h-8 w-8 mb-2 text-slate-600" />
                  <p className="text-sm">Noch keine Teilnehmer</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {participantsList.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                      <span className="text-[10px] text-slate-600 w-5 text-right shrink-0">{i + 1}</span>
                      {p.badge_image_url && (
                        <img src={p.badge_image_url} alt="" className="h-4 w-4 rounded shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-white font-medium block truncate">{p.viewer_username}</span>
                        {p.game_name && (
                          <span className="text-[10px] text-slate-500">{p.game_name}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-600 shrink-0">
                        {new Date(p.joined_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-slate-500">{participantsList?.length ?? 0} Teilnehmer</span>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={() => handleClearParticipants(participantsModal.id)}>
                  Liste leeren
                </Button>
                <Button variant="outline" size="sm" onClick={() => setParticipantsModal(null)}>Schließen</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== Draw Modal ====== */}
      {drawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => { if (!raffleAnimating && !savingDraw) setDrawModal(null); }}
          />
          <div
            className="relative z-10 w-full max-w-lg rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(139, 92, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-bold text-lg">Auslosung</h2>
                {drawStep !== "choose" && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {drawnPlayers.length}/{drawModal.participant_count}
                  </span>
                )}
              </div>
              <button
                onClick={() => { if (!raffleAnimating && !savingDraw) setDrawModal(null); }}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              {/* Step: Choose */}
              {drawStep === "choose" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-300 mb-1">
                      <span className="text-white font-semibold">{participantsList?.length ?? 0}</span> Teilnehmer angemeldet
                    </p>
                    <p className="text-xs text-slate-500">
                      {drawModal.participant_count} werden für das Bracket gezogen
                    </p>
                  </div>

                  {(participantsList?.length ?? 0) < drawModal.participant_count && (
                    <div className="px-3 py-2 rounded-lg text-xs text-amber-400 bg-amber-500/10 border border-amber-500/15 text-center">
                      Nicht genug Teilnehmer — fehlende Plätze werden als BYE gefüllt
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDrawAll}
                      disabled={!participantsList || participantsList.length === 0}
                      className="flex flex-col items-center gap-2 px-4 py-5 rounded-xl border border-white/[0.06] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Dices className="h-6 w-6 text-purple-400" />
                      <span className="text-sm font-semibold text-white">Alle auf einmal</span>
                      <span className="text-[10px] text-slate-500">Sofort ziehen</span>
                    </button>
                    <button
                      onClick={startSingleRaffle}
                      disabled={!participantsList || participantsList.length === 0}
                      className="flex flex-col items-center gap-2 px-4 py-5 rounded-xl border border-white/[0.06] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Users className="h-6 w-6 text-purple-400" />
                      <span className="text-sm font-semibold text-white">Einzeln ziehen</span>
                      <span className="text-[10px] text-slate-500">Mit Animation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Drawing (single raffle) */}
              {drawStep === "drawing" && (
                <div className="space-y-4">
                  {/* Raffle display */}
                  <div
                    className="text-center py-6 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02))",
                      border: "1px solid rgba(139,92,246,0.15)",
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-2">
                      Ziehung {drawnPlayers.length + 1} von {drawModal.participant_count}
                    </span>
                    <span
                      className="text-2xl font-black text-white block"
                      style={{
                        animation: raffleAnimating ? "pulse 0.15s ease-in-out infinite" : undefined,
                      }}
                    >
                      {raffleDisplay || "..."}
                    </span>
                  </div>

                  {/* Already drawn */}
                  {drawnPlayers.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Gezogen:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {drawnPlayers.map((p, i) => (
                          <span key={p.id} className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/15">
                            {i + 1}. {p.viewer_username}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next draw button */}
                  {!raffleAnimating && drawnPlayers.length < drawModal.participant_count && (
                    <Button
                      className="w-full gap-2"
                      onClick={startSingleRaffle}
                    >
                      <Dices className="h-4 w-4" />
                      Nächsten ziehen
                    </Button>
                  )}
                </div>
              )}

              {/* Step: Done */}
              {drawStep === "done" && (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <span className="text-emerald-400 font-semibold text-sm">Auslosung abgeschlossen!</span>
                  </div>

                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {drawnPlayers.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02]">
                        <span className="text-[10px] text-purple-400 font-bold w-5 text-right shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-white font-medium block truncate">{p.viewer_username}</span>
                          {p.game_name && <span className="text-[10px] text-slate-500">{p.game_name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-between">
              {drawStep === "done" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDrawStep("choose");
                      setDrawnPlayers([]);
                      setRaffleDisplay("");
                    }}
                  >
                    Neu ziehen
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    className="gap-2"
                    onClick={confirmDraw}
                    disabled={savingDraw}
                  >
                    {savingDraw ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Bracket erstellen & speichern
                  </Button>
                </>
              ) : (
                <div className="ml-auto">
                  <Button variant="outline" size="sm" onClick={() => { if (!raffleAnimating) setDrawModal(null); }} disabled={raffleAnimating}>
                    Abbrechen
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== Bracket Modal ====== */}
      {bracketModal && liveBracket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setBracketModal(null)}
          />
          <div
            className="relative z-10 w-full max-w-5xl max-h-[85vh] rounded-xl border border-white/[0.08] shadow-2xl flex flex-col"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-bold text-lg">{bracketModal.name} — Bracket</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[bracketModal.status]}`}>
                  {statusLabels[bracketModal.status]}
                </span>
              </div>
              <button onClick={() => setBracketModal(null)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Bracket */}
            <div className="flex-1 overflow-auto px-6 py-5">
              <TournamentBracket
                bracketData={liveBracket}
                onUpdate={handleBracketUpdate}
                readOnly={bracketModal.status !== "ongoing"}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500">
                {bracketModal.status === "ongoing"
                  ? "Klicke auf das Trophy-Icon um einen Gewinner zu wählen"
                  : bracketModal.status === "finished" && liveBracket.winner
                    ? `Gewinner: ${liveBracket.winner}`
                    : "Bracket-Vorschau"}
              </span>
              <Button variant="outline" size="sm" onClick={() => setBracketModal(null)}>Schließen</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== Overlay Preview Components ====== */

function NormalPreview() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
        border: "1px solid rgba(59, 130, 246, 0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        minWidth: "300px",
      }}
    >
      <div className="px-4 pt-4 pb-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
          <span
            className="font-black text-sm tracking-wide"
            style={{
              background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          >
            SLOT BATTLE
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">TOURNAMENT FINISHED</span>
      </div>
      <div className="px-4 pb-3">
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #78350f, #92400e)", border: "2px solid rgba(245,158,11,0.4)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-white font-bold text-[11px] block">WINNER</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">HIGHEST X-FACTOR</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>0X</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-2.5 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <span className="text-[11px] font-black tracking-wider" style={{ color: "#10b981" }}>WINNER</span>
      </div>
    </div>
  );
}

function BracketPreview() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
        border: "1px solid rgba(59, 130, 246, 0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
          <span className="font-bold text-[10px]" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TOURNAMENT</span>
        </div>
        <span className="text-[8px] font-semibold text-slate-500 uppercase">8 Players</span>
      </div>
      <div className="px-3 py-3 flex gap-4">
        <div className="shrink-0">
          <span className="text-[7px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Round 1</span>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mb-1">
              <div className="px-2 py-1 rounded-t text-[8px] text-slate-500 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>Player {i * 2 + 1}</div>
              <div className="px-2 py-1 rounded-b text-[8px] text-slate-500 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>Player {i * 2 + 2}</div>
            </div>
          ))}
        </div>
        <div className="shrink-0 pt-3">
          <span className="text-[7px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Semis</span>
          {[0, 1].map((i) => (
            <div key={i} className="mb-1 mt-2">
              <div className="px-2 py-1 rounded-t text-[8px] text-slate-600 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>---</div>
              <div className="px-2 py-1 rounded-b text-[8px] text-slate-600 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>---</div>
            </div>
          ))}
        </div>
        <div className="shrink-0 pt-7">
          <span className="text-[7px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Final</span>
          <div className="mt-2">
            <div className="px-2 py-1 rounded-t text-[8px] text-slate-600 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>---</div>
            <div className="px-2 py-1 rounded-b text-[8px] text-slate-600 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>---</div>
          </div>
          <div className="mt-2 px-2 py-1.5 rounded text-center" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
            <span className="text-[7px] uppercase tracking-widest text-slate-600 block">Winner</span>
            <span className="text-amber-400 font-bold text-[9px]">---</span>
          </div>
        </div>
      </div>
    </div>
  );
}
