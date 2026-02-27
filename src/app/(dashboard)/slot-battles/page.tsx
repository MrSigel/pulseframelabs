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
import { slotBattles as slotBattlesDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { SlotBattle } from "@/lib/supabase/types";

const currencies = [
  { value: "USD", label: "$ - (US Dollar)" },
  { value: "EUR", label: "\u20ac - (Euro)" },
  { value: "GBP", label: "\u00a3 - (British Pound)" },
  { value: "CAD", label: "C$ - (Canadian Dollar)" },
  { value: "AUD", label: "A$ - (Australian Dollar)" },
  { value: "JPY", label: "\u00a5 - (Japanese Yen)" },
];

const tableColumns = ["Slot Battle", "Start", "Number of Buys", "Status", "Created", "Last Update", "Manage"];

export default function SlotBattlesPage() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [startBalance, setStartBalance] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [buys, setBuys] = useState("1");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: battlesList, loading, refetch } = useDbQuery<SlotBattle[]>(() => slotBattlesDb.list(), []);
  const battles = (battlesList ?? []).filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await slotBattlesDb.create({
        name: name.trim(),
        start_balance: parseFloat(startBalance) || 0,
        currency,
        number_of_buys: parseInt(buys) || 0,
      });
      setCreateOpen(false);
      setName(""); setStartBalance(""); setCurrency("USD"); setBuys("1");
      await refetch();
    } catch (err) {
      console.error("Failed to create:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await slotBattlesDb.remove(id);
      await refetch();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const overlayUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/overlay/slot_battle_normal?title=SLOT%20BATTLE`;
  }, []);

  return (
    <div>
      <PageHeader
        title="Slot Battles"
        actions={
          <>
            <Button variant="success" className="gap-2" onClick={() => setOverlayOpen(true)}>
              <Monitor className="h-4 w-4" />
              Slot Battle Overlays
            </Button>
            <Button variant="warning" className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              + Create Slot Battle
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-white">Slot Battles</CardTitle>
          <div className="relative">
            <Input placeholder="Search for Slot Battle" className="w-64 pr-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div
            className="grid gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
            style={{
              gridTemplateColumns: "1.5fr 0.8fr 1fr 0.8fr 1fr 1fr 0.8fr",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {tableColumns.map((col, i) => (
              <span key={col} className={i === 2 ? "flex items-center gap-1" : ""}>
                {col}
                {i === 2 && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12l7-7 7 7" />
                  </svg>
                )}
              </span>
            ))}
          </div>

          {/* Data / Loading / Empty */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : battles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Inbox className="h-10 w-10 mb-3 text-slate-600" />
              <p className="text-sm">No data available in table</p>
            </div>
          ) : (
            <div>
              {battles.map((battle) => (
                <div
                  key={battle.id}
                  className="grid gap-4 px-4 py-3 items-center text-sm border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  style={{ gridTemplateColumns: "1.5fr 0.8fr 1fr 0.8fr 1fr 1fr 0.8fr" }}
                >
                  <span className="text-white font-medium truncate">{battle.name}</span>
                  <span className="text-slate-400">{battle.currency} {battle.start_balance}</span>
                  <span className="text-slate-400">{battle.number_of_buys}</span>
                  <span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${battle.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : battle.status === 'paused' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {battle.status.toUpperCase()}
                    </span>
                  </span>
                  <span className="text-slate-500 text-xs">{new Date(battle.created_at).toLocaleDateString()}</span>
                  <span className="text-slate-500 text-xs">{new Date(battle.updated_at).toLocaleDateString()}</span>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(battle.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
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
              <span className="text-xs text-slate-600">{battles.length === 0 ? "Showing no records" : `Showing ${battles.length} record${battles.length !== 1 ? "s" : ""}`}</span>
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

      {/* ====== Slot Battle Overlay Modal ====== */}
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
              <h2 className="text-white font-bold text-lg">Slot Battle Overlays</h2>
              <button
                onClick={() => setOverlayOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab */}
            <div className="px-6 pt-4 border-b border-white/[0.06]">
              <button className="pb-3 text-sm font-medium text-white relative">
                Overlay Normal
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#c9a84c]" style={{ animation: "tabSlide 0.2s ease-out" }} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <OverlayLink url={overlayUrl} />

              <div>
                <Label className="text-sm font-semibold text-slate-400 mb-2 block">Preview</Label>
                <div
                  className="rounded-lg p-5 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #080c14 0%, #0f1521 50%, #080c14 100%)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    minHeight: "380px",
                  }}
                >
                  <div className="animate-fade-in-up">
                    <SlotBattlePreview />
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

      {/* ====== Create Slot Battle Modal ====== */}
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
              <h2 className="text-white font-bold text-lg">Create Slot Battle</h2>
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
                <Label className="text-sm font-semibold text-white mb-2 block">Slot Battle Name</Label>
                <Input
                  placeholder="Enter slot battle name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Provide a short, clear name for your slot battle. This will be visible to viewers.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Start Balance</Label>
                  <Input
                    placeholder="Enter starting"
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
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-500 mt-1.5">Select the currency for your hunt.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Number of Buys</Label>
                  <Select value={buys} onValueChange={setBuys}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-500 mt-1.5">Enter the starting balance.</p>
                </div>
              </div>

              <Button
                className="w-full gap-2 py-5 text-sm font-semibold"
                onClick={handleCreate}
                disabled={creating || !name.trim()}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? "Creating..." : "Create Slot Battle"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Slot Battle Overlay Preview ── */

function SlotBattlePreview() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
        border: "1px solid rgba(59, 130, 246, 0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        minWidth: "320px",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2 text-center">
        <span
          className="font-black text-sm tracking-wider"
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
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] font-bold text-slate-400">BONUS <span className="text-white">0/0</span></span>
          <span className="text-[9px] font-bold text-slate-400">START <span className="text-white">0$</span></span>
        </div>
      </div>

      {/* VS */}
      <div className="px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className="flex-1 rounded-lg px-2.5 py-2 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.03))", border: "1px solid rgba(239,68,68,0.15)" }}
          >
            <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <div>
              <span className="text-white font-bold text-[10px] block">Slot</span>
              <span className="text-[8px] text-slate-500">Sub</span>
              <span className="text-[8px] text-slate-500 block">Provider</span>
            </div>
          </div>
          <span className="text-slate-600 font-black text-xs shrink-0">VS</span>
          <div
            className="flex-1 rounded-lg px-2.5 py-2 flex items-center gap-2 justify-end"
            style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.03), rgba(16,185,129,0.1))", border: "1px solid rgba(16,185,129,0.15)" }}
          >
            <div className="text-right">
              <span className="text-white font-bold text-[10px] block">Slot</span>
              <span className="text-[8px] text-slate-500">Sub</span>
              <span className="text-[8px] text-slate-500 block">Provider</span>
            </div>
            <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-3.5 pb-2.5">
        {[
          { left: "0/0", label: "# BONUS", right: "0/0" },
          { left: "0$", label: "COST", right: "0$" },
          { left: "0$", label: "BEST WIN", right: "0$" },
          { left: "0X", label: "BEST X", right: "0X" },
          { left: "0.00", label: "SCORE", right: "0.00", highlight: true },
        ].map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-1.5 px-2.5"
            style={{
              borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.03)",
              background: row.highlight ? "rgba(255,255,255,0.02)" : "transparent",
            }}
          >
            <span className={`text-[10px] font-bold ${row.highlight ? "text-[#c9a84c]" : "text-white"}`}>{row.left}</span>
            <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider">{row.label}</span>
            <span className={`text-[10px] font-bold ${row.highlight ? "text-green-400" : "text-white"}`}>{row.right}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3.5 py-2 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <span className="text-[7px] uppercase tracking-widest text-slate-600">
          SCORE = OVERALL PAYBACK / (BUY AMOUNT x COST)
        </span>
      </div>
    </div>
  );
}
