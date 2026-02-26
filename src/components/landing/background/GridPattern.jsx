"use client";

export default function GridPattern({ style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        ...style,
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="var(--text-tertiary)" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-dots)" />
      </svg>
    </div>
  );
}
