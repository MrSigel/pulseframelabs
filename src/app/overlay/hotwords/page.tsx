"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";

interface HotwordEntry {
  word: string;
  count: number;
}

function HotwordsOverlayContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();

  const { data: dbEntries, loading } = useOverlayData<HotwordEntry[]>({
    table: "hotword_entries",
    userId: uid,
    orderBy: "count",
    ascending: false,
  });

  // URL param fallback
  const wordsParam = params.get("words") || "";

  const words = useMemo(() => {
    if (uid && dbEntries && dbEntries.length > 0) {
      return dbEntries.map((e) => e.word);
    }
    return wordsParam
      ? wordsParam.split(",").map((w) => w.trim()).filter(Boolean)
      : ["GG", "HYPE", "LET'S GO", "WIN", "CLUTCH"];
  }, [uid, dbEntries, wordsParam]);

  if (uid && loading) {
    return <div className="text-white text-sm animate-pulse">Loading...</div>;
  }

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
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

        {/* Words */}
        <div className="flex flex-wrap gap-2">
          {words.map((word, i) => {
            const colors = [
              { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.25)", text: "#ef4444" },
              { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.25)", text: "#10b981" },
              { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.25)", text: "#3b82f6" },
              { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.25)", text: "#f59e0b" },
              { bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.25)", text: "#8b5cf6" },
            ];
            const c = colors[i % colors.length];

            // Show count badge if we have DB data with counts
            const dbEntry = uid && dbEntries ? dbEntries.find((e) => e.word === word) : null;

            return (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs font-bold tracking-wide inline-flex items-center gap-1.5"
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  color: c.text,
                }}
              >
                {word.toUpperCase()}
                {dbEntry && dbEntry.count > 0 && (
                  <span
                    className="text-[9px] font-semibold opacity-70"
                  >
                    ({dbEntry.count})
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function HotwordsOverlayPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <HotwordsOverlayContent />
      </Suspense>
    </div>
  );
}
