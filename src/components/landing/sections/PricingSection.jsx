"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RevealText from '@/components/landing/ui/RevealText';
import GlassCard from '@/components/landing/ui/GlassCard';
import MagneticButton from '@/components/landing/ui/MagneticButton';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function PricingSection() {
  const { t } = useLanguage();
  const cardsRef = useRef(null);

  const plans = t.pricing.plans.map((p, i) => ({
    ...p,
    popular: i === 1,
    bestValue: i === 2,
  }));

  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;
    const items = cards.querySelectorAll('.pricing-card');
    gsap.fromTo(items, { y: 60, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: cards, start: 'top 75%', toggleActions: 'play none none reverse' },
    });
  }, []);

  return (
    <section id="pricing" className="section" style={{ padding: 'clamp(100px, 14vw, 180px) 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 4vw, 56px)' }}>
          <RevealText as="div" style={{ marginBottom: '16px' }}>
            <span className="text-label" style={{ color: 'var(--gold)' }}>{t.pricing.label}</span>
          </RevealText>
          <RevealText as="h2" delay={0.1} className="text-display font-display">{t.pricing.title}</RevealText>
        </div>

        {/* Credit System Info */}
        {t.pricing.creditInfo && (
          <RevealText as="div" delay={0.2} style={{ textAlign: 'center', marginBottom: 'clamp(36px, 5vw, 64px)' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '12px 28px', borderRadius: '12px',
              background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
              backdropFilter: 'blur(12px)',
            }}>
              <span style={{ fontSize: '1.2rem' }}>&#x1FA99;</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>
                {t.pricing.creditInfo}
              </span>
            </div>
          </RevealText>
        )}

        <div ref={cardsRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: 'clamp(14px, 2vw, 20px)',
          maxWidth: '1100px',
          margin: '0 auto',
          perspective: '1000px',
        }}>
          {plans.map(plan => (
            <GlassCard key={plan.name} className="pricing-card" style={{
              display: 'flex', flexDirection: 'column', overflow: 'visible',
              background: plan.popular ? 'var(--pricing-popular-bg)' : 'var(--bg-glass)',
              border: plan.popular ? '1px solid var(--pricing-popular-border)' : '1px solid var(--bg-glass-border)',
            }}>
              {plan.popular && (
                <span style={{
                  position: 'absolute', top: '-10px', right: '20px',
                  fontSize: '0.6rem', fontWeight: 700, padding: '4px 16px', borderRadius: '4px',
                  background: 'var(--gradient-gold)', color: 'var(--text-inverse)',
                  fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.15em',
                }}>{t.pricing.popular}</span>
              )}
              {plan.bestValue && (
                <span style={{
                  position: 'absolute', top: '-10px', right: '20px',
                  fontSize: '0.6rem', fontWeight: 700, padding: '4px 16px', borderRadius: '4px',
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
                  fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.15em',
                }}>{t.pricing.bestValue || 'Best Value'}</span>
              )}

              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{plan.name}</h3>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 700, color: plan.popular ? 'var(--gold)' : 'var(--text-primary)', lineHeight: 1, marginBottom: '4px' }}>{plan.price}</div>
                {plan.priceEur && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600, marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>{plan.priceEur}</div>
                )}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{plan.desc}</p>
              </div>

              <div style={{ flex: 1, marginBottom: '28px' }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--gold)', fontSize: '0.75rem' }}>&#10003;</span>{f}
                  </div>
                ))}
              </div>

              <MagneticButton variant={plan.popular ? 'primary' : 'secondary'} style={{ width: '100%', justifyContent: 'center' }}>
                {plan.cta}
              </MagneticButton>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
