"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const shapes = [
  { size: 50, x: '12%', y: '18%', delay: 0 },
  { size: 70, x: '82%', y: '12%', delay: 2 },
  { size: 35, x: '72%', y: '55%', delay: 4 },
  { size: 45, x: '22%', y: '72%', delay: 1.5 },
  { size: 25, x: '88%', y: '78%', delay: 3 },
];

export default function FloatingShapes({ style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = el.querySelectorAll('.floating-shape');
    items.forEach((item, i) => {
      gsap.to(item, {
        y: 'random(-20, 20)',
        x: 'random(-15, 15)',
        rotation: 'random(-10, 10)',
        duration: 'random(8, 14)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: shapes[i]?.delay || 0,
      });
    });

    return () => { items.forEach(item => gsap.killTweensOf(item)); };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      {shapes.map((shape, i) => (
        <div
          key={i}
          className="floating-shape"
          style={{ position: 'absolute', left: shape.x, top: shape.y, willChange: 'transform' }}
        >
          <svg width={shape.size} height={shape.size} viewBox={`0 0 ${shape.size} ${shape.size}`}>
            <rect
              x="4" y="4"
              width={shape.size - 8} height={shape.size - 8}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="0.5"
              opacity="0.15"
              rx="2"
              transform={i % 2 === 0 ? `rotate(45 ${shape.size/2} ${shape.size/2})` : ''}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
