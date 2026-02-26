"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useCallback } from "react";

function PokerChipOverlay({ size = 60 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className="animate-spin-chip">
      <circle cx="24" cy="24" r="23" fill="#0a0f1a" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      <circle cx="24" cy="24" r="20.5" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="3.5" strokeDasharray="5.5 7.6" strokeLinecap="round" />
      <circle cx="24" cy="24" r="17.5" fill="#0c1220" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <circle cx="24" cy="24" r="13" fill="none" stroke="rgba(239,68,68,0.35)" strokeWidth="0.8" strokeDasharray="3 3" />
      <circle cx="24" cy="24" r="10" fill="#0d1322" stroke="rgba(239,68,68,0.3)" strokeWidth="0.8" />
      <path d="M24 16 L30 24 L24 32 L18 24 Z" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.5)" strokeWidth="0.6" />
      <circle cx="24" cy="24" r="2.5" fill="#ef4444" opacity="0.7" />
      <circle cx="24" cy="24" r="1.2" fill="#fff" opacity="0.6" />
      <ellipse cx="20" cy="18" rx="5" ry="3" fill="rgba(255,255,255,0.04)" transform="rotate(-30 20 18)" />
    </svg>
  );
}

function SpinnerOverlayContent() {
  const params = useSearchParams();
  const prizesParam = params.get("prizes") || "";
  const colorsParam = params.get("colors") || "";

  const prizes = prizesParam ? prizesParam.split(",") : ["Prize 1", "Prize 2", "Prize 3", "Prize 4"];
  const colors = colorsParam
    ? colorsParam.split(",")
    : ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const segAngle = 360 / prizes.length;
  const wheelSize = 300;
  const totalSize = wheelSize + 24;
  const wheelCenter = wheelSize / 2;

  const spin = useCallback(() => {
    if (spinning || prizes.length === 0) return;
    setSpinning(true);
    setWinner(null);
    const extra = 1800 + Math.random() * 1800;
    const newRotation = rotation + extra;
    setRotation(newRotation);
    setTimeout(() => {
      const normalizedAngle = newRotation % 360;
      const pointerAngle = (360 - normalizedAngle + 90) % 360;
      const winnerIdx = Math.floor(pointerAngle / segAngle) % prizes.length;
      setWinner(prizes[winnerIdx]);
      setSpinning(false);
    }, 4500);
  }, [spinning, rotation, prizes, segAngle]);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="relative" style={{ width: totalSize, height: totalSize }}>
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
            background: "conic-gradient(from 0deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.06) 100%)",
            border: "2px solid rgba(255,255,255,0.06)",
            boxShadow: "0 0 50px rgba(0,0,0,0.6), inset 0 0 25px rgba(0,0,0,0.3)",
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
                stroke="rgba(255,255,255,0.12)"
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
            transition: spinning ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
            boxShadow: "0 0 30px rgba(0,0,0,0.5), inset 0 0 35px rgba(0,0,0,0.25)",
            border: "2px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Segment divider lines */}
          <svg className="absolute inset-0" width={wheelSize} height={wheelSize} style={{ zIndex: 2 }}>
            {segmentLines.map((line, i) => (
              <line key={i} x1={wheelCenter} y1={wheelCenter} x2={line.x2} y2={line.y2} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            ))}
            {segmentLines.map((line, i) => (
              <line key={`w${i}`} x1={wheelCenter} y1={wheelCenter} x2={line.x2} y2={line.y2} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
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

        {/* Center poker chip (clickable) */}
        <div
          className="absolute cursor-pointer"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            filter: "drop-shadow(0 0 16px rgba(239,68,68,0.35))",
          }}
          onClick={spin}
        >
          <PokerChipOverlay size={64} />
        </div>
      </div>

      {/* Winner display */}
      {winner && (
        <div
          className="animate-fade-in-up rounded-lg px-6 py-3 text-center"
          style={{
            background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Winner</p>
          <p className="text-white font-bold text-lg">{winner}</p>
        </div>
      )}
    </div>
  );
}

export default function SpinnerOverlayPage() {
  return (
    <div style={{ background: "transparent" }}>
      <Suspense fallback={<div className="text-white text-sm p-4">Loading...</div>}>
        <SpinnerOverlayContent />
      </Suspense>
    </div>
  );
}
