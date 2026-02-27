"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Gets the current authenticated user's ID.
 * Used in dashboard pages to append ?uid= to overlay URLs.
 */
export function useAuthUid(): string | null {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUid(user?.id ?? null);
    });
  }, []);

  return uid;
}
