"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const PRESETS = [5, 10, 15, 30, 60];

export default function StreamCountdown() {
  const { t } = useLanguage();
  const tt = t.tools.countdown;

  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [phase, setPhase] = useState('setup'); // setup | running | paused | done
  const [customMin, setCustomMin] = useState('');
  const [customSec, setCustomSec] = useState('');
  const intervalRef = useRef(null);

  const startTimer = useCallback((seconds) => {
    setTotalSeconds(seconds);
    setRemaining(seconds);
    setPhase('running');
  }, []);

  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setPhase('done');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [phase]);

  const pause = () => {
    clearInterval(intervalRef.current);
    setPhase('paused');
  };

  const resume = () => {
    setPhase('running');
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setPhase('setup');
    setTotalSeconds(0);
    setRemaining(0);
  };

  const startCustom = () => {
    const min = parseInt(customMin) || 0;
    const sec = parseInt(customSec) || 0;
    const total = min * 60 + sec;
    if (total > 0) {
      startTimer(total);
      setCustomMin('');
      setCustomSec('');
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const circumference = 2 * Math.PI * 72;
  const strokeDashoffset = circumference * (1 - progress);

  const inputStyle = {
    width: '70px',
    padding: '10px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.9rem',
    textAlign: 'center',
    outline: 'none',
  };

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          fontWeight: 600,
          color: 'var(--gold)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {tt.description}
        </span>
      </div>
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(1.3rem, 2vw, 1.6rem)',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 'clamp(20px, 2.5vw, 28px)',
      }}>
        {tt.title}
      </h3>

      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Presets */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.7rem',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '10px',
              }}>
                {tt.presets}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PRESETS.map(min => (
                  <button
                    key={min}
                    onClick={() => startTimer(min * 60)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    {min} {tt.minutes}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom */}
            <div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.7rem',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '10px',
              }}>
                {tt.custom}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  placeholder="00"
                  min="0"
                  max="999"
                  style={inputStyle}
                />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  {tt.minutes}
                </span>
                <input
                  type="number"
                  value={customSec}
                  onChange={(e) => setCustomSec(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startCustom()}
                  placeholder="00"
                  min="0"
                  max="59"
                  style={inputStyle}
                />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  {tt.seconds}
                </span>
                <button
                  onClick={startCustom}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--gradient-gold)',
                    color: 'var(--text-inverse)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tt.start}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {(phase === 'running' || phase === 'paused' || phase === 'done') && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center' }}
          >
            {/* Progress ring */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="80" cy="80" r="72"
                  fill="none"
                  stroke="var(--border-subtle)"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="80" cy="80" r="72"
                  fill="none"
                  stroke={phase === 'done' ? 'var(--rose)' : 'var(--gold)'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}>
                <AnimatePresence mode="wait">
                  {phase === 'done' ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--gold)',
                        textAlign: 'center',
                      }}
                    >
                      {tt.timeUp}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="time"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                        fontWeight: 700,
                        color: phase === 'paused' ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {formatTime(remaining)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {phase === 'running' && (
                <button onClick={pause} style={{
                  padding: '10px 28px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-gold)',
                  background: 'transparent',
                  color: 'var(--gold)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {tt.pause}
                </button>
              )}
              {phase === 'paused' && (
                <button onClick={resume} style={{
                  padding: '10px 28px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'var(--gradient-gold)',
                  color: 'var(--text-inverse)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {tt.resume}
                </button>
              )}
              <button onClick={reset} style={{
                padding: '10px 28px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                background: 'transparent',
                color: 'var(--text-tertiary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {tt.reset}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
