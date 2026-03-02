"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RevealText from '@/components/landing/ui/RevealText';
import GlassCard from '@/components/landing/ui/GlassCard';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function SetupSection() {
  const { t } = useLanguage();
  const cardsRef = useRef(null);

  const steps = t.setup.steps.map((s, i) => ({ ...s, number: String(i + 1).padStart(2, '0') }));

  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;
    const items = cards.querySelectorAll('.setup-step');
    gsap.fromTo(items, { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: cards, start: 'top 75%', toggleActions: 'play none none reverse' },
    });
  }, []);

  return (
    <section className="section" style={{ padding: 'clamp(100px, 14vw, 180px) 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 6vw, 80px)' }}>
          <RevealText as="div" style={{ marginBottom: '16px' }}>
            <span className="text-label" style={{ color: 'var(--gold)' }}>{t.setup.label}</span>
          </RevealText>
          <RevealText as="h2" delay={0.1} className="text-display font-display">{t.setup.title}</RevealText>
        </div>

        <div ref={cardsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 'clamp(16px, 2vw, 24px)', maxWidth: '1100px', margin: '0 auto' }}>
          {steps.map(step => (
            <GlassCard key={step.number} className="setup-step">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <span className="font-display" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 0.9, color: 'var(--gold)', opacity: 0.2 }}>{step.number}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '4px 14px', borderRadius: '4px', border: '1px solid var(--border-gold)', color: 'var(--gold)', fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>{step.time}</span>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.1rem, 1.5vw, 1.25rem)', fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)' }}>{step.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{step.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
