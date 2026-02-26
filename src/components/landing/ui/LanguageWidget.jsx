"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { languages } from '@/i18n/translations';

// ── Minimal Professional Flag SVGs ────────────────────
// Clean geometric flags in small circles — theme-aware borders

function FlagEN() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <clipPath id="en"><circle cx="9" cy="9" r="9"/></clipPath>
      <g clipPath="url(#en)">
        <rect width="18" height="18" fill="#012169"/>
        <path d="M0 0L18 18M18 0L0 18" stroke="#fff" strokeWidth="3"/>
        <path d="M0 0L18 18M18 0L0 18" stroke="#C8102E" strokeWidth="1.5"/>
        <path d="M9 0V18M0 9H18" stroke="#fff" strokeWidth="5"/>
        <path d="M9 0V18M0 9H18" stroke="#C8102E" strokeWidth="3"/>
      </g>
    </svg>
  );
}

function FlagDE() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <clipPath id="de"><circle cx="9" cy="9" r="9"/></clipPath>
      <g clipPath="url(#de)">
        <rect width="18" height="6" fill="#000"/>
        <rect y="6" width="18" height="6" fill="#DD0000"/>
        <rect y="12" width="18" height="6" fill="#FFCC00"/>
      </g>
    </svg>
  );
}

function FlagIT() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <clipPath id="it"><circle cx="9" cy="9" r="9"/></clipPath>
      <g clipPath="url(#it)">
        <rect width="6" height="18" fill="#009246"/>
        <rect x="6" width="6" height="18" fill="#fff"/>
        <rect x="12" width="6" height="18" fill="#CE2B37"/>
      </g>
    </svg>
  );
}

function FlagFR() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <clipPath id="fr"><circle cx="9" cy="9" r="9"/></clipPath>
      <g clipPath="url(#fr)">
        <rect width="6" height="18" fill="#002395"/>
        <rect x="6" width="6" height="18" fill="#fff"/>
        <rect x="12" width="6" height="18" fill="#ED2939"/>
      </g>
    </svg>
  );
}

function FlagTR() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <clipPath id="tr"><circle cx="9" cy="9" r="9"/></clipPath>
      <g clipPath="url(#tr)">
        <rect width="18" height="18" fill="#E30A17"/>
        <circle cx="7.5" cy="9" r="3.6" fill="#fff"/>
        <circle cx="8.4" cy="9" r="2.9" fill="#E30A17"/>
        <polygon points="10.2,9 11.5,7.8 10.8,9.3 12.2,9 10.8,9.7 11.5,10.2" fill="#fff"/>
      </g>
    </svg>
  );
}

function FlagPT() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <clipPath id="pt"><circle cx="9" cy="9" r="9"/></clipPath>
      <g clipPath="url(#pt)">
        <rect width="7" height="18" fill="#006600"/>
        <rect x="7" width="11" height="18" fill="#FF0000"/>
        <circle cx="7" cy="9" r="2.8" fill="#FFCC00" opacity="0.9"/>
      </g>
    </svg>
  );
}

function FlagES() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <clipPath id="es"><circle cx="9" cy="9" r="9"/></clipPath>
      <g clipPath="url(#es)">
        <rect width="18" height="4.5" fill="#AA151B"/>
        <rect y="4.5" width="18" height="9" fill="#F1BF00"/>
        <rect y="13.5" width="18" height="4.5" fill="#AA151B"/>
      </g>
    </svg>
  );
}

const flagComponents = { en: FlagEN, de: FlagDE, it: FlagIT, fr: FlagFR, tr: FlagTR, pt: FlagPT, es: FlagES };

export default function LanguageWidget() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const CurrentFlag = flagComponents[lang] || FlagEN;
  const currentLabel = languages.find(l => l.code === lang)?.label || 'English';

  return (
    <div ref={ref} style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1001,
    }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              marginBottom: '8px',
              minWidth: '180px',
              padding: '6px',
              borderRadius: '10px',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-elevated)',
              boxShadow: 'var(--shadow-lg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {languages.map((l) => {
              const Flag = flagComponents[l.code];
              const isActive = l.code === lang;
              return (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    flexShrink: 0,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <Flag />
                  </span>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                    letterSpacing: '0.02em',
                  }}>
                    {l.label}
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    {l.code}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid var(--border-gold)',
          background: 'var(--bg-elevated)',
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <span style={{
          flexShrink: 0,
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-subtle)',
        }}>
          <CurrentFlag />
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {lang}
        </span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="10" height="10" viewBox="0 0 10 10" fill="none"
        >
          <path d="M2 4L5 7L8 4" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </motion.button>
    </div>
  );
}
