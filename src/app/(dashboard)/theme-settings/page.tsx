"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw, Save, Check } from "lucide-react";
import { useState, useMemo } from "react";

const presets = [
  { name: "Your Custom", colors: ["#64748b", "#3b82f6", "#8b5cf6"], custom: true },
  { name: "Neon", colors: ["#22c55e", "#3b82f6", "#a855f7"] },
  { name: "Volt Neon", colors: ["#06b6d4", "#22c55e", "#eab308"] },
  { name: "Cyber Pink", colors: ["#f43f5e", "#ec4899", "#a855f7"] },
  { name: "Data Stream", colors: ["#06b6d4", "#3b82f6", "#6366f1"] },
  { name: "Plasma Pink", colors: ["#f43f5e", "#ec4899", "#d946ef"] },
  { name: "Quantum Blue", colors: ["#3b82f6", "#6366f1", "#8b5cf6"] },
  { name: "Arc Reactor", colors: ["#8b5cf6", "#6366f1", "#a855f7"] },
  { name: "Ocean Depths", colors: ["#0ea5e9", "#06b6d4", "#14b8a6"] },
  { name: "Sunset Blaze", colors: ["#f97316", "#ef4444", "#ec4899"] },
  { name: "Golden Hour", colors: ["#f59e0b", "#d97706", "#b45309"] },
  { name: "Matrix Green", colors: ["#22c55e", "#16a34a", "#15803d"] },
  { name: "Royal Purple", colors: ["#a855f7", "#7c3aed", "#6d28d9"] },
  { name: "Ice Crystal", colors: ["#e0f2fe", "#7dd3fc", "#38bdf8"] },
  { name: "Blood Moon", colors: ["#ef4444", "#dc2626", "#991b1b"] },
  { name: "Aurora", colors: ["#34d399", "#60a5fa", "#c084fc"] },
  { name: "Midnight", colors: ["#1e293b", "#334155", "#475569"] },
  { name: "Cherry Blossom", colors: ["#fda4af", "#fb7185", "#f43f5e"] },
  { name: "Electric Lime", colors: ["#a3e635", "#84cc16", "#65a30d"] },
  { name: "Frost Bite", colors: ["#67e8f9", "#22d3ee", "#06b6d4"] },
  { name: "Magma Core", colors: ["#fb923c", "#f97316", "#ea580c"] },
  { name: "Emerald Night", colors: ["#10b981", "#059669", "#047857"] },
  { name: "Cosmic Dust", colors: ["#c084fc", "#a78bfa", "#818cf8"] },
  { name: "Amber Glow", colors: ["#fbbf24", "#f59e0b", "#d97706"] },
];

const ITEMS_PER_PAGE = 8;

const overlayOptions = [
  { value: "wager_bar_small", label: "Wager Bar (Small)" },
  { value: "wager_bar_normal", label: "Wager Bar (Normal)" },
  { value: "balance_small", label: "Balance (Small)" },
  { value: "balance_normal", label: "Balance (Normal)" },
  { value: "balance_large", label: "Balance (Large)" },
  { value: "bonushunt_large", label: "Bonushunt (Large)" },
  { value: "bonushunt_small", label: "Bonushunt (Small)" },
  { value: "bonushunt_horizontal", label: "Bonushunt (Horizontal)" },
  { value: "bonushunt_topworse", label: "Bonushunt (Top/Worse)" },
  { value: "bonushunt_guess", label: "Bonushunt (Guess)" },
  { value: "now_playing_normal", label: "Now Playing (Normal)" },
  { value: "now_playing_small", label: "Now Playing (Small)" },
  { value: "chat_small", label: "Chat (Small)" },
  { value: "chat_normal", label: "Chat (Normal)" },
  { value: "hotwords", label: "Hotwords" },
  { value: "slot_requests", label: "Slot Requests" },
  { value: "slot_battle_normal", label: "Slot Battle (Normal)" },
  { value: "tournament_normal", label: "Tournament (Normal)" },
  { value: "tournament_bracket", label: "Tournament (Bracket)" },
  { value: "duel_normal", label: "Duel (Normal)" },
  { value: "spinner", label: "Spinner" },
];

const defaultCustom = {
  bgColor: "#1a1f2e",
  bgOpacity: 45,
  iconColor: "#06b6d4",
  highlightColor: "#3b82f6",
  borderRadius: 10,
  borderEnabled: true,
  shadowEnabled: true,
};

export default function ThemeSettingsPage() {
  const [bgColor, setBgColor] = useState(defaultCustom.bgColor);
  const [bgOpacity, setBgOpacity] = useState(defaultCustom.bgOpacity);
  const [iconColor, setIconColor] = useState(defaultCustom.iconColor);
  const [highlightColor, setHighlightColor] = useState(defaultCustom.highlightColor);
  const [borderRadius, setBorderRadius] = useState(defaultCustom.borderRadius);
  const [borderEnabled, setBorderEnabled] = useState(defaultCustom.borderEnabled);
  const [shadowEnabled, setShadowEnabled] = useState(defaultCustom.shadowEnabled);
  const [selectedPreset, setSelectedPreset] = useState("Your Custom");
  const [page, setPage] = useState(0);
  const [previewOverlay, setPreviewOverlay] = useState("wager_bar_small");

  const totalPages = Math.ceil(presets.length / ITEMS_PER_PAGE);
  const pagedPresets = presets.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const applyPreset = (preset: typeof presets[number]) => {
    setSelectedPreset(preset.name);
    if (!preset.custom) {
      setIconColor(preset.colors[0]);
      setHighlightColor(preset.colors[1]);
    }
  };

  const handleReset = () => {
    setBgColor(defaultCustom.bgColor);
    setBgOpacity(defaultCustom.bgOpacity);
    setIconColor(defaultCustom.iconColor);
    setHighlightColor(defaultCustom.highlightColor);
    setBorderRadius(defaultCustom.borderRadius);
    setBorderEnabled(defaultCustom.borderEnabled);
    setShadowEnabled(defaultCustom.shadowEnabled);
    setSelectedPreset("Your Custom");
  };

  const previewStyle = useMemo(() => ({
    borderRadius: `${borderRadius}px`,
    background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
    border: borderEnabled ? `1px solid ${highlightColor}33` : "none",
    boxShadow: shadowEnabled ? `0 4px 24px rgba(0,0,0,0.5), 0 0 20px ${highlightColor}15` : "none",
  }), [borderRadius, borderEnabled, shadowEnabled, highlightColor]);

  return (
    <div>
      <PageHeader title="Theme Settings" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <Tabs defaultValue="presets">
          <TabsList className="bg-white/[0.04] border border-white/[0.06]">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3">
                  {pagedPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`flex items-center justify-between rounded-lg p-3 transition-all text-left ${
                        selectedPreset === preset.name
                          ? "bg-blue-500/10 border border-blue-500/30 ring-1 ring-blue-500/20"
                          : "bg-secondary border border-transparent hover:bg-white/[0.06]"
                      }`}
                    >
                      <div>
                        <div className="text-sm text-white font-medium flex items-center gap-1.5">
                          {preset.name}
                          {preset.custom && <span className="text-[10px] text-slate-500">Custom</span>}
                        </div>
                        <div className="flex gap-1 mt-1.5">
                          {preset.colors.map((c, i) => (
                            <div key={i} className="h-3 w-8 rounded-full" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      {selectedPreset === preset.name && (
                        <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 mt-6 text-sm text-slate-500">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    &larr; Back
                  </button>
                  <span>Page {page + 1}/{totalPages} ({presets.length})</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next &rarr;
                  </button>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button variant="destructive" className="gap-1" onClick={handleReset}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                  <Button className="gap-1">
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">Background</Label>
                  <div className="flex items-center gap-3">
                    <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-12 cursor-pointer" />
                    <Input type="range" min="0" max="100" value={bgOpacity} onChange={(e) => setBgOpacity(Number(e.target.value))} className="flex-1" />
                    <span className="text-sm text-slate-500 w-10">{bgOpacity}%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">Icon Color</Label>
                  <div className="flex items-center gap-3">
                    <Input type="color" value={iconColor} onChange={(e) => setIconColor(e.target.value)} className="h-10 w-12 cursor-pointer" />
                    <Input value={iconColor} onChange={(e) => setIconColor(e.target.value)} className="w-28 font-mono text-xs" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">Highlight / Badge</Label>
                  <div className="flex items-center gap-3">
                    <Input type="color" value={highlightColor} onChange={(e) => setHighlightColor(e.target.value)} className="h-10 w-12 cursor-pointer" />
                    <Input value={highlightColor} onChange={(e) => setHighlightColor(e.target.value)} className="w-28 font-mono text-xs" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">Border Radius</Label>
                  <div className="flex items-center gap-3">
                    <Input type="range" min="0" max="30" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="flex-1" />
                    <span className="text-sm text-slate-500 w-12">{borderRadius}px</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Border</Label>
                  <Switch checked={borderEnabled} onCheckedChange={setBorderEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Shadow</Label>
                  <Switch checked={shadowEnabled} onCheckedChange={setShadowEnabled} />
                </div>

                <div className="flex gap-2">
                  <Button variant="destructive" className="gap-1" onClick={handleReset}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                  <Button className="gap-1">
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Live Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-slate-500 uppercase font-bold">Theme Settings - Live Preview</h3>
            <Select value={previewOverlay} onValueChange={setPreviewOverlay}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {overlayOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className="rounded-lg p-8 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #080c14 0%, #0f1521 50%, #080c14 100%)",
              border: "1px solid rgba(255,255,255,0.04)",
              minHeight: "400px",
            }}
          >
            <div className="animate-fade-in-up">
              <PreviewRenderer
                overlay={previewOverlay}
                style={previewStyle}
                iconColor={iconColor}
                highlightColor={highlightColor}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Preview Renderer (matches real overlay designs) ── */

function PreviewRenderer({
  overlay,
  style,
  iconColor,
  highlightColor,
}: {
  overlay: string;
  style: React.CSSProperties;
  iconColor: string;
  highlightColor: string;
}) {
  const base = { ...style, minWidth: "280px" } as React.CSSProperties;

  /* ── Wager Bar Small ── */
  if (overlay === "wager_bar_small") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "380px", padding: "10px 14px" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-xs tracking-wide" style={{ color: "#ef4444" }}>WAGER: $0</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span style={{ color: "#94a3b8" }}>LEFT: <span className="text-white font-semibold">$0</span></span>
            <span className="font-semibold px-2 py-0.5 rounded text-[10px]" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>0.0%</span>
          </div>
        </div>
        <div className="h-1 rounded-full mb-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full" style={{ width: "0%", background: "linear-gradient(90deg, #ef4444, #f97316)" }} />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-[11px] tracking-wider px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>CASINONAME</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color: "#22c55e" }}>&#9654;</span>
            <span className="text-white text-xs font-medium">Sweet Bonanza</span>
            <span className="text-slate-500 text-[10px]">PRAGMATIC PLAY</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-xs font-semibold" style={{ color: "#ef4444" }}>$0</span>
          <div className="flex items-center gap-2 text-[11px]" style={{ color: "#64748b" }}>
            <span className="text-amber-400 font-semibold">0.0X</span>
            <span className="text-slate-700">|</span>
            <span>$0</span>
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400 font-semibold">0.0X</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Wager Bar Normal ── */
  if (overlay === "wager_bar_normal") {
    return (
      <div className="overflow-hidden rounded-xl" style={{ ...base, minWidth: "400px" }}>
        <div className="px-5 py-2.5 flex items-center justify-center" style={{ background: "linear-gradient(90deg, rgba(239,68,68,0.08), rgba(239,68,68,0.18), rgba(239,68,68,0.08))", borderBottom: "1px solid rgba(239,68,68,0.12)" }}>
          <span className="font-bold text-sm tracking-[0.15em]" style={{ background: "linear-gradient(90deg, #fca5a5, #ffffff, #fca5a5)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }}>PULSEFRAMELABS.COM</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <span className="font-bold text-sm px-3 py-1 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>$0 / $0</span>
              <span className="font-semibold text-sm px-2.5 py-1 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>0.0%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full" style={{ width: "0%", background: "linear-gradient(90deg, #ef4444, #f97316, #eab308)" }} />
            </div>
          </div>
          <div className="rounded-lg p-3 space-y-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium" style={{ color: "#64748b" }}>TOTAL</span>
              <span className="text-white font-semibold">$0</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "#64748b" }}>WEBSITE: <span className="font-semibold text-blue-400">CASINONAME</span></span>
              <span style={{ color: "#64748b" }}>LEFT: <span className="text-amber-400 font-semibold">$0</span></span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "#64748b" }}>START: <span className="text-emerald-400 font-semibold">$0</span></span>
              <span style={{ color: "#64748b" }}>WAGERED: <span className="text-red-400 font-semibold">$0</span></span>
            </div>
          </div>
          <div className="flex items-center justify-center pt-1">
            <span className="text-[9px] tracking-[0.12em] font-medium uppercase" style={{ color: "rgba(100,116,139,0.4)" }}>Powered by Pulseframelabs</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Balance Small ── */
  if (overlay === "balance_small") {
    return (
      <div className="overflow-hidden flex items-center gap-5" style={{ ...base, padding: "10px 16px", minWidth: "auto" }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>+</div>
          <span className="text-white font-bold text-sm">$0</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>&minus;</div>
          <span className="text-white font-bold text-sm">$0</span>
        </div>
      </div>
    );
  }

  /* ── Balance Normal ── */
  if (overlay === "balance_normal") {
    return (
      <div className="overflow-hidden space-y-2" style={{ ...base, padding: "12px 18px", minWidth: "160px" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>+</div>
          <span className="text-white font-bold text-base">$0</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>&minus;</div>
          <span className="text-white font-bold text-base">$0</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold" style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.25)" }}>&#8645;</div>
          <span className="text-white font-bold text-base">$0</span>
        </div>
      </div>
    );
  }

  /* ── Balance Large ── */
  if (overlay === "balance_large") {
    return (
      <div className="overflow-hidden flex items-center gap-6" style={{ ...base, padding: "14px 22px", minWidth: "auto" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-full text-base font-bold" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>+</div>
          <span className="text-white font-bold text-lg">$0</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-full text-base font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>&minus;</div>
          <span className="text-white font-bold text-lg">$0</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-full text-base font-bold" style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.25)" }}>&#8645;</div>
          <span className="text-white font-bold text-lg">$0</span>
        </div>
      </div>
    );
  }

  /* ── Bonushunt Large ── */
  if (overlay === "bonushunt_large") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "340px" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div>
              <span className="font-bold text-sm block" style={{ background: "linear-gradient(90deg, #ef4444, #f97316, #ef4444)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>%TITLE%</span>
              <span className="text-[10px] font-semibold text-slate-500">HUNT #000</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444" stroke="none"><rect x="2" y="6" width="8" height="12" rx="1"/><rect x="14" y="6" width="8" height="12" rx="1"/><circle cx="6" cy="10" r="1" fill="#0c1018"/><circle cx="18" cy="10" r="1" fill="#0c1018"/></svg>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>0/0</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          {[{ icon: "grid", v: "$0K" }, { icon: "play", v: "$0" }, { icon: "chart", v: "0X+" }, { icon: "x", v: "0X" }].map((s, i) => (
            <div key={i} className="flex flex-col items-center py-2.5 gap-1" style={{ background: "linear-gradient(180deg, rgba(15,21,33,0.8) 0%, rgba(12,16,24,0.9) 100%)" }}>
              <div style={{ color: "#ef4444" }}>
                {s.icon === "grid" && <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>}
                {s.icon === "play" && <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
                {s.icon === "chart" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                {s.icon === "x" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
              </div>
              <span className="text-white font-bold text-xs">{s.v}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 space-y-1.5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z"/></svg>
            <span className="text-slate-400 text-xs font-semibold">0.</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="none"><path d="M12 2C8 6 4 9.5 4 13a8 8 0 0016 0c0-3.5-4-7-8-11z"/></svg>
            <span className="text-slate-400 text-xs font-semibold">0.</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Bonushunt Small ── */
  if (overlay === "bonushunt_small") {
    return (
      <div className="overflow-hidden flex items-center" style={{ ...base, minWidth: "auto" }}>
        <div className="h-[52px] w-[52px] shrink-0 flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs" style={{ background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>%TITLE%</span>
            <span className="text-[10px] font-semibold text-slate-600">HUNT #000</span>
          </div>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#64748b" }}>Slots: 0/0</p>
        </div>
      </div>
    );
  }

  /* ── Bonushunt Horizontal ── */
  if (overlay === "bonushunt_horizontal") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "auto" }}>
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div>
              <span className="font-bold text-xs block" style={{ background: "linear-gradient(90deg, #ef4444, #f97316, #ef4444)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>%TITLE%</span>
              <span className="text-[9px] font-semibold text-slate-500">HUNT #000</span>
            </div>
          </div>
          <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="flex items-center gap-4">
            {[{ l: "Buy-in", v: "$0K" }, { l: "Start", v: "$0" }, { l: "Best", v: "0X+" }, { l: "Avg", v: "0X" }].map((s, i) => (
              <div key={i} className="text-center">
                <span className="text-[8px] uppercase tracking-wider text-slate-600 block">{s.l}</span>
                <span className="text-white font-bold text-xs">{s.v}</span>
              </div>
            ))}
          </div>
          <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>0/0</span>
        </div>
      </div>
    );
  }

  /* ── Bonushunt Top/Worse ── */
  if (overlay === "bonushunt_topworse") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "300px" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="font-bold text-sm" style={{ background: "linear-gradient(90deg, #ef4444, #f97316, #ef4444)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>%TITLE%</span>
          <span className="text-[10px] font-semibold text-slate-500">TOP / WORSE</span>
        </div>
        <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-2 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z"/></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Top Wins</span>
          </div>
          <div className="space-y-1">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center justify-between px-3 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-slate-500 text-[10px] font-semibold">#{n}</span>
                <span className="text-slate-600 text-[10px]">---</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 py-2.5">
          <div className="flex items-center gap-2 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="none"><path d="M12 2C8 6 4 9.5 4 13a8 8 0 0016 0c0-3.5-4-7-8-11z"/></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400/80">Worst</span>
          </div>
          <div className="space-y-1">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center justify-between px-3 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-slate-500 text-[10px] font-semibold">#{n}</span>
                <span className="text-slate-600 text-[10px]">---</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Bonushunt Guess ── */
  if (overlay === "bonushunt_guess") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "280px" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400/80">Guess Balance</span>
          </div>
          <span className="font-bold text-xs" style={{ background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>%TITLE%</span>
        </div>
        <div className="px-4 py-6 text-center">
          <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-1">Current Balance</p>
          <p className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>$0.00</p>
          <p className="text-[9px] text-slate-600 mt-2">Type !guess &lt;amount&gt; in chat</p>
        </div>
      </div>
    );
  }

  /* ── Now Playing Normal ── */
  if (overlay === "now_playing_normal") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "460px" }}>
        <div className="flex items-stretch">
          <div className="w-[110px] shrink-0 relative overflow-hidden">
            <div className="h-full w-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a73e833, #1a73e811)" }}>
              <span className="text-[9px] font-bold text-white/50 text-center px-2">Sweet Bonanza</span>
            </div>
            <div className="absolute inset-y-0 right-0 w-6" style={{ background: "linear-gradient(to right, transparent, #0c1018)" }} />
          </div>
          <div className="flex-1 flex items-stretch divide-x divide-white/[0.06]">
            <div className="flex-1 px-3.5 py-3.5 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px]" style={{ color: "#ef4444" }}>&#9654;</span>
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#94a3b8" }}>CURRENT GAME</span>
              </div>
              <p className="text-white font-bold text-xs leading-tight">Sweet Bonanza</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#64748b" }}>PRAGMATIC PLAY</p>
            </div>
            <div className="flex-1 px-3.5 py-3.5 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ background: "rgba(59,130,246,0.2)", color: "#3b82f6" }}>i</div>
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#3b82f6" }}>INFO</span>
              </div>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between"><span style={{ color: "#64748b" }}>POTENTIAL</span><span className="text-white font-bold">21100X</span></div>
                <div className="flex justify-between"><span style={{ color: "#64748b" }}>RTP</span><span className="text-white font-bold">96.5%</span></div>
                <div className="flex justify-between"><span style={{ color: "#64748b" }}>VOLATILITY</span><span className="text-white font-bold">MEDIUM</span></div>
              </div>
            </div>
            <div className="flex-1 px-3.5 py-3.5 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-[7px]" style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>&#9679;</div>
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#ef4444" }}>PERSONAL RECORD</span>
              </div>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between"><span style={{ color: "#64748b" }}>WIN</span><span className="text-white font-bold">0$</span></div>
                <div className="flex justify-between"><span style={{ color: "#64748b" }}>X</span><span className="text-white font-bold">0X</span></div>
                <div className="flex justify-between"><span style={{ color: "#64748b" }}>AVG-WIN</span><span className="text-white font-bold">0</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Now Playing Small ── */
  if (overlay === "now_playing_small") {
    return (
      <div className="overflow-hidden flex items-center" style={{ ...base, minWidth: "auto" }}>
        <div className="w-[56px] h-[56px] shrink-0 relative overflow-hidden">
          <div className="h-full w-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a73e833, #1a73e811)" }}>
            <span className="text-[8px] font-bold text-white/50 text-center px-1">Sweet Bonanza</span>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px]" style={{ color: "#ef4444" }}>&#9654;</span>
            <span className="text-white font-bold text-xs">Sweet Bonanza</span>
          </div>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#64748b" }}>PRAGMATIC PLAY</p>
        </div>
      </div>
    );
  }

  /* ── Chat Small ── */
  if (overlay === "chat_small") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "260px" }}>
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Chat</span>
        </div>
        <div className="px-3 py-3 space-y-2">
          <div className="flex gap-2 items-start"><span className="text-[10px] font-bold text-blue-400 shrink-0">Viewer1:</span><span className="text-[10px] text-slate-400">Hello chat!</span></div>
          <div className="flex gap-2 items-start"><span className="text-[10px] font-bold text-green-400 shrink-0">Mod:</span><span className="text-[10px] text-slate-400">Welcome!</span></div>
        </div>
      </div>
    );
  }

  /* ── Chat Normal ── */
  if (overlay === "chat_normal") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "320px" }}>
        <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
          <span className="text-xs font-bold text-white uppercase tracking-wider">Live Chat</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] text-slate-500 font-semibold">LIVE</span>
          </div>
        </div>
        <div className="px-4 py-3 space-y-3 min-h-[140px]">
          {[{ n: "Viewer1", c: "#3b82f6" }, { n: "Moderator", c: "#22c55e" }, { n: "Subscriber", c: "#a855f7" }].map((u) => (
            <div key={u.n} className="flex gap-2.5 items-start">
              <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${u.c}20` }}>
                <span className="text-[8px] font-bold" style={{ color: u.c }}>{u.n[0]}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold" style={{ color: u.c }}>{u.n}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{u.n === "Viewer1" ? "Hello chat!" : u.n === "Moderator" ? "Welcome everyone!" : "Let's go!"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Hotwords ── */
  if (overlay === "hotwords") {
    const colors = [
      { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.25)", text: "#ef4444" },
      { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.25)", text: "#10b981" },
      { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.25)", text: "#3b82f6" },
      { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.25)", text: "#f59e0b" },
      { bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.25)", text: "#8b5cf6" },
    ];
    return (
      <div className="overflow-hidden" style={{ ...base, padding: "16px 22px" }}>
        <div className="mb-3 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="font-bold text-sm tracking-widest" style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>HOT WORDS</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {["GG", "HYPE", "LET'S GO", "WIN", "CLUTCH"].map((w, i) => {
            const c = colors[i % colors.length];
            return <span key={w} className="px-3 py-1 rounded-full text-xs font-bold tracking-wide" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>{w}</span>;
          })}
        </div>
      </div>
    );
  }

  /* ── Slot Requests ── */
  if (overlay === "slot_requests") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "320px" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
            </div>
            <span className="font-bold text-sm tracking-wide" style={{ background: "linear-gradient(90deg, #ef4444, #f97316, #ef4444)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>!SR SLOT</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold" style={{ color: "#64748b" }}>Participants</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>0</span>
          </div>
        </div>
        <div className="px-4 py-3 min-h-[100px]" style={{ borderTop: "1px solid rgba(239,68,68,0.08)" }}>
          <div className="flex items-center justify-center h-[80px]">
            <span className="text-xs text-slate-600">Waiting for requests...</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Slot Battle Normal ── */
  if (overlay === "slot_battle_normal") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "320px" }}>
        <div className="px-5 pt-4 pb-2 text-center">
          <span className="font-black text-base tracking-wider" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>SLOT BATTLE</span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] font-bold text-slate-400">BONUS <span className="text-white">0/0</span></span>
            <span className="text-[10px] font-bold text-slate-400">START <span className="text-white">0$</span></span>
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              </div>
              <div><span className="text-white font-bold text-xs block">Slot</span><span className="text-[9px] text-slate-500">Sub</span><span className="text-[9px] text-slate-500 block">Provider</span></div>
            </div>
            <span className="text-slate-600 font-black text-sm shrink-0">VS</span>
            <div className="flex-1 rounded-lg px-3 py-2.5 flex items-center gap-2 justify-end" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.04), rgba(16,185,129,0.12))", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div className="text-right"><span className="text-white font-bold text-xs block">Slot</span><span className="text-[9px] text-slate-500">Sub</span><span className="text-[9px] text-slate-500 block">Provider</span></div>
              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 pb-3">
          {[{ l: "0/0", label: "# BONUS", r: "0/0" }, { l: "0$", label: "COST", r: "0$" }, { l: "0.00", label: "SCORE", r: "0.00", hl: true }].map((row, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3" style={{ borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.03)", background: row.hl ? "rgba(255,255,255,0.02)" : "transparent" }}>
              <span className={`text-xs font-bold ${row.hl ? "text-blue-400" : "text-white"}`}>{row.l}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{row.label}</span>
              <span className={`text-xs font-bold ${row.hl ? "text-green-400" : "text-white"}`}>{row.r}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-[8px] uppercase tracking-widest text-slate-600">SCORE = OVERALL PAYBACK / (BUY AMOUNT x COST)</span>
        </div>
      </div>
    );
  }

  /* ── Tournament Normal ── */
  if (overlay === "tournament_normal") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "310px" }}>
        <div className="px-5 pt-5 pb-3 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            <span className="font-black text-base tracking-wide" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>SLOT BATTLE</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">TOURNAMENT FINISHED</span>
        </div>
        <div className="px-5 pb-4">
          <div className="relative rounded-lg overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)", border: "1px solid rgba(239,68,68,0.25)", boxShadow: "0 0 20px rgba(239,68,68,0.1)" }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #78350f, #92400e)", border: "2px solid rgba(245,158,11,0.4)", boxShadow: "0 0 12px rgba(245,158,11,0.2)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
              </div>
              <div className="flex-1">
                <span className="text-white font-bold text-sm block">WINNER</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">HIGHEST X-FACTOR</span>
              </div>
              <div className="px-2.5 py-1 rounded-md text-xs font-black" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>0X</div>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-sm font-black tracking-wider" style={{ color: "#10b981" }}>WINNER</span>
        </div>
      </div>
    );
  }

  /* ── Tournament Bracket ── */
  if (overlay === "tournament_bracket") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "420px" }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            <span className="font-bold text-sm" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TOURNAMENT</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">8 Players &middot; 3 Rounds</span>
        </div>
        <div className="px-5 py-4 flex gap-6 overflow-x-auto">
          {[{ label: "Round 1", count: 4, pt: "" }, { label: "Semis", count: 2, pt: "pt-4" }, { label: "Final", count: 1, pt: "pt-10" }].map((round) => (
            <div key={round.label} className={`space-y-2 shrink-0 ${round.pt}`}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block mb-2">{round.label}</span>
              {Array.from({ length: round.count }).map((_, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="px-3 py-1.5 rounded-t text-[10px] font-semibold text-slate-400 w-28" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>---</div>
                  <div className="px-3 py-1.5 rounded-b text-[10px] font-semibold text-slate-400 w-28" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>---</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Duel Normal ── */
  if (overlay === "duel_normal") {
    return (
      <div className="overflow-hidden" style={{ ...base, minWidth: "360px" }}>
        <div className="px-5 pt-4 pb-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            <span className="font-black text-base tracking-wider" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s ease-in-out infinite" }}>DUEL</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">2 Players</span>
        </div>
        <div className="grid px-4 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500" style={{ gridTemplateColumns: "1fr 1.2fr 0.8fr 0.8fr 0.5fr", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span>Player</span><span>Game</span><span>Buy-In</span><span>Result</span><span className="text-center">#</span>
        </div>
        <div className="px-4 pb-3">
          {[{ n: "Player 1", g: "Sweet Bonanza", b: "100$", c: "#ef4444" }, { n: "Player 2", g: "Gates of Olympus", b: "100$", c: "#10b981" }].map((p, i) => (
            <div key={i} className="grid py-2 items-center" style={{ gridTemplateColumns: "1fr 1.2fr 0.8fr 0.8fr 0.5fr", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: `${p.c}20`, border: `1px solid ${p.c}33` }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={p.c} stroke="none"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
                </div>
                <span className="text-white font-semibold text-[10px]">{p.n}</span>
              </div>
              <span className="text-slate-400 text-[10px]">{p.g}</span>
              <span className="text-white text-[10px] font-semibold">{p.b}</span>
              <span className="text-slate-500 text-[10px]">---</span>
              <span className="text-amber-400 text-[10px] font-bold text-center">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-[8px] uppercase tracking-widest text-slate-600">!duel GameName to join</span>
        </div>
      </div>
    );
  }

  /* ── Spinner ── */
  if (overlay === "spinner") {
    const segments = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];
    const segAngle = 360 / segments.length;
    return (
      <div className="overflow-hidden flex items-center justify-center" style={{ ...base, minWidth: "200px", minHeight: "200px", background: "transparent", border: "none", boxShadow: "none" }}>
        <div className="relative">
          <div
            className="h-40 w-40 rounded-full"
            style={{
              background: `conic-gradient(${segments.map((c, i) => `${c} ${i * segAngle}deg ${(i + 1) * segAngle}deg`).join(", ")})`,
              boxShadow: "0 0 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-gray-900 flex items-center justify-center" style={{ border: "3px solid rgba(255,255,255,0.1)", boxShadow: "0 0 15px rgba(0,0,0,0.5)" }}>
              <span className="text-[10px] font-black text-white">SPIN</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="overflow-hidden text-xs" style={base}>
      <div className="px-4 py-6 text-center">
        <span className="text-slate-500 text-sm">Select an overlay to preview</span>
      </div>
    </div>
  );
}
