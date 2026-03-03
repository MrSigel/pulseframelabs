"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { streamPointsConfig as spDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useEffect, useState, useCallback, useRef } from "react";
import { Save, Gift, Play, Square, Users, Search, Inbox, ChevronLeft, ChevronRight, Coins } from "lucide-react";
import { useTwitchBot } from "@/contexts/TwitchBotContext";
import { createPointsDropHandler } from "@/lib/twitch/handlers";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { streamViewers as svDb } from "@/lib/supabase/db";
import type { StreamPointsConfig, StreamViewer } from "@/lib/supabase/types";

export default function StreamPointsPage() {
  const { canModify } = useFeatureGate();
  const { isConnected, addHandler, removeHandler } = useTwitchBot();
  const { data: dbConfig, refetch } = useDbQuery<StreamPointsConfig | null>(() => spDb.get(), []);

  // Points config state
  const [pointsPerMinute, setPointsPerMinute] = useState("");
  const [pointsPerFollow, setPointsPerFollow] = useState("");
  const [pointsPerSub, setPointsPerSub] = useState("");
  const [pointsPerDonation, setPointsPerDonation] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);

  // Points Drop state
  const [dropKeyword, setDropKeyword] = useState("!claim");
  const [dropAmount, setDropAmount] = useState("50");
  const [dropDuration, setDropDuration] = useState("60");
  const [dropActive, setDropActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [claimCount, setClaimCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const claimCountRef = useRef(0);

  // Seed form state from DB
  useEffect(() => {
    if (dbConfig) {
      setPointsPerMinute(String(dbConfig.points_per_minute));
      setPointsPerFollow(String(dbConfig.points_per_follow));
      setPointsPerSub(String(dbConfig.points_per_sub));
      setPointsPerDonation(String(dbConfig.points_per_donation));
      setIsActive(dbConfig.is_active);
    }
  }, [dbConfig]);

  async function handleSave() {
    setSaving(true);
    try {
      await spDb.update({
        points_per_minute: parseInt(pointsPerMinute) || 0,
        points_per_follow: parseInt(pointsPerFollow) || 0,
        points_per_sub: parseInt(pointsPerSub) || 0,
        points_per_donation: parseInt(pointsPerDonation) || 0,
        is_active: isActive,
      });
      await refetch();
    } catch (err) {
      console.error("Failed to save stream points config:", err);
    } finally {
      setSaving(false);
    }
  }

  const handleStartDrop = useCallback(() => {
    if (!dropKeyword.trim()) return;
    const amount = parseInt(dropAmount) || 50;
    const dur = parseInt(dropDuration) || 60;

    claimCountRef.current = 0;
    setClaimCount(0);
    setDropActive(true);
    setTimeRemaining(dur);

    const handler = createPointsDropHandler({
      keyword: dropKeyword.trim(),
      amount,
      onClaim: () => {
        claimCountRef.current += 1;
        setClaimCount(claimCountRef.current);
      },
    });
    addHandler(handler);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          removeHandler("points-drop");
          setDropActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [dropKeyword, dropAmount, dropDuration, addHandler, removeHandler]);

  const handleStopDrop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    removeHandler("points-drop");
    setDropActive(false);
    setTimeRemaining(0);
  }, [removeHandler]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <PageHeader title="Stream Points" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <span className="text-lg">&#9889;</span>
              Points Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dbConfig && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white font-semibold mb-2 block text-sm">Points per Minute</Label>
                  <Input
                    value={pointsPerMinute}
                    onChange={(e) => setPointsPerMinute(e.target.value)}
                    type="number"
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-500 mt-1">Points earned per minute of watch time.</p>
                </div>
                <div>
                  <Label className="text-white font-semibold mb-2 block text-sm">Points per Follow</Label>
                  <Input
                    value={pointsPerFollow}
                    onChange={(e) => setPointsPerFollow(e.target.value)}
                    type="number"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-white font-semibold mb-2 block text-sm">Points per Sub</Label>
                  <Input
                    value={pointsPerSub}
                    onChange={(e) => setPointsPerSub(e.target.value)}
                    type="number"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-white font-semibold mb-2 block text-sm">Points per Donation</Label>
                  <Input
                    value={pointsPerDonation}
                    onChange={(e) => setPointsPerDonation(e.target.value)}
                    type="number"
                    placeholder="0"
                  />
                </div>
                <div className="p-3 rounded-lg border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-border bg-transparent accent-primary"
                    />
                    <span className={`font-bold text-sm ${isActive ? "text-green-400" : "text-slate-500"}`}>
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
                <Button className="w-full gap-2" onClick={handleSave} disabled={!canModify || saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Points Drop */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Points Drop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected && (
              <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-400">
                Connect your Twitch Bot first to use Points Drop.
              </div>
            )}

            <div>
              <Label className="text-white font-semibold mb-2 block text-sm">Keyword</Label>
              <Input
                value={dropKeyword}
                onChange={(e) => setDropKeyword(e.target.value)}
                placeholder="!claim"
                disabled={dropActive}
              />
              <p className="text-xs text-slate-500 mt-1">Viewers type this in chat to claim points.</p>
            </div>

            <div>
              <Label className="text-white font-semibold mb-2 block text-sm">Points Amount</Label>
              <Input
                value={dropAmount}
                onChange={(e) => setDropAmount(e.target.value)}
                type="number"
                placeholder="50"
                disabled={dropActive}
              />
              <p className="text-xs text-slate-500 mt-1">How many points each viewer receives.</p>
            </div>

            <div>
              <Label className="text-white font-semibold mb-2 block text-sm">Duration (Seconds)</Label>
              <Input
                value={dropDuration}
                onChange={(e) => setDropDuration(e.target.value)}
                type="number"
                placeholder="60"
                disabled={dropActive}
              />
              <p className="text-xs text-slate-500 mt-1">How long the drop stays active.</p>
            </div>

            {/* Active Drop Status */}
            {dropActive && (
              <div
                className="rounded-lg border border-green-500/30 p-4"
                style={{ background: "rgba(34, 197, 94, 0.05)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-400 font-bold text-sm">Drop Active</span>
                  </div>
                  <span className="text-white font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Users className="h-4 w-4" />
                  <span>{claimCount} viewer{claimCount !== 1 ? "s" : ""} claimed</span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-1000"
                    style={{
                      width: `${(timeRemaining / (parseInt(dropDuration) || 60)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {!dropActive ? (
              <Button
                variant="success"
                className="w-full gap-2 py-5"
                onClick={handleStartDrop}
                disabled={!canModify || !isConnected || !dropKeyword.trim()}
              >
                <Play className="h-4 w-4" />
                Start Points Drop
              </Button>
            ) : (
              <Button
                variant="destructive"
                className="w-full gap-2 py-5"
                onClick={handleStopDrop}
                disabled={!canModify}
              >
                <Square className="h-4 w-4" />
                Stop Drop
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Viewer Points Table */}
      <ViewerPointsTable />
    </div>
  );
}

// ============================================================
// Viewer Points Table
// ============================================================

function ViewerPointsTable() {
  const { data: viewers } = useDbQuery<StreamViewer[]>(() => svDb.list(), []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const filtered = (viewers ?? []).filter((v) =>
    v.username.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  // Reset page when search changes
  useEffect(() => {
    setPage(0);
  }, [search]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Viewer Points
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {filtered.length} viewer{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username..."
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Inbox className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">
              {search ? "No viewers match your search" : "No viewers tracked yet"}
            </p>
            {!search && (
              <p className="text-xs mt-1 opacity-60">
                Viewers will appear here once they earn points in your stream.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">First Seen</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Points</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((v) => (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-white">{v.username}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {v.created_at ? new Date(v.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-primary">
                        {(v.total_points ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {v.last_seen ? new Date(v.last_seen).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(0); }}
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
