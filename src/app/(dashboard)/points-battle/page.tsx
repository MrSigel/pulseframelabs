"use client";

import { PageHeader } from "@/components/page-header";
import { OverlayLink } from "@/components/overlay-link";
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
import { Monitor, Settings2, Plus, Play, Lock, ArrowLeft, Trash2, X, Loader2, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { pointsBattle as pbDb, pointsBattleBets } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useAuthUid } from "@/hooks/useAuthUid";
import { useTwitchBot } from "@/contexts/TwitchBotContext";
import { createPointsBattleHandler } from "@/lib/twitch/handlers/points-battle-handler";
import type { PointsBattlePreset } from "@/lib/supabase/types";

interface BetOption {
  command: string;
  keyword: string;
  description: string;
}

interface PBPreset {
  id: string;
  name: string;
  options: BetOption[];
  minPoints: string;
  maxPoints: string;
  time: string;
}

export default function PointsBattlePage() {
  const uid = useAuthUid();
  const [minPoints, setMinPoints] = useState("");
  const [maxPoints, setMaxPoints] = useState("");

  // Prediction options
  const [predictionOptions, setPredictionOptions] = useState<BetOption[]>([
    { command: "!bet", keyword: "", description: "" },
    { command: "!bet", keyword: "", description: "" },
  ]);

  // Presets
  const [presets, setPresets] = useState<PBPreset[]>([]);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [presetsView, setPresetsView] = useState<"main" | "create" | "manage">("main");
  const [selectedTime, setSelectedTime] = useState("30");

  // Twitch bot
  const { isConnected, addHandler, removeHandler } = useTwitchBot();

  // Active prediction state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [totalPointsWagered, setTotalPointsWagered] = useState<number>(0);
  const [isPredictionActive, setIsPredictionActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Overlay modal
  const [showOverlayModal, setShowOverlayModal] = useState(false);

  const overlayUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/overlay/points_battle?uid=${uid || ""}`;
  }, []);

  // Create preset form
  const [newPresetOptions, setNewPresetOptions] = useState<BetOption[]>([
    { command: "!bet", keyword: "", description: "" },
    { command: "!bet", keyword: "", description: "" },
  ]);
  const [newPresetMin, setNewPresetMin] = useState("");
  const [newPresetMax, setNewPresetMax] = useState("");
  const [newPresetDuration, setNewPresetDuration] = useState("");

  const MAX_PRESETS = 4;

  // Preset name for create form
  const [presetName, setPresetName] = useState("");

  // --- Supabase queries ---
  const { data: dbPresets, refetch: refetchPresets } = useDbQuery<PointsBattlePreset[]>(
    () => pbDb.presets.list(),
    [],
  );

  useEffect(() => {
    if (dbPresets) {
      setPresets(dbPresets.map(p => ({
        id: p.id,
        name: p.name,
        options: (p.options as any[]) || [],
        minPoints: String(p.min_points),
        maxPoints: String(p.max_points),
        time: String(p.duration_seconds),
      })));
    }
  }, [dbPresets]);

  function resetCreateForm() {
    setPresetName("");
    setNewPresetOptions([
      { command: "!bet", keyword: "", description: "" },
      { command: "!bet", keyword: "", description: "" },
    ]);
    setNewPresetMin("");
    setNewPresetMax("");
    setNewPresetDuration("");
  }

  function openPresetsModal() {
    setPresetsView("main");
    setShowPresetsModal(true);
  }

  function closePresetsModal() {
    setShowPresetsModal(false);
    resetCreateForm();
  }

  async function handleCreatePreset() {
    if (presets.length >= MAX_PRESETS) return;
    const name = presetName.trim() || `Preset ${presets.length + 1}`;
    try {
      await pbDb.presets.create({
        name,
        options: newPresetOptions.map((o) => ({ ...o })),
        min_points: parseInt(newPresetMin) || 0,
        max_points: parseInt(newPresetMax) || 0,
        duration_seconds: parseInt(newPresetDuration) || 30,
      });
      resetCreateForm();
      await refetchPresets();
      setPresetsView("manage");
    } catch (err) {
      console.error(err);
    }
  }

  function updateNewPresetOption(index: number, field: keyof BetOption, value: string) {
    setNewPresetOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function addNewPresetOption() {
    setNewPresetOptions((prev) => [...prev, { command: "!bet", keyword: "", description: "" }]);
  }

  function removeNewPresetOption(index: number) {
    if (newPresetOptions.length <= 2) return;
    setNewPresetOptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDeletePreset(id: string) {
    try {
      await pbDb.presets.remove(id);
      await refetchPresets();
    } catch (err) {
      console.error(err);
    }
  }

  function handleLoadPreset(preset: PBPreset) {
    setPredictionOptions(preset.options.map((o) => ({ ...o })));
    setMinPoints(preset.minPoints);
    setMaxPoints(preset.maxPoints);
    setSelectedTime(preset.time);
    closePresetsModal();
  }

  // --- Prediction lifecycle ---

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const pollBets = useCallback(async (sessionId: string) => {
    try {
      const bets = await pointsBattleBets.list(sessionId);
      setParticipantCount(bets.length);
      setTotalPointsWagered(bets.reduce((sum, b) => sum + b.amount, 0));
    } catch { /* ignore */ }
  }, []);

  async function handleStartPrediction() {
    if (isPredictionActive) return;

    const min = parseInt(minPoints) || 0;
    const max = parseInt(maxPoints) || 0;
    const duration = parseInt(selectedTime) || 30;

    // Validate at least 2 options have keywords
    const validOptions = predictionOptions.filter((o) => o.keyword.trim());
    if (validOptions.length < 2) return;

    try {
      const session = await pbDb.sessions.create({
        options: validOptions,
        min_points: min,
        max_points: max,
        duration_seconds: duration,
      });

      setActiveSessionId(session.id);
      setIsPredictionActive(true);
      setRemainingSeconds(duration);
      setParticipantCount(0);
      setTotalPointsWagered(0);

      // Register the Twitch chat handler
      addHandler(
        createPointsBattleHandler({
          activeSessionId: session.id,
          options: validOptions,
          minPoints: min,
          maxPoints: max,
        }),
      );

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            // Time is up — finish the prediction
            finishPrediction(session.id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Poll bets every 3 seconds for live stats
      pollRef.current = setInterval(() => pollBets(session.id), 3000);
    } catch (err) {
      console.error("Failed to start prediction:", err);
    }
  }

  async function finishPrediction(sessionId: string) {
    stopTimer();
    stopPolling();
    removeHandler("points-battle");

    try {
      await pbDb.sessions.update(sessionId, { status: "finished" });
      // Final poll to get accurate counts
      await pollBets(sessionId);
    } catch (err) {
      console.error("Failed to finish prediction:", err);
    }

    setIsPredictionActive(false);
  }

  async function handleStopPrediction() {
    if (!activeSessionId) return;
    await finishPrediction(activeSessionId);
  }

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopPolling();
    };
  }, [stopTimer, stopPolling]);

  // Format remaining time as mm:ss
  const formattedTime = useMemo(() => {
    if (!isPredictionActive && remainingSeconds === 0) return "--:--";
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [isPredictionActive, remainingSeconds]);

  function updateOption(index: number, field: keyof BetOption, value: string) {
    setPredictionOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function addOption() {
    setPredictionOptions((prev) => [...prev, { command: "!bet", keyword: "", description: "" }]);
  }

  function removeOption(index: number) {
    if (predictionOptions.length <= 2) return;
    setPredictionOptions((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <PageHeader
        title="Points Battle"
        actions={
          <Button className="gap-2" onClick={() => setShowOverlayModal(true)}>
            <Monitor className="h-4 w-4" />
            Points Battle Overlay
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Presets */}
          {presets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-8">
                <Lock className="h-10 w-10 text-slate-500 mb-2" />
                <p className="text-slate-500 mb-4">No Presets Available</p>
                <Button className="gap-2" onClick={openPresetsModal}>
                  <Plus className="h-4 w-4" />
                  Manage Presets
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base text-white">Presets</CardTitle>
                <Button size="sm" variant="ghost" className="text-xs text-slate-400 hover:text-white" onClick={openPresetsModal}>
                  Manage
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => handleLoadPreset(preset)}
                    >
                      <Play className="h-3 w-3" />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prediction Options */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base text-white">Prediction Options</CardTitle>
              <Button className="gap-2" size="sm" onClick={addOption}>
                <Plus className="h-3.5 w-3.5" />
                New Option
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictionOptions.map((opt, i) => (
                <div key={i}>
                  <Label className="text-sm text-muted-foreground mb-2 block">Option {i + 1}</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={opt.command}
                      onChange={(e) => updateOption(i, "command", e.target.value)}
                      className="w-16"
                    />
                    <Input
                      value={opt.keyword}
                      onChange={(e) => updateOption(i, "keyword", e.target.value)}
                      placeholder={`Keyword (e.g., ${i === 0 ? "yes" : "no"})`}
                      className="flex-1"
                    />
                    <Input
                      value={opt.description}
                      onChange={(e) => updateOption(i, "description", e.target.value)}
                      placeholder={`Description (e.g., ${i === 0 ? "profit" : "loss"})`}
                      className="flex-1"
                    />
                    {predictionOptions.length > 2 && (
                      <button
                        onClick={() => removeOption(i)}
                        className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Prediction Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-white">Prediction Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Points in Prediction:</span>
                <span className="text-white font-bold">{totalPointsWagered.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Participants:</span>
                <span className="text-white font-bold">{participantCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining Time:</span>
                <span className="text-white font-bold">{formattedTime}</span>
              </div>
            </CardContent>
          </Card>

          {/* Prediction Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-white">Prediction Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Minimum Points (per user)</Label>
                <Input value={minPoints} onChange={(e) => setMinPoints(e.target.value)} placeholder="Enter minimum points" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Maximum Points (per user)</Label>
                <Input value={maxPoints} onChange={(e) => setMaxPoints(e.target.value)} placeholder="Enter maximum points" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Set Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="30 seconds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="120">120 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isPredictionActive ? (
                <Button className="w-full gap-2 py-5" variant="destructive" onClick={handleStopPrediction}>
                  <Square className="h-4 w-4" />
                  Stop Prediction
                </Button>
              ) : (
                <Button className="w-full gap-2 py-5" onClick={handleStartPrediction}>
                  <Play className="h-4 w-4" />
                  Start Prediction
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Points Battle Overlay Modal */}
      {showOverlayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOverlayModal(false)} />
          <div
            className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl"
            style={{ animation: "modalSlideIn 0.25s ease-out" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-white font-bold text-base">Points Battle Overlay</h3>
              <button onClick={() => setShowOverlayModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label className="text-white font-semibold mb-2 block text-sm">Overlay URL</Label>
                <OverlayLink url={overlayUrl} obsSize="400 × 280" />
                <p className="text-xs text-slate-500 mt-2">Add this URL as a Browser Source in OBS to display the Points Battle overlay on your stream.</p>
              </div>

              {/* Preview */}
              <div>
                <Label className="text-white font-semibold mb-2 block text-sm">Preview</Label>
                <div className="rounded-lg border border-border bg-black/40 p-4 flex items-center justify-center min-h-[120px]">
                  <div
                    className="rounded-lg overflow-hidden w-full max-w-[340px]"
                    style={{
                      background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-[10px] font-bold tracking-widest" style={{ color: "#3b82f6" }}>POINTS BATTLE</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>LIVE</span>
                    </div>
                    <div className="px-3 py-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white font-semibold">Option A</span>
                        <span className="text-[10px] font-bold" style={{ color: "#10b981" }}>1,250 pts</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full" style={{ width: "65%", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)" }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white font-semibold">Option B</span>
                        <span className="text-[10px] font-bold" style={{ color: "#ef4444" }}>680 pts</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full" style={{ width: "35%", background: "linear-gradient(90deg, #ef4444, #f97316)" }} />
                      </div>
                    </div>
                    <div className="px-3 py-1.5 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-[9px]" style={{ color: "#64748b" }}>12 participants</span>
                      <span className="text-[9px] font-bold" style={{ color: "#f59e0b" }}>0:28</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Presets Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePresetsModal} />
          <div
            className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-2xl"
            style={{ animation: "modalSlideIn 0.25s ease-out" }}
          >
            {/* Main View */}
            {presetsView === "main" && (
              <div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="text-white font-bold text-base">Manage Presets</h3>
                  <button onClick={closePresetsModal} className="text-slate-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-slate-400 text-sm mb-1">Select an Option</p>
                  <Button
                    variant="success"
                    className="w-full gap-2 py-5 text-sm font-semibold"
                    onClick={() => {
                      if (presets.length < MAX_PRESETS) {
                        setPresetsView("create");
                      }
                    }}
                    disabled={presets.length >= MAX_PRESETS}
                  >
                    <Plus className="h-4 w-4" />
                    Create New Preset ({presets.length}/{MAX_PRESETS})
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 py-5 text-sm font-semibold"
                    onClick={() => setPresetsView("manage")}
                  >
                    <Settings2 className="h-4 w-4" />
                    Manage current Presets
                  </Button>
                </div>
              </div>
            )}

            {/* Create Preset View */}
            {presetsView === "create" && (
              <div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setPresetsView("main"); resetCreateForm(); }}
                      className="text-primary hover:text-primary transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h3 className="text-white font-bold text-base">Create New Preset</h3>
                  </div>
                  <button onClick={closePresetsModal} className="text-slate-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  {/* Preset Name */}
                  <div>
                    <Label className="text-white font-semibold mb-2 block text-sm">Preset Name</Label>
                    <Input
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="Enter preset name"
                    />
                  </div>

                  {/* Bet Options */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-white font-semibold text-sm">Bet Options</Label>
                      <Button size="sm" className="gap-1.5 text-xs h-7" onClick={addNewPresetOption}>
                        <Plus className="h-3 w-3" />
                        New Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {newPresetOptions.map((opt, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Input
                            value={opt.command}
                            onChange={(e) => updateNewPresetOption(i, "command", e.target.value)}
                            className="w-14 text-xs"
                            placeholder="!bet"
                          />
                          <Input
                            value={opt.keyword}
                            onChange={(e) => updateNewPresetOption(i, "keyword", e.target.value)}
                            placeholder={`Keyword ${i + 1}`}
                            className="flex-1 text-xs"
                          />
                          <Input
                            value={opt.description}
                            onChange={(e) => updateNewPresetOption(i, "description", e.target.value)}
                            placeholder="Description"
                            className="flex-1 text-xs"
                          />
                          {newPresetOptions.length > 2 && (
                            <button
                              onClick={() => removeNewPresetOption(i)}
                              className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Minimum Points */}
                  <div>
                    <Label className="text-white font-semibold mb-2 block text-sm">Minimum Points</Label>
                    <Input
                      value={newPresetMin}
                      onChange={(e) => setNewPresetMin(e.target.value)}
                      placeholder="Enter minimum points"
                      type="number"
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter the minimum points viewers can bet.</p>
                  </div>

                  {/* Maximum Points */}
                  <div>
                    <Label className="text-white font-semibold mb-2 block text-sm">Maximum Points</Label>
                    <Input
                      value={newPresetMax}
                      onChange={(e) => setNewPresetMax(e.target.value)}
                      placeholder="Enter maximum points"
                      type="number"
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter the maximum points viewers can bet.</p>
                  </div>

                  {/* Duration */}
                  <div>
                    <Label className="text-white font-semibold mb-2 block text-sm">Duration (Seconds)</Label>
                    <Input
                      value={newPresetDuration}
                      onChange={(e) => setNewPresetDuration(e.target.value)}
                      placeholder="Enter duration"
                      type="number"
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter the duration of the prediction in seconds.</p>
                  </div>

                  <Button
                    variant="success"
                    className="w-full gap-2 py-5 text-sm font-semibold"
                    onClick={handleCreatePreset}
                  >
                    <Plus className="h-4 w-4" />
                    Create Preset
                  </Button>
                </div>
              </div>
            )}

            {/* Manage Presets View */}
            {presetsView === "manage" && (
              <div>
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                  <button
                    onClick={() => setPresetsView("main")}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-white font-bold text-base">Manage Presets</h3>
                </div>
                <div className="p-5">
                  {presets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 text-sm">No presets found.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {presets.map((preset) => (
                        <div
                          key={preset.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3 group hover:border-primary/30 transition-colors"
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleLoadPreset(preset)}
                          >
                            <p className="text-white font-semibold text-sm">{preset.name}</p>
                            <p className="text-slate-500 text-xs mt-0.5">
                              {preset.options.length} options · Min: {preset.minPoints || "0"} · Max: {preset.maxPoints || "0"} · {preset.time}s
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeletePreset(preset.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors ml-3 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
