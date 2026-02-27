"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { streamPointsConfig as spDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { StreamPointsConfig } from "@/lib/supabase/types";

export default function StreamPointsPage() {
  const { data: dbConfig } = useDbQuery<StreamPointsConfig | null>(() => spDb.get(), []);

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
                <p className="text-slate-500 text-xs mb-1">Points / Minute</p>
                <p className="text-white font-bold">{dbConfig.points_per_minute}</p>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-slate-500 text-xs mb-1">Points / Follow</p>
                <p className="text-white font-bold">{dbConfig.points_per_follow}</p>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-slate-500 text-xs mb-1">Points / Sub</p>
                <p className="text-white font-bold">{dbConfig.points_per_sub}</p>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-slate-500 text-xs mb-1">Status</p>
                <p className={`font-bold ${dbConfig.is_active ? "text-green-400" : "text-slate-500"}`}>{dbConfig.is_active ? "Active" : "Inactive"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
