"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { streamPointsConfig as spDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import type { StreamPointsConfig } from "@/lib/supabase/types";

export default function StreamPointsPage() {
  const { data: dbConfig, refetch } = useDbQuery<StreamPointsConfig | null>(() => spDb.get(), []);

  const [pointsPerMinute, setPointsPerMinute] = useState("");
  const [pointsPerFollow, setPointsPerFollow] = useState("");
  const [pointsPerSub, setPointsPerSub] = useState("");
  const [pointsPerDonation, setPointsPerDonation] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);

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

  return (
    <div>
      <PageHeader title="Stream Points" />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <span className="text-4xl mb-4">&#9889;</span>
          <h2 className="text-xl font-bold text-white mb-2">Stream Points</h2>
          <p className="text-slate-500 text-center max-w-md">
            Configure your stream points system. Manage how viewers earn and spend points during your stream.
          </p>
          {dbConfig && (
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm w-full max-w-sm">
              <div className="p-3 rounded-lg border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <Label className="text-slate-500 text-xs mb-1 block">Points / Minute</Label>
                <Input
                  value={pointsPerMinute}
                  onChange={(e) => setPointsPerMinute(e.target.value)}
                  type="number"
                  className="mt-1"
                />
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <Label className="text-slate-500 text-xs mb-1 block">Points / Follow</Label>
                <Input
                  value={pointsPerFollow}
                  onChange={(e) => setPointsPerFollow(e.target.value)}
                  type="number"
                  className="mt-1"
                />
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <Label className="text-slate-500 text-xs mb-1 block">Points / Sub</Label>
                <Input
                  value={pointsPerSub}
                  onChange={(e) => setPointsPerSub(e.target.value)}
                  type="number"
                  className="mt-1"
                />
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <Label className="text-slate-500 text-xs mb-1 block">Points / Donation</Label>
                <Input
                  value={pointsPerDonation}
                  onChange={(e) => setPointsPerDonation(e.target.value)}
                  type="number"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2 p-3 rounded-lg border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
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
              <div className="col-span-2">
                <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
