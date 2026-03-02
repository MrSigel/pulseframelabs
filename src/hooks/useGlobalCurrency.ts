"use client";

import { useOverlayData } from "@/hooks/useOverlayData";

interface ProfileCurrency {
  currency: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "\u20ac",
  GBP: "\u00a3",
  CAD: "CA$",
  AUD: "A$",
  JPY: "\u00a5",
  CHF: "Fr",
  SEK: "kr",
  NOK: "kr",
  BRL: "R$",
  TRY: "\u20ba",
};

/**
 * Hook for overlay pages: reads the user's global currency from user_profiles.
 * Returns the currency code and symbol.
 */
export function useGlobalCurrency(userId: string | null) {
  const { data } = useOverlayData<ProfileCurrency>({
    table: "user_profiles",
    userId,
    single: true,
  });

  const code = data?.currency || "USD";
  const symbol = CURRENCY_SYMBOLS[code] || code;

  return { code, symbol };
}

export function currencySymbol(code: string | null | undefined): string {
  return CURRENCY_SYMBOLS[code ?? ""] || code || "$";
}
