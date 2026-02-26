"use client";

import { useLanguage } from '@/context/LanguageContext';

function Diamond() {
  return (
    <span aria-hidden="true" style={{
      flexShrink: 0,
      width: '6px',
      height: '6px',
      background: 'var(--gradient-gold)',
      transform: 'rotate(45deg)',
      opacity: 0.35,
    }} />
  );
}

function MarqueeRow({ items, reverse = false, speed = 30, large = false }) {
  const duration = items.length * speed / 10;
  const fontSize = large ? 'clamp(1.05rem, 1.8vw, 1.35rem)' : 'clamp(0.8rem, 1.2vw, 0.95rem)';
  const textColor = large ? 'var(--text-secondary)' : 'var(--text-tertiary)';
  const gap = large ? 'clamp(36px, 5vw, 60px)' : 'clamp(28px, 4vw, 48px)';

  return (
    <div style={{
      display: 'flex',
      overflow: 'hidden',
      padding: large ? '18px 0' : '12px 0',
      maskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap,
        animation: `${reverse ? 'marquee-reverse' : 'marquee'} ${duration}s linear infinite`,
        willChange: 'transform',
      }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap,
          }}>
            <Diamond />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize,
              fontWeight: large ? 500 : 400,
              color: textColor,
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}>
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MarqueeSection() {
  const { t } = useLanguage();

  return (
    <section className="section" style={{
      padding: 'clamp(20px, 4vw, 40px) 0',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--gradient-subtle)',
    }}>
      <MarqueeRow items={t.marquee} speed={35} large />
      <div aria-hidden="true" style={{
        width: '60%',
        maxWidth: '600px',
        height: '1px',
        background: 'var(--divider)',
        opacity: 0.3,
        margin: '0 auto',
      }} />
      <MarqueeRow items={t.marquee} reverse speed={40} />
    </section>
  );
}
