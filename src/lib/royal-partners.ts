/**
 * Royal Partners Affiliate API client.
 * All calls are server-side only (use ROYAL_PARTNERS_TOKEN env var).
 */

const BASE_URL = "https://affiliate.royal-partners.com";

function getToken(): string {
  const token = process.env.ROYAL_PARTNERS_TOKEN;
  if (!token) throw new Error("Missing ROYAL_PARTNERS_TOKEN env var");
  return token;
}

async function rpFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Royal Partners API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ── Types ──

export interface Campaign {
  id: number;
  name: string;
  url: string;
  description: string;
  geo: string[];
  status: string;
}

export interface Promo {
  id: number;
  name: string;
  type: string;
  code: string | null;
  landing_url: string;
  campaign_id: number;
  status: string;
}

export interface ReportRow {
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

export interface ReportResponse {
  data: ReportRow[];
  total: ReportRow;
}

export interface ReportFilters {
  date_from: string; // YYYY-MM-DD
  date_to: string;
  group_by?: "day" | "week" | "month" | "campaign";
  campaign_id?: string;
}

// ── API calls ──

export async function getCampaigns(): Promise<Campaign[]> {
  const res = await rpFetch<{ data: Campaign[] }>("/api/customer/v1/partner/campaigns");
  return res.data ?? [];
}

export async function getPromos(campaignId?: string): Promise<Promo[]> {
  const params: Record<string, string> = {};
  if (campaignId) params.campaign_id = campaignId;
  const res = await rpFetch<{ data: Promo[] }>("/api/customer/v1/partner/promos", params);
  return res.data ?? [];
}

export async function getReport(filters: ReportFilters): Promise<ReportResponse> {
  const params: Record<string, string> = {
    date_from: filters.date_from,
    date_to: filters.date_to,
  };
  if (filters.group_by) params.group_by = filters.group_by;
  if (filters.campaign_id) params.campaign_id = filters.campaign_id;
  return rpFetch<ReportResponse>("/api/customer/v1/partner/report", params);
}
