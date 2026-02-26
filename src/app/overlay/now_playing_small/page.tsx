"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function NowPlayingSmallContent() {
  const params = useSearchParams();
  const game = params.get("game") || "Sweet Bonanza";
  const provider = params.get("provider") || "PRAGMATIC PLAY";
  const image = params.get("image") || "";

  return (
    <div className="inline-block animate-fade-in-up">
      <div
        className="rounded-lg overflow-hidden flex items-center"
        style={{
          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
        }}
      >
        {/* Game Image */}
        <div className="w-[56px] h-[56px] shrink-0 relative overflow-hidden">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={game} className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1a73e833, #1a73e811)" }}
            >
              <span className="text-[8px] font-bold text-white/50 text-center px-1">{game}</span>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px]" style={{ color: "#ef4444" }}>&#9654;</span>
            <span className="text-white font-bold text-xs">{game}</span>
          </div>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#64748b" }}>{provider.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}

export default function NowPlayingSmallPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <NowPlayingSmallContent />
      </Suspense>
    </div>
  );
}
