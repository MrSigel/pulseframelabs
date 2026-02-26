"use client";

import { PageHeader } from "@/components/page-header";
import { OverlayLink } from "@/components/overlay-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw, Save } from "lucide-react";
import { useState, useMemo } from "react";

export default function WagerPage() {
  const [casinoName, setCasinoName] = useState("Casinoname");
  const [headerText, setHeaderText] = useState("PULSEFRAMELABS.COM");
  const [bonusType, setBonusType] = useState("sticky");
  const [currency, setCurrency] = useState("usd");
  const [depositAmount, setDepositAmount] = useState("0");
  const [bonusAmount, setBonusAmount] = useState("0");
  const [wagerAmount, setWagerAmount] = useState("0");
  const [wageredAmount, setWageredAmount] = useState("0");

  const currencySymbol = currency === "usd" ? "$" : "\u20AC";
  const wager = parseFloat(wagerAmount) || 0;
  const wagered = parseFloat(wageredAmount) || 0;
  const deposit = parseFloat(depositAmount) || 0;
  const bonus = parseFloat(bonusAmount) || 0;
  const left = Math.max(0, wager - wagered);
  const pct = wager > 0 ? Math.min(100, (wagered / wager) * 100) : 0;
  const multiplier = deposit > 0 ? (wagered / deposit).toFixed(1) : "0.0";
  const start = deposit + bonus;

  const overlayBaseUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  }, []);

  return (
    <div>
      <PageHeader title="Wager" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wager Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-white">Wager Settings</CardTitle>
            <Button variant="destructive" size="sm" className="gap-1">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500 text-xs font-semibold mb-1.5">Casino Name</Label>
                <Input value={casinoName} onChange={(e) => setCasinoName(e.target.value)} />
              </div>
              <div>
                <Label className="text-slate-500 text-xs font-semibold mb-1.5">Header Text</Label>
                <Input value={headerText} onChange={(e) => setHeaderText(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500 text-xs font-semibold mb-1.5">Bonus Type</Label>
                <Select value={bonusType} onValueChange={setBonusType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sticky">Sticky/Non-Sticky</SelectItem>
                    <SelectItem value="sticky-only">Sticky</SelectItem>
                    <SelectItem value="non-sticky">Non-Sticky</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-500 text-xs font-semibold mb-1.5">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">$ - (US Dollar)</SelectItem>
                    <SelectItem value="eur">&euro; - (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500 text-xs font-semibold mb-1.5">Deposit Amount</Label>
                <div className="flex items-center gap-2">
                  <Input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} type="number" />
                  <span className="text-slate-500">{currencySymbol}</span>
                </div>
              </div>
              <div>
                <Label className="text-slate-500 text-xs font-semibold mb-1.5">Bonus Amount</Label>
                <div className="flex items-center gap-2">
                  <Input value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} type="number" />
                  <span className="text-slate-500">{currencySymbol}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500 text-xs font-semibold mb-1.5">Wager Amount</Label>
                <div className="flex items-center gap-2">
                  <Input value={wagerAmount} onChange={(e) => setWagerAmount(e.target.value)} type="number" />
                  <span className="text-slate-500">{currencySymbol}</span>
                </div>
              </div>
              <div>
                <Label className="text-slate-500 text-xs font-semibold mb-1.5">Wagered Amount</Label>
                <div className="flex items-center gap-2">
                  <Input value={wageredAmount} onChange={(e) => setWageredAmount(e.target.value)} type="number" />
                  <span className="text-slate-500">{currencySymbol}</span>
                </div>
              </div>
            </div>

            <Button className="w-full gap-2">
              <Save className="h-4 w-4" />
              Update
            </Button>
          </CardContent>
        </Card>

        {/* Overlay Preview */}
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="small">
              <TabsList className="bg-white/[0.04] border border-white/[0.06]">
                <TabsTrigger value="small">Overlay Small</TabsTrigger>
                <TabsTrigger value="normal">Overlay Normal</TabsTrigger>
              </TabsList>

              {/* Overlay Small */}
              <TabsContent value="small" className="mt-4 space-y-4">
                <OverlayLink url={`${overlayBaseUrl}/overlay/wager_bar_small`} />

                <div className="rounded-xl p-6 flex items-center justify-center" style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.05) 0%, transparent 70%)" }}>
                  <div
                    className="rounded-lg overflow-hidden animate-fade-in-up"
                    style={{
                      background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
                      minWidth: "380px",
                      padding: "10px 14px",
                    }}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs tracking-wide" style={{ color: "#ef4444" }}>
                        WAGER: {currencySymbol}{wager.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span style={{ color: "#94a3b8" }}>
                          LEFT: <span className="text-white font-semibold">{currencySymbol}{left.toLocaleString()}</span>
                        </span>
                        <span
                          className="font-semibold px-2 py-0.5 rounded text-[10px]"
                          style={{
                            background: pct > 50 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                            color: pct > 50 ? "#10b981" : "#ef4444",
                          }}
                        >
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 rounded-full mb-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full animate-progress-shimmer"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, #ef4444, #f97316, #ef4444, #f97316)",
                          transition: "width 1s ease-in-out",
                        }}
                      />
                    </div>

                    {/* Casino + game */}
                    <div className="flex items-center gap-3">
                      <span
                        className="font-bold text-[11px] tracking-wider px-2 py-0.5 rounded"
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "#ef4444",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        {casinoName.toUpperCase()}
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px]" style={{ color: "#22c55e" }}>&#9654;</span>
                          <div className="overflow-hidden flex-1">
                            <div className="animate-carousel whitespace-nowrap">
                              <span className="text-white text-xs font-medium mr-8">Sweet Bonanza</span>
                              <span className="text-slate-500 text-[10px] mr-8">PRAGMATIC PLAY</span>
                              <span className="text-white text-xs font-medium mr-8">Sweet Bonanza</span>
                              <span className="text-slate-500 text-[10px] mr-8">PRAGMATIC PLAY</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-xs font-semibold" style={{ color: "#ef4444" }}>
                        {currencySymbol}{bonus.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2 text-[11px]" style={{ color: "#64748b" }}>
                        <span className="text-amber-400 font-semibold">{multiplier}X</span>
                        <span className="text-slate-700">|</span>
                        <span>{currencySymbol}{wagered.toLocaleString()}</span>
                        <span className="text-slate-700">|</span>
                        <span className="text-cyan-400 font-semibold">{multiplier}X</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Overlay Normal */}
              <TabsContent value="normal" className="mt-4 space-y-4">
                <OverlayLink url={`${overlayBaseUrl}/overlay/wager_bar_normal`} />

                <div className="rounded-xl p-6 flex items-center justify-center" style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.05) 0%, transparent 70%)" }}>
                  <div
                    className="rounded-xl overflow-hidden animate-fade-in-up"
                    style={{
                      background: "linear-gradient(180deg, #0c1018 0%, #111827 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.15)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                      minWidth: "380px",
                    }}
                  >
                    {/* Header */}
                    <div
                      className="px-5 py-2.5 flex items-center justify-center"
                      style={{
                        background: "linear-gradient(90deg, rgba(239,68,68,0.08), rgba(239,68,68,0.18), rgba(239,68,68,0.08))",
                        borderBottom: "1px solid rgba(239,68,68,0.12)",
                      }}
                    >
                      <span
                        className="font-bold text-sm tracking-[0.15em]"
                        style={{
                          background: "linear-gradient(90deg, #fca5a5, #ffffff, #fca5a5)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 3s linear infinite",
                        }}
                      >
                        {headerText.toUpperCase()}
                      </span>
                    </div>

                    <div className="px-5 py-4 space-y-3">
                      {/* Wager progress */}
                      <div>
                        <div className="flex items-center justify-center gap-3 mb-2.5">
                          <span
                            className="font-bold text-sm px-3 py-1 rounded"
                            style={{
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#ef4444",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                            }}
                          >
                            {currencySymbol}{wagered.toLocaleString()} / {currencySymbol}{wager.toLocaleString()}
                          </span>
                          <span
                            className="font-semibold text-sm px-2.5 py-1 rounded"
                            style={{
                              background: pct > 50 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                              color: pct > 50 ? "#10b981" : "#ef4444",
                            }}
                          >
                            {pct.toFixed(1)}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div
                            className="h-full rounded-full relative"
                            style={{
                              width: `${pct}%`,
                              background: "linear-gradient(90deg, #ef4444, #f97316, #eab308)",
                              transition: "width 1.5s ease-in-out",
                            }}
                          >
                            <div
                              className="absolute inset-0 rounded-full animate-progress-shimmer"
                              style={{
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                                backgroundSize: "200% 100%",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div
                        className="rounded-lg p-3 space-y-1.5"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium" style={{ color: "#64748b" }}>TOTAL</span>
                          <span className="text-white font-semibold">{currencySymbol}{wager.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: "#64748b" }}>
                            WEBSITE: <span className="font-semibold text-blue-400">{casinoName.toUpperCase()}</span>
                          </span>
                          <span style={{ color: "#64748b" }}>
                            LEFT: <span className="text-amber-400 font-semibold">{currencySymbol}{left.toLocaleString()}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: "#64748b" }}>
                            START: <span className="text-emerald-400 font-semibold">{currencySymbol}{start.toLocaleString()}</span>
                          </span>
                          <span style={{ color: "#64748b" }}>
                            WAGERED: <span className="text-red-400 font-semibold">{currencySymbol}{wagered.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-center pt-1">
                        <span className="text-[9px] tracking-[0.12em] font-medium uppercase" style={{ color: "rgba(100,116,139,0.4)" }}>
                          Powered by Pulseframelabs
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
