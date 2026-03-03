"use client";

import { motion } from 'framer-motion';

const icons = {
  on: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
    </svg>
  ),
  off: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
      <path d="M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),
};

export default function AnimationToggle({ enabled, onToggle, compact = false }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={enabled ? 'Disable background animation' : 'Enable background animation'}
      aria-label={`Background animation: ${enabled ? 'On' : 'Off'}`}
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
        key={enabled ? 'on' : 'off'}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', alignItems: 'center', color: 'var(--gold)' }}
      >
        {enabled ? icons.on : icons.off}
      </motion.span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {enabled ? 'FX' : 'FX'}
      </span>
    </motion.button>
  );
}
