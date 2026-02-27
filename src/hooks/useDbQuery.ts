"use client";

import { useState, useEffect, useCallback } from "react";

interface UseDbQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for loading data from Supabase on mount.
 * Automatically fetches on mount and provides refetch.
 */
export function useDbQuery<T>(
  queryFn: () => Promise<T>,
  deps: unknown[] = [],
): UseDbQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("useDbQuery error:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

interface UseDbMutationResult<TArgs extends unknown[], TResult> {
  mutate: (...args: TArgs) => Promise<TResult | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for performing mutations (insert, update, delete).
 * Does not auto-fetch; call mutate() manually.
 */
export function useDbMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
): UseDbMutationResult<TArgs, TResult> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (...args: TArgs): Promise<TResult | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(...args);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
      console.error("useDbMutation error:", err);
      return null;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { mutate, loading, error };
}
