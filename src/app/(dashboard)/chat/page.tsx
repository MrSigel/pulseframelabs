"use client";

import { PageHeader } from "@/components/page-header";
import { OverlayLink } from "@/components/overlay-link";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { chatMessages as chatDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { ChatMessage } from "@/lib/supabase/types";

const tabs = [
  { key: "small", label: "Overlay Small", path: "chat_small" },
  { key: "normal", label: "Overlay Normal", path: "chat_normal" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("small");
  const { data: dbMessages } = useDbQuery<ChatMessage[]>(() => chatDb.list(), []);

  const overlayUrls = useMemo(() => {
    if (typeof window === "undefined") return { small: "", normal: "" };
    const origin = window.location.origin;
    return {
      small: `${origin}/overlay/chat_small`,
      normal: `${origin}/overlay/chat_normal`,
    };
  }, []);

  return (
    <div>
      <PageHeader title="Chat Overlay" />

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
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-500"
                      style={{ animation: "tabSlide 0.2s ease-out" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Overlay Link - changes per tab */}
          <OverlayLink url={activeTab === "small" ? overlayUrls.small : overlayUrls.normal} />

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
                      <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Chat</span>
                    </div>
                    <div className="px-3 py-3 space-y-2">
                      <div className="flex gap-2 items-start">
                        <span className="text-[10px] font-bold text-blue-400 shrink-0">Viewer1:</span>
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
                      <MessageCircle className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Live Chat</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] text-slate-500 font-semibold">LIVE</span>
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-2.5 min-h-[160px]">
                      <div className="flex gap-2.5 items-start">
                        <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[8px] font-bold text-blue-400">V</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-blue-400">Viewer1</span>
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
