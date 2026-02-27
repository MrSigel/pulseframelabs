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
import { RotateCcw, RefreshCw, Settings2, Loader2, Save } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { balanceProfiles } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { BalanceProfile } from "@/lib/supabase/types";

const currencies = [
  { value: "usd", symbol: "$", label: "US Dollar (USD)" },
  { value: "eur", symbol: "\u20AC", label: "Euro (EUR)" },
  { value: "gbp", symbol: "\u00A3", label: "British Pound (GBP)" },
  { value: "jpy", symbol: "\u00A5", label: "Japanese Yen (JPY)" },
  { value: "cny", symbol: "\u00A5", label: "Chinese Yuan (CNY)" },
  { value: "chf", symbol: "CHF", label: "Swiss Franc (CHF)" },
  { value: "cad", symbol: "CA$", label: "Canadian Dollar (CAD)" },
  { value: "aud", symbol: "A$", label: "Australian Dollar (AUD)" },
  { value: "nzd", symbol: "NZ$", label: "New Zealand Dollar (NZD)" },
  { value: "sek", symbol: "kr", label: "Swedish Krona (SEK)" },
  { value: "nok", symbol: "kr", label: "Norwegian Krone (NOK)" },
  { value: "dkk", symbol: "kr", label: "Danish Krone (DKK)" },
  { value: "pln", symbol: "z\u0142", label: "Polish Zloty (PLN)" },
  { value: "czk", symbol: "K\u010D", label: "Czech Koruna (CZK)" },
  { value: "huf", symbol: "Ft", label: "Hungarian Forint (HUF)" },
  { value: "ron", symbol: "lei", label: "Romanian Leu (RON)" },
  { value: "bgn", symbol: "\u043B\u0432", label: "Bulgarian Lev (BGN)" },
  { value: "hrk", symbol: "kn", label: "Croatian Kuna (HRK)" },
  { value: "rub", symbol: "\u20BD", label: "Russian Ruble (RUB)" },
  { value: "try", symbol: "\u20BA", label: "Turkish Lira (TRY)" },
  { value: "brl", symbol: "R$", label: "Brazilian Real (BRL)" },
  { value: "mxn", symbol: "MX$", label: "Mexican Peso (MXN)" },
  { value: "inr", symbol: "\u20B9", label: "Indian Rupee (INR)" },
  { value: "krw", symbol: "\u20A9", label: "South Korean Won (KRW)" },
  { value: "zar", symbol: "R", label: "South African Rand (ZAR)" },
  { value: "sgd", symbol: "S$", label: "Singapore Dollar (SGD)" },
  { value: "hkd", symbol: "HK$", label: "Hong Kong Dollar (HKD)" },
  { value: "thb", symbol: "\u0E3F", label: "Thai Baht (THB)" },
  { value: "idr", symbol: "Rp", label: "Indonesian Rupiah (IDR)" },
  { value: "php", symbol: "\u20B1", label: "Philippine Peso (PHP)" },
  { value: "myr", symbol: "RM", label: "Malaysian Ringgit (MYR)" },
  { value: "aed", symbol: "AED", label: "UAE Dirham (AED)" },
  { value: "sar", symbol: "SAR", label: "Saudi Riyal (SAR)" },
  { value: "ils", symbol: "\u20AA", label: "Israeli Shekel (ILS)" },
  { value: "btc", symbol: "\u20BF", label: "Bitcoin (BTC)" },
  { value: "eth", symbol: "\u039E", label: "Ethereum (ETH)" },
];

export default function DepositWithdrawalsPage() {
  const [currency, setCurrency] = useState("usd");
  const [deposits, setDeposits] = useState("0");
  const [depositsAdd, setDepositsAdd] = useState("0");
  const [withdrawals, setWithdrawals] = useState("0");
  const [withdrawalsAdd, setWithdrawalsAdd] = useState("0");
  const [leftover, setLeftover] = useState("0");
  const [leftoverAdd, setLeftoverAdd] = useState("0");
  const [saving, setSaving] = useState(false);
  const { data: profile, refetch } = useDbQuery<BalanceProfile | null>(
    () => balanceProfiles.get(),
    [],
  );

  useEffect(() => {
    if (profile) {
      setCurrency(profile.currency || "USD");
      setDeposits(String(profile.deposits || 0));
      setDepositsAdd(String(profile.deposits_add || 0));
      setWithdrawals(String(profile.withdrawals || 0));
      setWithdrawalsAdd(String(profile.withdrawals_add || 0));
      setLeftover(String(profile.leftover || 0));
      setLeftoverAdd(String(profile.leftover_add || 0));
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    try {
      await balanceProfiles.update({
        currency,
        deposits: parseFloat(deposits) || 0,
        deposits_add: parseFloat(depositsAdd) || 0,
        withdrawals: parseFloat(withdrawals) || 0,
        withdrawals_add: parseFloat(withdrawalsAdd) || 0,
        leftover: parseFloat(leftover) || 0,
        leftover_add: parseFloat(leftoverAdd) || 0,
      });
      await refetch();
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    try {
      await balanceProfiles.update({
        deposits: 0, deposits_add: 0, withdrawals: 0, withdrawals_add: 0,
        leftover: 0, leftover_add: 0,
      });
      await refetch();
    } catch (err) {
      console.error("Failed to reset:", err);
    }
    setDeposits("0"); setDepositsAdd("0");
    setWithdrawals("0"); setWithdrawalsAdd("0");
    setLeftover("0"); setLeftoverAdd("0");
  }

  const currencyObj = currencies.find((c) => c.value === currency) || currencies[0];
  const currencySymbol = currencyObj.symbol;
  const depositTotal = (parseFloat(deposits) || 0) + (parseFloat(depositsAdd) || 0);
  const withdrawalTotal = (parseFloat(withdrawals) || 0) + (parseFloat(withdrawalsAdd) || 0);
  const leftoverTotal = (parseFloat(leftover) || 0) + (parseFloat(leftoverAdd) || 0);

  const overlayBaseUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  }, []);

  return (
    <div>
      <PageHeader
        title="Deposit & Withdrawals"
        actions={
          <Button variant="success" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Manage Profiles
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white">Balance Management</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Update your balance profiles</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deposits */}
            <div>
              <Label className="text-white font-semibold mb-3 block">Deposits</Label>
              <div className="flex items-center gap-2">
                <Input value={deposits} onChange={(e) => setDeposits(e.target.value)} type="number" className="flex-1" />
                <Button size="sm" variant="secondary" className="shrink-0">{currencySymbol}</Button>
                <span className="text-slate-500">+</span>
                <Input value={depositsAdd} onChange={(e) => setDepositsAdd(e.target.value)} type="number" className="flex-1" />
                <Button size="sm" variant="secondary" className="shrink-0">{currencySymbol}</Button>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-28 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.symbol} - {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="icon" className="shrink-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Withdrawals */}
            <div>
              <Label className="text-white font-semibold mb-3 block">Withdrawals</Label>
              <div className="flex items-center gap-2">
                <Input value={withdrawals} onChange={(e) => setWithdrawals(e.target.value)} type="number" className="flex-1" />
                <Button size="sm" variant="secondary" className="shrink-0">{currencySymbol}</Button>
                <span className="text-slate-500">+</span>
                <Input value={withdrawalsAdd} onChange={(e) => setWithdrawalsAdd(e.target.value)} type="number" className="flex-1" />
                <Button size="sm" variant="secondary" className="shrink-0">{currencySymbol}</Button>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-28 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.symbol} - {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="icon" className="shrink-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* LeftOver */}
            <div>
              <Label className="text-white font-semibold mb-3 block">LeftOver</Label>
              <div className="flex items-center gap-2">
                <Input value={leftover} onChange={(e) => setLeftover(e.target.value)} type="number" className="flex-1" />
                <Button size="sm" variant="secondary" className="shrink-0">{currencySymbol}</Button>
                <span className="text-slate-500">+</span>
                <Input value={leftoverAdd} onChange={(e) => setLeftoverAdd(e.target.value)} type="number" className="flex-1" />
                <Button size="sm" variant="secondary" className="shrink-0">{currencySymbol}</Button>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-28 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.symbol} - {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="icon" className="shrink-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Update Profile"}
              </Button>
              <Button variant="destructive" className="gap-2" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Reset Current Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Overlays */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white">Overlays</CardTitle>
            <p className="text-sm text-slate-500">Preview and copy your overlay links</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="small">
              <TabsList className="bg-white/[0.04] border border-white/[0.06]">
                <TabsTrigger value="small">Small</TabsTrigger>
                <TabsTrigger value="normal">Normal</TabsTrigger>
                <TabsTrigger value="large">Large</TabsTrigger>
              </TabsList>

              {/* Small */}
              <TabsContent value="small" className="mt-4 space-y-4">
                <OverlayLink url={`${overlayBaseUrl}/overlay/balance_small`} />

                <div className="rounded-xl p-6 flex items-center justify-center" style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.05) 0%, transparent 70%)" }}>
                  <div
                    className="rounded-lg overflow-hidden flex items-center gap-5 animate-fade-in-up"
                    style={{
                      background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
                      padding: "10px 16px",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold"
                        style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.25)" }}
                      >
                        +
                      </div>
                      <span className="text-white font-bold text-sm">{currencySymbol}{depositTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold"
                        style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
                      >
                        &minus;
                      </div>
                      <span className="text-white font-bold text-sm">{currencySymbol}{withdrawalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Normal */}
              <TabsContent value="normal" className="mt-4 space-y-4">
                <OverlayLink url={`${overlayBaseUrl}/overlay/balance_normal`} />

                <div className="rounded-xl p-6 flex items-center justify-center" style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.05) 0%, transparent 70%)" }}>
                  <div
                    className="rounded-lg overflow-hidden space-y-2 animate-fade-in-up"
                    style={{
                      background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
                      padding: "12px 18px",
                      minWidth: "160px",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold"
                        style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.25)" }}
                      >
                        +
                      </div>
                      <span className="text-white font-bold text-base">{currencySymbol}{depositTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold"
                        style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
                      >
                        &minus;
                      </div>
                      <span className="text-white font-bold text-base">{currencySymbol}{withdrawalTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold"
                        style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", border: "1px solid rgba(139, 92, 246, 0.25)" }}
                      >
                        &#8645;
                      </div>
                      <span className="text-white font-bold text-base">{currencySymbol}{leftoverTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Large */}
              <TabsContent value="large" className="mt-4 space-y-4">
                <OverlayLink url={`${overlayBaseUrl}/overlay/balance_large`} />

                <div className="rounded-xl p-6 flex items-center justify-center" style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.05) 0%, transparent 70%)" }}>
                  <div
                    className="rounded-xl overflow-hidden flex items-center gap-6 animate-fade-in-up"
                    style={{
                      background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                      padding: "14px 22px",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center h-8 w-8 rounded-full text-base font-bold"
                        style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.25)" }}
                      >
                        +
                      </div>
                      <span className="text-white font-bold text-lg">{currencySymbol}{depositTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center h-8 w-8 rounded-full text-base font-bold"
                        style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
                      >
                        &minus;
                      </div>
                      <span className="text-white font-bold text-lg">{currencySymbol}{withdrawalTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center h-8 w-8 rounded-full text-base font-bold"
                        style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", border: "1px solid rgba(139, 92, 246, 0.25)" }}
                      >
                        &#8645;
                      </div>
                      <span className="text-white font-bold text-lg">{currencySymbol}{leftoverTotal.toLocaleString()}</span>
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
