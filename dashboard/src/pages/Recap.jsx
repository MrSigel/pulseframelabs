import { useState, useEffect, useRef, useMemo } from 'react'
import { Download, Calendar, BarChart3 } from 'lucide-react'
import { toPng } from 'html-to-image'
import { useLang } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { getAll } from '../lib/store'

const gold = '#d4af37'

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
}

const DATE_RANGES = ['today', 'last7', 'last30', 'allTime']

function getDateThreshold(range) {
  const now = new Date()
  if (range === 'today') {
    const d = new Date(now); d.setHours(0, 0, 0, 0); return d
  }
  if (range === 'last7') return new Date(now.getTime() - 7 * 86400000)
  if (range === 'last30') return new Date(now.getTime() - 30 * 86400000)
  return new Date(0) // allTime
}

export default function Recap() {
  const { t } = useLang()
  const { mode } = useTheme()
  const isDark = mode === 'dark'
  const tr = t.recap
  const { user } = useAuth()

  const recapRef = useRef(null)
  const [range, setRange] = useState('allTime')
  const [exporting, setExporting] = useState(false)

  const [hunts, setHunts] = useState([])
  const [entries, setEntries] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [wagerSessions, setWagerSessions] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      getAll('bonushunts'),
      getAll('bonushunt_entries'),
      getAll('tournaments'),
      getAll('wager_sessions'),
    ]).then(([h, e, tour, ws]) => {
      setHunts(h)
      setEntries(e)
      setTournaments(tour)
      setWagerSessions(ws)
      setLoaded(true)
    })
  }, [])

  const threshold = useMemo(() => getDateThreshold(range), [range])

  // Filter by date
  const filteredHunts = useMemo(() => hunts.filter(h => new Date(h.created_at) >= threshold), [hunts, threshold])
  const filteredEntries = useMemo(() => {
    const huntIds = new Set(filteredHunts.map(h => h.id))
    return entries.filter(e => huntIds.has(e.bonushunt_id))
  }, [entries, filteredHunts])
  const filteredTournaments = useMemo(() => tournaments.filter(t => new Date(t.created_at) >= threshold), [tournaments, threshold])
  const filteredWager = useMemo(() => wagerSessions.filter(w => new Date(w.created_at) >= threshold), [wagerSessions, threshold])

  // Bonushunt recap
  const totalBuyIn = filteredEntries.reduce((s, e) => s + (Number(e.buy_in) || 0), 0)
  const totalWin = filteredEntries.reduce((s, e) => s + (Number(e.win) || 0), 0)
  const profit = totalWin - totalBuyIn

  const entryStats = filteredEntries.map(e => ({
    name: e.slot_name || e.game || 'Unknown',
    profit: (Number(e.win) || 0) - (Number(e.buy_in) || 0),
  }))
  const bestSlot = entryStats.length > 0 ? entryStats.reduce((best, e) => e.profit > best.profit ? e : best, entryStats[0]) : null
  const worstSlot = entryStats.length > 0 ? entryStats.reduce((worst, e) => e.profit < worst.profit ? e : worst, entryStats[0]) : null

  // Tournament recap
  const tournamentList = filteredTournaments.map(t => ({
    winner: t.winner_name || t.winner || '-',
    prizePool: Number(t.prize_pool) || Number(t.amount) || 0,
  }))

  // Wager recap
  const wagerStart = filteredWager.reduce((s, w) => s + (Number(w.start_balance) || 0), 0)
  const wagerTotal = filteredWager.reduce((s, w) => s + (Number(w.wagered) || Number(w.amount) || 0), 0)
  const wagerProfit = filteredWager.reduce((s, w) => {
    const start = Number(w.start_balance) || 0
    const end = Number(w.end_balance) || 0
    return s + (end - start)
  }, 0)

  const hasData = filteredHunts.length > 0 || filteredTournaments.length > 0 || filteredWager.length > 0

  const handleExport = async () => {
    if (!recapRef.current) return
    setExporting(true)
    try {
      const dataUrl = await toPng(recapRef.current, { backgroundColor: '#08081a' })
      const link = document.createElement('a')
      link.download = `stream-recap-${range}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    }
    setExporting(false)
  }

  if (!loaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ fontSize: 13, color: 'var(--label-color)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with export */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Calendar size={14} style={{ color: gold }} />
          <span style={{ ...S.label, marginBottom: 0 }}>{tr.selectDate}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {DATE_RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)} style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: range === r ? 'rgba(212,175,55,0.12)' : 'transparent',
                border: `1px solid ${range === r ? 'rgba(212,175,55,0.3)' : 'var(--card-border)'}`,
                color: range === r ? gold : 'var(--label-color)', transition: 'all 0.2s',
              }}>
                {tr[r]}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleExport} disabled={exporting || !hasData} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 700, cursor: exporting || !hasData ? 'not-allowed' : 'pointer',
          background: hasData ? `linear-gradient(135deg, ${gold}, #b8962e)` : isDark ? '#1a1818' : '#d8d4cc',
          border: 'none', color: hasData ? '#000' : '#666', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { if (hasData) { e.currentTarget.style.boxShadow = '0 0 18px rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
          <Download size={14} />
          {exporting ? tr.exporting : tr.exportImage}
        </button>
      </div>

      {/* Recap Content */}
      <div ref={recapRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {!hasData ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12 }}>
            <BarChart3 size={32} style={{ color: 'var(--label-color)', opacity: 0.5 }} />
            <div style={{ fontSize: 13, color: 'var(--label-color)' }}>{tr.noRecapData}</div>
          </div>
        ) : (
          <>
            {/* Bonushunt Recap */}
            {filteredHunts.length > 0 && (
              <div>
                <p style={{ ...S.label, marginBottom: 14 }}>{tr.bonushuntRecap}</p>
                <div style={{ ...S.card, padding: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>{tr.totalBuyIn}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--input-text)', fontVariantNumeric: 'tabular-nums' }}>€{totalBuyIn.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>{tr.totalWin}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>€{totalWin.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>{tr.profit}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: profit >= 0 ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>
                        {profit >= 0 ? '+' : ''}€{profit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {bestSlot && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 16, borderTop: '1px solid var(--card-border)' }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>{tr.bestSlot}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>{bestSlot.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--label-color)', marginTop: 2 }}>+€{bestSlot.profit.toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>{tr.worstSlot}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>{worstSlot.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--label-color)', marginTop: 2 }}>€{worstSlot.profit.toFixed(2)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tournament Recap */}
            {filteredTournaments.length > 0 && (
              <div>
                <p style={{ ...S.label, marginBottom: 14 }}>{tr.tournamentRecap}</p>
                <div style={{ ...S.card, padding: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {tournamentList.map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < tournamentList.length - 1 ? '1px solid rgba(212,175,55,0.04)' : 'none' }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--label-color)', marginBottom: 2 }}>{tr.tournamentWinner}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--input-text)' }}>{t.winner}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--label-color)', marginBottom: 2 }}>{tr.prizePool}</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: gold, fontVariantNumeric: 'tabular-nums' }}>€{t.prizePool.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Wager Recap */}
            {filteredWager.length > 0 && (
              <div>
                <p style={{ ...S.label, marginBottom: 14 }}>{tr.wagerRecap}</p>
                <div style={{ ...S.card, padding: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>{tr.startBalance}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--input-text)', fontVariantNumeric: 'tabular-nums' }}>€{wagerStart.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>{tr.sessionSummary}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: gold, fontVariantNumeric: 'tabular-nums' }}>€{wagerTotal.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>{tr.profit}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: wagerProfit >= 0 ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>
                        {wagerProfit >= 0 ? '+' : ''}€{wagerProfit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
