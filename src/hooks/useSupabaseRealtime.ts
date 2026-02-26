"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

type EventType = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeOptions<T extends Record<string, unknown>> {
  table: string;
  event?: EventType;
  schema?: string;
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: { old: T; new: T }) => void;
  onDelete?: (payload: T) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
}

export function useSupabaseRealtime<
  T extends Record<string, unknown>,
>({
  table,
  event = "*",
  schema = "public",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channelConfig: {
      event: string;
      schema: string;
      table: string;
      filter?: string;
    } = { event, schema, table };
    if (filter) channelConfig.filter = filter;

    const channel = supabase
      .channel(`realtime-${table}-${event}`)
      .on(
        "postgres_changes" as never,
        channelConfig as never,
        (payload: RealtimePostgresChangesPayload<T>) => {
          onChange?.(payload);
          if (payload.eventType === "INSERT")
            onInsert?.(payload.new as T);
          if (payload.eventType === "UPDATE")
            onUpdate?.({ old: payload.old as T, new: payload.new as T });
          if (payload.eventType === "DELETE")
            onDelete?.(payload.old as T);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, event, schema, filter]);
}
