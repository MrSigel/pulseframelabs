"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OverlayLink } from "@/components/overlay-link";
import { Trash2, Monitor, Save, Eye, X, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { hotwords as hotwordsDb } from "@/lib/supabase/db";
import { useTwitchBot } from "@/contexts/TwitchBotContext";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useAuthUid } from "@/hooks/useAuthUid";
import type { HotwordSettings, HotwordEntry } from "@/lib/supabase/types";

export default function HotwordsPage() {
  const uid = useAuthUid();
  const { isConnected } = useTwitchBot();
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Form state
  const [twitchUsername, setTwitchUsername] = useState("");
  const [kickUsername, setKickUsername] = useState("");
  const [excludedWords, setExcludedWords] = useState("");

  const overlayUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/overlay/hotwords?uid=${uid || ""}`;
  }, []);

  // --- Supabase queries ---
  const { data: dbSettings, refetch: refetchSettings } = useDbQuery<HotwordSettings | null>(
    () => hotwordsDb.settings.get(),
    [],
  );
  const { data: dbEntries, refetch: refetchEntries } = useDbQuery<HotwordEntry[]>(
    () => hotwordsDb.entries.list(),
    [],
  );

  useEffect(() => {
    if (dbSettings) {
      setTwitchUsername(dbSettings.twitch_username || "");
      setKickUsername(dbSettings.kick_username || "");
      if (Array.isArray(dbSettings.excluded_words)) {
        setExcludedWords((dbSettings.excluded_words as string[]).join(", "));
      }
    }
  }, [dbSettings]);

  async function handleSaveSettings() {
    try {
      await hotwordsDb.settings.update({
        twitch_username: twitchUsername,
        kick_username: kickUsername,
        excluded_words: excludedWords.split(",").map(w => w.trim()).filter(Boolean),
      });
      await refetchSettings();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClearHotwords() {
    try {
      await hotwordsDb.entries.clearAll();
      await refetchEntries();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <PageHeader
        title="Hot Words"
        actions={
          <div className="flex items-center gap-2">
            {/* Twitch Bot Status — compact inline */}
            <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 mr-1">
              <div className="h-7 w-7 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
              </div>
              <div className="leading-tight">
                <p className="text-xs text-white font-semibold">Twitch Bot</p>
                <p className={`text-[10px] font-bold ${isConnected ? "text-green-400" : "text-red-400"}`}>{isConnected ? "Online" : "Offline"}</p>
              </div>
            </div>
            <Button variant="destructive" className="gap-2" onClick={handleClearHotwords}>
              <Trash2 className="h-4 w-4" />
              Clear Hot Words
            </Button>
            <Button variant="success" className="gap-2" onClick={() => setOverlayOpen(true)}>
              <Monitor className="h-4 w-4" />
              HotWords Overlay
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live Hot Words */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              Live Hot Words
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {dbEntries && dbEntries.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {dbEntries.map((entry) => (
                  <span
                    key={entry.id}
                    className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-primary/15 border border-primary/25 text-primary"
                  >
                    {entry.word} ({entry.count})
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm mb-4">No hot words yet.</p>
            )}
            <div className="flex-1" />
            <Button variant="success" className="gap-2 w-full">
              <Eye className="h-4 w-4" />
              Open Live Preview
            </Button>
          </CardContent>
        </Card>

        {/* Word Filter */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              &#9660; Word Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-3">
            <div>
              <Label className="text-sm font-semibold text-white mb-2 block">Excluded Words</Label>
              <Input
                value={excludedWords}
                onChange={(e) => setExcludedWords(e.target.value)}
                placeholder="Enter words to exclude separated by comma"
              />
              <p className="text-xs text-slate-500 mt-2">
                &#9432; Enter words to exclude from hotwords. Separate words with a comma.
              </p>
            </div>
            <div className="flex-1" />
            <Button variant="success" className="gap-2 w-full" onClick={handleSaveSettings}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base text-white">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <div>
              <Label className="text-sm font-semibold text-white mb-2 block">Twitch Username</Label>
              <Input
                value={twitchUsername}
                onChange={(e) => setTwitchUsername(e.target.value)}
                placeholder="Enter your twitch username"
              />
              <p className="text-xs text-slate-500 mt-1">
                &#9432; Enter your twitch username to enable live hotwords on twitch, leave blank to disable.
              </p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-white mb-2 block">Kick Username</Label>
              <Input
                value={kickUsername}
                onChange={(e) => setKickUsername(e.target.value)}
                placeholder="Enter your kick username"
              />
              <p className="text-xs text-slate-500 mt-1">
                &#9432; Enter your kick username to enable live hotwords on kick, leave blank to disable.
              </p>
            </div>
            <div className="flex-1" />
            <Button variant="success" className="gap-2 w-full" onClick={handleSaveSettings}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Overlay Modal */}
      {overlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOverlayOpen(false)}
          />
          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-xl rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Hot Words Overlay</h2>
              <button
                onClick={() => setOverlayOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Overlay Link */}
              <div>
                <Label className="text-sm font-semibold text-slate-400 mb-2 block">Overlay URL</Label>
                <OverlayLink url={overlayUrl} obsSize="320 × 120" />
              </div>

              {/* Overlay Preview */}
              <div>
                <Label className="text-sm font-semibold text-slate-400 mb-2 block">Preview</Label>
                <div
                  className="rounded-lg p-4 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #080c14 0%, #0f1521 50%, #080c14 100%)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    minHeight: "120px",
                  }}
                >
                  {/* Inline preview matching the overlay */}
                  <div className="inline-block">
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                        padding: "16px 22px",
                        minWidth: "280px",
                      }}
                    >
                      {/* Header */}
                      <div className="mb-3 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <span
                          className="font-bold text-sm tracking-widest"
                          style={{
                            background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)",
                            backgroundSize: "200% 100%",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            animation: "shimmer 3s ease-in-out infinite",
                          }}
                        >
                          HOT WORDS
                        </span>
                      </div>

                      {/* Sample Words */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { word: "GG", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.25)", text: "#ef4444" },
                          { word: "HYPE", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.25)", text: "#10b981" },
                          { word: "LET'S GO", bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.25)", text: "#3b82f6" },
                          { word: "WIN", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.25)", text: "#f59e0b" },
                          { word: "CLUTCH", bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.25)", text: "#8b5cf6" },
                        ].map((item, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                            style={{
                              background: item.bg,
                              border: `1px solid ${item.border}`,
                              color: item.text,
                            }}
                          >
                            {item.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <Button variant="outline" onClick={() => setOverlayOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Flame({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
