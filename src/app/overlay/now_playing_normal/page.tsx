"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";

interface GameRow {
  name: string;
  provider: string;
  image_url: string | null;
}

function NowPlayingNormalContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();

  const { data: dbGame, loading } = useOverlayData<GameRow>({
    table: "games",
    userId: uid,
    filter: { is_playing: true },
    single: true,
  });

  // DB values (when uid present and data loaded) or URL param fallback
  const game = uid && dbGame ? dbGame.name : (params.get("game") || "Sweet Bonanza");
  const provider = uid && dbGame ? dbGame.provider : (params.get("provider") || "PRAGMATIC PLAY");
  const image = uid && dbGame ? (dbGame.image_url || "") : (params.get("image") || "");

  // Stats not in DB — always from URL params
  const potential = params.get("potential") || "21100X";
  const rtp = params.get("rtp") || "96.5%";
  const volatility = params.get("volatility") || "MEDIUM";
  const recordWin = params.get("win") || "0$";
  const recordX = params.get("x") || "0X";
  const avgWin = params.get("avg") || "0";

  if (uid && loading) {
    return <div className="text-white text-sm animate-pulse">Loading...</div>;
  }

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          minWidth: "520px",
        }}
      >
        <div className="flex items-stretch">
          {/* Game Image */}
          <div className="w-[130px] shrink-0 relative overflow-hidden">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={game} className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1a73e833, #1a73e811)" }}
              >
                <span className="text-xs font-bold text-white/50 text-center px-2">{game}</span>
              </div>
            )}
            {/* Gradient overlay on right edge */}
            <div
              className="absolute inset-y-0 right-0 w-6"
              style={{ background: "linear-gradient(to right, transparent, #0c1018)" }}
            />
          </div>

          {/* Info Section */}
          <div className="flex-1 flex items-stretch divide-x divide-white/[0.06]">
            {/* Current Game */}
            <div className="flex-1 px-4 py-4 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px]" style={{ color: "#ef4444" }}>&#9654;</span>
                <span
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: "#94a3b8" }}
                >
                  CURRENT GAME
                </span>
              </div>
              <p className="text-white font-bold text-sm leading-tight">{game}</p>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#64748b" }}>{provider.toUpperCase()}</p>
            </div>

            {/* Info */}
            <div className="flex-1 px-4 py-4 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div
                  className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}
                >
                  i
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#3b82f6" }}>
                  INFO
                </span>
              </div>
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>POTENTIAL</span>
                  <span className="text-white font-bold">{potential}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>RTP</span>
                  <span className="text-white font-bold">{rtp}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>VOLATILITY</span>
                  <span className="text-white font-bold">{volatility}</span>
                </div>
              </div>
            </div>

            {/* Personal Record */}
            <div className="flex-1 px-4 py-4 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div
                  className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px]"
                  style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}
                >
                  &#9679;
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#ef4444" }}>
                  PERSONAL RECORD
                </span>
              </div>
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>WIN</span>
                  <span className="text-white font-bold">{recordWin}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>X</span>
                  <span className="text-white font-bold">{recordX}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>AVG-WIN</span>
                  <span className="text-white font-bold">{avgWin}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NowPlayingNormalPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <NowPlayingNormalContent />
      </Suspense>
    </div>
  );
}
