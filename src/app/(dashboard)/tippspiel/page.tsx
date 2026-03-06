"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tippspielSessions } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/client";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useAuthUid } from "@/hooks/useAuthUid";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { twitchBot } from "@/lib/twitch/bot";
import type { TippspielSession, TippspielEntry } from "@/lib/supabase/types";
import { Play, Square, Trophy, Loader2, RefreshCw, Hash, Users, Copy, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";

interface RankedEntry {
  username: string;
  guess: number;
  diff: number;
  rank: number;
}

export default function TippspielPage() {
  useFeatureGate();
  const uid = useAuthUid();

  const [targetInput, setTargetInput] = useState("");
  const [resolving, setResolving] = useState(false);
  const [results, setResults] = useState<RankedEntry[] | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: activeSession, refetch: refetchSession } = useDbQuery<TippspielSession | null>(
    () => tippspielSessions.getActive(),
    [],
  );

  const { data: entries, refetch: refetchEntries } = useDbQuery<TippspielEntry[]>(
    () => activeSession ? tippspielSessions.entries.list(activeSession.id) : Promise.resolve([]),
    [activeSession?.id],
  );

  const entryCount = entries?.length ?? 0;

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/guess?uid=${uid || ""}`;
  }, [uid]);

  function handleCopyUrl() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleOpen() {
    try {
      await tippspielSessions.create({ status: "open" });
      await refetchSession();
      twitchBot.say(`Tippspiel is now OPEN! Enter your guess here: ${publicUrl}`);
    } catch (err) {
      console.error("Failed to open tippspiel:", err);
    }
  }

  async function handleClose() {
    if (!activeSession) return;
    try {
      await tippspielSessions.update(activeSession.id, { status: "closed" });
      await refetchSession();
      await refetchEntries();
      twitchBot.say(`Tippspiel is now CLOSED! ${entryCount} guesses received.`);
    } catch (err) {
      console.error("Failed to close:", err);
    }
  }

  async function handleResolve() {
    if (!activeSession || !entries || entries.length === 0) return;
    const target = parseFloat(targetInput);
    if (isNaN(target)) return;

    setResolving(true);
    try {
      await tippspielSessions.update(activeSession.id, { target_number: target, status: "finished" });

      const ranked: RankedEntry[] = entries
        .map((e) => ({
          username: e.username,
          guess: e.guess,
          diff: Math.abs(e.guess - target),
          rank: 0,
        }))
        .sort((a, b) => a.diff - b.diff);

      ranked.forEach((r, i) => { r.rank = i + 1; });
      setResults(ranked);

      // Broadcast to overlay
      try {
        const supabase = createClient();
        const channel = supabase.channel(`tippspiel-result-${uid}`);
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            channel.send({
              type: "broadcast",
              event: "result",
              payload: { target, top3: ranked.slice(0, 3) },
            });
            setTimeout(() => supabase.removeChannel(channel), 1000);
          }
        });
      } catch { /* non-critical */ }

      const top3 = ranked.slice(0, 3);
      const medals = ["1st", "2nd", "3rd"];
      const announcements = top3.map((r, i) =>
        `${medals[i]}: @${r.username} (${r.guess} — diff: ${r.diff.toFixed(2)})`
      );
      twitchBot.say(`Tippspiel Results! Target: ${target} | ${announcements.join(" | ")}`);

      await refetchSession();
    } catch (err) {
      console.error("Failed to resolve:", err);
    } finally {
      setResolving(false);
    }
  }

  async function handleReset() {
    if (activeSession) {
      try {
        await tippspielSessions.update(activeSession.id, { status: "finished" });
      } catch { /* ignore */ }
    }
    setResults(null);
    setTargetInput("");
    await refetchSession();
    await refetchEntries();
  }

  const isOpen = activeSession?.status === "open";
  const isClosed = activeSession?.status === "closed";

  return (
    <div>
      <PageHeader
        title="Tippspiel"
        actions={
          <Button variant="destructive" className="gap-2" onClick={handleReset}>
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeSession || activeSession.status === "finished" ? (
                <Button variant="success" className="w-full gap-2" onClick={handleOpen}>
                  <Play className="h-4 w-4" />
                  Open Tippspiel
                </Button>
              ) : isOpen ? (
                <Button variant="destructive" className="w-full gap-2" onClick={handleClose}>
                  <Square className="h-4 w-4" />
                  Close Tippspiel
                </Button>
              ) : isClosed ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-400">End Balance / Target</Label>
                    <Input
                      type="number"
                      placeholder="Enter end balance..."
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    variant="accent"
                    className="w-full gap-2"
                    onClick={handleResolve}
                    disabled={!targetInput || resolving}
                  >
                    {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
                    {resolving ? "Resolving..." : "Resolve"}
                  </Button>
                </div>
              ) : null}

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Hash className="h-4 w-4" />
                <span>{entryCount} guesses</span>
              </div>

              {isOpen && (
                <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  Tippspiel is open — viewers can enter guesses on the website
                </div>
              )}
            </CardContent>
          </Card>

          {/* Public URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-white">Public URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Input value={publicUrl} readOnly className="text-xs" />
                <Button size="sm" variant="default" className="shrink-0 gap-1" onClick={handleCopyUrl}>
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Open in new tab
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Results / Entries */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center justify-between">
                <span>{results ? "Results" : `Guesses (${entryCount})`}</span>
                <Button size="sm" className="gap-1" onClick={() => { refetchSession(); refetchEntries(); }}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reload
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.slice(0, 20).map((r) => {
                    const medals: Record<number, string> = { 1: "text-amber-400", 2: "text-slate-300", 3: "text-amber-700" };
                    return (
                      <div
                        key={r.username}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                          r.rank <= 3
                            ? "bg-amber-500/10 border border-amber-500/20"
                            : "bg-white/[0.03] border border-white/[0.06]"
                        }`}
                      >
                        <span className={`text-sm font-bold w-6 text-right ${medals[r.rank] || "text-slate-600"}`}>
                          #{r.rank}
                        </span>
                        <span className="text-sm text-white font-medium flex-1">{r.username}</span>
                        <span className="text-sm text-slate-400">{r.guess}</span>
                        <span className="text-xs text-slate-600">diff: {r.diff.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : !entries || entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Users className="h-8 w-8 mb-2 text-slate-600" />
                  <p className="text-sm">No guesses yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {entries.map((e) => (
                    <div
                      key={e.id}
                      className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm"
                    >
                      <span className="text-white font-medium block truncate">{e.username}</span>
                      <span className="text-slate-500 text-xs">{e.guess}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
