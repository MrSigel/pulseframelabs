"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayTheme } from "@/hooks/useOverlayTheme";
import { createClient } from "@/lib/supabase/client";

type Phase = "hidden" | "spinning" | "winner";

function JoinContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();
  const { cssVars } = useOverlayTheme(uid);

  const [phase, setPhase] = useState<Phase>("hidden");
  const [winner, setWinner] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("");

  const startDraw = useCallback((winnerName: string, participantNames: string[]) => {
    setNames(participantNames);
    setWinner(winnerName);
    setPhase("spinning");
    setDisplayName("");

    // Cycle through names rapidly then slow down
    const shuffled = [...participantNames].sort(() => Math.random() - 0.5);
    let idx = 0;
    let delay = 50;
    const tick = () => {
      setDisplayName(shuffled[idx % shuffled.length]);
      idx++;
      delay += 15;
      if (delay < 600) {
        setTimeout(tick, delay);
      } else {
        // Show winner
        setDisplayName(winnerName);
        setPhase("winner");
        // Auto-hide after 10 seconds
        setTimeout(() => {
          setPhase((p) => p === "winner" ? "hidden" : p);
        }, 10000);
      }
    };
    setTimeout(tick, 200);
  }, []);

  // Listen for broadcast draw events
  useEffect(() => {
    if (!uid) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`join-draw-${uid}`)
      .on("broadcast", { event: "draw" }, (payload) => {
        const { winner: w, participants } = payload.payload;
        startDraw(w, participants);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [uid, startDraw]);

  if (phase === "hidden") return null;

  return (
    <div className="flex items-center justify-center min-h-screen animate-fade-in-up" style={cssVars}>
      <div
        className="rounded-2xl overflow-hidden overlay-card-lg text-center px-12 py-10"
        style={{ minWidth: 420 }}
      >
        {phase === "spinning" && (
          <>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
              Drawing...
            </div>
            <div
              className="text-3xl font-black text-white transition-all duration-75"
              style={{
                textShadow: "0 0 20px rgba(59,130,246,0.4)",
              }}
            >
              {displayName || "..."}
            </div>
            <div className="text-xs text-slate-500 mt-3">
              {names.length} participants
            </div>
          </>
        )}

        {phase === "winner" && (
          <>
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-3">
              Winner
            </div>
            <div
              className="text-4xl font-black"
              style={{
                background: "linear-gradient(90deg, var(--overlay-highlight, #f59e0b), #fbbf24, var(--overlay-highlight, #f59e0b))",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 3s ease-in-out infinite",
                textShadow: "0 0 30px rgba(245,158,11,0.3)",
              }}
            >
              {displayName}
            </div>
            <div className="text-xs text-slate-500 mt-3">
              out of {names.length} participants
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function JoinOverlayPage() {
  return (
    <div style={{ background: "transparent" }}>
      <Suspense fallback={null}>
        <JoinContent />
      </Suspense>
    </div>
  );
}
