"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, FolderOpen, Trophy, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { personalBests as pbDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { PersonalBest } from "@/lib/supabase/types";

export default function PersonalBestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: dbBests, loading } = useDbQuery<PersonalBest[]>(() => pbDb.list(), []);

  const filteredBests = useMemo(() => {
    if (!dbBests || !searchQuery.trim()) return dbBests ?? [];
    const q = searchQuery.toLowerCase();
    return dbBests.filter(
      (pb) =>
        pb.game_name.toLowerCase().includes(q) ||
        pb.provider.toLowerCase().includes(q)
    );
  }, [dbBests, searchQuery]);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Personal Bests</h1>
        <p className="text-slate-500">
          Enter the name of a slot game to find your personal bests.
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
              <Loader2 className="h-8 w-8 text-[#c9a84c] animate-spin mb-4" />
              <p className="text-slate-500">Loading personal bests...</p>
            </div>
          ) : filteredBests.length > 0 ? (
            <div className="space-y-3">
              {filteredBests.map((pb) => (
                <div
                  key={pb.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{pb.game_name}</h3>
                    <p className="text-slate-500 text-xs">{pb.provider}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-green-400 font-bold text-sm">${pb.win_amount.toLocaleString()}</p>
                    <p className="text-slate-500 text-xs">{pb.multiplier}x</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-slate-500 text-xs">{new Date(pb.achieved_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-16 w-16 text-slate-500 mb-4" />
              <p className="text-slate-500">
                {searchQuery.trim()
                  ? "No personal bests found matching your search."
                  : "Start by searching for a slot game above."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
