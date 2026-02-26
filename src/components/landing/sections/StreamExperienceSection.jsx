"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RevealText from '@/components/landing/ui/RevealText';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

function ExperienceCard({ item, index }) {
  const [hovered, setHovered] = useState(false);
  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        borderColor: hovered ? 'var(--border-gold)' : 'var(--border-medium)',
        backgroundColor: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
      }}
      transition={{ duration: 0.35 }}
      style={{
        position: 'relative',
        padding: 'clamp(28px, 3.5vw, 40px)',
        borderRadius: '12px',
        border: '1px solid var(--border-medium)',
        background: 'var(--bg-card)',
        cursor: 'default',
        overflow: 'hidden',
      }}
    >
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        fontWeight: 600,
        color: hovered ? 'var(--gold)' : 'var(--text-tertiary)',
        letterSpacing: '0.05em',
        transition: 'color 0.3s',
        display: 'block',
        marginBottom: '16px',
      }}>{num}</span>

      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(1.15rem, 1.6vw, 1.35rem)',
        fontWeight: 500,
        color: 'var(--text-primary)',
        lineHeight: 1.3,
        marginBottom: '12px',
      }}>{item.title}</h3>

      <p style={{
        fontSize: 'clamp(0.85rem, 1vw, 0.92rem)',
        color: 'var(--text-secondary)',
        lineHeight: 1.7,
        marginBottom: '20px',
      }}>{item.desc}</p>

      <div style={{
        display: 'inline-block',
        padding: '6px 14px',
        borderRadius: '20px',
        border: '1px solid var(--border-gold)',
        fontSize: '0.72rem',
        fontFamily: "'JetBrains Mono', monospace",
        color: 'var(--gold)',
        letterSpacing: '0.03em',
        fontWeight: 500,
      }}>{item.detail}</div>

      <motion.div
        animate={{ opacity: hovered ? 0.12 : 0.04 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          bottom: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--gold)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}

export default function StreamExperienceSection() {
  const { t } = useLanguage();
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll(':scope > div');
    gsap.fromTo(cards, { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 80%', toggleActions: 'play none none reverse' },
    });
  }, []);

  return (
    <section className="section" style={{ padding: 'clamp(100px, 14vw, 180px) 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 6vw, 72px)' }}>
          <RevealText as="div" style={{ marginBottom: '16px' }}>
            <span className="text-label" style={{ color: 'var(--gold)' }}>{t.experience.label}</span>
          </RevealText>
          <RevealText as="h2" delay={0.1} className="text-display font-display">
            {t.experience.title}
          </RevealText>
          <RevealText as="p" delay={0.2} style={{
            maxWidth: '520px',
            margin: '20px auto 0',
            fontSize: 'clamp(0.9rem, 1.1vw, 1rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}>
            {t.experience.subtitle}
          </RevealText>
          <div style={{ width: '60px', height: '1px', background: 'var(--gradient-gold)', margin: '24px auto 0', opacity: 0.6 }} />
        </div>

        <div ref={gridRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(12px, 2vw, 20px)',
          maxWidth: '1000px',
          margin: '0 auto',
        }}>
          {t.experience.cards.map((item, i) => (
            <ExperienceCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
