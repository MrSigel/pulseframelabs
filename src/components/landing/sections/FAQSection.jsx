"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RevealText from '@/components/landing/ui/RevealText';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      animate={{
        borderColor: open ? 'var(--border-gold)' : 'var(--border-medium)',
        backgroundColor: open ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        boxShadow: open ? 'var(--shadow-glow-accent)' : 'none',
      }}
      transition={{ duration: 0.35 }}
      style={{
        borderRadius: '10px',
        border: '1px solid var(--border-medium)',
        background: 'var(--bg-card)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: 'clamp(18px, 2.5vw, 24px)',
          textAlign: 'left',
          gap: '14px',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
        }}
      >
        <span style={{
          flexShrink: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          fontWeight: 600,
          color: open ? 'var(--gold)' : 'var(--text-tertiary)',
          letterSpacing: '0.05em',
          transition: 'color 0.3s',
        }}>{num}</span>
        <span style={{
          flex: 1,
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.4,
        }}>{faq.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{
            flexShrink: 0,
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1px solid',
            borderColor: open ? 'var(--gold)' : 'var(--border-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            color: 'var(--gold)',
            fontWeight: 300,
          }}
        >+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 clamp(18px, 2.5vw, 24px) clamp(18px, 2.5vw, 24px)',
              paddingLeft: 'calc(clamp(18px, 2.5vw, 24px) + 14px + 2.2em)',
            }}>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                maxWidth: '580px',
              }}>{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const { t } = useLanguage();
  const itemsRef = useRef(null);

  useEffect(() => {
    const items = itemsRef.current;
    if (!items) return;
    const faqItems = items.querySelectorAll(':scope > div');
    gsap.fromTo(faqItems, { y: 20, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: items, start: 'top 80%', toggleActions: 'play none none reverse' },
    });
  }, []);

  return (
    <section className="section" style={{ padding: 'clamp(100px, 14vw, 180px) 0' }}>
      <div className="container-narrow">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 6vw, 64px)' }}>
          <RevealText as="div" style={{ marginBottom: '16px' }}>
            <span className="text-label" style={{ color: 'var(--gold)' }}>{t.faq.label}</span>
          </RevealText>
          <RevealText as="h2" delay={0.1} className="text-display font-display">{t.faq.title}</RevealText>
          <div style={{ width: '60px', height: '1px', background: 'var(--gradient-gold)', margin: '24px auto 0', opacity: 0.6 }} />
        </div>
        <div ref={itemsRef} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.2vw, 12px)' }}>
          {t.faq.items.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)}
        </div>
      </div>
    </section>
  );
}
