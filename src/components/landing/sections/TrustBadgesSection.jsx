"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const badgeValues = ['99.9%', '<5min', '14+', '24/7', '0'];
const badgeIcons = ['◈', '◇', '◆', '◈', '◇'];

function Badge({ badge }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        borderColor: hovered ? 'var(--border-gold)' : 'var(--border-subtle)',
        scale: hovered ? 1.03 : 1,
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        textAlign: 'center',
        padding: 'clamp(24px, 3vw, 36px) clamp(16px, 2vw, 24px)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        cursor: 'default',
      }}
    >
      <div style={{
        fontSize: '0.75rem',
        color: 'var(--gold)',
        marginBottom: '10px',
        opacity: 0.5,
      }}>{badge.icon}</div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
        fontWeight: 600,
        color: 'var(--text-primary)',
        lineHeight: 1.1,
        marginBottom: '8px',
        background: hovered ? 'var(--gradient-gold)' : 'none',
        WebkitBackgroundClip: hovered ? 'text' : 'unset',
        WebkitTextFillColor: hovered ? 'transparent' : 'var(--text-primary)',
        transition: 'all 0.3s',
      }}>{badge.value}</div>
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 'clamp(0.72rem, 0.9vw, 0.82rem)',
        color: 'var(--text-tertiary)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontWeight: 500,
      }}>{badge.label}</div>
    </motion.div>
  );
}

export default function TrustBadgesSection() {
  const { t } = useLanguage();
  const gridRef = useRef(null);

  const badges = t.trust.labels.map((label, i) => ({
    value: badgeValues[i],
    label,
    icon: badgeIcons[i],
  }));

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const items = grid.querySelectorAll(':scope > div');
    gsap.fromTo(items, { y: 20, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  }, []);

  return (
    <section className="section" style={{
      padding: 'clamp(60px, 8vw, 100px) 0',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--gradient-subtle)',
    }}>
      <div className="container">
        <div ref={gridRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
          gap: 'clamp(8px, 1.5vw, 16px)',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {badges.map((badge, i) => (
            <Badge key={i} badge={badge} />
          ))}
        </div>
      </div>
    </section>
  );
}
