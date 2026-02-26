"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MagneticButton from '@/components/landing/ui/MagneticButton';
import SplitText from '@/components/landing/ui/SplitText';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    gsap.fromTo(content, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
    });
  }, []);

  return (
    <section ref={sectionRef} className="section" style={{ padding: 'clamp(100px, 16vw, 220px) 0', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden="true" style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '60vw', height: '60vw', maxWidth: '800px', maxHeight: '800px',
        borderRadius: '50%', background: 'var(--gradient-radial)', filter: 'blur(100px)', pointerEvents: 'none',
      }} />

      <div ref={contentRef} className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '700px' }}>
        <div style={{ marginBottom: '20px' }}>
          <span className="text-label" style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '30px', height: '1px', background: 'var(--gradient-gold)' }} />
            {t.cta.label}
            <span style={{ width: '30px', height: '1px', background: 'var(--gradient-gold)' }} />
          </span>
        </div>

        <h2 className="text-display font-display" style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
          <SplitText stagger={0.04}>{t.cta.title}</SplitText>
        </h2>

        <div style={{ width: '60px', height: '1px', background: 'var(--gradient-gold)', margin: '0 auto clamp(20px, 3vw, 32px)', opacity: 0.6 }} />

        <p className="text-body" style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', marginBottom: 'clamp(36px, 5vw, 56px)', lineHeight: 1.8 }}>
          {t.cta.subtitle}
        </p>

        <MagneticButton variant="primary" href="/register">
          {t.cta.button} <span style={{ marginLeft: '4px' }}>&rarr;</span>
        </MagneticButton>
      </div>
    </section>
  );
}
