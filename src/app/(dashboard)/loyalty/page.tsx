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
import { Settings2, Play, RefreshCw, Search, ChevronLeft, ChevronRight, ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface Preset {
  id: string;
  name: string;
  keyword: string;
  points: string;
  duration: string;
}

export default function LoyaltyPage() {
  const [keyword, setKeyword] = useState("");
  const [pointsAmount, setPointsAmount] = useState("1");
  const [duration, setDuration] = useState("0");

  // Presets state
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [presetsView, setPresetsView] = useState<"main" | "create" | "manage">("main");

  // Create preset form
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetKeyword, setNewPresetKeyword] = useState("");
  const [newPresetPoints, setNewPresetPoints] = useState("");
  const [newPresetDuration, setNewPresetDuration] = useState("");

  const MAX_PRESETS = 15;

  function openPresetsModal() {
    setPresetsView("main");
    setShowPresetsModal(true);
  }

  function closePresetsModal() {
    setShowPresetsModal(false);
    setNewPresetName("");
    setNewPresetKeyword("");
    setNewPresetPoints("");
    setNewPresetDuration("");
  }

  function handleCreatePreset() {
    if (!newPresetName.trim() || presets.length >= MAX_PRESETS) return;
    const preset: Preset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      keyword: newPresetKeyword.trim(),
      points: newPresetPoints || "0",
      duration: newPresetDuration || "0",
    };
    setPresets((prev) => [...prev, preset]);
    setNewPresetName("");
    setNewPresetKeyword("");
    setNewPresetPoints("");
    setNewPresetDuration("");
    setPresetsView("manage");
  }

  function handleDeletePreset(id: string) {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }

  function handleLoadPreset(preset: Preset) {
    setKeyword(preset.keyword);
    setPointsAmount(preset.points);
    setDuration(preset.duration);
    closePresetsModal();
  }

  return (
    <div>
      <PageHeader
        title="Loyalty"
        actions={
          <Button variant="success" className="gap-2" onClick={openPresetsModal}>
            <Settings2 className="h-4 w-4" />
            Manage Presets
          </Button>
        }
      />

      {/* Alert */}
      {presets.length === 0 ? (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400 mb-6">
          No presets found.
        </div>
      ) : (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm text-green-400 mb-6 flex items-center justify-between">
          <span>{presets.length} preset{presets.length !== 1 ? "s" : ""} configured.</span>
          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 h-7 px-2 text-xs" onClick={openPresetsModal}>
            Manage
          </Button>
        </div>
      )}

      {/* Quick Preset Buttons */}
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
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
      )}

      {/* Points Giveaway */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            Points Giveaway
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white font-semibold mb-2 block">Keyword</Label>
            <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Enter keyword" />
            <p className="text-xs text-slate-500 mt-1">Enter a keyword that viewers can type in chat to enter the giveaway.</p>
          </div>

          <div>
            <Label className="text-white font-semibold mb-2 block">Points Amount</Label>
            <Input value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)} type="number" />
            <p className="text-xs text-slate-500 mt-1">Enter the amount of points viewers will receive for entering the giveaway.</p>
          </div>

          <div>
            <Label className="text-white font-semibold mb-2 block">Duration (Seconds)</Label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" />
            <p className="text-xs text-slate-500 mt-1">Enter the duration of the giveaway in seconds.</p>
          </div>

          <div>
            <Label className="text-white font-semibold mb-2 block">Streamdeck URL</Label>
            <div className="flex gap-2">
              <Input value="https://pulseframelabs.com/api/rest/stream-points/..." className="flex-1" readOnly />
              <Button size="icon" className="shrink-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">The URL for your Streamdeck to trigger the giveaway.</p>
          </div>

          <Button variant="success" className="w-full gap-2 py-5">
            <Play className="h-4 w-4" />
            Start Giveaway
          </Button>
        </CardContent>
      </Card>

      {/* Giveaway History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            Giveaway History
          </CardTitle>
          <div className="relative">
            <Input placeholder="Search for keyword or amount" className="w-72 pr-8" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500 bg-secondary rounded px-3 py-2 inline-block mb-4">Keyword</div>
          <div className="text-center py-8 text-slate-500 text-sm">No data available in table</div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Select defaultValue="10">
                <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="10">10</SelectItem></SelectContent>
              </Select>
              <span className="text-sm text-slate-500">Showing no records</span>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    Create new preset ({presets.length}/{MAX_PRESETS})
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
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                  <button
                    onClick={() => setPresetsView("main")}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-white font-bold text-base">Create new Preset</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <Label className="text-white font-semibold mb-2 block text-sm">Preset Name</Label>
                    <Input
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="Enter preset name"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-semibold mb-2 block text-sm">Keyword</Label>
                    <Input
                      value={newPresetKeyword}
                      onChange={(e) => setNewPresetKeyword(e.target.value)}
                      placeholder="Enter keyword"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-semibold mb-2 block text-sm">Points Amount</Label>
                    <Input
                      value={newPresetPoints}
                      onChange={(e) => setNewPresetPoints(e.target.value)}
                      type="number"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-semibold mb-2 block text-sm">Duration (Seconds)</Label>
                    <Input
                      value={newPresetDuration}
                      onChange={(e) => setNewPresetDuration(e.target.value)}
                      type="number"
                      placeholder="0"
                    />
                  </div>
                  <Button
                    variant="success"
                    className="w-full gap-2 py-5 text-sm font-semibold"
                    onClick={handleCreatePreset}
                    disabled={!newPresetName.trim()}
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
                          className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3 group hover:border-blue-500/30 transition-colors"
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleLoadPreset(preset)}
                          >
                            <p className="text-white font-semibold text-sm">{preset.name}</p>
                            <p className="text-slate-500 text-xs mt-0.5">
                              Keyword: {preset.keyword || "—"} · Points: {preset.points} · Duration: {preset.duration}s
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
