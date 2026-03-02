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

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
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
  }, [table, userId, single, orderBy, ascending, filter]);

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
