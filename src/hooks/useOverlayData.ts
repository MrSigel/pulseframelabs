"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseOverlayDataOptions {
  table: string;
  userId: string | null;
  filter?: Record<string, unknown>;
  orderBy?: string;
  ascending?: boolean;
  single?: boolean;
}

interface UseOverlayDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for overlay pages: fetches data from Supabase filtered by user_id
 * and subscribes to Realtime changes for live updates.
 *
 * Before fetching, checks if the user has an active subscription via
 * /api/overlay/check-access. If not, returns null data (overlay shows fallback).
 *
 * When `single` is true, returns a single row (T).
 * When `single` is false (default), returns an array (T[]).
 */
export function useOverlayData<T>({
  table,
  userId,
  filter,
  orderBy,
  ascending = true,
  single = false,
}: UseOverlayDataOptions): UseOverlayDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const accessCheckedRef = useRef<{ uid: string; allowed: boolean } | null>(null);

  const checkAccess = useCallback(async (uid: string): Promise<boolean> => {
    // Cache the result for the same uid within this hook instance
    if (accessCheckedRef.current?.uid === uid) {
      return accessCheckedRef.current.allowed;
    }
    try {
      const res = await fetch(`/api/overlay/check-access?uid=${uid}`);
      const { allowed } = await res.json();
      accessCheckedRef.current = { uid, allowed };
      return allowed;
    } catch {
      return false;
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Check subscription access before fetching data
      const allowed = await checkAccess(userId);
      if (!allowed) {
        setData(null);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      let query = supabase.from(table).select("*").eq("user_id", userId);

      if (filter) {
        for (const [key, value] of Object.entries(filter)) {
          query = query.eq(key, value);
        }
      }

      if (orderBy) {
        query = query.order(orderBy, { ascending });
      }

      if (single) {
        // When fetching a single row, always order by created_at desc to get the latest
        if (!orderBy) query = query.order("created_at", { ascending: false });
        const { data: row, error: err } = await query.limit(1).maybeSingle();
        if (err) throw err;
        setData(row as T);
      } else {
        const { data: rows, error: err } = await query;
        if (err) throw err;
        setData(rows as T);
      }

      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [table, userId, single, orderBy, ascending, filter, checkAccess]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`overlay-${table}-${userId}`)
      .on(
        "postgres_changes" as never,
        {
          event: "*",
          schema: "public",
          table,
          filter: `user_id=eq.${userId}`,
        } as never,
        () => {
          // On any change, refetch the entire dataset
          fetchData();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, userId, fetchData]);

  return { data, loading, error };
}
