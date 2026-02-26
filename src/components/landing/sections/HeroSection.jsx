"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import MagneticButton from '@/components/landing/ui/MagneticButton';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroSection() {
  const { lang, t } = useLanguage();
  const titleRef = useRef(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const text = t.hero.title;
    el.innerHTML = '';
    const allChars = [];

    text.split(' ').forEach((word, wi, arr) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';

      word.split('').forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.style.willChange = 'transform, opacity';
        wordSpan.appendChild(charSpan);
        allChars.push(charSpan);
      });

      el.appendChild(wordSpan);

      if (wi < arr.length - 1) {
        const space = document.createElement('span');
        space.innerHTML = '&nbsp;';
        space.style.display = 'inline-block';
        space.style.width = '0.25em';
        el.appendChild(space);
        allChars.push(space);
      }
    });

    gsap.fromTo(allChars, { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, stagger: 0.035, ease: 'power4.out', delay: 0.6,
    });
  }, [lang, t.hero.title]);

  return (
    <section className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Gold radial glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '35%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50vw', height: '50vw', maxWidth: '700px', maxHeight: '700px',
        borderRadius: '50%', background: 'var(--gradient-radial)', filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: 'clamp(140px, 18vh, 200px) 0 clamp(80px, 10vh, 120px)' }}>
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ marginBottom: 'clamp(20px, 3vw, 36px)' }}
        >
          <span className="text-label" style={{
            color: 'var(--gold)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ width: '40px', height: '1px', background: 'var(--gradient-gold)' }} />
            {t.hero.label}
            <span style={{ width: '40px', height: '1px', background: 'var(--gradient-gold)' }} />
          </span>
        </motion.div>

        {/* Title */}
        <h1 ref={titleRef} className="text-hero font-display" style={{ maxWidth: '900px', margin: '0 auto', marginBottom: 'clamp(24px, 3vw, 40px)' }}>
          {t.hero.title}
        </h1>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '60px', height: '1px', background: 'var(--gradient-gold)', margin: '0 auto clamp(24px, 3vw, 36px)', transformOrigin: 'center' }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="text-body"
          style={{ maxWidth: '580px', margin: '0 auto', color: 'var(--text-secondary)', marginBottom: 'clamp(36px, 5vw, 56px)', lineHeight: 1.8 }}
        >
          {t.hero.subtitle}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <MagneticButton href="/register" variant="primary">
            {t.hero.cta} <span style={{ marginLeft: '4px' }}>&rarr;</span>
          </MagneticButton>
          <MagneticButton href="#widgets" variant="secondary">
            {t.hero.ctaSecondary}
          </MagneticButton>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2.5, duration: 1.5 }}
          style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)' }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--gold), transparent)' }}
          />
        </motion.div>
      </div>
    </section>
  );
}
