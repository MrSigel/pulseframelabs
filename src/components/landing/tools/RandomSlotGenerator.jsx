"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { slotProviders } from '@/data/slotProviders';

export default function RandomSlotGenerator() {
  const { t } = useLanguage();
  const tt = t.tools.randomSlot;

  const [filterProvider, setFilterProvider] = useState('all');
  const [phase, setPhase] = useState('idle'); // idle | spinning | result
  const [displayProvider, setDisplayProvider] = useState('');
  const [displayGame, setDisplayGame] = useState('');
  const intervalRef = useRef(null);

  const getPool = useCallback(() => {
    if (filterProvider === 'all') return slotProviders;
    return slotProviders.filter(p => p.id === filterProvider);
  }, [filterProvider]);

  const startSpin = () => {
    setPhase('spinning');
    let tick = 0;
    const maxTicks = 22;
    const speeds = [60, 60, 60, 80, 80, 80, 100, 100, 100, 120, 120, 150, 150, 180, 200, 220, 260, 300, 360, 440, 520, 600];

    const pool = getPool();

    const doTick = () => {
      const rp = pool[Math.floor(Math.random() * pool.length)];
      const rg = rp.games[Math.floor(Math.random() * rp.games.length)];
      setDisplayProvider(rp.name);
      setDisplayGame(rg);
      tick++;
      if (tick >= maxTicks) {
        setPhase('result');
        return;
      }
      intervalRef.current = setTimeout(doTick, speeds[tick] || 600);
    };
    doTick();
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, []);

  const reset = () => {
    setPhase('idle');
    setDisplayProvider('');
    setDisplayGame('');
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
        marginBottom: 'clamp(24px, 3vw, 32px)',
      }}>
        {tt.title}
      </h3>

      {/* Provider filter */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--text-tertiary)',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {tt.selectProvider}
        </label>
        <select
          value={filterProvider}
          onChange={(e) => { setFilterProvider(e.target.value); if (phase === 'result') reset(); }}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.85rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">{tt.allProviders}</option>
          {slotProviders.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Display area */}
      <div style={{
        minHeight: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center',
                padding: '32px',
                borderRadius: '10px',
                border: '1px dashed var(--border-subtle)',
                width: '100%',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.3 }}>🎰</div>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                color: 'var(--text-tertiary)',
              }}>
                {tt.description}
              </p>
            </motion.div>
          )}

          {phase === 'spinning' && (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center',
                padding: '24px',
                borderRadius: '10px',
                border: '1px solid var(--border-gold)',
                background: 'var(--bg-card)',
                width: '100%',
              }}
            >
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                color: 'var(--gold)',
                marginBottom: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {tt.spinning}
              </div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}>
                {displayProvider}
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}>
                {displayGame}
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                textAlign: 'center',
                padding: 'clamp(24px, 3vw, 32px)',
                borderRadius: '12px',
                border: '1px solid var(--border-gold)',
                background: 'var(--bg-card)',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '15%',
                right: '15%',
                height: '1px',
                background: 'var(--gradient-gold)',
              }} />

              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                color: 'var(--gold)',
                marginBottom: '16px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {tt.result}
              </div>

              <div style={{ marginBottom: '8px' }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.6rem',
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {tt.provider}
                </span>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginTop: '4px',
                }}>
                  {displayProvider}
                </div>
              </div>

              <div style={{
                width: '40px',
                height: '1px',
                background: 'var(--gradient-gold)',
                margin: '12px auto',
                opacity: 0.5,
              }} />

              <div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.6rem',
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {tt.game}
                </span>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginTop: '4px',
                }}>
                  {displayGame}
                </div>
              </div>

              <motion.div
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  bottom: '-30px',
                  right: '-30px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'var(--gold)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action button */}
      <div style={{ textAlign: 'center' }}>
        {phase === 'idle' && (
          <button
            onClick={startSpin}
            style={{
              padding: '12px 40px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--gradient-gold)',
              color: 'var(--text-inverse)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {tt.start}
          </button>
        )}
        {phase === 'spinning' && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.05em',
          }}>
            {tt.spinning}
          </div>
        )}
        {phase === 'result' && (
          <button
            onClick={reset}
            style={{
              padding: '12px 40px',
              borderRadius: '6px',
              border: '1px solid var(--border-gold)',
              background: 'transparent',
              color: 'var(--gold)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {tt.tryAgain}
          </button>
        )}
      </div>
    </div>
  );
}
