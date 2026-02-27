"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Wallet,
  BarChart3,
  Trophy,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalBalance: number;
  totalDeposits: number;
}

interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action: string;
  target_user_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export default function AdminOverviewPage() {
  const { t } = useLanguage();
  const a = t.admin ?? {};
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalBalance: 0,
    totalDeposits: 0,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, logsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/audit-log?limit=20"),
        ]);

        if (usersRes.ok) {
          const { users } = await usersRes.json();
          const activeSubCount = users.filter(
            (u: Record<string, unknown>) => u.subscription != null,
          ).length;
          const totalBal = users.reduce(
            (sum: number, u: Record<string, unknown>) =>
              sum + ((u.wallet as Record<string, number> | null)?.balance ?? 0),
            0,
          );
          const totalDep = users.reduce(
            (sum: number, u: Record<string, unknown>) =>
              sum +
              ((u.wallet as Record<string, number> | null)?.total_deposited ?? 0),
            0,
          );
          setStats({
            totalUsers: users.length,
            activeSubscriptions: activeSubCount,
            totalBalance: totalBal,
            totalDeposits: totalDep,
          });
        }

        if (logsRes.ok) {
          const { logs } = await logsRes.json();
          setAuditLogs(logs);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    {
      label: a.totalUsers ?? "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-cyan-400",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    },
    {
      label: a.activeSubscriptions ?? "Active Subscriptions",
      value: stats.activeSubscriptions,
      icon: Shield,
      color: "from-emerald-500 to-green-400",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    },
    {
      label: a.totalBalance ?? "Total Balance",
      value: `${stats.totalBalance} Credits`,
      icon: Wallet,
      color: "from-[#c9a84c] to-[#e2cc7e]",
      glow: "shadow-[0_0_20px_rgba(201,168,76,0.15)]",
    },
    {
      label: a.totalDeposits ?? "Total Deposits",
      value: `${stats.totalDeposits} Credits`,
      icon: BarChart3,
      color: "from-violet-500 to-purple-500",
      glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    },
  ];

  const quickLinks = [
    { label: a.users ?? "Users", href: "/admin/users", icon: Users },
    { label: a.wallets ?? "Wallets", href: "/admin/wallets", icon: Wallet },
    { label: a.analytics ?? "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: a.casinoDeals ?? "Casino Deals", href: "/admin/deals", icon: Trophy },
  ];

  function formatAction(action: string) {
    return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div>
      <PageHeader title={`Admin ${a.overview ?? "Overview"}`} />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          {a.loading ?? "Loading..."}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className={stat.glow}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="pt-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {link.label}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {a.auditLog ?? "Audit Log"} — {a.recentActions ?? "Recent Actions"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  {a.noData ?? "No data available"}
                </p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            log.action.includes("delete")
                              ? "destructive"
                              : log.action.includes("lock")
                                ? "secondary"
                                : "default"
                          }
                          className="text-[10px]"
                        >
                          {formatAction(log.action)}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.target_user_id?.slice(0, 8)}...
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
