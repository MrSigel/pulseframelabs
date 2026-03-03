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
import { twitchConnections, botCustomCommands } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/client";
import {
  createChatHandler,
  createHotwordHandler,
  createSlotRequestHandler,
  createTournamentJoinHandler,
  createCustomResponseHandler,
  createViewerJoinHandler,
} from "@/lib/twitch/handlers";
import type { MessageHandler } from "@/lib/twitch/types";
import type { BotCustomCommand } from "@/lib/supabase/types";

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
  customCommands: BotCustomCommand[];
  refreshCustomCommands: () => Promise<void>;
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
    "tournament-join": true,
  });

  const [customCommands, setCustomCommands] = useState<BotCustomCommand[]>([]);
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

  // Load custom commands from DB
  const refreshCustomCommands = useCallback(async () => {
    try {
      const cmds = await botCustomCommands.list();
      setCustomCommands(cmds);
    } catch {
      // silently ignore if table doesn't exist yet
    }
  }, []);

  // Load custom commands on mount
  useEffect(() => {
    refreshCustomCommands();
  }, [refreshCustomCommands]);

  // Realtime subscription for custom commands
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("bot_custom_commands_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bot_custom_commands" },
        () => { refreshCustomCommands(); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refreshCustomCommands]);

  // Apply custom commands to bot (aliases + response handler)
  useEffect(() => {
    const enabledCmds = customCommands.filter((c) => c.enabled);

    // Build alias map
    const aliases = new Map<string, string>();
    for (const cmd of enabledCmds) {
      if (cmd.action_type === "alias" && cmd.alias_target) {
        aliases.set(cmd.command.toLowerCase(), cmd.alias_target);
      }
    }
    twitchBot.setAliases(aliases);

    // Build response map and register handler
    const responses = new Map<string, { response: string; cooldown: number }>();
    for (const cmd of enabledCmds) {
      if (cmd.action_type === "response" && cmd.response_text) {
        responses.set(cmd.command.toLowerCase(), {
          response: cmd.response_text,
          cooldown: cmd.cooldown_seconds,
        });
      }
    }

    // Remove old custom-responses handler if exists
    if (handlersRef.current.has("custom-responses")) {
      handlersRef.current.delete("custom-responses");
      twitchBot.removeHandler("custom-responses");
    }

    // Register new one if there are response commands
    if (responses.size > 0) {
      const handler = createCustomResponseHandler(responses);
      handlersRef.current.set("custom-responses", handler);
      twitchBot.addHandler(handler);
    }
  }, [customCommands]);

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

    // Tournament join handler
    if (enabledFeatures["tournament-join"] && !handlersRef.current.has("tournament-join")) {
      const handler = createTournamentJoinHandler();
      handlersRef.current.set("tournament-join", handler);
      twitchBot.addHandler(handler);
    } else if (!enabledFeatures["tournament-join"] && handlersRef.current.has("tournament-join")) {
      handlersRef.current.delete("tournament-join");
      twitchBot.removeHandler("tournament-join");
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

      const registerJoinHandler = (username: string) => {
        if (!handlersRef.current.has("viewer-join")) {
          const handler = createViewerJoinHandler({ streamerUsername: username });
          handlersRef.current.set("viewer-join", handler);
          twitchBot.addHandler(handler);
        }
      };

      try {
        await twitchBot.connect(
          connection.access_token,
          connection.twitch_username,
          connection.user_id,
        );
        registerJoinHandler(connection.twitch_username);
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
        registerJoinHandler(twitch_username);
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
        customCommands,
        refreshCustomCommands,
      }}
    >
      {children}
    </TwitchBotContext.Provider>
  );
}
