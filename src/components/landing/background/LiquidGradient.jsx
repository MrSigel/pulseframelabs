"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function LiquidGradient({ style = {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const blobs = el.querySelectorAll('.gradient-blob');
    blobs.forEach((blob, i) => {
      gsap.to(blob, {
        x: `random(-100, 100)`,
        y: `random(-100, 100)`,
        scale: `random(0.85, 1.2)`,
        duration: `random(10, 18)`,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 3,
      });
    });

    return () => { blobs.forEach(blob => gsap.killTweensOf(blob)); };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {/* Warm gold glow */}
      <div
        className="gradient-blob"
        style={{
          position: 'absolute',
          top: '5%',
          left: '15%',
          width: 'clamp(300px, 45vw, 600px)',
          height: 'clamp(300px, 45vw, 600px)',
          borderRadius: '50%',
          background: 'var(--gold)',
          opacity: 0.04,
          filter: 'blur(120px)',
          animation: 'morph 22s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      {/* Champagne accent */}
      <div
        className="gradient-blob"
        style={{
          position: 'absolute',
          top: '45%',
          right: '10%',
          width: 'clamp(200px, 35vw, 500px)',
          height: 'clamp(200px, 35vw, 500px)',
          borderRadius: '50%',
          background: 'var(--champagne)',
          opacity: 0.03,
          filter: 'blur(130px)',
          animation: 'morph 28s ease-in-out infinite reverse',
          willChange: 'transform',
        }}
      />
      {/* Rose hint */}
      <div
        className="gradient-blob"
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '35%',
          width: 'clamp(180px, 30vw, 400px)',
          height: 'clamp(180px, 30vw, 400px)',
          borderRadius: '50%',
          background: 'var(--rose)',
          opacity: 0.025,
          filter: 'blur(110px)',
          animation: 'morph 20s ease-in-out infinite',
          animationDelay: '-7s',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
