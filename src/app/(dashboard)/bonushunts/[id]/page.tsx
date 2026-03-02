"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Plus, Trash2, Loader2, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { bonushunts as bonushuntsDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import type { Bonushunt, BonushuntEntry } from "@/lib/supabase/types";

export default function BonushuntDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { canModify } = useFeatureGate();

  // Data
  const { data: huntsList } = useDbQuery<Bonushunt[]>(() => bonushuntsDb.list(), []);
  const hunt = huntsList?.find((h) => h.id === id) ?? null;

  const { data: entries, loading, refetch } = useDbQuery<BonushuntEntry[]>(
    () => bonushuntsDb.entries.list(id),
    [id],
  );

  // Add form state
  const [gameName, setGameName] = useState("");
  const [provider, setProvider] = useState("");
  const [buyIn, setBuyIn] = useState("");
  const [adding, setAdding] = useState(false);

  // Inline edit state: entryId → input value
  const [editingWin, setEditingWin] = useState<Record<string, string>>({});

  const sortedEntries = useMemo(
    () => [...(entries ?? [])].sort((a, b) => a.position - b.position),
    [entries],
  );

  // Find "current" = first entry with win_amount = 0
  // "next" = second entry with win_amount = 0
  const unplayed = useMemo(
    () => sortedEntries.filter((e) => e.win_amount === 0),
    [sortedEntries],
  );
  const currentId = unplayed[0]?.id;
  const nextId = unplayed[1]?.id;

  // Totals
  const totals = useMemo(() => {
    const played = sortedEntries.filter((e) => e.win_amount > 0);
    const totalBuyIn = sortedEntries.reduce((s, e) => s + e.buy_in, 0);
    const totalWin = sortedEntries.reduce((s, e) => s + e.win_amount, 0);
    const totalMult = totalBuyIn > 0 ? totalWin / totalBuyIn : 0;
    return { totalBuyIn, totalWin, totalMult, playedCount: played.length, totalCount: sortedEntries.length };
  }, [sortedEntries]);

  const currencySymbol = useMemo(() => {
    const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$", JPY: "¥", BRL: "R$", SEK: "kr", NOK: "kr", PLN: "zł" };
    return symbols[hunt?.currency ?? "USD"] ?? "$";
  }, [hunt]);

  async function handleAdd() {
    if (!gameName.trim() || !buyIn) return;
    setAdding(true);
    try {
      await bonushuntsDb.entries.create({
        bonushunt_id: id,
        game_name: gameName.trim(),
        provider: provider.trim(),
        buy_in: parseFloat(buyIn) || 0,
        win_amount: 0,
        multiplier: 0,
        position: (entries?.length ?? 0) + 1,
      });
      setGameName("");
      setProvider("");
      setBuyIn("");
      await refetch();
    } catch (err) {
      console.error("Failed to add entry:", err);
    } finally {
      setAdding(false);
    }
  }

  const handleSaveWin = useCallback(async (entry: BonushuntEntry) => {
    const raw = editingWin[entry.id];
    if (raw === undefined) return;
    const winAmount = parseFloat(raw) || 0;
    const multiplier = entry.buy_in > 0 ? winAmount / entry.buy_in : 0;
    try {
      await bonushuntsDb.entries.update(entry.id, { win_amount: winAmount, multiplier });
      setEditingWin((prev) => { const next = { ...prev }; delete next[entry.id]; return next; });
      await refetch();
    } catch (err) {
      console.error("Failed to save win:", err);
    }
  }, [editingWin, refetch]);

  async function handleDelete(entryId: string) {
    try {
      await bonushuntsDb.entries.remove(entryId);
      await refetch();
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  }

  function rowStyle(entry: BonushuntEntry): string {
    if (entry.win_amount === 0) return "border border-white/[0.06] bg-white/[0.02]";
    if (entry.multiplier >= 2) return "border border-emerald-500/20 bg-emerald-500/5";
    return "border border-red-500/20 bg-red-500/5";
  }

  function multColor(entry: BonushuntEntry): string {
    if (entry.win_amount === 0) return "text-slate-600";
    if (entry.multiplier >= 2) return "text-emerald-400";
    return "text-red-400";
  }

  return (
    <div>
      <PageHeader
        title={hunt?.name ?? "Bonushunt"}
        actions={
          <Link href="/bonushunts">
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Zurück
            </Button>
          </Link>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Spiele", value: `${totals.playedCount} / ${totals.totalCount}` },
          { label: "Total Buy-In", value: `${currencySymbol}${totals.totalBuyIn.toLocaleString()}` },
          { label: "Total Gewinn", value: `${currencySymbol}${totals.totalWin.toLocaleString()}`, green: totals.totalWin >= totals.totalBuyIn },
          { label: "Gesamt x", value: `${totals.totalMult.toFixed(2)}x`, green: totals.totalMult >= 1 },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg px-4 py-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.green === true ? "text-emerald-400" : s.green === false ? "text-red-400" : "text-white"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Entries Table ── */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm text-slate-400 uppercase tracking-wider">
                Spielliste
              </CardTitle>
              <span className="text-xs text-slate-600">{sortedEntries.length} Spiele</span>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                </div>
              ) : sortedEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                  <Trophy className="h-8 w-8 mb-2 text-slate-700" />
                  <p className="text-sm">Noch keine Spiele hinzugefügt.</p>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-[28px_1fr_80px_80px_64px_32px] gap-2 px-4 py-2 text-[10px] text-slate-600 font-semibold uppercase tracking-wider border-b border-white/[0.06]">
                    <span>#</span>
                    <span>Spiel</span>
                    <span className="text-right">Einsatz</span>
                    <span className="text-right">Gewinn</span>
                    <span className="text-right">x</span>
                    <span />
                  </div>

                  {sortedEntries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-[28px_1fr_80px_80px_64px_32px] gap-2 px-4 py-2.5 mx-2 mb-1 rounded-lg items-center ${rowStyle(entry)}`}
                    >
                      {/* # */}
                      <span className="text-xs text-slate-600 font-semibold">{idx + 1}</span>

                      {/* Game name + badges */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-white truncate">{entry.game_name}</span>
                          {entry.id === currentId && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase tracking-wider shrink-0">Aktuell</span>
                          )}
                          {entry.id === nextId && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase tracking-wider shrink-0">Nächstes</span>
                          )}
                        </div>
                        {entry.provider && <p className="text-[10px] text-slate-600">{entry.provider}</p>}
                      </div>

                      {/* Buy-in */}
                      <span className="text-xs text-slate-400 text-right font-mono">
                        {currencySymbol}{entry.buy_in.toLocaleString()}
                      </span>

                      {/* Win — inline edit */}
                      <div className="text-right">
                        {editingWin[entry.id] !== undefined ? (
                          <input
                            autoFocus
                            type="number"
                            className="w-full text-xs text-right bg-white/[0.08] border border-primary/40 rounded px-1 py-0.5 text-white outline-none"
                            value={editingWin[entry.id]}
                            onChange={(e) => setEditingWin((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveWin(entry);
                              if (e.key === "Escape") setEditingWin((prev) => { const n = { ...prev }; delete n[entry.id]; return n; });
                            }}
                            onBlur={() => handleSaveWin(entry)}
                          />
                        ) : (
                          <button
                            className="text-xs font-mono w-full text-right hover:text-primary transition-colors"
                            style={{ color: entry.win_amount === 0 ? "#475569" : entry.multiplier >= 2 ? "#34d399" : "#f87171" }}
                            onClick={() => setEditingWin((prev) => ({ ...prev, [entry.id]: String(entry.win_amount) }))}
                            title="Klicken zum Bearbeiten"
                            disabled={!canModify}
                          >
                            {entry.win_amount === 0 ? "—" : `${currencySymbol}${entry.win_amount.toLocaleString()}`}
                          </button>
                        )}
                      </div>

                      {/* Multiplier */}
                      <div className={`text-xs font-bold text-right font-mono flex items-center justify-end gap-0.5 ${multColor(entry)}`}>
                        {entry.win_amount > 0 && entry.multiplier >= 2 && <TrendingUp className="h-3 w-3" />}
                        {entry.win_amount > 0 && entry.multiplier < 2 && <TrendingDown className="h-3 w-3" />}
                        {entry.win_amount === 0 ? "—" : `${entry.multiplier.toFixed(2)}x`}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={!canModify}
                        className="h-6 w-6 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Footer totals */}
                  <div className="grid grid-cols-[28px_1fr_80px_80px_64px_32px] gap-2 px-4 py-3 mt-1 border-t border-white/[0.06] mx-2">
                    <span />
                    <span className="text-xs font-semibold text-slate-500 uppercase">Gesamt</span>
                    <span className="text-xs font-bold text-white text-right font-mono">
                      {currencySymbol}{totals.totalBuyIn.toLocaleString()}
                    </span>
                    <span className={`text-xs font-bold text-right font-mono ${totals.totalWin >= totals.totalBuyIn ? "text-emerald-400" : "text-red-400"}`}>
                      {totals.totalWin > 0 ? `${currencySymbol}${totals.totalWin.toLocaleString()}` : "—"}
                    </span>
                    <span className={`text-xs font-bold text-right font-mono ${totals.totalMult >= 1 ? "text-emerald-400" : totals.totalMult > 0 ? "text-red-400" : "text-slate-600"}`}>
                      {totals.totalMult > 0 ? `${totals.totalMult.toFixed(2)}x` : "—"}
                    </span>
                    <span />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Add game form ── */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Spiel hinzufügen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-white mb-1.5 block">Spielname *</Label>
                <Input
                  placeholder="z.B. Sweet Bonanza"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-white mb-1.5 block">Provider</Label>
                <Input
                  placeholder="z.B. Pragmatic Play"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-white mb-1.5 block">Einsatz (Buy-In)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{currencySymbol}</span>
                  <Input
                    type="number"
                    placeholder="0"
                    className="pl-7"
                    value={buyIn}
                    onChange={(e) => setBuyIn(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                  />
                </div>
              </div>

              <Button
                className="w-full gap-2"
                onClick={handleAdd}
                disabled={adding || !gameName.trim() || !buyIn || !canModify}
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {adding ? "Wird hinzugefügt..." : "Hinzufügen"}
              </Button>

              <p className="text-[11px] text-slate-600 text-center">
                Gewinn eintragen: einfach auf den &quot;—&quot; Wert in der Tabelle klicken.
              </p>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="mt-4 rounded-lg px-4 py-3 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold mb-2">Legende</p>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-emerald-500/30 border border-emerald-500/50 shrink-0" />
              <span className="text-xs text-slate-400">≥ 2.0x (gut)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-red-500/30 border border-red-500/50 shrink-0" />
              <span className="text-xs text-slate-400">&lt; 2.0x (schlecht)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-white/[0.04] border border-white/[0.1] shrink-0" />
              <span className="text-xs text-slate-400">Noch nicht gespielt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
