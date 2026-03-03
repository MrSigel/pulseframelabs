"use client";

import { motion } from 'framer-motion';

const icons = {
  dark: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M14 8.5a6 6 0 01-7.5 5.8A6 6 0 018.5 2a6 6 0 005.5 6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  light: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  system: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 13h4M8 11v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const labels = { dark: 'Dark', light: 'Light', system: 'Auto' };

export default function ThemeToggleWidget({ preference, onCycle, compact = false }) {
  return (
    <motion.button
      onClick={onCycle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Theme: ${labels[preference]}`}
      aria-label={`Switch theme. Current: ${labels[preference]}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? '6px' : '8px',
        padding: compact ? '7px 12px' : '10px 16px',
        borderRadius: compact ? '6px' : '8px',
        border: '1px solid var(--border-gold)',
        background: 'var(--bg-elevated)',
        boxShadow: compact ? 'none' : 'var(--shadow-md)',
        cursor: 'pointer',
        backdropFilter: compact ? 'none' : 'blur(20px)',
        WebkitBackdropFilter: compact ? 'none' : 'blur(20px)',
      }}
    >
      <motion.span
        key={preference}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', alignItems: 'center', color: 'var(--gold)' }}
      >
        {icons[preference]}
      </motion.span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {labels[preference]}
      </span>
    </motion.button>
  );
}
