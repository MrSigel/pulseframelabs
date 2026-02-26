"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 10000, suffix: '+', label: 'Streamers', format: (v) => `${Math.round(v / 1000)}k` },
  { value: 99.9, suffix: '%', label: 'Uptime', format: (v) => v.toFixed(1) },
  { value: 5, prefix: '<', suffix: 'min', label: 'Setup', format: (v) => Math.round(v) },
];

export default function StatsSection() {
  const ref = useRef(null);
  const valueRefs = useRef([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    stats.forEach((stat, i) => {
      const valEl = valueRefs.current[i];
      if (!valEl) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: stat.value,
        duration: 2.5,
        ease: 'power2.out',
        onUpdate: () => {
          valEl.textContent = `${stat.prefix || ''}${stat.format(obj.val)}${stat.suffix}`;
        },
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' },
      });
    });
  }, []);

  return (
    <section ref={ref} className="section" style={{ padding: 'clamp(60px, 8vw, 100px) 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(40px, 6vw, 80px)', flexWrap: 'wrap', maxWidth: '800px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ textAlign: 'center', flex: '1 1 150px' }}>
            <div
              ref={(el) => (valueRefs.current[i] = el)}
              className="font-display"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                fontWeight: 700,
                color: 'var(--gold)',
                lineHeight: 1,
                marginBottom: '8px',
              }}
            >
              {stat.prefix || ''}{stat.format(0)}{stat.suffix}
            </div>
            <div className="text-label" style={{ color: 'var(--text-tertiary)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
