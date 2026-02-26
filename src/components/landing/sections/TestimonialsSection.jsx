"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RevealText from '@/components/landing/ui/RevealText';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const testimonialMeta = [
  { name: 'Ryzen', platform: 'Twitch', accent: 'var(--gold)' },
  { name: 'VelvetSpin', platform: 'Kick', accent: 'var(--champagne)' },
  { name: 'AceBets', platform: 'Twitch', accent: 'var(--rose)' },
  { name: 'LuckyDave', platform: 'YouTube', accent: 'var(--gold)' },
];

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function TestimonialCard({ testimonial }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        borderColor: hovered ? 'var(--border-gold)' : 'var(--border-medium)',
        backgroundColor: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        y: hovered ? -4 : 0,
      }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'relative',
        padding: 'clamp(24px, 3vw, 32px)',
        borderRadius: '12px',
        border: '1px solid var(--border-medium)',
        background: 'var(--bg-card)',
        cursor: 'default',
        overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{ opacity: hovered ? 0.8 : 0.3 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'var(--gradient-gold)',
        }}
      />

      <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
        {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
      </div>

      <p style={{
        fontSize: 'clamp(0.88rem, 1vw, 0.95rem)',
        color: 'var(--text-secondary)',
        lineHeight: 1.75,
        marginBottom: 'clamp(20px, 2.5vw, 28px)',
        fontStyle: 'italic',
      }}>
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${testimonial.accent}, transparent)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          border: '1px solid var(--border-gold)',
        }}>
          {testimonial.name[0]}
        </div>
        <div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: "'Inter', sans-serif",
          }}>{testimonial.name}</div>
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-tertiary)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.03em',
          }}>{testimonial.role} · {testimonial.platform}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const { t } = useLanguage();
  const gridRef = useRef(null);

  const testimonials = testimonialMeta.map((meta, i) => ({
    ...meta,
    role: t.testimonials.roles[i],
    quote: t.testimonials.quotes[i],
  }));

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll(':scope > div');
    gsap.fromTo(cards, { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 80%', toggleActions: 'play none none reverse' },
    });
  }, []);

  return (
    <section className="section" style={{ padding: 'clamp(100px, 14vw, 180px) 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 6vw, 72px)' }}>
          <RevealText as="div" style={{ marginBottom: '16px' }}>
            <span className="text-label" style={{ color: 'var(--gold)' }}>{t.testimonials.label}</span>
          </RevealText>
          <RevealText as="h2" delay={0.1} className="text-display font-display">
            {t.testimonials.title}
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
          {testimonials.map((item, i) => (
            <TestimonialCard key={i} testimonial={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
