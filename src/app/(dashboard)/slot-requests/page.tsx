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
import { OverlayLink } from "@/components/overlay-link";
import { Monitor, History, Settings, Gift, MessageSquare, Trash2, Link, X, Save, Smile, Eraser, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { slotRequests as srDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useAuthUid } from "@/hooks/useAuthUid";
import { useTwitchBot } from "@/contexts/TwitchBotContext";
import type { SlotRequestSettings, SlotRequest, RaffleHistoryEntry } from "@/lib/supabase/types";

const defaultEmojis = ["❓", "❓", "❓", "❓", "❓", "❓", "⭐", "✨", "🤩"];

export default function SlotRequestsPage() {
  const uid = useAuthUid();
  const { isConnected } = useTwitchBot();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [raffleOpen, setRaffleOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [slotRequestsOpen, setSlotRequestsOpen] = useState(false);

  const overlayUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/overlay/slot_requests?uid=${uid || ""}`;
  }, []);

  // Settings state
  const [pointsCost, setPointsCost] = useState("0");
  const [allowMultiple, setAllowMultiple] = useState("no");
  const [emojis, setEmojis] = useState<string[]>(defaultEmojis);
  const [emojiInput, setEmojiInput] = useState("");
  const [holdingTime, setHoldingTime] = useState("3000");

  const { data: dbSettings, refetch: refetchSettings } = useDbQuery<SlotRequestSettings | null>(
    () => srDb.settings.get(),
    [],
  );
  const { data: dbRequests, loading: requestsLoading, refetch: refetchRequests } = useDbQuery<SlotRequest[]>(
    () => srDb.list(),
    [],
  );
  const { data: dbRaffleHistory } = useDbQuery<RaffleHistoryEntry[]>(
    () => srDb.raffleHistory.list(),
    [],
  );

  useEffect(() => {
    if (dbSettings) {
      setPointsCost(String(dbSettings.points_cost || 0));
      setAllowMultiple(dbSettings.allow_multiple ? "yes" : "no");
      if (Array.isArray(dbSettings.animation_emojis)) {
        setEmojis(dbSettings.animation_emojis as string[]);
      }
      setHoldingTime(String(dbSettings.holding_time_ms || 5000));
    }
  }, [dbSettings]);

  async function handleSaveSettings() {
    try {
      await srDb.settings.update({
        points_cost: parseInt(pointsCost) || 0,
        allow_multiple: allowMultiple === "yes",
        animation_emojis: emojis,
        holding_time_ms: parseInt(holdingTime) || 5000,
      });
      await refetchSettings();
      setSettingsOpen(false);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  }

  async function handleClearAll() {
    try { await srDb.clearAll(); await refetchRequests(); }
    catch (err) { console.error(err); }
  }

  const handleRaffleGame = useCallback(async () => {
    if (!dbRequests || dbRequests.length === 0) return;
    const pending = dbRequests.filter((r) => r.status === "pending" || !r.status);
    if (pending.length === 0) return;
    const winner = pending[Math.floor(Math.random() * pending.length)];
    try {
      await srDb.update(winner.id, { status: "raffled" });
      await srDb.raffleHistory.create({
        slot_name: winner.slot_name,
        winner: winner.viewer_username,
      });
      await refetchRequests();
    } catch (err) {
      console.error("Failed to raffle:", err);
    }
  }, [dbRequests, refetchRequests]);

  function handleToggleSlotRequests() {
    setSlotRequestsOpen((prev) => !prev);
  }

  return (
    <div>
      <PageHeader
        title="Slot Requests"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="warning" className="gap-2" onClick={() => setRaffleOpen(true)}>
              <History className="h-4 w-4" />
              Raffle History
            </Button>
            <Button variant="warning" className="gap-2" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button variant="success" className="gap-2" onClick={() => setOverlayOpen(true)}>
              <Monitor className="h-4 w-4" />
              Slot Requests Overlay
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button className="gap-2" onClick={handleRaffleGame}>
                  <Gift className="h-4 w-4" />
                  Raffle a Game
                </Button>
                <Button
                  variant={slotRequestsOpen ? "destructive" : "success"}
                  className="gap-2"
                  onClick={handleToggleSlotRequests}
                >
                  <MessageSquare className="h-4 w-4" />
                  {slotRequestsOpen ? "Close Slot Requests" : "Open Slot Requests"}
                </Button>
                <Button variant="destructive" className="gap-2" onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4" />
                  Clear All Requests
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Slot Requests Table */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-4">
                Slot Requests ({dbRequests?.length ?? 0}) - !SR &quot;GAME&quot;
              </p>
              <div className="grid grid-cols-4 gap-3 text-xs text-slate-500 font-semibold uppercase border-b border-border pb-3 mb-3">
                <span>Username</span>
                <span>Slot</span>
                <span>Time</span>
                <span>Actions</span>
              </div>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                </div>
              ) : (!dbRequests || dbRequests.length === 0) ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No requests yet
                </div>
              ) : (
                <div className="space-y-1">
                  {dbRequests.map((r) => (
                    <div key={r.id} className="grid grid-cols-4 gap-3 text-sm py-2 border-b border-white/[0.03]">
                      <span className="text-white font-medium">{r.viewer_username}</span>
                      <span className="text-slate-300">{r.slot_name}</span>
                      <span className="text-slate-500">{new Date(r.requested_at).toLocaleTimeString()}</span>
                      <span>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={async () => {
                            try { await srDb.remove(r.id); await refetchRequests(); }
                            catch (err) { console.error(err); }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </Button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Linked Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Link className="h-5 w-5" />
                Linked Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2" onClick={() => setLinkOpen(true)}>
                <Link className="h-4 w-4" />
                Link More Accounts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ====== Settings Modal ====== */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setSettingsOpen(false)}
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
              <h2 className="text-white font-bold text-lg">Settings</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
              {/* Points Cost */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Points Cost per Slot Request</Label>
                <Input
                  type="number"
                  value={pointsCost}
                  onChange={(e) => setPointsCost(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Set to <span className="text-white font-semibold">0</span> to deactivate loyalty points requirement.
                </p>
              </div>

              {/* Allow Multiple */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Allow Multiple Slot Requests from the Same User</Label>
                <Select value={allowMultiple} onValueChange={setAllowMultiple}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1.5">
                  If set to &quot;No&quot;, users can only have one active slot request at a time.
                </p>
              </div>

              {/* Overlay Animation Emojis */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">
                  Overlay Animation Emojis <span className="text-slate-500 font-normal">(max 10)</span>
                </Label>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="flex-1 rounded-lg px-3 py-2 text-sm flex items-center gap-1 flex-wrap min-h-[40px]"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {emojis.map((e, i) => (
                      <span key={i} className="text-base">{e}</span>
                    ))}
                    <input
                      className="bg-transparent border-none outline-none text-white text-sm flex-1 min-w-[40px]"
                      value={emojiInput}
                      onChange={(ev) => setEmojiInput(ev.target.value)}
                      placeholder=""
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" && emojiInput.trim() && emojis.length < 10) {
                          setEmojis([...emojis, emojiInput.trim()]);
                          setEmojiInput("");
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (emojiInput.trim() && emojis.length < 10) {
                        setEmojis([...emojis, emojiInput.trim()]);
                        setEmojiInput("");
                      }
                    }}
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-all hover:scale-105"
                    style={{ background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.2)" }}
                  >
                    <Smile className="h-4 w-4 text-amber-400" />
                  </button>
                </div>

                {/* Emoji chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {emojis.map((emoji, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        animation: `casinoItemIn 0.2s ease-out ${i * 30}ms both`,
                      }}
                    >
                      {emoji}
                      <button
                        onClick={() => setEmojis(emojis.filter((_, idx) => idx !== i))}
                        className="text-slate-500 hover:text-red-400 transition-colors ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">({emojis.length}/10)</span>
                  <button
                    onClick={() => setEmojis([])}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <Eraser className="h-3 w-3" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Winner Holding Time */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Winner Holding Time (milliseconds)</Label>
                <Input
                  type="number"
                  value={holdingTime}
                  onChange={(e) => setHoldingTime(e.target.value)}
                  step={100}
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Time the winner stays on the overlay before it goes back to normal (set to 3000 for 3 seconds).
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-center">
              <Button
                variant="default"
                className="gap-2 px-8"
                onClick={handleSaveSettings}
              >
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Raffle History Modal ====== */}
      {raffleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setRaffleOpen(false)}
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
              <h2 className="text-white font-bold text-lg">Raffle History</h2>
              <button
                onClick={() => setRaffleOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Table */}
            <div className="px-6 py-5">
              <div className="grid grid-cols-4 gap-3 text-xs text-slate-500 font-semibold uppercase tracking-wider border-b border-white/[0.06] pb-3 mb-3">
                <span>DATE</span>
                <span>TIME</span>
                <span>SLOT</span>
                <span>WINNER</span>
              </div>
              <div
                className="min-h-[120px] max-h-[300px] overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}
              >
                {(!dbRaffleHistory || dbRaffleHistory.length === 0) ? (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-slate-500 text-sm">No raffle history yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {dbRaffleHistory.map((r) => {
                      const d = new Date(r.raffled_at);
                      return (
                        <div
                          key={r.id}
                          className="grid grid-cols-4 gap-3 text-sm py-2 border-b border-white/[0.03]"
                        >
                          <span className="text-slate-400">{d.toLocaleDateString()}</span>
                          <span className="text-slate-400">{d.toLocaleTimeString()}</span>
                          <span className="text-white">{r.slot_name}</span>
                          <span className="text-emerald-400 font-medium">{r.winner}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <Button variant="outline" onClick={() => setRaffleOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Slot Requests Overlay Modal ====== */}
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
              <h2 className="text-white font-bold text-lg">Slotrequest Overlays</h2>
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
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" style={{ animation: "tabSlide 0.2s ease-out" }} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Overlay Link */}
              <OverlayLink url={overlayUrl} />

              {/* Overlay Preview */}
              <div>
                <Label className="text-sm font-semibold text-slate-400 mb-2 block">Preview</Label>
                <div
                  className="rounded-lg p-5 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #080c14 0%, #0f1521 50%, #080c14 100%)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    minHeight: "180px",
                  }}
                >
                  <div className="inline-block animate-fade-in-up">
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                        minWidth: "320px",
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-md flex items-center justify-center"
                            style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.2)" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="16 3 21 3 21 8" />
                              <line x1="4" y1="20" x2="21" y2="3" />
                              <polyline points="21 16 21 21 16 21" />
                              <line x1="15" y1="15" x2="21" y2="21" />
                              <line x1="4" y1="4" x2="9" y2="9" />
                            </svg>
                          </div>
                          <span
                            className="font-bold text-sm tracking-wide"
                            style={{
                              background: "linear-gradient(90deg, #ef4444, #f97316, #ef4444)",
                              backgroundSize: "200% 100%",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              animation: "shimmer 3s ease-in-out infinite",
                            }}
                          >
                            !SR SLOT
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold" style={{ color: "#64748b" }}>Participants</span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.15)" }}
                          >
                            0
                          </span>
                        </div>
                      </div>

                      {/* Empty area */}
                      <div className="px-4 py-3 min-h-[80px] flex items-center justify-center">
                        <span className="text-xs text-slate-600">Waiting for requests...</span>
                      </div>
                    </div>
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

      {/* ====== Link Accounts Modal ====== */}
      {linkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setLinkOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-sm rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Link Accounts</h2>
              <button
                onClick={() => setLinkOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-8 flex flex-col items-center gap-5">
              <p className="text-sm text-slate-400 text-center">Connect your streaming accounts to enable slot requests from your chat.</p>

              {/* Twitch */}
              <button
                className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-semibold text-white text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #6441a5, #9146ff)",
                  boxShadow: "0 4px 20px rgba(145, 70, 255, 0.25)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
                </svg>
                Sign in with Twitch
              </button>

              {/* Kick */}
              <button
                className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-semibold text-white text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #39b54a, #53d769)",
                  boxShadow: "0 4px 20px rgba(83, 215, 105, 0.2)",
                }}
              >
                <span className="font-black text-base">K</span>
                Sign in with Kick
              </button>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <Button variant="outline" onClick={() => setLinkOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
