"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function StreamPointsPage() {
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
        </CardContent>
      </Card>
    </div>
  );
}
