/**
 * Referon Affiliate API client.
 * Fetches CSV report from a Referon API link and parses it into structured data.
 * Server-side only (uses REFERON_API_URL env var).
 */

function getApiUrl(): string {
  const url = process.env.REFERON_API_URL;
  if (!url) throw new Error("Missing REFERON_API_URL env var");
  return url;
}

// ── Types ──

export interface ReferonRow {
  [key: string]: string | number;
}

export interface ReferonReport {
  headers: string[];
  rows: ReferonRow[];
  totals: ReferonRow | null;
}

// ── CSV parser ──

function parseCSV(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(parseCsvLine);
  return { headers, rows };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === "," || ch === ";") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function toTypedValue(val: string): string | number {
  if (val === "" || val === "-") return val;
  // Try to parse as number (handles "1,234.56" and "1234.56")
  const cleaned = val.replace(/,/g, "");
  const num = Number(cleaned);
  if (!isNaN(num) && cleaned !== "") return num;
  return val;
}

// ── API call ──

export async function getReferonReport(): Promise<ReferonReport> {
  const apiUrl = getApiUrl();

  const res = await fetch(apiUrl, {
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Referon API error ${res.status}: ${text}`);
  }

  const csv = await res.text();
  const { headers, rows: rawRows } = parseCSV(csv);

  if (headers.length === 0) {
    return { headers: [], rows: [], totals: null };
  }

  // Convert rows to objects with typed values
  const rows: ReferonRow[] = rawRows
    .filter((r) => r.some((cell) => cell !== ""))
    .map((r) => {
      const obj: ReferonRow = {};
      headers.forEach((h, i) => {
        obj[h] = toTypedValue(r[i] ?? "");
      });
      return obj;
    });

  // Try to compute totals for numeric columns
  const totals: ReferonRow = {};
  let hasTotals = false;
  for (const h of headers) {
    const numericValues = rows.map((r) => r[h]).filter((v): v is number => typeof v === "number");
    if (numericValues.length > 0 && numericValues.length === rows.filter((r) => r[h] !== "" && r[h] !== "-").length) {
      totals[h] = numericValues.reduce((a, b) => a + b, 0);
      hasTotals = true;
    } else {
      totals[h] = "";
    }
  }

  return { headers, rows, totals: hasTotals ? totals : null };
}
