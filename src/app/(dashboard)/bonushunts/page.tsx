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
import { bonushunts as bonushuntsDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { Bonushunt } from "@/lib/supabase/types";

const overlayTabs = [
  { key: "large", label: "Overlay Large" },
  { key: "small", label: "Overlay Small" },
  { key: "horizontal", label: "Overlay Horizontal" },
  { key: "topworse", label: "Top/Worse" },
  { key: "guess", label: "Guess Balance" },
] as const;

type OverlayTab = (typeof overlayTabs)[number]["key"];

const currencies = [
  { value: "USD", label: "$ - (US Dollar)" },
  { value: "EUR", label: "\u20ac - (Euro)" },
  { value: "GBP", label: "\u00a3 - (British Pound)" },
  { value: "CAD", label: "C$ - (Canadian Dollar)" },
  { value: "AUD", label: "A$ - (Australian Dollar)" },
  { value: "JPY", label: "\u00a5 - (Japanese Yen)" },
  { value: "BRL", label: "R$ - (Brazilian Real)" },
  { value: "SEK", label: "kr - (Swedish Krona)" },
  { value: "NOK", label: "kr - (Norwegian Krone)" },
  { value: "PLN", label: "z\u0142 - (Polish Zloty)" },
];

export default function BonushuntsPage() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<OverlayTab>("large");
  const [huntName, setHuntName] = useState("");
  const [huntDesc, setHuntDesc] = useState("");
  const [startBalance, setStartBalance] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: huntsList, loading, refetch } = useDbQuery<Bonushunt[]>(() => bonushuntsDb.list(), []);
  const hunts = (huntsList ?? []).filter(h => !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase()));

  async function handleCreateHunt() {
    if (!huntName.trim()) return;
    setCreating(true);
    try {
      await bonushuntsDb.create({
        name: huntName.trim(),
        description: huntDesc.trim(),
        start_balance: parseFloat(startBalance) || 0,
        currency,
      });
      setCreateOpen(false);
      setHuntName("");
      setHuntDesc("");
      setStartBalance("");
      await refetch();
    } catch (err) {
      console.error("Failed to create bonushunt:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteHunt(id: string) {
    try {
      await bonushuntsDb.remove(id);
      await refetch();
    } catch (err) {
      console.error("Failed to delete bonushunt:", err);
    }
  }

  const overlayUrls = useMemo(() => {
    if (typeof window === "undefined") return {} as Record<OverlayTab, string>;
    const base = window.location.origin;
    return {
      large: `${base}/overlay/bonushunt_large?title=%25TITLE%25&hunt=HUNT%20%23000`,
      small: `${base}/overlay/bonushunt_small?title=%25TITLE%25&hunt=HUNT%20%23000`,
      horizontal: `${base}/overlay/bonushunt_horizontal?title=%25TITLE%25&hunt=HUNT%20%23000`,
      topworse: `${base}/overlay/bonushunt_topworse?title=%25TITLE%25`,
      guess: `${base}/overlay/bonushunt_guess?title=%25TITLE%25&balance=%240.00`,
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Bonushunts"
        actions={
          <>
            <Button variant="success" className="gap-2" onClick={() => setOverlayOpen(true)}>
              <Monitor className="h-4 w-4" />
              Bonushunt Overlay
            </Button>
            <Button variant="warning" className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Bonushunt
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-white">Bonushunts</CardTitle>
          <div className="relative">
            <Input placeholder="Search for Bonushunt" className="w-64 pr-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <div className="px-4 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-slate-400">
              Bonushunt
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : hunts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Inbox className="h-10 w-10 mb-3 text-slate-600" />
              <p className="text-sm">No data available in table</p>
            </div>
          ) : (
            <div className="space-y-2">
              {hunts.map((hunt) => (
                <div key={hunt.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">{hunt.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hunt.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : hunt.status === 'paused' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'}`}>
                        {hunt.status.toUpperCase()}
                      </span>
                    </div>
                    {hunt.description && <p className="text-xs text-slate-500 mt-0.5">{hunt.description}</p>}
                    <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-600">
                      <span>Start: {hunt.currency} {hunt.start_balance}</span>
                      <span>Created: {new Date(hunt.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteHunt(hunt.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

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
              <span className="text-xs text-slate-600">{hunts.length === 0 ? "Showing no records" : `Showing ${hunts.length} record${hunts.length !== 1 ? "s" : ""}`}</span>
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

      {/* ====== Bonushunt Overlay Modal ====== */}
      {overlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setOverlayOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-2xl rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Bonushunt Overlays</h2>
              <button
                onClick={() => setOverlayOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 border-b border-white/[0.06] flex gap-1 overflow-x-auto">
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
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#c9a84c]"
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
                    minHeight: "240px",
                  }}
                >
                  <div className="animate-fade-in-up" key={activeTab}>
                    {activeTab === "large" && <LargePreview />}
                    {activeTab === "small" && <SmallPreview />}
                    {activeTab === "horizontal" && <HorizontalPreview />}
                    {activeTab === "topworse" && <TopWorsePreview />}
                    {activeTab === "guess" && <GuessPreview />}
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

      {/* ====== Create Bonushunt Modal ====== */}
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
              <h2 className="text-white font-bold text-lg">Create Bonushunt</h2>
              <button
                onClick={() => setCreateOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Hunt Name */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Bonushunt Name</Label>
                <Input
                  placeholder="Enter hunt name"
                  value={huntName}
                  onChange={(e) => setHuntName(e.target.value)}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Provide a short, clear name for your hunt. This will be visible to viewers.
                </p>
              </div>

              {/* Hunt Description */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Hunt Description</Label>
                <textarea
                  placeholder="Enter hunt description"
                  value={huntDesc}
                  onChange={(e) => setHuntDesc(e.target.value)}
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
                  Provide a brief description of your hunt. This will be visible to viewers.
                </p>
              </div>

              {/* Start Balance + Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Start Balance</Label>
                  <Input
                    placeholder="Enter starting balance"
                    value={startBalance}
                    onChange={(e) => setStartBalance(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">Enter the starting balance.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-500 mt-1.5">Select the currency for your hunt.</p>
                </div>
              </div>

              {/* Create Button */}
              <Button
                className="w-full gap-2 py-5 text-sm font-semibold"
                disabled={creating || !huntName.trim()}
                onClick={handleCreateHunt}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? "Creating..." : "Create Bonushunt"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Overlay Preview Components ── */

function LargePreview() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
        border: "1px solid rgba(239, 68, 68, 0.15)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        minWidth: "340px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-md flex items-center justify-center"
            style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.2)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div>
            <span
              className="font-bold text-[11px] block"
              style={{ background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              %TITLE%
            </span>
            <span className="text-[9px] font-semibold text-slate-500">HUNT #000</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#ef4444"><rect x="2" y="6" width="8" height="12" rx="1" /><rect x="14" y="6" width="8" height="12" rx="1" /></svg>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>
            0/0
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.03)" }}>
        {[
          { icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z", val: "$0K" },
          { icon: "M8 5v14l11-7z", val: "$0" },
          { icon: "", val: "0X+" },
          { icon: "", val: "0X" },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center py-2 gap-0.5" style={{ background: "rgba(12,16,24,0.9)" }}>
            <span style={{ color: "#ef4444" }}>
              {i === 0 && <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>}
              {i === 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
              {i === 2 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
              {i === 3 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
            </span>
            <span className="text-white font-bold text-[10px]">{s.val}</span>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="px-3 py-2.5 space-y-1">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,0.02)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z" /></svg>
          <span className="text-slate-500 text-[10px] font-semibold">0.</span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,0.02)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444"><path d="M12 2C8 6 4 9.5 4 13a8 8 0 0016 0c0-3.5-4-7-8-11z" /></svg>
          <span className="text-slate-500 text-[10px] font-semibold">0.</span>
        </div>
      </div>
    </div>
  );
}

function SmallPreview() {
  return (
    <div
      className="rounded-lg overflow-hidden flex items-center"
      style={{
        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="h-[48px] w-[48px] shrink-0 flex items-center justify-center"
        style={{ background: "rgba(239, 68, 68, 0.08)", borderRight: "1px solid rgba(255,255,255,0.04)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[10px]" style={{ background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>%TITLE%</span>
          <span className="text-[9px] font-semibold text-slate-600">HUNT #000</span>
        </div>
        <p className="text-[9px] font-semibold mt-0.5" style={{ color: "#64748b" }}>Slots: 0/0</p>
      </div>
    </div>
  );
}

function HorizontalPreview() {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
        border: "1px solid rgba(59, 130, 246, 0.15)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
      }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-[9px] block" style={{ background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>%TITLE%</span>
            <span className="text-[8px] text-slate-500">HUNT #000</span>
          </div>
        </div>
        <div className="h-6 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        {["$0K", "$0", "0X+", "0X"].map((v, i) => (
          <div key={i} className="text-center">
            <span className="text-[7px] uppercase tracking-wider text-slate-600 block">{["Buy-in", "Start", "Best", "Avg"][i]}</span>
            <span className="text-white font-bold text-[9px]">{v}</span>
          </div>
        ))}
        <div className="h-6 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>0/0</span>
      </div>
    </div>
  );
}

function TopWorsePreview() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
        border: "1px solid rgba(59, 130, 246, 0.15)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
        minWidth: "260px",
      }}
    >
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="font-bold text-[10px]" style={{ background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>%TITLE%</span>
        <span className="text-[9px] font-semibold text-slate-500">TOP / WORSE</span>
      </div>
      <div className="px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z" /></svg>
          <span className="text-[8px] font-bold uppercase text-amber-400/80">Top Wins</span>
        </div>
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center justify-between px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-slate-500 text-[9px]">#{n}</span>
            <span className="text-slate-600 text-[9px]">---</span>
          </div>
        ))}
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#ef4444"><path d="M12 2C8 6 4 9.5 4 13a8 8 0 0016 0c0-3.5-4-7-8-11z" /></svg>
          <span className="text-[8px] font-bold uppercase text-red-400/80">Worst</span>
        </div>
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center justify-between px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-slate-500 text-[9px]">#{n}</span>
            <span className="text-slate-600 text-[9px]">---</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuessPreview() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
        border: "1px solid rgba(59, 130, 246, 0.15)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
        minWidth: "240px",
      }}
    >
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded flex items-center justify-center" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <span className="text-[9px] font-bold uppercase text-violet-400/80">Guess Balance</span>
        </div>
        <span className="font-bold text-[9px]" style={{ background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>%TITLE%</span>
      </div>
      <div className="px-3 py-4 text-center">
        <p className="text-[8px] uppercase tracking-widest text-slate-600 mb-0.5">Current Balance</p>
        <p className="text-lg font-bold" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>$0.00</p>
        <p className="text-[8px] text-slate-600 mt-1.5">Type !guess &lt;amount&gt; in chat</p>
      </div>
    </div>
  );
}
