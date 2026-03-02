"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RevealText from '@/components/landing/ui/RevealText';
import GlassCard from '@/components/landing/ui/GlassCard';
import MagneticButton from '@/components/landing/ui/MagneticButton';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function DemoDealsSection() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.demo-card');
    gsap.fromTo(cards, { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play none none reverse' },
    });
  }, []);

  return (
    <section className="section" style={{ padding: 'clamp(80px, 12vw, 160px) 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 4vw, 56px)' }}>
          <RevealText as="div" style={{ marginBottom: '16px' }}>
            <span className="text-label" style={{ color: 'var(--gold)' }}>
              {t.demoDeals?.label || 'YOUR BRAND'}
            </span>
          </RevealText>
          <RevealText as="h2" delay={0.1} className="text-display font-display">
            {t.demoDeals?.title || 'Your Website. Your Deals.'}
          </RevealText>
          <RevealText as="p" delay={0.2} style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '16px auto 0', fontSize: '1rem', lineHeight: 1.7 }}>
            {t.demoDeals?.subtitle || 'Every streamer gets a professional website and can close exclusive deals directly through the platform.'}
          </RevealText>
        </div>

        <div ref={sectionRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(16px, 2vw, 24px)',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {/* Streamer Website Card */}
          <GlassCard className="demo-card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
            {/* Mini website mockup */}
            <div style={{
              background: 'linear-gradient(135deg, #0c1018, #111827)',
              padding: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {/* Browser chrome mockup */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                {/* Title bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: 'rgba(0,0,0,0.2)',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                  <div style={{
                    flex: 1, marginLeft: '8px', padding: '3px 12px',
                    borderRadius: '4px', background: 'rgba(255,255,255,0.05)',
                    fontSize: '9px', color: 'var(--text-tertiary)',
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    pulseframelabs.com/s/yourname
                  </div>
                </div>

                {/* Website content mockup */}
                <div style={{ padding: '16px' }}>
                  {/* Header area */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--gold), #d4a853)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, color: '#000',
                    }}>S</div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>StreamerName</div>
                      <div style={{ fontSize: '8px', color: 'var(--text-tertiary)', fontFamily: "'Inter', sans-serif" }}>Casino Streamer</div>
                    </div>
                    <div style={{
                      marginLeft: 'auto',
                      padding: '3px 8px', borderRadius: '4px',
                      background: 'rgba(16,185,129,0.15)',
                      fontSize: '8px', fontWeight: 700, color: '#10b981',
                      fontFamily: "'Inter', sans-serif", textTransform: 'uppercase',
                    }}>Live</div>
                  </div>

                  {/* Promo cards */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['Stake', 'Roobet', 'Gamdom'].map((name) => (
                      <div key={name} style={{
                        flex: 1, padding: '8px 6px', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{name}</div>
                        <div style={{ fontSize: '7px', color: 'var(--gold)', fontFamily: "'Inter', sans-serif" }}>Exclusive Deal</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ padding: '20px 24px' }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.1rem', fontWeight: 600,
                color: 'var(--text-primary)', marginBottom: '8px',
              }}>
                {t.demoDeals?.websiteTitle || 'Your Streamer Page'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t.demoDeals?.websiteDesc || 'Get your own branded website at pulseframelabs.com/s/yourname — show off your casino deals, promo codes, and stream schedule to your viewers.'}
              </p>
            </div>
          </GlassCard>

          {/* Casino Deals Card */}
          <GlassCard className="demo-card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
            {/* Deals mockup */}
            <div style={{
              background: 'linear-gradient(135deg, #0c1018, #111827)',
              padding: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Stake.com', bonus: '200% Deposit Bonus', color: '#3b82f6' },
                  { name: 'Roobet', bonus: 'Free $50 Play', color: '#eab308' },
                  { name: 'Gamdom', bonus: '15% Rakeback', color: '#10b981' },
                ].map((deal) => (
                  <div key={deal.name} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: `${deal.color}20`,
                      border: `1px solid ${deal.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 800, color: deal.color,
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {deal.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{deal.name}</div>
                      <div style={{ fontSize: '9px', color: deal.color, fontFamily: "'Inter', sans-serif" }}>{deal.bonus}</div>
                    </div>
                    <div style={{
                      padding: '4px 10px', borderRadius: '4px',
                      background: `${deal.color}15`,
                      border: `1px solid ${deal.color}30`,
                      fontSize: '8px', fontWeight: 700, color: deal.color,
                      fontFamily: "'Inter', sans-serif", textTransform: 'uppercase',
                    }}>
                      Claim
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ padding: '20px 24px' }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.1rem', fontWeight: 600,
                color: 'var(--text-primary)', marginBottom: '8px',
              }}>
                {t.demoDeals?.dealsTitle || 'Exclusive Casino Deals'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t.demoDeals?.dealsDesc || 'Close partnerships with top casinos directly through our platform. Manage promo codes, track referrals, and showcase deals on your streamer page.'}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(32px, 4vw, 48px)' }}>
          <MagneticButton href="/register" variant="primary">
            {t.demoDeals?.cta || 'Get Your Website'}
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
