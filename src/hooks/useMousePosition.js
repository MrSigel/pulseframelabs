"use client";

import { useState, useEffect, useRef } from 'react';

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [normalized, setNormalized] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const x = e.clientX;
        const y = e.clientY;
        setPosition({ x, y });
        setNormalized({
          x: (x / window.innerWidth - 0.5) * 2,
          y: (y / window.innerHeight - 0.5) * 2,
        });
      });
    };

    window.addEventListener('mousemove', handler, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handler);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { position, normalized };
}
