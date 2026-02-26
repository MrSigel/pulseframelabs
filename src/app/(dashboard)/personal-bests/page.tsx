"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, FolderOpen } from "lucide-react";

export default function PersonalBestsPage() {
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
          />
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FolderOpen className="h-16 w-16 text-slate-500 mb-4" />
          <p className="text-slate-500">Start by searching for a slot game above.</p>
        </CardContent>
      </Card>
    </div>
  );
}
