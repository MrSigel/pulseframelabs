"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OverlayLink } from "@/components/overlay-link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, Plus, Search, ChevronLeft, ChevronRight, Inbox, X, Trash2, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { tournaments as tournamentsDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useAuthUid } from "@/hooks/useAuthUid";
import type { Tournament } from "@/lib/supabase/types";

const overlayTabs = [
  { key: "normal", label: "Overlay Normal" },
  { key: "bracket", label: "Overlay Bracket" },
] as const;

type OverlayTab = (typeof overlayTabs)[number]["key"];

export default function TournamentsPage() {
  const uid = useAuthUid();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<OverlayTab>("normal");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [participants, setParticipants] = useState("8");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: tournamentsList, loading, refetch } = useDbQuery<Tournament[]>(() => tournamentsDb.list(), []);
  const filteredTournaments = (tournamentsList ?? []).filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await tournamentsDb.create({
        name: name.trim(),
        description: desc.trim(),
        participant_count: parseInt(participants) || 8,
      });
      setCreateOpen(false);
      setName(""); setDesc(""); setParticipants("8");
      await refetch();
    } catch (err) {
      console.error("Failed to create:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await tournamentsDb.remove(id);
      await refetch();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const overlayUrls = useMemo(() => {
    if (typeof window === "undefined") return {} as Record<OverlayTab, string>;
    const base = window.location.origin;
    return {
      normal: `${base}/overlay/tournament_normal?uid=${uid || ""}&title=SLOT%20BATTLE&status=TOURNAMENT%20FINISHED`,
      bracket: `${base}/overlay/tournament_bracket?uid=${uid || ""}&title=TOURNAMENT&participants=8`,
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Tournaments"
        actions={
          <>
            <Button variant="success" className="gap-2" onClick={() => setOverlayOpen(true)}>
              <Monitor className="h-4 w-4" />
              Tournament Overlay
            </Button>
            <Button variant="warning" className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              + Create Tournament
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-white">Tournaments</CardTitle>
          <div className="relative">
            <Input placeholder="Search for Tournament" className="w-64 pr-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div
            className="grid gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
            style={{
              gridTemplateColumns: "1.5fr 1.2fr 0.8fr 1fr 1fr 0.8fr",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span>Tournament</span>
            <span className="flex items-center gap-1">
              Participants
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12l7-7 7 7" />
              </svg>
            </span>
            <span>Status</span>
            <span>Created</span>
            <span>Last Update</span>
            <span className="text-right">Manage</span>
          </div>

          {/* Data rows */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Inbox className="h-10 w-10 mb-3 text-slate-600" />
              <p className="text-sm">No data available in table</p>
            </div>
          ) : (
            <div>
              {filteredTournaments.map((t) => (
                <div
                  key={t.id}
                  className="grid gap-4 px-4 py-3 text-sm items-center hover:bg-white/[0.02] transition-colors"
                  style={{
                    gridTemplateColumns: "1.5fr 1.2fr 0.8fr 1fr 1fr 0.8fr",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div>
                    <span className="font-semibold text-white">{t.name}</span>
                    {t.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.description}</p>}
                  </div>
                  <span className="text-slate-300">{t.participant_count}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${t.status === 'ongoing' ? 'bg-emerald-500/10 text-emerald-400' : t.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {t.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</span>
                  <span className="text-xs text-slate-500">{new Date(t.updated_at).toLocaleDateString()}</span>
                  <div className="flex justify-end">
                    <button onClick={() => handleDelete(t.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Select defaultValue="10">
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-slate-600">{filteredTournaments.length === 0 ? "Showing no records" : `Showing ${filteredTournaments.length} record${filteredTournaments.length !== 1 ? "s" : ""}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon-sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====== Tournament Overlay Modal ====== */}
      {overlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setOverlayOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-xl rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Tournament Overlays</h2>
              <button
                onClick={() => setOverlayOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 border-b border-white/[0.06] flex gap-1">
              {overlayTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="pb-3 px-3 text-sm font-medium relative whitespace-nowrap transition-colors"
                  style={{ color: activeTab === tab.key ? "#fff" : "#64748b" }}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                      style={{ animation: "tabSlide 0.2s ease-out" }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <OverlayLink url={overlayUrls[activeTab] || ""} />

              <div>
                <Label className="text-sm font-semibold text-slate-400 mb-2 block">Preview</Label>
                <div
                  className="rounded-lg p-6 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #080c14 0%, #0f1521 50%, #080c14 100%)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    minHeight: "260px",
                  }}
                >
                  <div className="animate-fade-in-up" key={activeTab}>
                    {activeTab === "normal" && <NormalPreview />}
                    {activeTab === "bracket" && <BracketPreview />}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <Button variant="outline" onClick={() => setOverlayOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Create Tournament Modal ====== */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setCreateOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-md rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Create Tournament</h2>
              <button
                onClick={() => setCreateOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Tournament Name</Label>
                <Input
                  placeholder="Enter tournament name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Provide a short, clear name for your tournament. This will be visible to viewers.
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Tournament Description</Label>
                <textarea
                  placeholder="Enter tournament description"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 resize-none"
                  style={{
                    background: "rgba(56, 79, 125, 0.12)",
                    border: "1px solid rgba(56, 79, 125, 0.25)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(56, 79, 125, 0.25)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Provide a brief description of your tournament. This will be visible to viewers.
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Participants</Label>
                <Select value={participants} onValueChange={setParticipants}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 Participants</SelectItem>
                    <SelectItem value="8">8 Participants</SelectItem>
                    <SelectItem value="16">16 Participants</SelectItem>
                    <SelectItem value="32">32 Participants</SelectItem>
                    <SelectItem value="64">64 Participants</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Select the number of participants for your tournament. This will determine the tournament structure.
                </p>
              </div>

              <Button
                className="w-full gap-2 py-5 text-sm font-semibold"
                onClick={handleCreate}
                disabled={creating || !name.trim()}
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {creating ? "Creating..." : "Create Tournament"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -- Overlay Preview Components -- */

function NormalPreview() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
        border: "1px solid rgba(59, 130, 246, 0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        minWidth: "300px",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
          <span
            className="font-black text-sm tracking-wide"
            style={{
              background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          >
            SLOT BATTLE
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">TOURNAMENT FINISHED</span>
      </div>

      {/* Winner card */}
      <div className="px-4 pb-3">
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #78350f, #92400e)", border: "2px solid rgba(245,158,11,0.4)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-white font-bold text-[11px] block">WINNER</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">HIGHEST X-FACTOR</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>0X</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <span className="text-[11px] font-black tracking-wider" style={{ color: "#10b981" }}>WINNER</span>
      </div>
    </div>
  );
}

function BracketPreview() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
        border: "1px solid rgba(59, 130, 246, 0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
          <span className="font-bold text-[10px]" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TOURNAMENT</span>
        </div>
        <span className="text-[8px] font-semibold text-slate-500 uppercase">8 Players</span>
      </div>

      {/* Bracket */}
      <div className="px-3 py-3 flex gap-4">
        {/* Round 1 */}
        <div className="shrink-0">
          <span className="text-[7px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Round 1</span>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mb-1">
              <div className="px-2 py-1 rounded-t text-[8px] text-slate-500 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>Player {i * 2 + 1}</div>
              <div className="px-2 py-1 rounded-b text-[8px] text-slate-500 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>Player {i * 2 + 2}</div>
            </div>
          ))}
        </div>
        {/* Semis */}
        <div className="shrink-0 pt-3">
          <span className="text-[7px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Semis</span>
          {[0, 1].map((i) => (
            <div key={i} className="mb-1 mt-2">
              <div className="px-2 py-1 rounded-t text-[8px] text-slate-600 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>---</div>
              <div className="px-2 py-1 rounded-b text-[8px] text-slate-600 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>---</div>
            </div>
          ))}
        </div>
        {/* Final */}
        <div className="shrink-0 pt-7">
          <span className="text-[7px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Final</span>
          <div className="mt-2">
            <div className="px-2 py-1 rounded-t text-[8px] text-slate-600 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>---</div>
            <div className="px-2 py-1 rounded-b text-[8px] text-slate-600 w-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>---</div>
          </div>
          <div className="mt-2 px-2 py-1.5 rounded text-center" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
            <span className="text-[7px] uppercase tracking-widest text-slate-600 block">Winner</span>
            <span className="text-amber-400 font-bold text-[9px]">---</span>
          </div>
        </div>
      </div>
    </div>
  );
}
