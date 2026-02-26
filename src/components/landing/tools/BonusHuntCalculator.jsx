"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function BonusHuntCalculator() {
  const { t } = useLanguage();
  const tt = t.tools.bonusCalc;

  const [entries, setEntries] = useState([]);
  const [buyInInput, setBuyInInput] = useState('');
  const [winInput, setWinInput] = useState('');

  const addEntry = () => {
    const buyIn = parseFloat(buyInInput);
    const win = parseFloat(winInput);
    if (isNaN(buyIn) || isNaN(win) || buyIn <= 0) return;
    setEntries(prev => [...prev, { buyIn, win }]);
    setBuyInInput('');
    setWinInput('');
  };

  const removeEntry = (idx) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const resetAll = () => {
    setEntries([]);
    setBuyInInput('');
    setWinInput('');
  };

  // Computed stats
  const totalBuyIn = entries.reduce((s, e) => s + e.buyIn, 0);
  const totalWin = entries.reduce((s, e) => s + e.win, 0);
  const profit = totalWin - totalBuyIn;
  const isProfit = profit >= 0;
  const avgMultiplier = entries.length > 0
    ? entries.reduce((s, e) => s + (e.win / e.buyIn), 0) / entries.length
    : 0;
  const avgBuyIn = entries.length > 0 ? totalBuyIn / entries.length : 0;
  const breakEven = avgBuyIn > 0 ? totalBuyIn / entries.length / avgBuyIn : 0;

  let bestIdx = -1, worstIdx = -1;
  if (entries.length > 0) {
    let bestX = -Infinity, worstX = Infinity;
    entries.forEach((e, i) => {
      const x = e.win / e.buyIn;
      if (x > bestX) { bestX = x; bestIdx = i; }
      if (x < worstX) { worstX = x; worstIdx = i; }
    });
  }

  const inputStyle = {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.85rem',
    outline: 'none',
    minWidth: 0,
  };

  const labelStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.65rem',
    fontWeight: 500,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '4px',
  };

  const statStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-card)',
    textAlign: 'center',
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

      {/* Add entry form */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>{tt.buyIn} (€)</div>
          <input
            type="number"
            value={buyInInput}
            onChange={(e) => setBuyInInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEntry()}
            placeholder="2.00"
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>{tt.win} (€)</div>
          <input
            type="number"
            value={winInput}
            onChange={(e) => setWinInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEntry()}
            placeholder="15.00"
            style={inputStyle}
          />
        </div>
        <button
          onClick={addEntry}
          style={{
            padding: '10px 16px',
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
          + {tt.addBonus}
        </button>
      </div>

      {/* Entry list */}
      {entries.length > 0 && (
        <div style={{
          maxHeight: '180px',
          overflowY: 'auto',
          marginBottom: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['#', tt.buyIn, tt.win, tt.multiplier, ''].map((h, i) => (
                  <th key={i} style={{
                    padding: '8px 10px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    textAlign: i === 0 ? 'center' : 'right',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {entries.map((e, i) => {
                  const x = e.win / e.buyIn;
                  const isBest = i === bestIdx;
                  const isWorst = i === worstIdx;
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isBest ? 'rgba(201, 168, 76, 0.06)' : isWorst ? 'rgba(183, 110, 121, 0.06)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        €{e.buyIn.toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        €{e.win.toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: x >= 1 ? 'var(--gold)' : 'var(--rose)', fontWeight: 600 }}>
                        {x.toFixed(2)}x
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'center', width: '30px' }}>
                        <button
                          onClick={() => removeEntry(i)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-tertiary)',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            padding: '2px 4px',
                          }}
                        >
                          ✕
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Stats grid */}
      {entries.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <div style={statStyle}>
            <div style={labelStyle}>{tt.totalBuyIn}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              €{totalBuyIn.toFixed(2)}
            </div>
          </div>
          <div style={statStyle}>
            <div style={labelStyle}>{tt.totalResult}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              €{totalWin.toFixed(2)}
            </div>
          </div>
          <div style={{ ...statStyle, border: `1px solid ${isProfit ? 'var(--gold)' : 'var(--rose)'}` }}>
            <div style={labelStyle}>{isProfit ? tt.profit : tt.loss}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: isProfit ? 'var(--gold)' : 'var(--rose)' }}>
              {isProfit ? '+' : ''}€{profit.toFixed(2)}
            </div>
          </div>
          <div style={statStyle}>
            <div style={labelStyle}>{tt.averageMultiplier}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: avgMultiplier >= 1 ? 'var(--gold)' : 'var(--rose)' }}>
              {avgMultiplier.toFixed(2)}x
            </div>
          </div>
          <div style={statStyle}>
            <div style={labelStyle}>{tt.numberOfBonuses}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {entries.length}
            </div>
          </div>
          <div style={statStyle}>
            <div style={labelStyle}>{tt.averageBuyIn}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              €{avgBuyIn.toFixed(2)}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          borderRadius: '8px',
          border: '1px dashed var(--border-subtle)',
          marginBottom: '16px',
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.85rem',
            color: 'var(--text-tertiary)',
          }}>
            {tt.noData}
          </p>
        </div>
      )}

      {/* Reset button */}
      {entries.length > 0 && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={resetAll}
            style={{
              padding: '8px 24px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
              color: 'var(--text-tertiary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            {tt.reset}
          </button>
        </div>
      )}
    </div>
  );
}
