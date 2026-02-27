"use client";

import { useState, useEffect } from "react";

interface UseIsAdminResult {
  isAdmin: boolean;
  isLoading: boolean;
}

/**
 * Client hook that checks /api/admin/check to determine if the current user is admin.
 * Caches the result for the component lifetime.
 */
export function useIsAdmin(): UseIsAdminResult {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/admin/check");
        if (!res.ok) {
          setIsAdmin(false);
          return;
        }
        const json = await res.json();
        if (!cancelled) setIsAdmin(json.isAdmin === true);
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  return { isAdmin, isLoading };
}
