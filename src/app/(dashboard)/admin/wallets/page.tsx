"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Plus, Minus, Gift, CheckCircle2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface UserWalletRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  wallet: { balance: number; total_deposited: number; total_spent: number } | null;
  subscription: { status: string; expires_at: string; packages?: { name: string } } | null;
}

interface PackageRow {
  id: string;
  name: string;
  slug: string;
  price_credits: number;
  duration_days: number;
}

export default function AdminWalletsPage() {
  const { t } = useLanguage();
  const a = t.admin ?? {};
  const [users, setUsers] = useState<UserWalletRow[]>([]);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [walletModal, setWalletModal] = useState<{
    user: UserWalletRow;
    action: "credit" | "debit";
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [pkgModal, setPkgModal] = useState<UserWalletRow | null>(null);
  const [selectedPkg, setSelectedPkg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [usersRes, pkgRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/packages"),
      ]);
      if (!usersRes.ok) {
        setError(`Failed to load users (${usersRes.status})`);
      } else {
        const { users: data } = await usersRes.json();
        setUsers(data);
      }
      if (pkgRes.ok) {
        const pkgs = await pkgRes.json();
        setPackages(Array.isArray(pkgs) ? pkgs : pkgs.packages ?? []);
      }
    } catch {
      setError("Network error loading data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
          (u.display_name?.toLowerCase().includes(search.toLowerCase()) ?? false),
      ),
    [users, search],
  );

  async function handleWalletAction() {
    if (!walletModal) return;
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/users/${walletModal.user.user_id}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: walletModal.action,
          amount: numAmount,
          description: description || `Admin ${walletModal.action}`,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to ${walletModal.action} wallet (${res.status})`);
      } else {
        setSuccess(`Successfully ${walletModal.action === "credit" ? "credited" : "debited"} ${numAmount} credits for ${walletModal.user.email}`);
      }
      setWalletModal(null);
      setAmount("");
      setDescription("");
      await loadData();
    } catch {
      setError("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAssignPackage() {
    if (!pkgModal || !selectedPkg) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/users/${pkgModal.user_id}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: selectedPkg }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to assign package (${res.status})`);
      } else {
        setSuccess(`Package assigned to ${pkgModal.email}`);
      }
      setPkgModal(null);
      setSelectedPkg("");
      await loadData();
    } catch {
      setError("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title={a.walletAdmin ?? "Wallet Administration"} />

      {/* Success Banner */}
      {success && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-400/60 hover:text-emerald-400 ml-4">&times;</button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-destructive/60 hover:text-destructive ml-4">&times;</button>
        </div>
      )}

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={a.search ?? "Search..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          {a.loading ?? "Loading..."}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.email ?? "Email"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.balance ?? "Balance"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.totalDeposits ?? "Deposited"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Spent</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.subscription ?? "Subscription"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.actions ?? "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user.user_id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-foreground font-mono text-xs">
                        {user.email ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground font-bold">
                        {user.wallet?.balance ?? 0}
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-mono">
                        {user.wallet?.total_deposited ?? 0}
                      </td>
                      <td className="px-4 py-3 text-rose-400 font-mono">
                        {user.wallet?.total_spent ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        {user.subscription ? (
                          <Badge variant="default" className="text-[10px]">
                            {(user.subscription.packages as Record<string, unknown> | undefined)?.name as string ?? "Active"}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-emerald-400 hover:text-emerald-300"
                            onClick={() => {
                              setWalletModal({ user, action: "credit" });
                              setAmount("");
                              setDescription("");
                            }}
                            title={a.creditWallet ?? "Credit"}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-400 hover:text-rose-300"
                            onClick={() => {
                              setWalletModal({ user, action: "debit" });
                              setAmount("");
                              setDescription("");
                            }}
                            title={a.debitWallet ?? "Debit"}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-primary hover:text-primary/80"
                            onClick={() => {
                              setPkgModal(user);
                              setSelectedPkg("");
                            }}
                            title={a.assignPackage ?? "Assign Package"}
                          >
                            <Gift className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        {a.noData ?? "No data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credit/Debit Modal */}
      <Dialog open={!!walletModal} onOpenChange={() => setWalletModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {walletModal?.action === "credit"
                ? (a.creditWallet ?? "Credit Wallet")
                : (a.debitWallet ?? "Debit Wallet")}
            </DialogTitle>
            <DialogDescription>{walletModal?.user.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                {a.amount ?? "Amount"} (Credits)
              </label>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                {a.description ?? "Description"}
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional reason..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setWalletModal(null)}>
              {a.cancel ?? "Cancel"}
            </Button>
            <Button
              variant={walletModal?.action === "credit" ? "default" : "destructive"}
              disabled={actionLoading || !amount}
              onClick={handleWalletAction}
            >
              {actionLoading
                ? (a.loading ?? "Loading...")
                : a.confirm ?? "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Package Modal */}
      <Dialog open={!!pkgModal} onOpenChange={() => setPkgModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{a.assignPackage ?? "Assign Package"}</DialogTitle>
            <DialogDescription>{pkgModal?.email}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="text-sm text-muted-foreground mb-2 block">
              Select Package
            </label>
            <div className="space-y-2">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selectedPkg === pkg.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm font-medium text-foreground">
                    {pkg.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {pkg.price_credits} Credits · {pkg.duration_days} days
                  </span>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPkgModal(null)}>
              {a.cancel ?? "Cancel"}
            </Button>
            <Button
              disabled={actionLoading || !selectedPkg}
              onClick={handleAssignPackage}
            >
              {actionLoading
                ? (a.loading ?? "Loading...")
                : (a.assignPackage ?? "Assign")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
