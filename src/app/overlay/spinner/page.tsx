"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useOverlayTheme } from "@/hooks/useOverlayTheme";
import { createClient } from "@/lib/supabase/client";

interface SpinnerPrizeRow {
  prize: string;
  color: string;
  position: number;
}

function PokerChipOverlay({ size = 60 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className="animate-spin-chip">
      <circle cx="24" cy="24" r="23" fill="rgba(10,15,26,0.85)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      <circle cx="24" cy="24" r="20.5" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="3.5" strokeDasharray="5.5 7.6" strokeLinecap="round" />
      <circle cx="24" cy="24" r="17.5" fill="rgba(12,18,32,0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <circle cx="24" cy="24" r="13" fill="none" stroke="rgba(239,68,68,0.35)" strokeWidth="0.8" strokeDasharray="3 3" />
      <circle cx="24" cy="24" r="10" fill="rgba(13,19,34,0.85)" stroke="rgba(239,68,68,0.3)" strokeWidth="0.8" />
      <path d="M24 16 L30 24 L24 32 L18 24 Z" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.5)" strokeWidth="0.6" />
      <circle cx="24" cy="24" r="2.5" fill="#ef4444" opacity="0.7" />
      <circle cx="24" cy="24" r="1.2" fill="#fff" opacity="0.6" />
      <ellipse cx="20" cy="18" rx="5" ry="3" fill="rgba(255,255,255,0.04)" transform="rotate(-30 20 18)" />
    </svg>
  );
}

type OverlayPhase = "hidden" | "spinning" | "winner" | "fade-out";

function SpinnerOverlayContent() {
  const params = useSearchParams();
  const uid = useOverlayUid();
  const { cssVars } = useOverlayTheme(uid);

  const { data: dbPrizes, loading } = useOverlayData<SpinnerPrizeRow[]>({
    table: "spinner_prizes",
    userId: uid,
    orderBy: "position",
    ascending: true,
  });

  // URL param fallback
  const prizesParam = params.get("prizes") || "";
  const colorsParam = params.get("colors") || "";

  const { prizes, colors } = useMemo(() => {
    if (uid && dbPrizes && dbPrizes.length > 0) {
      return {
        prizes: dbPrizes.map((p) => p.prize),
        colors: dbPrizes.map((p) => p.color),
      };
    }
    return {
      prizes: prizesParam ? prizesParam.split(",") : ["Prize 1", "Prize 2", "Prize 3", "Prize 4"],
      colors: colorsParam ? colorsParam.split(",") : ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"],
    };
  }, [uid, dbPrizes, prizesParam, colorsParam]);

  const [rotation, setRotation] = useState(0);
  const [phase, setPhase] = useState<OverlayPhase>("hidden");
  const [winner, setWinner] = useState<string | null>(null);

  const segAngle = 360 / prizes.length;
  const wheelSize = 300;
  const totalSize = wheelSize + 24;
  const wheelCenter = wheelSize / 2;

  const rotationRef = useRef(rotation);
  rotationRef.current = rotation;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const spinWithRotation = useCallback((extra: number, duration: number) => {
    if (phaseRef.current === "spinning") return;
    if (prizes.length === 0) return;

    setWinner(null);
    setPhase("spinning");

    const newRotation = rotationRef.current + extra;
    setRotation(newRotation);

    setTimeout(() => {
      const normalizedAngle = newRotation % 360;
      const pointerAngle = (360 - normalizedAngle + 90) % 360;
      const winnerIdx = Math.floor(pointerAngle / segAngle) % prizes.length;
      setWinner(prizes[winnerIdx]);
      setPhase("winner");

      // Auto fade out after 6 seconds
      setTimeout(() => {
        setPhase("fade-out");
        setTimeout(() => setPhase("hidden"), 800);
      }, 6000);
    }, duration);
  }, [prizes, segAngle]);

  // Listen for broadcast spin events from the dashboard
  useEffect(() => {
    if (!uid) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`spinner-spin-${uid}`)
      .on("broadcast", { event: "spin" }, (payload) => {
        const { rotation: extra, duration } = payload.payload;
        spinWithRotation(extra, duration);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid, spinWithRotation]);

  const conicStops = prizes
    .map((_, i) => {
      const c = colors[i % colors.length];
      const start = (i / prizes.length) * 100;
      const end = ((i + 1) / prizes.length) * 100;
      return `${c} ${start}% ${end}%`;
    })
    .join(", ");

  const segmentLines = prizes.map((_, i) => {
    const angle = (360 / prizes.length) * i - 90;
    const rad = (angle * Math.PI) / 180;
    const r = wheelCenter - 2;
    return { x2: wheelCenter + Math.cos(rad) * r, y2: wheelCenter + Math.sin(rad) * r };
  });

  if (uid && loading) return null;

  // Hidden — nothing renders (fully transparent for OBS)
  if (phase === "hidden") return null;

  const isVisible = phase === "spinning" || phase === "winner";
  const isFadingOut = phase === "fade-out";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-6"
      style={{
        ...cssVars,
        opacity: isFadingOut ? 0 : 1,
        transition: isFadingOut ? "opacity 0.8s ease-out" : "opacity 0.4s ease-in",
        animation: isVisible && !isFadingOut ? "fade-in-up 0.5s ease-out forwards" : undefined,
      }}
    >
      <div className="relative" style={{ width: totalSize, height: totalSize, opacity: 0.92 }}>
        {/* Pointer */}
        <div
          className="absolute z-20"
          style={{ top: -4, left: "50%", transform: "translateX(-50%)" }}
        >
          <div style={{
            width: 0,
            height: 0,
            borderLeft: "13px solid transparent",
            borderRight: "13px solid transparent",
            borderTop: "22px solid #ef4444",
            filter: "drop-shadow(0 2px 10px rgba(239,68,68,0.6))",
          }} />
        </div>

        {/* Outer decorative ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.01) 75%, rgba(255,255,255,0.04) 100%)",
            border: "2px solid rgba(255,255,255,0.04)",
            boxShadow: "0 0 40px rgba(0,0,0,0.2)",
          }}
        />

        {/* Tick marks */}
        <svg className="absolute inset-0" width={totalSize} height={totalSize} style={{ zIndex: 1 }}>
          {Array.from({ length: 48 }).map((_, i) => {
            const a = (360 / 48) * i - 90;
            const rad = (a * Math.PI) / 180;
            const cx = totalSize / 2;
            const cy = totalSize / 2;
            const outerR = totalSize / 2 - 2;
            const innerR = totalSize / 2 - (i % 6 === 0 ? 10 : 6);
            return (
              <line
                key={i}
                x1={cx + Math.cos(rad) * innerR}
                y1={cy + Math.sin(rad) * innerR}
                x2={cx + Math.cos(rad) * outerR}
                y2={cy + Math.sin(rad) * outerR}
                stroke="rgba(255,255,255,0.10)"
                strokeWidth={i % 6 === 0 ? "1.5" : "0.5"}
              />
            );
          })}
        </svg>

        {/* Wheel */}
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            top: 12,
            left: 12,
            width: wheelSize,
            height: wheelSize,
            background: `conic-gradient(${conicStops})`,
            transform: `rotate(${rotation}deg)`,
            transition: phase === "spinning" ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
            border: "2px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 20px rgba(0,0,0,0.2), inset 0 0 25px rgba(0,0,0,0.1)",
          }}
        >
          {/* Segment divider lines */}
          <svg className="absolute inset-0" width={wheelSize} height={wheelSize} style={{ zIndex: 2 }}>
            {segmentLines.map((line, i) => (
              <line key={i} x1={wheelCenter} y1={wheelCenter} x2={line.x2} y2={line.y2} stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
            ))}
            {segmentLines.map((line, i) => (
              <line key={`w${i}`} x1={wheelCenter} y1={wheelCenter} x2={line.x2} y2={line.y2} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            ))}
          </svg>

          {/* Prize labels */}
          {prizes.map((prize, i) => {
            const angle = segAngle * i + segAngle / 2 - 90;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  top: "50%",
                  left: "50%",
                  width: wheelCenter - 16,
                  transform: `rotate(${angle}deg) translateX(26%)`,
                  transformOrigin: "0 0",
                  zIndex: 3,
                }}
              >
                <span
                  className="text-[12px] font-bold block truncate"
                  style={{
                    color: "#fff",
                    textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)",
                    maxWidth: wheelCenter - 50,
                  }}
                >
                  {prize}
                </span>
              </div>
            );
          })}
        </div>

        {/* Center poker chip */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            filter: "drop-shadow(0 0 12px rgba(239,68,68,0.25))",
          }}
        >
          <PokerChipOverlay size={64} />
        </div>
      </div>

      {/* Winner display */}
      {winner && phase === "winner" && (
        <div
          className="animate-fade-in-up rounded-xl px-8 py-4 text-center"
          style={{
            background: "rgba(12, 16, 24, 0.70)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.25), 0 0 30px rgba(16, 185, 129, 0.08)",
          }}
        >
          <p className="text-emerald-400 font-bold text-xl">{winner}</p>
        </div>
      )}
    </div>
  );
}

export default function SpinnerOverlayPage() {
  return (
    <div style={{ background: "transparent" }}>
      <Suspense fallback={null}>
        <SpinnerOverlayContent />
      </Suspense>
    </div>
  );
}
