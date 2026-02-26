"use client";

export default function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: 'var(--noise-opacity)',
        mixBlendMode: 'overlay',
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="200%"
          height="200%"
          x="-50%"
          y="-50%"
          filter="url(#noise-filter)"
          style={{ animation: 'noise 8s steps(10) infinite' }}
        />
      </svg>
    </div>
  );
}
