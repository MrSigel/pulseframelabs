"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { slotStats } from '@/data/slotStats';

const volOrder = { low: 0, medium: 1, high: 2, extreme: 3 };
const volColors = { low: '#4ade80', medium: '#facc15', high: '#f97316', extreme: '#ef4444' };

export default function SlotVolatilityComparer() {
  const { t } = useLanguage();
  const tt = t.tools.volatility;

  const [slotA, setSlotA] = useState('');
  const [slotB, setSlotB] = useState('');

  const dataA = slotStats.find(s => s.id === slotA);
  const dataB = slotStats.find(s => s.id === slotB);

  const volLabel = (v) => tt[v] || v;

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.85rem',
    cursor: 'pointer',
    outline: 'none',
  };

  const labelStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.6rem',
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '4px',
  };

  const valueStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  };

  const renderSlotCard = (data, side) => {
    if (!data) return (
      <div style={{
        flex: 1,
        padding: '24px 16px',
        borderRadius: '10px',
        border: '1px dashed var(--border-subtle)',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
      }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          {tt.selectSlot}
        </p>
      </div>
    );

    const rows = [
      { label: tt.provider, value: data.provider },
      { label: tt.rtp, value: `${data.rtp}%` },
      {
        label: tt.volatilityLabel,
        value: volLabel(data.volatility),
        color: volColors[data.volatility],
      },
      { label: tt.maxWin, value: data.maxWin },
      { label: tt.hitFrequency, value: data.hitFrequency },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          flex: 1,
          padding: 'clamp(16px, 2vw, 24px)',
          borderRadius: '10px',
          border: '1px solid var(--border-medium)',
          background: 'var(--bg-card)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'var(--gradient-gold)',
          opacity: 0.5,
        }} />
        <h4 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          {data.name}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rows.map((row) => (
            <div key={row.label}>
              <div style={labelStyle}>{row.label}</div>
              <div style={{ ...valueStyle, color: row.color || valueStyle.color }}>
                {row.value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
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

      {/* Slot selectors */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <select value={slotA} onChange={(e) => setSlotA(e.target.value)} style={selectStyle}>
            <option value="">{tt.selectSlot} A</option>
            {slotStats.map(s => (
              <option key={s.id} value={s.id} disabled={s.id === slotB}>{s.name}</option>
            ))}
          </select>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontFamily: "'Playfair Display', serif",
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--gold)',
        }}>
          {tt.vs}
        </div>
        <div style={{ flex: 1 }}>
          <select value={slotB} onChange={(e) => setSlotB(e.target.value)} style={selectStyle}>
            <option value="">{tt.selectSlot} B</option>
            {slotStats.map(s => (
              <option key={s.id} value={s.id} disabled={s.id === slotA}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison cards */}
      {(!dataA && !dataB) ? (
        <div style={{
          textAlign: 'center',
          padding: '32px',
          borderRadius: '10px',
          border: '1px dashed var(--border-subtle)',
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.85rem',
            color: 'var(--text-tertiary)',
          }}>
            {tt.selectBoth}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px' }}>
          {renderSlotCard(dataA, 'A')}
          {renderSlotCard(dataB, 'B')}
        </div>
      )}

      {/* Highlight winners */}
      {dataA && dataB && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid var(--border-gold)',
          background: 'var(--bg-card)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: tt.rtp, a: dataA.rtp, b: dataB.rtp, higher: true },
              { label: tt.volatilityLabel, a: volOrder[dataA.volatility], b: volOrder[dataB.volatility], higher: true },
            ].map(({ label, a, b, higher }) => {
              const winner = higher ? (a > b ? 'A' : a < b ? 'B' : '-') : (a < b ? 'A' : a > b ? 'B' : '-');
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ ...labelStyle, margin: 0, flex: 1 }}>{label}</span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: winner === '-' ? 'var(--text-tertiary)' : 'var(--gold)',
                  }}>
                    {winner === '-' ? '=' : winner === 'A' ? `← ${dataA.name}` : `${dataB.name} →`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
