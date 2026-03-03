"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Wifi, WifiOff, Unplug, ToggleLeft, ToggleRight, Plus, Trash2, Terminal } from "lucide-react";
import { useTwitchBot } from "@/contexts/TwitchBotContext";
import { twitchConnections, botCustomCommands } from "@/lib/supabase/db";
import { PageHeader } from "@/components/page-header";
import { useFeatureGate } from "@/hooks/useFeatureGate";

const BUILT_IN_COMMANDS = [
  { label: "Slot Requests (!sr)", value: "!sr" },
  { label: "Tournament Join (!join)", value: "!join" },
  { label: "Points Battle (!bet)", value: "!bet" },
  { label: "Quick Guess (!guess)", value: "!guess" },
];

const featureLabels: Record<string, { name: string; description: string }> = {
  chat: { name: "Chat Relay", description: "Relay all Twitch chat messages to overlays" },
  hotwords: { name: "Hotwords", description: "Count word frequency from chat messages" },
  "slot-requests": { name: "Slot Requests", description: "Handle !sr <game> commands from viewers" },
  "quick-guesses": { name: "Quick Guesses", description: "Handle guess commands from viewers" },
  "points-battle": { name: "Points Battle", description: "Handle !bet commands for predictions" },
  loyalty: { name: "Loyalty Giveaways", description: "Track keyword entries for giveaways" },
};

export default function BotPage() {
  const { canModify } = useFeatureGate();
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
    customCommands,
    refreshCustomCommands,
  } = useTwitchBot();

  const [hasConnection, setHasConnection] = useState<boolean | null>(null);
  const [storedUsername, setStoredUsername] = useState<string | null>(null);

  // Custom command form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCommand, setNewCommand] = useState("!");
  const [newActionType, setNewActionType] = useState<"alias" | "response">("alias");
  const [newAliasTarget, setNewAliasTarget] = useState("!sr");
  const [newResponseText, setNewResponseText] = useState("");
  const [newCooldown, setNewCooldown] = useState(0);
  const [saving, setSaving] = useState(false);

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

  async function handleAddCommand() {
    if (!newCommand || newCommand === "!") return;
    const cmd = newCommand.startsWith("!") ? newCommand : `!${newCommand}`;
    setSaving(true);
    try {
      await botCustomCommands.create({
        command: cmd.toLowerCase(),
        action_type: newActionType,
        alias_target: newActionType === "alias" ? newAliasTarget : null,
        response_text: newActionType === "response" ? newResponseText : null,
        cooldown_seconds: newCooldown,
      });
      await refreshCustomCommands();
      setShowAddForm(false);
      setNewCommand("!");
      setNewActionType("alias");
      setNewAliasTarget("!sr");
      setNewResponseText("");
      setNewCooldown(0);
    } catch (err) {
      console.error("Failed to create command:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCommand(id: string, enabled: boolean) {
    try {
      await botCustomCommands.update(id, { enabled });
      await refreshCustomCommands();
    } catch (err) {
      console.error("Failed to toggle command:", err);
    }
  }

  async function handleDeleteCommand(id: string) {
    try {
      await botCustomCommands.remove(id);
      await refreshCustomCommands();
    } catch (err) {
      console.error("Failed to delete command:", err);
    }
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
                canModify ? (
                  <a
                    href="/api/twitch/auth"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#9146ff] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#7c3ae6] hover:shadow-lg hover:shadow-[#9146ff]/20"
                  >
                    <Wifi className="h-4 w-4" />
                    Connect Twitch
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 rounded-lg bg-[#9146ff]/50 px-4 py-2 text-sm font-medium text-white/50 cursor-not-allowed"
                  >
                    <Wifi className="h-4 w-4" />
                    Connect Twitch
                  </button>
                )
              ) : !isConnected ? (
                <button
                  onClick={connect}
                  disabled={isConnecting || !canModify}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wifi className="h-4 w-4" />
                  {isConnecting ? "Connecting..." : "Start Bot"}
                </button>
              ) : (
                <button
                  onClick={disconnect}
                  disabled={!canModify}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600/80 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <WifiOff className="h-4 w-4" />
                  Stop Bot
                </button>
              )}

              {hasConnection && (
                <button
                  onClick={handleDisconnectAccount}
                  disabled={!canModify}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  onClick={() => canModify && toggleFeature(key, !enabled)}
                  disabled={!canModify}
                  className={`flex w-full items-center justify-between rounded-lg border border-border/50 bg-background/50 px-4 py-3 transition-all ${canModify ? "hover:border-primary/30" : "opacity-50 cursor-not-allowed"}`}
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

      {/* Custom Commands */}
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Custom Commands
          </h2>
          {canModify && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/30"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          )}
        </div>

        {/* Add Command Form */}
        {showAddForm && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-background/50 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Command</label>
                <input
                  type="text"
                  value={newCommand}
                  onChange={(e) => setNewCommand(e.target.value)}
                  placeholder="!mycommand"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                <select
                  value={newActionType}
                  onChange={(e) => setNewActionType(e.target.value as "alias" | "response")}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="alias">Alias (redirect to built-in)</option>
                  <option value="response">Response (custom text)</option>
                </select>
              </div>
            </div>

            {newActionType === "alias" ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Target Command</label>
                <select
                  value={newAliasTarget}
                  onChange={(e) => setNewAliasTarget(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {BUILT_IN_COMMANDS.map((cmd) => (
                    <option key={cmd.value} value={cmd.value}>{cmd.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Messages starting with your command will be rewritten to the target before processing.
                </p>
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Response Text</label>
                <input
                  type="text"
                  value={newResponseText}
                  onChange={(e) => setNewResponseText(e.target.value)}
                  placeholder="Join our Discord: https://discord.gg/..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Use {"{user}"} to insert the viewer&apos;s name.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Cooldown (seconds)</label>
              <input
                type="number"
                min={0}
                value={newCooldown}
                onChange={(e) => setNewCooldown(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddCommand}
                disabled={saving || newCommand === "!" || (newActionType === "response" && !newResponseText)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Add Command"}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-all hover:bg-background"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Command List */}
        {customCommands.length === 0 ? (
          <div className="text-muted-foreground py-4 text-center text-sm">
            No custom commands yet. Add one to create aliases or auto-responses.
          </div>
        ) : (
          <div className="space-y-2">
            {customCommands.map((cmd) => (
              <div
                key={cmd.id}
                className={`flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-4 py-3 transition-all ${
                  !cmd.enabled ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-primary">{cmd.command}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                      cmd.action_type === "alias"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-violet-500/20 text-violet-400"
                    }`}>
                      {cmd.action_type}
                    </span>
                    {cmd.cooldown_seconds > 0 && (
                      <span className="text-[10px] text-muted-foreground">{cmd.cooldown_seconds}s cd</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground truncate">
                    {cmd.action_type === "alias"
                      ? `Redirects to ${cmd.alias_target}`
                      : cmd.response_text}
                  </div>
                </div>
                {canModify && (
                  <div className="flex items-center gap-1 ml-3 shrink-0">
                    <button
                      onClick={() => handleToggleCommand(cmd.id, !cmd.enabled)}
                      className="p-1.5 rounded-md transition-colors hover:bg-background"
                      title={cmd.enabled ? "Disable" : "Enable"}
                    >
                      {cmd.enabled ? (
                        <ToggleRight className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCommand(cmd.id)}
                      className="p-1.5 rounded-md transition-colors hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
