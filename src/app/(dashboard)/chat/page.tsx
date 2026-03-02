"use client";

import { PageHeader } from "@/components/page-header";
import { OverlayLink } from "@/components/overlay-link";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MessageCircle, Info, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { chatMessages as chatDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useAuthUid } from "@/hooks/useAuthUid";
import type { ChatMessage } from "@/lib/supabase/types";

type Platform = "twitch" | "kick" | "restream";

const platforms: { key: Platform; label: string; color: string; badge: string; info: string }[] = [
  {
    key: "twitch",
    label: "Twitch",
    color: "border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20",
    badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    info: "Aktiviere den Bot auf der Bot-Seite — er liest deinen Twitch-Chat direkt mit.",
  },
  {
    key: "kick",
    label: "Kick",
    color: "border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20",
    badge: "bg-green-500/15 text-green-300 border-green-500/30",
    info: "Kick-Chat via Restream an Twitch weiterleiten → Twitch Bot liest automatisch mit.",
  },
  {
    key: "restream",
    label: "Restream",
    color: "border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20",
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    info: "Verbinde Restream → Chat landet automatisch in Twitch, der Bot liest alles mit.",
  },
];

const tabs = [
  { key: "small", label: "Overlay Small", path: "chat_small" },
  { key: "normal", label: "Overlay Normal", path: "chat_normal" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function ChatPage() {
  const uid = useAuthUid();
  const [activeTab, setActiveTab] = useState<TabKey>("small");
  const [platform, setPlatform] = useState<Platform>("twitch");
  const { data: dbMessages } = useDbQuery<ChatMessage[]>(() => chatDb.list(), []);

  useEffect(() => {
    const saved = localStorage.getItem("chat_platform") as Platform | null;
    if (saved && platforms.some((p) => p.key === saved)) setPlatform(saved);
  }, []);

  function handlePlatform(p: Platform) {
    setPlatform(p);
    localStorage.setItem("chat_platform", p);
  }

  const activePlatform = platforms.find((p) => p.key === platform)!;

  const overlayUrls = useMemo(() => {
    if (typeof window === "undefined") return { small: "", normal: "" };
    const origin = window.location.origin;
    return {
      small: `${origin}/overlay/chat_small?uid=${uid || ""}`,
      normal: `${origin}/overlay/chat_normal?uid=${uid || ""}`,
    };
  }, [uid]);

  return (
    <div>
      <PageHeader title="Chat Overlay" />

      {/* Platform Selector */}
      <div className="max-w-3xl mx-auto mb-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-semibold text-slate-300">Streaming-Plattform</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${activePlatform.badge}`}>
                {activePlatform.label}
              </span>
            </div>
            <div className="flex gap-2 mb-3">
              {platforms.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handlePlatform(p.key)}
                  className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    platform === p.key
                      ? p.color + " ring-1 ring-inset ring-current"
                      : "border-white/[0.08] bg-white/[0.03] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-500" />
              <span>{activePlatform.info}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          {/* Tabs */}
          <div className="border-b border-white/[0.06] mb-5">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 px-4 text-sm font-medium relative transition-colors ${
                    activeTab === tab.key ? "text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                      style={{ animation: "tabSlide 0.2s ease-out" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Overlay Link - changes per tab */}
          <OverlayLink url={activeTab === "small" ? overlayUrls.small : overlayUrls.normal} obsSize={activeTab === "small" ? "300 × 200" : "420 × 250"} />

          {/* Preview */}
          <div className="mt-5">
            <Label className="text-sm font-semibold text-slate-400 mb-2 block">Preview</Label>
            <div
              className="rounded-lg p-5 flex flex-col items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #080c14 0%, #0f1521 50%, #080c14 100%)",
                border: "1px solid rgba(255,255,255,0.04)",
                minHeight: activeTab === "normal" ? "280px" : "200px",
              }}
            >
              {activeTab === "small" ? (
                <div className="animate-fade-in-up w-full max-w-xs">
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.15)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <MessageCircle className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Chat</span>
                    </div>
                    <div className="px-3 py-3 space-y-2">
                      <div className="flex gap-2 items-start">
                        <span className="text-[10px] font-bold text-primary shrink-0">Viewer1:</span>
                        <span className="text-[10px] text-slate-400">Hello chat!</span>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="text-[10px] font-bold text-green-400 shrink-0">Mod:</span>
                        <span className="text-[10px] text-slate-400">Welcome!</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in-up w-full max-w-sm">
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.15)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div className="flex items-center gap-2.5 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Live Chat</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] text-slate-500 font-semibold">LIVE</span>
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-2.5 min-h-[160px]">
                      <div className="flex gap-2.5 items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[8px] font-bold text-primary">V</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-primary">Viewer1</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">Hello chat!</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[8px] font-bold text-green-400">M</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-green-400">Moderator</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">Welcome everyone!</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[8px] font-bold text-purple-400">S</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-purple-400">Subscriber</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">Let&apos;s go!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
