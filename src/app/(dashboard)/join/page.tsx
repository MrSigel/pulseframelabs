"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverlayLink } from "@/components/overlay-link";
import { joinSessions } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/client";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useAuthUid } from "@/hooks/useAuthUid";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { twitchBot } from "@/lib/twitch/bot";
import type { JoinSession, JoinParticipant } from "@/lib/supabase/types";
import { Monitor, X, Users, Play, Square, Trophy, Loader2, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";

export default function JoinPage() {
  useFeatureGate();
  const uid = useAuthUid();

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const { data: activeSession, refetch: refetchSession } = useDbQuery<JoinSession | null>(
    () => joinSessions.getActive(),
    [],
  );

  const { data: participants, refetch: refetchParticipants } = useDbQuery<JoinParticipant[]>(
    () => activeSession ? joinSessions.participants.list(activeSession.id) : Promise.resolve([]),
    [activeSession?.id],
  );

  const participantCount = participants?.length ?? 0;

  const overlayUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/overlay/join?uid=${uid || ""}`;
  }, [uid]);

  async function handleOpenJoin() {
    try {
      await joinSessions.create({ status: "open" });
      await refetchSession();
      twitchBot.say("Join is now OPEN! Type !join to enter!");
    } catch (err) {
      console.error("Failed to open join:", err);
    }
  }

  async function handleCloseJoin() {
    if (!activeSession) return;
    try {
      await joinSessions.update(activeSession.id, { status: "closed" });
      await refetchSession();
      await refetchParticipants();
      twitchBot.say(`Join is now CLOSED! ${participantCount} participants entered.`);
    } catch (err) {
      console.error("Failed to close join:", err);
    }
  }

  async function handleDrawWinner() {
    if (!activeSession || !participants || participants.length === 0) return;
    setSpinning(true);
    setWinner(null);

    // Pick random winner
    const randomIndex = Math.floor(Math.random() * participants.length);
    const picked = participants[randomIndex];

    // Broadcast to overlay
    try {
      const supabase = createClient();
      const channel = supabase.channel(`join-draw-${uid}`);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event: "draw",
            payload: { winner: picked.username, participants: participants.map(p => p.username) },
          });
          setTimeout(() => supabase.removeChannel(channel), 1000);
        }
      });
    } catch { /* non-critical */ }

    // Wait for animation then show result
    setTimeout(async () => {
      setWinner(picked.username);
      setSpinning(false);
      twitchBot.say(`The winner is... @${picked.username}!`);

      // Save winner to DB
      try {
        await joinSessions.update(activeSession.id, { winner: picked.username, status: "finished" });
        await refetchSession();
      } catch { /* ignore */ }
    }, 4000);
  }

  async function handleReset() {
    if (activeSession) {
      try {
        await joinSessions.update(activeSession.id, { status: "finished" });
      } catch { /* ignore */ }
    }
    setWinner(null);
    setSpinning(false);
    await refetchSession();
    await refetchParticipants();
  }

  const isOpen = activeSession?.status === "open";
  const isClosed = activeSession?.status === "closed";
  const canDraw = isClosed && participantCount > 0 && !spinning;

  return (
    <div>
      <PageHeader
        title="Join"
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
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeSession || activeSession.status === "finished" ? (
                <Button variant="success" className="w-full gap-2" onClick={handleOpenJoin}>
                  <Play className="h-4 w-4" />
                  Open !join
                </Button>
              ) : isOpen ? (
                <Button variant="destructive" className="w-full gap-2" onClick={handleCloseJoin}>
                  <Square className="h-4 w-4" />
                  Close !join
                </Button>
              ) : isClosed ? (
                <Button
                  variant="accent"
                  className="w-full gap-2"
                  onClick={handleDrawWinner}
                  disabled={!canDraw}
                >
                  {spinning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
                  {spinning ? "Drawing..." : "Draw Winner"}
                </Button>
              ) : null}

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Users className="h-4 w-4" />
                <span>{participantCount} participants</span>
              </div>

              {isOpen && (
                <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  !join is open — viewers can type !join in chat
                </div>
              )}

              {isClosed && !winner && (
                <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                  Join closed — ready to draw a winner
                </div>
              )}

              {winner && (
                <div className="px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Winner</span>
                  <p className="text-xl font-black text-amber-400 mt-1">{winner}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Participant List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center justify-between">
                <span>Participants ({participantCount})</span>
                <Button size="sm" className="gap-1" onClick={() => { refetchSession(); refetchParticipants(); }}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reload
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!participants || participants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Users className="h-8 w-8 mb-2 text-slate-600" />
                  <p className="text-sm">No participants yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {participants.map((p, i) => (
                    <div
                      key={p.id}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                        winner === p.username
                          ? "bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold"
                          : "bg-white/[0.03] border border-white/[0.06] text-slate-300"
                      }`}
                    >
                      <span className="text-[10px] text-slate-600 w-4 text-right shrink-0">{i + 1}</span>
                      <span className="truncate">{p.username}</span>
                    </div>
                  ))}
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
            <h3 className="text-lg font-bold text-white mb-4">Join Overlay</h3>
            <OverlayLink url={overlayUrl} />
          </div>
        </div>
      )}
    </div>
  );
}
