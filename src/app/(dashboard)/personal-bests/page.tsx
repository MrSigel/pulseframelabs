"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, FolderOpen, Trophy, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { bonushunts as bhDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { BonushuntEntry } from "@/lib/supabase/types";

interface PersonalBestDerived {
  game_name: string;
  provider: string;
  best_win: number;
  best_multiplier: number;
  appearances: number;
}

function derivePersonalBests(entries: BonushuntEntry[]): PersonalBestDerived[] {
  const map = new Map<string, PersonalBestDerived>();

  for (const e of entries) {
    const key = e.game_name.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.best_win = Math.max(existing.best_win, e.win_amount);
      existing.best_multiplier = Math.max(existing.best_multiplier, e.multiplier);
      existing.appearances += 1;
    } else {
      map.set(key, {
        game_name: e.game_name,
        provider: e.provider,
        best_win: e.win_amount,
        best_multiplier: e.multiplier,
        appearances: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.best_win - a.best_win);
}

export default function PersonalBestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allEntries, loading } = useDbQuery<BonushuntEntry[]>(
    () => bhDb.entries.listAll(),
    []
  );

  const personalBests = useMemo(() => derivePersonalBests(allEntries ?? []), [allEntries]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return personalBests;
    const q = searchQuery.toLowerCase();
    return personalBests.filter(
      (pb) =>
        pb.game_name.toLowerCase().includes(q) ||
        pb.provider.toLowerCase().includes(q)
    );
  }, [personalBests, searchQuery]);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Personal Bests</h1>
        <p className="text-slate-500">
          Automatically calculated from your bonushunt history — best win and multiplier per game.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <Input
            placeholder="Search for a slot game..."
            className="pl-10 h-12 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-slate-500">Loading personal bests...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((pb) => (
                <div
                  key={pb.game_name}
                  className="flex items-center gap-4 p-4 rounded-lg border border-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}
                  >
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{pb.game_name}</h3>
                    <p className="text-slate-500 text-xs">{pb.provider}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-green-400 font-bold text-sm">
                      ${pb.best_win.toLocaleString()}
                    </p>
                    <p className="text-slate-500 text-xs">{pb.best_multiplier.toFixed(1)}x</p>
                  </div>
                  <div className="text-right shrink-0 min-w-[48px]">
                    <p className="text-slate-600 text-xs">{pb.appearances}×</p>
                    <p className="text-slate-700 text-[10px]">played</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-16 w-16 text-slate-500 mb-4" />
              <p className="text-slate-500">
                {searchQuery.trim()
                  ? "No games found matching your search."
                  : "No bonushunt data yet. Add entries to your bonushunts to see personal bests here."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
