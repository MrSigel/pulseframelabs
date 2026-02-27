"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2, Search, Link, ChevronLeft, ChevronRight, X, ArrowLeft, Plus, Minus, Info, Coins, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { streamViewers as viewersDb, userProfiles } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { StreamViewer, UserProfile } from "@/lib/supabase/types";

export default function SettingsPage() {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [moreOptionsView, setMoreOptionsView] = useState<"main" | "manage-points">("main");
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [viewerSearch, setViewerSearch] = useState("");
  const [perPage, setPerPage] = useState(5);
  const [viewerPage, setViewerPage] = useState(0);

  const { data: dbViewers, loading, refetch } = useDbQuery<StreamViewer[]>(() => viewersDb.list(), []);
  const { data: profile } = useDbQuery<UserProfile | null>(() => userProfiles.get(), []);

  const filteredViewers = useMemo(() => {
    if (!dbViewers) return [];
    if (!viewerSearch.trim()) return dbViewers;
    return dbViewers.filter((v) => v.username.toLowerCase().includes(viewerSearch.toLowerCase()));
  }, [dbViewers, viewerSearch]);

  const totalViewerPages = Math.max(1, Math.ceil(filteredViewers.length / perPage));
  const pagedViewers = filteredViewers.slice(viewerPage * perPage, (viewerPage + 1) * perPage);

  async function handleAddPoints() {
    if (!pointsAmount) return;
    try {
      await viewersDb.transactions.create({
        amount: Number(pointsAmount),
        reason: pointsReason || "Manual add",
        type: "add",
      });
      setPointsAmount("");
      setPointsReason("");
      await refetch();
    } catch (err) {
      console.error("Failed to add points:", err);
    }
  }

  async function handleRemovePoints() {
    if (!pointsAmount) return;
    try {
      await viewersDb.transactions.create({
        amount: Number(pointsAmount),
        reason: pointsReason || "Manual remove",
        type: "remove",
      });
      setPointsAmount("");
      setPointsReason("");
      await refetch();
    } catch (err) {
      console.error("Failed to remove points:", err);
    }
  }

  function closeMoreOptions() {
    setShowMoreOptions(false);
    setMoreOptionsView("main");
    setPointsAmount("");
    setPointsReason("");
  }

  return (
    <div>
      <PageHeader title="Stream Settings" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream Viewers */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                Stream Viewers
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    placeholder="Search for a Viewer"
                    className="w-56 pr-8"
                    value={viewerSearch}
                    onChange={(e) => { setViewerSearch(e.target.value); setViewerPage(0); }}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
                <Button variant="success" className="gap-2" onClick={() => { setMoreOptionsView("main"); setShowMoreOptions(true); }}>
                  <Settings2 className="h-4 w-4" />
                  More Options
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-sm text-slate-500 bg-secondary rounded px-3 py-2 mb-4">
                <span>User</span>
                <span>Points</span>
                <span>Watch Time</span>
                <span>Last Seen</span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 text-[#c9a84c] animate-spin" />
                </div>
              ) : pagedViewers.length > 0 ? (
                <div className="space-y-1">
                  {pagedViewers.map((viewer) => (
                    <div key={viewer.id} className="grid grid-cols-4 gap-4 text-sm px-3 py-2 rounded hover:bg-white/[0.02] transition-colors">
                      <span className="text-white font-medium">{viewer.username}</span>
                      <span className="text-slate-400">{viewer.total_points.toLocaleString()}</span>
                      <span className="text-slate-400">{Math.round(viewer.watch_time_minutes / 60)}h {viewer.watch_time_minutes % 60}m</span>
                      <span className="text-slate-500">{new Date(viewer.last_seen).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No data available in table
                </div>
              )}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setViewerPage(0); }}>
                    <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-slate-500">
                    {filteredViewers.length > 0
                      ? `Showing ${viewerPage * perPage + 1}-${Math.min((viewerPage + 1) * perPage, filteredViewers.length)} of ${filteredViewers.length}`
                      : "Showing no records"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={viewerPage === 0} onClick={() => setViewerPage((p) => Math.max(0, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={viewerPage >= totalViewerPages - 1} onClick={() => setViewerPage((p) => Math.min(totalViewerPages - 1, p + 1))}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Linked Accounts */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Link className="h-5 w-5" />
              Linked Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Link className="h-4 w-4" />
              Link More Accounts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* More Options Modal */}
      {showMoreOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMoreOptions} />
          <div
            className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-2xl"
            style={{ animation: "modalSlideIn 0.25s ease-out" }}
          >
            {/* Main View */}
            {moreOptionsView === "main" && (
              <div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="text-white font-bold text-base">More Options</h3>
                  <button onClick={closeMoreOptions} className="text-slate-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-slate-400 text-sm mb-1">Select an Option:</p>
                  <Button
                    className="w-full gap-2 py-5 text-sm font-semibold"
                    onClick={() => setMoreOptionsView("manage-points")}
                  >
                    <Coins className="h-4 w-4" />
                    Manage Points for All Users
                  </Button>
                </div>
              </div>
            )}

            {/* Manage Points View */}
            {moreOptionsView === "manage-points" && (
              <div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMoreOptionsView("main")}
                      className="text-[#c9a84c] hover:text-[#c9a84c] transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  </div>
                  <button onClick={closeMoreOptions} className="text-slate-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <Label className="text-white font-semibold text-sm block">Points Management:</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={pointsAmount}
                        onChange={(e) => setPointsAmount(e.target.value)}
                        placeholder="Enter Points Amount"
                        type="number"
                        className="pr-8"
                      />
                      <Coins className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div className="relative flex-1">
                      <Input
                        value={pointsReason}
                        onChange={(e) => setPointsReason(e.target.value)}
                        placeholder="Provide a Reason"
                        className="pr-8"
                      />
                      <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                  <Button
                    variant="success"
                    className="w-full gap-2 py-4 text-sm font-semibold"
                    onClick={handleAddPoints}
                  >
                    <Plus className="h-4 w-4" />
                    Add Points
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full gap-2 py-4 text-sm font-semibold"
                    onClick={handleRemovePoints}
                  >
                    <Minus className="h-4 w-4" />
                    Remove Points
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
