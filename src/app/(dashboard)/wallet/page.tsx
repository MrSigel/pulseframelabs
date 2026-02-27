"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet as WalletIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  Package,
  Clock,
  Copy,
  Check,
  Loader2,
  QrCode,
  X,
  Crown,
  Zap,
  Shield,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { wallet as walletDb, packages as packagesDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useLanguage } from "@/context/LanguageContext";
import type { Package as PackageType, WalletTransaction, PaymentRequest } from "@/lib/supabase/types";
import { getSupportedCoins } from "@/lib/cryptapi";

export default function WalletPage() {
  const { wallet, subscription, hasActiveSubscription, refetch } = useSubscription();
  const { t } = useLanguage();
  const wt = t.wallet || {};

  // Packages
  const { data: pkgs } = useDbQuery<PackageType[]>(() => packagesDb.list(), []);

  // Transactions
  const { data: transactions, refetch: refetchTx } = useDbQuery<WalletTransaction[]>(
    () => walletDb.getTransactions(50),
    []
  );

  // Top-up state
  const [topUpAmount, setTopUpAmount] = useState("10");
  const [selectedCoin, setSelectedCoin] = useState("btc");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    payment_id: string;
    address_in: string;
    amount_crypto: string;
    amount_fiat: number;
    coin: string;
    qr_code: string;
    payment_uri: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Purchase state
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [purchaseConfirm, setPurchaseConfirm] = useState<PackageType | null>(null);

  const coins = getSupportedCoins();

  // Top-up handler
  async function handleTopUp() {
    const amount = parseInt(topUpAmount, 10);
    if (isNaN(amount) || amount < 5) return;

    setTopUpLoading(true);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, coin: selectedCoin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Top-up failed");
      setPaymentData(data);
    } catch (err) {
      console.error("Top-up error:", err);
    } finally {
      setTopUpLoading(false);
    }
  }

  // Purchase handler
  async function handlePurchase(pkg: PackageType) {
    setPurchaseLoading(pkg.id);
    try {
      const res = await fetch("/api/wallet/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: pkg.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Purchase failed");
      await refetch();
      await refetchTx();
      setPurchaseConfirm(null);
    } catch (err) {
      console.error("Purchase error:", err);
    } finally {
      setPurchaseLoading(null);
    }
  }

  // Copy address
  function copyAddress(addr: string) {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Auto-refresh when payment is pending
  useEffect(() => {
    if (!paymentData) return;
    const interval = setInterval(() => {
      refetch();
      refetchTx();
    }, 15000);
    return () => clearInterval(interval);
  }, [paymentData, refetch, refetchTx]);

  const balance = wallet?.balance ?? 0;
  const totalDeposited = wallet?.total_deposited ?? 0;
  const totalSpent = wallet?.total_spent ?? 0;

  const packageIcons = [Zap, Crown, Star, Shield];

  return (
    <div>
      <PageHeader title={wt.title || "Wallet & Credits"} />

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
                <WalletIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{wt.balance || "Balance"}</p>
                <p className="text-2xl font-bold text-foreground">{balance} <span className="text-sm text-muted-foreground">{wt.credits || "Credits"}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <ArrowUpCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{wt.totalDeposited || "Total Deposited"}</p>
                <p className="text-2xl font-bold text-foreground">{totalDeposited} <span className="text-sm text-muted-foreground">{wt.credits || "Credits"}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600">
                <ArrowDownCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{wt.totalSpent || "Total Spent"}</p>
                <p className="text-2xl font-bold text-foreground">{totalSpent} <span className="text-sm text-muted-foreground">{wt.credits || "Credits"}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Subscription */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            {hasActiveSubscription
              ? (wt.activeSubscription || "Active Subscription")
              : (wt.noSubscription || "No Active Subscription")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasActiveSubscription && subscription ? (
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {(subscription as unknown as Record<string, unknown>).packages
                    ? ((subscription as unknown as Record<string, unknown>).packages as Record<string, unknown>).name as string
                    : "Active Package"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {wt.expiresOn
                    ? wt.expiresOn.replace("{date}", new Date(subscription.expires_at).toLocaleDateString())
                    : `Expires on ${new Date(subscription.expires_at).toLocaleDateString()}`}
                  {" — "}
                  {(() => {
                    const days = Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return wt.expiresIn
                      ? wt.expiresIn.replace("{days}", String(days))
                      : `${days} days remaining`;
                  })()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {wt.noSubscriptionDesc || "Purchase a package to unlock all features."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Packages Grid */}
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        {wt.packages || "Packages"}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {wt.packagesDesc || "Spend credits to unlock all dashboard features."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(pkgs || []).map((pkg, i) => {
          const Icon = packageIcons[i % packageIcons.length];
          const canAfford = balance >= pkg.price_credits;
          const isPopular = pkg.slug === "monthly";
          const isBestValue = pkg.slug === "3months";

          return (
            <Card key={pkg.id} className={`relative overflow-hidden transition-all ${
              isPopular ? "border-primary/40 shadow-[0_0_20px_rgba(201,168,76,0.1)]" : ""
            }`}>
              {isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-primary/80 text-[10px] font-bold uppercase tracking-wider text-white px-3 py-1 rounded-bl-lg">
                  {t.pricing?.popular || "Popular"}
                </div>
              )}
              {isBestValue && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-emerald-600 text-[10px] font-bold uppercase tracking-wider text-white px-3 py-1 rounded-bl-lg">
                  {t.pricing?.bestValue || "Best Value"}
                </div>
              )}
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{pkg.name}</p>
                    <p className="text-xs text-muted-foreground">{pkg.duration_days} {pkg.duration_days === 1 ? "day" : "days"}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">{pkg.price_credits}</span>
                  <span className="text-sm text-muted-foreground ml-1">{wt.credits || "Credits"}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{pkg.price_credits}€</p>
                </div>

                <p className="text-xs text-muted-foreground mb-4">{pkg.description}</p>

                <Button
                  className="w-full"
                  variant={canAfford ? "default" : "outline"}
                  disabled={!!purchaseLoading}
                  onClick={() => {
                    if (canAfford) {
                      setPurchaseConfirm(pkg);
                    }
                  }}
                >
                  {purchaseLoading === pkg.id ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />{wt.purchasing || "Purchasing..."}</>
                  ) : canAfford ? (
                    wt.buyPackage || "Buy Package"
                  ) : (
                    wt.topUpFirst || "Top Up First"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Purchase Confirmation Modal */}
      {purchaseConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPurchaseConfirm(null)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                {wt.purchaseConfirm || "Purchase Confirmation"}
                <Button variant="ghost" size="sm" onClick={() => setPurchaseConfirm(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                {(wt.purchaseConfirmDesc || "You are about to spend {amount} credits on the {name} package.")
                  .replace("{amount}", String(purchaseConfirm.price_credits))
                  .replace("{name}", purchaseConfirm.name)}
              </p>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">{wt.balance || "Balance"}</span>
                <span className="font-semibold text-foreground">{balance} {wt.credits || "Credits"}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-6">
                <span className="text-muted-foreground">Cost</span>
                <span className="font-semibold text-rose-500">-{purchaseConfirm.price_credits} {wt.credits || "Credits"}</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setPurchaseConfirm(null)}>Cancel</Button>
                <Button
                  className="flex-1"
                  disabled={!!purchaseLoading}
                  onClick={() => handlePurchase(purchaseConfirm)}
                >
                  {purchaseLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />{wt.purchasing || "Purchasing..."}</>
                  ) : (
                    wt.buyPackage || "Buy Package"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Up Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-primary" />
            {wt.topUpTitle || "Top Up Wallet"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {wt.topUpDesc || "Add credits to your wallet using cryptocurrency."}
          </p>

          {!paymentData ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {wt.amount || "Amount (Credits)"}
                </label>
                <Input
                  type="number"
                  min={5}
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {wt.amountHint || "Minimum 5 credits. 1 credit = 1 EUR."}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {wt.selectCoin || "Select Cryptocurrency"}
                </label>
                <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coins.map((c) => (
                      <SelectItem key={c.coin} value={c.coin}>
                        {c.ticker} — {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleTopUp}
                disabled={topUpLoading || parseInt(topUpAmount, 10) < 5}
                className="gap-2"
              >
                {topUpLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />{wt.creatingPayment || "Creating..."}</>
                ) : (
                  <>{wt.createPayment || "Create Payment"}</>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-primary" />
                  {wt.paymentCreated || "Payment Created"}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setPaymentData(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                {wt.sendExactAmount || "Send the exact amount to the address below:"}
              </p>

              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold text-foreground mb-1">
                  {paymentData.amount_crypto} {coins.find(c => c.coin === paymentData.coin)?.ticker}
                </p>
                <p className="text-sm text-muted-foreground">= {paymentData.amount_fiat}€</p>
              </div>

              {/* QR Code */}
              {paymentData.qr_code && (
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${paymentData.qr_code}`}
                    alt="QR Code"
                    className="w-48 h-48 rounded-lg border border-border/50"
                  />
                </div>
              )}

              {/* Address */}
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">Address</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-foreground flex-1 break-all">{paymentData.address_in}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyAddress(paymentData.address_in)}
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {wt.waitingForPayment || "Waiting for payment..."}
              </div>

              <Button variant="outline" onClick={() => setPaymentData(null)} className="w-full">
                {wt.createPayment || "Create New Payment"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {wt.transactionHistory || "Transaction History"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {wt.noTransactions || "No transactions yet"}
            </p>
          ) : (
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border/50">
                <span>Date</span>
                <span>Type</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Balance</span>
                <span>Description</span>
              </div>
              {transactions.map((tx) => {
                const txTypeLabels = wt.txType || {};
                const typeLabel = txTypeLabels[tx.type] || tx.type;
                const isPositive = tx.amount > 0;

                return (
                  <div key={tx.id} className="grid grid-cols-5 gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground text-xs">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-foreground text-xs font-medium">{typeLabel}</span>
                    <span className={`text-right text-xs font-semibold ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                      {isPositive ? "+" : ""}{tx.amount}
                    </span>
                    <span className="text-right text-xs text-muted-foreground">{tx.balance_after}</span>
                    <span className="text-muted-foreground text-xs truncate">{tx.description}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
