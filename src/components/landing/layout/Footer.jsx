"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const { t } = useLanguage();
  const ref = useRef(null);

  const footerLinks = [
    { label: t.nav.widgets, href: '#widgets' },
    { label: t.nav.features, href: '#features' },
    { label: t.nav.pricing, href: '#pricing' },
  ];

  useEffect(() => {
    const el = ref.current;
    gsap.fromTo(el, { opacity: 0 }, {
      opacity: 1, duration: 1,
      scrollTrigger: { trigger: el, start: 'top 95%', toggleActions: 'play none none reverse' },
    });
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer ref={ref} style={{ position: 'relative', padding: '48px 0', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {footerLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              style={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'color 0.3s',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/register"
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '8px 20px',
              borderRadius: '4px',
              background: 'var(--gradient-gold)',
              color: 'var(--text-inverse)',
              textDecoration: 'none',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {t.footer.startFree}
          </a>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
          {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
