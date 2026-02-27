"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Wifi, WifiOff, Unplug, ToggleLeft, ToggleRight } from "lucide-react";
import { useTwitchBot } from "@/contexts/TwitchBotContext";
import { twitchConnections } from "@/lib/supabase/db";
import { PageHeader } from "@/components/page-header";

const featureLabels: Record<string, { name: string; description: string }> = {
  chat: { name: "Chat Relay", description: "Relay all Twitch chat messages to overlays" },
  hotwords: { name: "Hotwords", description: "Count word frequency from chat messages" },
  "slot-requests": { name: "Slot Requests", description: "Handle !sr <game> commands from viewers" },
  "quick-guesses": { name: "Quick Guesses", description: "Handle guess commands from viewers" },
  "points-battle": { name: "Points Battle", description: "Handle !bet commands for predictions" },
  loyalty: { name: "Loyalty Giveaways", description: "Track keyword entries for giveaways" },
};

export default function BotPage() {
  const params = useSearchParams();
  const {
    isConnected,
    isConnecting,
    channel,
    twitchUsername,
    connect,
    disconnect,
    enabledFeatures,
    toggleFeature,
    logs,
  } = useTwitchBot();

  const [hasConnection, setHasConnection] = useState<boolean | null>(null);
  const [storedUsername, setStoredUsername] = useState<string | null>(null);

  // Check if we have a stored Twitch connection
  useEffect(() => {
    twitchConnections.get().then((conn) => {
      setHasConnection(!!conn);
      setStoredUsername(conn?.twitch_username || null);
    });
  }, []);

  // Show connection result from OAuth callback
  const connected = params.get("connected");
  const error = params.get("error");

  useEffect(() => {
    if (connected === "true") {
      // Refresh connection status
      twitchConnections.get().then((conn) => {
        setHasConnection(!!conn);
        setStoredUsername(conn?.twitch_username || null);
      });
    }
  }, [connected]);

  async function handleDisconnectAccount() {
    await disconnect();
    await twitchConnections.remove();
    setHasConnection(false);
    setStoredUsername(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Twitch Bot" />

      {/* Status messages */}
      {connected === "true" && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          Twitch account connected successfully!
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Connection error: {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connection Panel */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Connection
          </h2>

          <div className="space-y-4">
            {/* Connection status */}
            <div className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  isConnected
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : isConnecting
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500/60"
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {isConnected
                  ? `Connected to #${channel}`
                  : isConnecting
                    ? "Connecting..."
                    : "Disconnected"}
              </span>
            </div>

            {/* Connected Twitch account */}
            {(storedUsername || twitchUsername) && (
              <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-3 py-2">
                <span className="text-xs text-muted-foreground">Twitch:</span>
                <span className="text-sm font-medium text-foreground">
                  {twitchUsername || storedUsername}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {!hasConnection ? (
                <a
                  href="/api/twitch/auth"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#9146ff] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#7c3ae6] hover:shadow-lg hover:shadow-[#9146ff]/20"
                >
                  <Wifi className="h-4 w-4" />
                  Connect Twitch
                </a>
              ) : !isConnected ? (
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
                >
                  <Wifi className="h-4 w-4" />
                  {isConnecting ? "Connecting..." : "Start Bot"}
                </button>
              ) : (
                <button
                  onClick={disconnect}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600/80 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-500"
                >
                  <WifiOff className="h-4 w-4" />
                  Stop Bot
                </button>
              )}

              {hasConnection && (
                <button
                  onClick={handleDisconnectAccount}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                >
                  <Unplug className="h-4 w-4" />
                  Disconnect Account
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Feature Toggles</h2>
          <div className="space-y-3">
            {Object.entries(featureLabels).map(([key, { name, description }]) => {
              const enabled = enabledFeatures[key] ?? false;
              return (
                <button
                  key={key}
                  onClick={() => toggleFeature(key, !enabled)}
                  className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-background/50 px-4 py-3 transition-all hover:border-primary/30"
                >
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">{name}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                  {enabled ? (
                    <ToggleRight className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Activity Log</h2>
          {logs.length > 0 && (
            <span className="text-xs text-muted-foreground">{logs.length} events</span>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto space-y-1 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-muted-foreground py-4 text-center text-sm">
              No activity yet. Connect your bot to start seeing events.
            </div>
          ) : (
            logs
              .slice()
              .reverse()
              .map((log, i) => (
                <div key={i} className="flex gap-2 py-0.5">
                  <span className="text-muted-foreground shrink-0">
                    {log.time.toLocaleTimeString()}
                  </span>
                  <span
                    className={`shrink-0 ${
                      log.type === "error"
                        ? "text-red-400"
                        : log.type === "system"
                          ? "text-blue-400"
                          : "text-emerald-400"
                    }`}
                  >
                    [{log.type}]
                  </span>
                  <span className="text-foreground/80 break-all">{log.message}</span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
