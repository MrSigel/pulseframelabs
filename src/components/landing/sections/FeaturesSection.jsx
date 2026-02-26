"use client";

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import RevealText from '@/components/landing/ui/RevealText';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

function FeatureItem({ feature, index }) {
  const [hovered, setHovered] = useState(false);
  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      className="feature-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        borderColor: hovered ? 'var(--border-gold)' : 'var(--border-subtle)',
        backgroundColor: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
      }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: 'clamp(16px, 2vw, 22px)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        cursor: 'default',
      }}
    >
      <span style={{
        flexShrink: 0,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        fontWeight: 600,
        color: hovered ? 'var(--gold)' : 'var(--text-tertiary)',
        lineHeight: 1.7,
        transition: 'color 0.3s',
        letterSpacing: '0.05em',
      }}>{num}</span>
      <span style={{
        fontSize: 'clamp(0.85rem, 1vw, 0.95rem)',
        color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        lineHeight: 1.6,
        transition: 'color 0.3s',
      }}>{feature}</span>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const { t } = useLanguage();
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = list.querySelectorAll('.feature-item');
    gsap.fromTo(items, { y: 20, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power3.out',
      scrollTrigger: { trigger: list, start: 'top 75%', toggleActions: 'play none none reverse' },
    });
  }, []);

  return (
    <section id="features" className="section" style={{ padding: 'clamp(100px, 14vw, 180px) 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 6vw, 80px)' }}>
          <RevealText as="div" style={{ marginBottom: '16px' }}>
            <span className="text-label" style={{ color: 'var(--gold)' }}>{t.features.label}</span>
          </RevealText>
          <RevealText as="h2" delay={0.1} className="text-display font-display">
            {t.features.title}
          </RevealText>
          <div style={{ width: '60px', height: '1px', background: 'var(--gradient-gold)', margin: '24px auto 0', opacity: 0.6 }} />
        </div>

        <div ref={listRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(8px, 1.5vw, 14px)',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {t.features.list.map((feature, i) => (
            <FeatureItem key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
