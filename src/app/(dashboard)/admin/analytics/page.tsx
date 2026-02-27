"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  MousePointerClick,
  UserPlus,
  DollarSign,
  Coins,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface ReportRow {
  date?: string;
  campaign_id?: number;
  campaign_name?: string;
  clicks: number;
  registrations: number;
  first_deposits: number;
  deposits_count: number;
  deposits_sum: number;
  withdrawals_sum: number;
  revenue: number;
  commission: number;
}

export default function AdminAnalyticsPage() {
  const { t } = useLanguage();
  const a = t.admin ?? {};

  // Default date range: last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo.toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(now.toISOString().split("T")[0]);
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month" | "campaign">("day");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [total, setTotal] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchReport() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        date_from: dateFrom,
        date_to: dateTo,
        group_by: groupBy,
      });
      const res = await fetch(`/api/admin/analytics?${params}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to fetch");
      }
      const data = await res.json();
      setRows(data.data ?? []);
      setTotal(data.total ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  }

  const summaryCards = total
    ? [
        {
          label: a.clicks ?? "Clicks",
          value: total.clicks?.toLocaleString() ?? "0",
          icon: MousePointerClick,
          color: "from-blue-500 to-cyan-400",
        },
        {
          label: a.registrations ?? "Registrations",
          value: total.registrations?.toLocaleString() ?? "0",
          icon: UserPlus,
          color: "from-emerald-500 to-green-400",
        },
        {
          label: a.deposits ?? "Deposits",
          value: `$${total.deposits_sum?.toLocaleString() ?? "0"}`,
          icon: DollarSign,
          color: "from-[#c9a84c] to-[#e2cc7e]",
        },
        {
          label: a.commission ?? "Commission",
          value: `$${total.commission?.toLocaleString() ?? "0"}`,
          icon: Coins,
          color: "from-violet-500 to-purple-500",
        },
      ]
    : [];

  return (
    <div>
      <PageHeader title={a.analytics ?? "Analytics"} />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {a.dateFrom ?? "From"}
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {a.dateTo ?? "To"}
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {a.groupBy ?? "Group By"}
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="day">{a.day ?? "Day"}</option>
                <option value="week">{a.week ?? "Week"}</option>
                <option value="month">{a.month ?? "Month"}</option>
                <option value="campaign">{a.campaign ?? "Campaign"}</option>
              </select>
            </div>
            <Button onClick={fetchReport} disabled={loading}>
              {loading ? (a.loading ?? "Loading...") : (a.fetchReport ?? "Fetch Report")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {summaryCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
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
      )}

      {/* Report Table */}
      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Report
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      {groupBy === "campaign" ? (a.campaign ?? "Campaign") : "Date"}
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.clicks ?? "Clicks"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.registrations ?? "Regs"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.firstDeposits ?? "FTDs"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.depositsSum ?? "Deposits"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.revenue ?? "Revenue"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.commission ?? "Commission"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-foreground text-xs">
                        {groupBy === "campaign"
                          ? (row.campaign_name ?? row.campaign_id)
                          : row.date}
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono">
                        {row.clicks?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono">
                        {row.registrations?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono">
                        {row.first_deposits?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-mono">
                        ${row.deposits_sum?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono">
                        ${row.revenue?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-primary font-mono font-bold">
                        ${row.commission?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && rows.length === 0 && !error && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <BarChart3 className="h-10 w-10 mb-3" />
              <p className="text-sm">{a.noData ?? "No data available"}</p>
              <p className="text-xs mt-1">
                Select a date range and click &quot;{a.fetchReport ?? "Fetch Report"}&quot;
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
