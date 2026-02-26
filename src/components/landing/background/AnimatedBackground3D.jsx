"use client";

import { useRef, useEffect } from 'react';

// Intensified 3D particle network with perspective projection
// Canvas 2D — no Three.js dependency
// Adapts to dark/light/system theme via data-theme attribute

const PARTICLE_COUNT = 90;
const CONNECTION_DISTANCE = 180;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MOUSE_RADIUS = 250;
const DEPTH = 600;
const FOV = 400;

const COLORS = {
  dark: {
    particle: [201, 168, 76],    // gold
    core: [212, 197, 169],       // champagne
    line: [201, 168, 76],        // gold
  },
  light: {
    particle: [139, 109, 31],    // dark gold
    core: [100, 80, 25],         // deeper gold
    line: [139, 109, 31],        // dark gold
  },
};

function createParticle(w, h) {
  return {
    x: (Math.random() - 0.5) * w * 1.4,
    y: (Math.random() - 0.5) * h * 1.4,
    z: Math.random() * DEPTH,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    vz: (Math.random() - 0.5) * 0.2,
    size: Math.random() * 3 + 1.2,
  };
}

export default function AnimatedBackground3D() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    animId: 0,
    particles: [],
    mouse: { x: -9999, y: -9999 },
    w: 0,
    h: 0,
    time: 0,
    isDark: true,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const state = stateRef.current;

    const checkTheme = () => {
      state.isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      state.w = window.innerWidth;
      state.h = window.innerHeight;
      canvas.width = state.w * dpr;
      canvas.height = state.h * dpr;
      canvas.style.width = state.w + 'px';
      canvas.style.height = state.h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (state.particles.length === 0) {
        state.particles = Array.from({ length: PARTICLE_COUNT }, () =>
          createParticle(state.w, state.h)
        );
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e) => { state.mouse.x = e.clientX; state.mouse.y = e.clientY; };
    const onLeave = () => { state.mouse.x = -9999; state.mouse.y = -9999; };
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    const animate = () => {
      const { w, h, particles, mouse } = state;
      const cx = w * 0.5;
      const cy = h * 0.5;
      const palette = state.isDark ? COLORS.dark : COLORS.light;

      ctx.clearRect(0, 0, w, h);
      state.time += 0.004;
      const t = state.time;

      // Project all particles
      const proj = [];
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Layered organic drift + slow breathing wave
        const waveX = Math.sin(t * 0.5 + i * 0.3) * 0.3;
        const waveY = Math.cos(t * 0.4 + i * 0.5) * 0.3;
        p.x += p.vx + Math.sin(t + i * 0.7) * 0.12 + waveX;
        p.y += p.vy + Math.cos(t + i * 0.4) * 0.12 + waveY;
        p.z += p.vz;

        // Wrap boundaries
        const bx = w * 0.8, by = h * 0.8;
        if (p.x > bx) p.x = -bx;
        if (p.x < -bx) p.x = bx;
        if (p.y > by) p.y = -by;
        if (p.y < -by) p.y = by;
        if (p.z > DEPTH) p.z = 0;
        if (p.z < 0) p.z = DEPTH;

        // Perspective projection
        const scale = FOV / (FOV + p.z);
        const sx = cx + p.x * scale;
        const sy = cy + p.y * scale;
        const sz = p.size * scale;
        const a = 1 - p.z / DEPTH;

        proj.push({ sx, sy, sz, a, z: p.z, i });
      }

      // Sort far-to-near
      proj.sort((a, b) => b.z - a.z);

      // Draw connections with early x-axis rejection
      const [lr, lg, lb] = palette.line;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < proj.length; i++) {
        const a = proj[i];
        for (let j = i + 1; j < proj.length; j++) {
          const b = proj[j];
          const dx = a.sx - b.sx;
          if (dx > CONNECTION_DISTANCE || dx < -CONNECTION_DISTANCE) continue;
          const dy = a.sy - b.sy;
          const d2 = dx * dx + dy * dy;
          if (d2 > CONNECTION_DISTANCE_SQ) continue;

          const d = Math.sqrt(d2);
          const ratio = 1 - d / CONNECTION_DISTANCE;
          const depthA = Math.min(a.a, b.a);
          const opacity = ratio * depthA * (state.isDark ? 0.35 : 0.2);

          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.strokeStyle = `rgba(${lr},${lg},${lb},${opacity})`;
          ctx.stroke();
        }
      }

      // Draw particles
      const [gr, gg, gb] = palette.particle;
      for (let idx = 0; idx < proj.length; idx++) {
        const p = proj[idx];
        let dx = p.sx - mouse.x;
        let dy = p.sy - mouse.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        let px = p.sx;
        let py = p.sy;

        // Mouse repulsion
        if (md < MOUSE_RADIUS && md > 0) {
          const f = (1 - md / MOUSE_RADIUS) * 25;
          px += (dx / md) * f;
          py += (dy / md) * f;
        }

        // Pulse effect: ~8% of particles pulse brighter at any moment
        const pulse = Math.sin(t * 3 + p.i * 1.7) * 0.5 + 0.5;
        const isPulsing = pulse > 0.92;

        // Soft glow halo
        const glowR = p.sz * 14;
        const glowAlpha = p.a * (state.isDark ? 0.12 : 0.06) * (isPulsing ? 1.6 : 1);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        grad.addColorStop(0, `rgba(${gr},${gg},${gb},${glowAlpha})`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
        const [cr, cg, cb] = p.sz > 1.8 ? palette.core : palette.particle;
        const dotAlpha = p.a * (state.isDark ? 0.8 : 0.55) * (isPulsing ? 1.4 : 1);
        ctx.beginPath();
        ctx.arc(px, py, p.sz * (isPulsing ? 1.3 : 1), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${dotAlpha})`;
        ctx.fill();
      }

      state.animId = requestAnimationFrame(animate);
    };

    state.animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(state.animId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
