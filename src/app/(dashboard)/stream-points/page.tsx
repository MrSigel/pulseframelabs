"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { streamPointsConfig as spDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useEffect, useState, useCallback, useRef } from "react";
import { Save, Gift, Play, Square, Users } from "lucide-react";
import { useTwitchBot } from "@/contexts/TwitchBotContext";
import { createPointsDropHandler } from "@/lib/twitch/handlers";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import type { StreamPointsConfig } from "@/lib/supabase/types";

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
    </div>
  );
}
