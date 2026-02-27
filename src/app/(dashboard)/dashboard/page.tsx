"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Eye,
  Gamepad2,
  Trophy,
  BarChart3,
} from "lucide-react";
import { dashboardStats } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { DashboardStat } from "@/lib/supabase/types";

function formatCurrency(val: number) {
  return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getChange(val: number) {
  if (val > 0) return { text: `+${val.toFixed(0)}%`, trend: "up" as const };
  if (val < 0) return { text: `${val.toFixed(0)}%`, trend: "down" as const };
  return { text: "0%", trend: "neutral" as const };
}

export default function DashboardPage() {
  const { data: stats } = useDbQuery<DashboardStat | null>(
    () => dashboardStats.get(),
    [],
  );

  const s = stats ?? {
    total_wagered: 0,
    total_deposits: 0,
    total_withdrawals: 0,
    net_profit: 0,
    active_viewers: 0,
    games_played: 0,
    best_multiplier: 0,
    total_users: 0,
  };

  const primaryStats = [
    {
      label: "Total Wagered",
      value: formatCurrency(s.total_wagered),
      ...getChange(0),
      icon: DollarSign,
      color: "from-[#c9a84c] to-[#e2cc7e]",
      glow: "shadow-[0_0_20px_rgba(201,168,76,0.15)]",
    },
    {
      label: "Total Deposits",
      value: formatCurrency(s.total_deposits),
      ...getChange(0),
      icon: TrendingUp,
      color: "from-emerald-500 to-green-400",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    },
    {
      label: "Total Withdrawals",
      value: formatCurrency(s.total_withdrawals),
      ...getChange(0),
      icon: TrendingDown,
      color: "from-rose-500 to-pink-500",
      glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    },
    {
      label: "Net Profit/Loss",
      value: formatCurrency(s.net_profit),
      ...getChange(0),
      icon: BarChart3,
      color: "from-violet-500 to-purple-500",
      glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    },
  ];

  const secondaryStatsList = [
    { label: "Active Viewers", value: String(s.active_viewers), icon: Eye },
    { label: "Games Played", value: String(s.games_played), icon: Gamepad2 },
    { label: "Best Multiplier", value: `${s.best_multiplier}x`, icon: Trophy },
    { label: "Total Users", value: String(s.total_users), icon: Users },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {primaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={stat.glow}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    stat.trend === "up"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-slate-500/10 text-slate-400"
                  }`}>
                    {stat.text}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {secondaryStatsList.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                  <Icon className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[11px] text-slate-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#c9a84c]" />
              Session History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <BarChart3 className="h-10 w-10 mb-3" />
              <p className="text-sm">No session data yet</p>
              <p className="text-xs mt-1">Start a session to see your stats here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-emerald-400" />
              Recent Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <Gamepad2 className="h-10 w-10 mb-3" />
              <p className="text-sm">No games played yet</p>
              <p className="text-xs mt-1">Your recent game history will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
