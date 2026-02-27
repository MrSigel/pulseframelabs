"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { twitchBot } from "@/lib/twitch/bot";
import { twitchConnections } from "@/lib/supabase/db";
import {
  createChatHandler,
  createHotwordHandler,
  createSlotRequestHandler,
} from "@/lib/twitch/handlers";
import type { MessageHandler } from "@/lib/twitch/types";

interface LogEntry {
  time: Date;
  type: string;
  message: string;
}

interface TwitchBotContextValue {
  isConnected: boolean;
  isConnecting: boolean;
  channel: string | null;
  twitchUsername: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  enabledFeatures: Record<string, boolean>;
  toggleFeature: (name: string, enabled: boolean) => void;
  logs: LogEntry[];
  addHandler: (handler: MessageHandler) => void;
  removeHandler: (name: string) => void;
}

const TwitchBotContext = createContext<TwitchBotContextValue | null>(null);

export function useTwitchBot() {
  const ctx = useContext(TwitchBotContext);
  if (!ctx) throw new Error("useTwitchBot must be used within TwitchBotProvider");
  return ctx;
}

export function TwitchBotProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [channel, setChannel] = useState<string | null>(null);
  const [twitchUsername, setTwitchUsername] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({
    chat: true,
    hotwords: true,
    "slot-requests": true,
    "quick-guesses": false,
    "points-battle": false,
    loyalty: false,
  });

  const handlersRef = useRef<Map<string, MessageHandler>>(new Map());

  // Listen to bot status changes
  useEffect(() => {
    const unsub = twitchBot.onStatusChange((status) => {
      setIsConnected(status === "connected");
      setIsConnecting(status === "connecting");
      setChannel(twitchBot.channel);
    });
    return unsub;
  }, []);

  // Listen to bot logs
  useEffect(() => {
    const unsub = twitchBot.onLog((entry) => {
      setLogs((prev) => [...prev.slice(-49), entry]);
    });
    return unsub;
  }, []);

  // Register default handlers when features are toggled
  useEffect(() => {
    // Chat handler
    if (enabledFeatures.chat && !handlersRef.current.has("chat")) {
      const handler = createChatHandler();
      handlersRef.current.set("chat", handler);
      twitchBot.addHandler(handler);
    } else if (!enabledFeatures.chat && handlersRef.current.has("chat")) {
      handlersRef.current.delete("chat");
      twitchBot.removeHandler("chat");
    }

    // Hotword handler
    if (enabledFeatures.hotwords && !handlersRef.current.has("hotwords")) {
      const handler = createHotwordHandler({ excludedWords: [] });
      handlersRef.current.set("hotwords", handler);
      twitchBot.addHandler(handler);
    } else if (!enabledFeatures.hotwords && handlersRef.current.has("hotwords")) {
      handlersRef.current.delete("hotwords");
      twitchBot.removeHandler("hotwords");
    }

    // Slot request handler
    if (enabledFeatures["slot-requests"] && !handlersRef.current.has("slot-requests")) {
      const handler = createSlotRequestHandler();
      handlersRef.current.set("slot-requests", handler);
      twitchBot.addHandler(handler);
    } else if (!enabledFeatures["slot-requests"] && handlersRef.current.has("slot-requests")) {
      handlersRef.current.delete("slot-requests");
      twitchBot.removeHandler("slot-requests");
    }
  }, [enabledFeatures]);

  const connect = useCallback(async () => {
    try {
      // First try to get stored connection
      const connection = await twitchConnections.get();
      if (!connection) {
        // Redirect to OAuth
        window.location.href = "/api/twitch/auth";
        return;
      }

      setTwitchUsername(connection.twitch_username);

      try {
        await twitchBot.connect(
          connection.access_token,
          connection.twitch_username,
          connection.user_id,
        );
      } catch {
        // Token might be expired, try refresh
        const res = await fetch("/api/twitch/refresh", { method: "POST" });
        if (!res.ok) {
          // Refresh failed, need re-auth
          window.location.href = "/api/twitch/auth";
          return;
        }
        const { access_token, twitch_username } = await res.json();
        await twitchBot.connect(access_token, twitch_username, connection.user_id);
      }
    } catch (err) {
      console.error("Failed to connect bot:", err);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await twitchBot.disconnect();
    setTwitchUsername(null);
  }, []);

  const toggleFeature = useCallback((name: string, enabled: boolean) => {
    setEnabledFeatures((prev) => ({ ...prev, [name]: enabled }));
  }, []);

  const addHandler = useCallback((handler: MessageHandler) => {
    handlersRef.current.set(handler.name, handler);
    twitchBot.addHandler(handler);
  }, []);

  const removeHandler = useCallback((name: string) => {
    handlersRef.current.delete(name);
    twitchBot.removeHandler(name);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      twitchBot.clearHandlers();
      handlersRef.current.clear();
    };
  }, []);

  return (
    <TwitchBotContext.Provider
      value={{
        isConnected,
        isConnecting,
        channel,
        twitchUsername,
        connect,
        disconnect,
        enabledFeatures,
        toggleFeature,
        logs,
        addHandler,
        removeHandler,
      }}
    >
      {children}
    </TwitchBotContext.Provider>
  );
}
