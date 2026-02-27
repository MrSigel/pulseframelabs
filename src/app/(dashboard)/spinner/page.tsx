"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OverlayLink } from "@/components/overlay-link";
import { spinner as spinnerDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { SpinnerPrize } from "@/lib/supabase/types";
import { Plus, Shuffle, Save, Play, Trash2, Monitor, X, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

interface PrizeRow {
  id: number;
  prize: string;
  color: string;
}

const vibrantPalette = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#10b981",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#f43f5e", "#14b8a6", "#0ea5e9", "#d946ef",
];

function PokerChip({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className="animate-spin-chip">
      {/* Outer ring */}
      <circle cx="24" cy="24" r="23" fill="#0a0f1a" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      {/* Edge notches */}
      <circle cx="24" cy="24" r="20.5" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="3.5" strokeDasharray="5.5 7.6" strokeLinecap="round" />
      {/* Inner dark ring */}
      <circle cx="24" cy="24" r="17.5" fill="#0c1220" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      {/* Decorative inner ring */}
      <circle cx="24" cy="24" r="13" fill="none" stroke="rgba(239,68,68,0.35)" strokeWidth="0.8" strokeDasharray="3 3" />
      {/* Inner circle */}
      <circle cx="24" cy="24" r="10" fill="linear-gradient(135deg,#0a0f1a,#151d30)" stroke="rgba(239,68,68,0.3)" strokeWidth="0.8" />
      <circle cx="24" cy="24" r="10" fill="#0d1322" />
      {/* Diamond shape */}
      <path d="M24 16 L30 24 L24 32 L18 24 Z" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.5)" strokeWidth="0.6" />
      {/* Center dot */}
      <circle cx="24" cy="24" r="2.5" fill="#ef4444" opacity="0.7" />
      <circle cx="24" cy="24" r="1.2" fill="#fff" opacity="0.6" />
      {/* Subtle shine */}
      <ellipse cx="20" cy="18" rx="5" ry="3" fill="rgba(255,255,255,0.04)" transform="rotate(-30 20 18)" />
    </svg>
  );
}

export default function SpinnerPage() {
  const [prizes, setPrizes] = useState<PrizeRow[]>([
    { id: 1, prize: "", color: "#f43f5e" },
    { id: 2, prize: "", color: "#3b82f6" },
  ]);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const nextId = useRef(3);

  const { data: dbPrizes, refetch: refetchPrizes } = useDbQuery<SpinnerPrize[]>(
    () => spinnerDb.prizes.list(),
    [],
  );

  useEffect(() => {
    if (dbPrizes && dbPrizes.length > 0) {
      setPrizes(dbPrizes.map((p, i) => ({ id: i + 1, prize: p.prize, color: p.color })));
    }
  }, [dbPrizes]);

  const activePrizes = prizes.filter((p) => p.prize.trim() !== "");

  const overlayUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const names = activePrizes.map((p) => p.prize).join(",");
    const cols = activePrizes.map((p) => p.color).join(",");
    return `${window.location.origin}/overlay/spinner?prizes=${encodeURIComponent(names)}&colors=${encodeURIComponent(cols)}`;
  }, [activePrizes]);

  async function handleAddPrize() {
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
    const color = colors[prizes.length % colors.length];
    const newPrize = { id: prizes.length + 1, prize: `Prize ${prizes.length + 1}`, color };
    setPrizes([...prizes, newPrize]);
    try {
      await spinnerDb.prizes.create({ prize: newPrize.prize, color, position: prizes.length });
      await refetchPrizes();
    } catch (err) {
      console.error("Failed to add prize:", err);
    }
  }

  async function handleRemovePrize(index: number) {
    if (prizes.length <= 2) return;
    setPrizes(prizes.filter((_, i) => i !== index));
    if (dbPrizes && dbPrizes[index]) {
      try {
        await spinnerDb.prizes.remove(dbPrizes[index].id);
        await refetchPrizes();
      } catch (err) {
        console.error("Failed to remove prize:", err);
      }
    }
  }

  const randomizeColors = () => {
    const shuffled = [...vibrantPalette].sort(() => Math.random() - 0.5);
    setPrizes(prizes.map((p, i) => ({ ...p, color: shuffled[i % shuffled.length] })));
  };

  const displayPrizes = activePrizes.length >= 2 ? activePrizes : prizes;
  const wheelSize = 260;
  const wheelCenter = wheelSize / 2;

  const conicStops = displayPrizes
    .map((p, i) => {
      const start = (i / displayPrizes.length) * 100;
      const end = ((i + 1) / displayPrizes.length) * 100;
      return `${p.color} ${start}% ${end}%`;
    })
    .join(", ");

  const segmentLines = displayPrizes.map((_, i) => {
    const angle = (360 / displayPrizes.length) * i - 90;
    const rad = (angle * Math.PI) / 180;
    const r = wheelCenter - 2;
    const x2 = wheelCenter + Math.cos(rad) * r;
    const y2 = wheelCenter + Math.sin(rad) * r;
    return { x2, y2 };
  });

  const spinWheel = useCallback(() => {
    if (spinning || activePrizes.length < 2) return;
    setSpinning(true);
    setWinner(null);
    const extra = 2000 + Math.random() * 2000;
    const newRotation = rotation + extra;
    setRotation(newRotation);
    setTimeout(async () => {
      const normalizedAngle = newRotation % 360;
      const segA = 360 / activePrizes.length;
      const pointerAngle = (360 - normalizedAngle + 90) % 360;
      const winnerIdx = Math.floor(pointerAngle / segA) % activePrizes.length;
      const winnerName = activePrizes[winnerIdx].prize;
      setWinner(winnerName);
      setSpinning(false);
      try { await spinnerDb.history.create({ winner: winnerName }); } catch {}
    }, 4500);
  }, [spinning, rotation, activePrizes]);

  return (
    <div>
      <PageHeader
        title="Spinner"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="success" className="gap-2" onClick={() => setOverlayOpen(true)}>
              <Monitor className="h-4 w-4" />
              Spinner Overlay
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prize List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-white">Prize List</CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleAddPrize} className="gap-1" size="sm">
                  <Plus className="h-3.5 w-3.5" />
                  Add Row
                </Button>
                <Button variant="accent" className="gap-1" size="sm" onClick={randomizeColors}>
                  <Shuffle className="h-3.5 w-3.5" />
                  Random Colors
                </Button>
                <Button className="gap-1" size="sm">
                  <Save className="h-3.5 w-3.5" />
                  Save Prizes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[40px_1fr_200px_80px] gap-3 mb-3 text-xs text-slate-500 font-semibold uppercase">
                <span>#</span>
                <span>Prize</span>
                <span>Color</span>
                <span>Actions</span>
              </div>
              {prizes.map((prize, idx) => (
                <div key={prize.id} className="grid grid-cols-[40px_1fr_200px_80px] gap-3 items-center mb-3">
                  <span className="text-sm text-slate-500 font-bold">{idx + 1}</span>
                  <Input
                    placeholder="Enter prize"
                    value={prize.prize}
                    onChange={(e) => {
                      const updated = [...prizes];
                      updated[idx] = { ...updated[idx], prize: e.target.value };
                      setPrizes(updated);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={prize.color}
                      onChange={(e) => {
                        const updated = [...prizes];
                        updated[idx] = { ...updated[idx], color: e.target.value };
                        setPrizes(updated);
                      }}
                      className="h-10 w-14 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 h-8 rounded" style={{ background: prize.color }} />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemovePrize(idx)}
                    disabled={prizes.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Spinner Preview + Actions */}
        <div className="space-y-6">
          {/* Wheel Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white">Wheel Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative" style={{ width: wheelSize + 20, height: wheelSize + 20 }}>
                {/* Pointer */}
                <div
                  className="absolute z-20"
                  style={{
                    top: -4,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div style={{
                    width: 0,
                    height: 0,
                    borderLeft: "11px solid transparent",
                    borderRight: "11px solid transparent",
                    borderTop: "18px solid #ef4444",
                    filter: "drop-shadow(0 2px 8px rgba(239,68,68,0.6))",
                  }} />
                </div>

                {/* Outer decorative ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "conic-gradient(from 0deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.06) 100%)",
                    border: "2px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.3)",
                  }}
                />

                {/* Tick marks ring */}
                <svg
                  className="absolute inset-0"
                  width={wheelSize + 20}
                  height={wheelSize + 20}
                  style={{ zIndex: 1 }}
                >
                  {Array.from({ length: 40 }).map((_, i) => {
                    const a = (360 / 40) * i - 90;
                    const rad = (a * Math.PI) / 180;
                    const outerR = (wheelSize + 20) / 2 - 2;
                    const innerR = (wheelSize + 20) / 2 - 8;
                    const cx = (wheelSize + 20) / 2;
                    const cy = (wheelSize + 20) / 2;
                    return (
                      <line
                        key={i}
                        x1={cx + Math.cos(rad) * innerR}
                        y1={cy + Math.sin(rad) * innerR}
                        x2={cx + Math.cos(rad) * outerR}
                        y2={cy + Math.sin(rad) * outerR}
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth={i % 5 === 0 ? "1.5" : "0.5"}
                      />
                    );
                  })}
                </svg>

                {/* Wheel */}
                <div
                  className="absolute rounded-full overflow-hidden"
                  style={{
                    top: 10,
                    left: 10,
                    width: wheelSize,
                    height: wheelSize,
                    background: `conic-gradient(${conicStops})`,
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                    boxShadow: "0 0 25px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.25)",
                    border: "2px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {/* Segment divider lines */}
                  <svg
                    className="absolute inset-0"
                    width={wheelSize}
                    height={wheelSize}
                    style={{ zIndex: 2 }}
                  >
                    {segmentLines.map((line, i) => (
                      <line
                        key={i}
                        x1={wheelCenter}
                        y1={wheelCenter}
                        x2={line.x2}
                        y2={line.y2}
                        stroke="rgba(0,0,0,0.3)"
                        strokeWidth="1.5"
                      />
                    ))}
                    {segmentLines.map((line, i) => (
                      <line
                        key={`w${i}`}
                        x1={wheelCenter}
                        y1={wheelCenter}
                        x2={line.x2}
                        y2={line.y2}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="0.5"
                      />
                    ))}
                  </svg>

                  {/* Prize labels */}
                  {displayPrizes.map((p, i) => {
                    const segAngle = 360 / displayPrizes.length;
                    const angle = segAngle * i + segAngle / 2 - 90;
                    return (
                      <div
                        key={i}
                        className="absolute"
                        style={{
                          top: "50%",
                          left: "50%",
                          width: wheelCenter - 16,
                          transform: `rotate(${angle}deg) translateX(24%)`,
                          transformOrigin: "0 0",
                          zIndex: 3,
                        }}
                      >
                        <span
                          className="text-[10px] font-bold block truncate"
                          style={{
                            color: "#fff",
                            textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)",
                            maxWidth: wheelCenter - 50,
                          }}
                        >
                          {p.prize || "..."}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Center poker chip */}
                <div
                  className="absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                    filter: "drop-shadow(0 0 12px rgba(239,68,68,0.3))",
                  }}
                >
                  <PokerChip size={52} />
                </div>
              </div>

              {/* Winner */}
              {winner && (
                <div
                  className="animate-fade-in-up rounded-lg px-4 py-2 text-center w-full"
                  style={{
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Winner</p>
                  <p className="text-green-400 font-bold text-base">{winner}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spin Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                variant="success"
                className="w-full gap-2 py-6 text-lg"
                onClick={spinWheel}
                disabled={spinning || activePrizes.length < 2}
              >
                <Play className="h-5 w-5" />
                {spinning ? "Spinning..." : "Spin The Wheel"}
              </Button>
              {activePrizes.length < 2 && (
                <p className="text-xs text-amber-400/70 text-center mt-2">
                  Enter at least 2 prizes to spin the wheel.
                </p>
              )}
              {!spinning && activePrizes.length >= 2 && (
                <p className="text-sm text-slate-500 text-center mt-3">
                  Click the button to spin the wheel for a winner.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ====== Spinner Overlay Modal ====== */}
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
              <h2 className="text-white font-bold text-lg">Spinner Overlay</h2>
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
              <OverlayLink url={overlayUrl} />

              <div>
                <Label className="text-sm font-semibold text-slate-400 mb-2 block">Preview</Label>
                <div
                  className="rounded-lg p-6 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #080c14 0%, #0f1521 50%, #080c14 100%)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    minHeight: "220px",
                  }}
                >
                  <div className="animate-fade-in-up">
                    <div className="relative" style={{ width: 200, height: 200 }}>
                      {/* Pointer */}
                      <div
                        className="absolute z-20"
                        style={{
                          top: -2,
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        <div style={{
                          width: 0,
                          height: 0,
                          borderLeft: "8px solid transparent",
                          borderRight: "8px solid transparent",
                          borderTop: "14px solid #ef4444",
                          filter: "drop-shadow(0 2px 6px rgba(239,68,68,0.5))",
                        }} />
                      </div>

                      {/* Outer ring */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "conic-gradient(from 0deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.05) 100%)",
                          border: "1.5px solid rgba(255,255,255,0.06)",
                          boxShadow: "0 0 30px rgba(0,0,0,0.5)",
                        }}
                      />

                      {/* Tick marks */}
                      <svg className="absolute inset-0" width={200} height={200} style={{ zIndex: 1 }}>
                        {Array.from({ length: 32 }).map((_, i) => {
                          const a = (360 / 32) * i - 90;
                          const rad = (a * Math.PI) / 180;
                          return (
                            <line
                              key={i}
                              x1={100 + Math.cos(rad) * 93}
                              y1={100 + Math.sin(rad) * 93}
                              x2={100 + Math.cos(rad) * 98}
                              y2={100 + Math.sin(rad) * 98}
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth={i % 4 === 0 ? "1.2" : "0.4"}
                            />
                          );
                        })}
                      </svg>

                      {/* Wheel */}
                      <div
                        className="absolute rounded-full overflow-hidden"
                        style={{
                          top: 8,
                          left: 8,
                          width: 184,
                          height: 184,
                          background: `conic-gradient(${conicStops})`,
                          boxShadow: "0 0 20px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.25)",
                          border: "1.5px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {/* Segment lines */}
                        <svg className="absolute inset-0" width={184} height={184} style={{ zIndex: 2 }}>
                          {displayPrizes.map((_, i) => {
                            const a = (360 / displayPrizes.length) * i - 90;
                            const rad = (a * Math.PI) / 180;
                            return (
                              <line
                                key={i}
                                x1={92}
                                y1={92}
                                x2={92 + Math.cos(rad) * 90}
                                y2={92 + Math.sin(rad) * 90}
                                stroke="rgba(0,0,0,0.3)"
                                strokeWidth="1"
                              />
                            );
                          })}
                        </svg>

                        {displayPrizes.map((p, i) => {
                          const segA = 360 / displayPrizes.length;
                          const angle = segA * i + segA / 2 - 90;
                          return (
                            <div
                              key={i}
                              className="absolute"
                              style={{
                                top: "50%",
                                left: "50%",
                                width: 68,
                                transform: `rotate(${angle}deg) translateX(18%)`,
                                transformOrigin: "0 0",
                                zIndex: 3,
                              }}
                            >
                              <span
                                className="text-[8px] font-bold block truncate"
                                style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.9)", maxWidth: 52 }}
                              >
                                {p.prize || "..."}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Center poker chip */}
                      <div
                        className="absolute"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 10,
                          filter: "drop-shadow(0 0 8px rgba(239,68,68,0.25))",
                        }}
                      >
                        <PokerChip size={40} />
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
    </div>
  );
}
