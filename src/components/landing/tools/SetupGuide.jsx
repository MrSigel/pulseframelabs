"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

function StepIcon({ number, active }) {
  return (
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '0.85rem',
      fontFamily: "'Inter', sans-serif",
      flexShrink: 0,
      background: active ? 'var(--gradient-gold)' : 'var(--bg-card)',
      color: active ? 'var(--text-inverse)' : 'var(--text-tertiary)',
      border: active ? 'none' : '1px solid var(--border-subtle)',
      transition: 'all 0.3s',
    }}>
      {number}
    </div>
  );
}

function StepCard({ number, title, children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        gap: '14px',
        padding: '16px',
        borderRadius: '10px',
        border: active ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
        background: active ? 'var(--bg-card-hover)' : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.25s',
      }}
    >
      <StepIcon number={number} active={active} />
      <div style={{ flex: 1 }}>
        <h4 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95rem',
          fontWeight: 600,
          color: active ? 'var(--gold)' : 'var(--text-primary)',
          marginBottom: active ? '10px' : 0,
          transition: 'color 0.2s',
        }}>
          {title}
        </h4>
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                fontFamily: "'Inter', sans-serif",
              }}>
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}

export default function SetupGuide() {
  const { t } = useLanguage();
  const g = t.setupGuide || {};
  const [activeStep, setActiveStep] = useState(0);

  const steps = g.steps || [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}>
          {g.title || 'Setup Guide'}
        </h2>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          fontFamily: "'Inter', sans-serif",
        }}>
          {g.subtitle || 'Follow these steps to get your stream running.'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {steps.map((step, i) => (
          <StepCard
            key={i}
            number={i + 1}
            title={step.title}
            active={activeStep === i}
            onClick={() => setActiveStep(activeStep === i ? -1 : i)}
          >
            {step.lines && step.lines.map((line, j) => (
              <p key={j} style={{ marginBottom: j < step.lines.length - 1 ? '8px' : 0 }}>
                {line}
              </p>
            ))}
          </StepCard>
        ))}
      </div>

      {/* Tip box */}
      <div style={{
        marginTop: '20px',
        padding: '14px 18px',
        borderRadius: '8px',
        border: '1px solid var(--border-gold)',
        background: 'rgba(201, 168, 76, 0.06)',
      }}>
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--gold)',
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          marginBottom: '4px',
        }}>
          {g.tipTitle || 'Pro Tip'}
        </p>
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          fontFamily: "'Inter', sans-serif",
        }}>
          {g.tipText || 'Start with just one or two widgets and add more as you get comfortable.'}
        </p>
      </div>
    </div>
  );
}
