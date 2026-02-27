"use client";

import { useSearchParams } from "next/navigation";

/**
 * Extracts the user ID from the overlay URL's ?uid= search parameter.
 * Overlay pages use this to know whose data to fetch from Supabase.
 */
export function useOverlayUid(): string | null {
  const params = useSearchParams();
  return params.get("uid");
}
