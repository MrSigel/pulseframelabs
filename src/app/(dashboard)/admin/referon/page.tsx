"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  RefreshCw,
  Download,
  Loader2,
  MousePointerClick,
  UserPlus,
  DollarSign,
  Coins,
  TrendingUp,
} from "lucide-react";
import { useState, useMemo } from "react";

interface ReferonRow {
  [key: string]: string | number;
}

interface ReferonReport {
  headers: string[];
  rows: ReferonRow[];
  totals: ReferonRow | null;
}

// Map common Referon column names to icons and colors
const COLUMN_ICONS: Record<string, { icon: typeof BarChart3; color: string }> = {
  clicks: { icon: MousePointerClick, color: "from-blue-500 to-cyan-400" },
  impressions: { icon: MousePointerClick, color: "from-blue-500 to-cyan-400" },
  registrations: { icon: UserPlus, color: "from-emerald-500 to-green-400" },
  signups: { icon: UserPlus, color: "from-emerald-500 to-green-400" },
  sign_ups: { icon: UserPlus, color: "from-emerald-500 to-green-400" },
  deposits: { icon: DollarSign, color: "from-[#c9a84c] to-[#e2cc7e]" },
  deposit: { icon: DollarSign, color: "from-[#c9a84c] to-[#e2cc7e]" },
  ftd: { icon: DollarSign, color: "from-amber-500 to-yellow-400" },
  first_deposits: { icon: DollarSign, color: "from-amber-500 to-yellow-400" },
  revenue: { icon: TrendingUp, color: "from-violet-500 to-purple-500" },
  commission: { icon: Coins, color: "from-violet-500 to-purple-500" },
  earnings: { icon: Coins, color: "from-violet-500 to-purple-500" },
};

function getColumnMeta(header: string) {
  const key = header.toLowerCase().replace(/[\s-]/g, "_");
  return COLUMN_ICONS[key] ?? null;
}

function formatValue(val: string | number): string {
  if (typeof val === "number") {
    // Format with locale (thousands separator)
    return Number.isInteger(val) ? val.toLocaleString() : val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(val);
}

export default function AdminReferonPage() {
  const [report, setReport] = useState<ReferonReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/referon");
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to fetch");
      }
      const data: ReferonReport = await res.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Referon report");
    } finally {
      setLoading(false);
    }
  }

  // Build summary cards from totals — pick numeric columns with matching icons
  const summaryCards = useMemo(() => {
    if (!report?.totals) return [];
    return report.headers
      .map((h) => {
        const meta = getColumnMeta(h);
        const val = report.totals![h];
        if (!meta || typeof val !== "number") return null;
        return { label: h, value: val, icon: meta.icon, color: meta.color };
      })
      .filter(Boolean) as { label: string; value: number; icon: typeof BarChart3; color: string }[];
  }, [report]);

  function exportCSV() {
    if (!report) return;
    const lines = [report.headers.join(",")];
    for (const row of report.rows) {
      lines.push(report.headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referon-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="Referon Reports"
        actions={
          <div className="flex items-center gap-2">
            {report && report.rows.length > 0 && (
              <Button variant="outline" className="gap-2" onClick={exportCSV}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
            <Button onClick={fetchReport} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {loading ? "Loading..." : "Fetch Report"}
            </Button>
          </div>
        }
      />

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
                    {formatValue(stat.value)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Report Table */}
      {report && report.rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Referon Report ({report.rows.length} rows)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    {report.headers.map((h) => (
                      <th key={h} className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      {report.headers.map((h) => {
                        const val = row[h];
                        const isNumeric = typeof val === "number";
                        return (
                          <td
                            key={h}
                            className={`px-4 py-3 whitespace-nowrap ${isNumeric ? "font-mono text-foreground" : "text-foreground text-xs"}`}
                          >
                            {formatValue(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Totals row */}
                  {report.totals && (
                    <tr className="border-t-2 border-border bg-muted/20 font-bold">
                      {report.headers.map((h, i) => {
                        const val = report.totals![h];
                        return (
                          <td key={h} className="px-4 py-3 whitespace-nowrap font-mono text-foreground">
                            {i === 0 && typeof val !== "number" ? "Total" : typeof val === "number" ? formatValue(val) : ""}
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && (!report || report.rows.length === 0) && !error && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <BarChart3 className="h-10 w-10 mb-3" />
              <p className="text-sm">No data available</p>
              <p className="text-xs mt-1">
                Click &quot;Fetch Report&quot; to load data from Referon
              </p>
              <p className="text-[10px] mt-3 text-slate-600 max-w-sm text-center">
                Set the <code className="px-1 py-0.5 rounded bg-white/[0.06] text-xs">REFERON_API_URL</code> environment
                variable to your Referon report API link (from Reports → General → API Link).
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
