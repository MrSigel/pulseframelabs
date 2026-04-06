import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Percent, Trophy, DollarSign, Flame, Target } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { getAll } from '../lib/store'

const gold = '#d4af37'

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
}

export default function Analytics() {
  const { t } = useLang()
  const { mode } = useTheme()
  const isDark = mode === 'dark'
  const ta = t.analytics
  const { user } = useAuth()

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

  // Computed stats
  const totalHunts = hunts.length
  const huntProfits = hunts.map(h => {
    const huntEntries = entries.filter(e => e.bonushunt_id === h.id)
    const totalBuyIn = huntEntries.reduce((s, e) => s + (Number(e.buy_in) || 0), 0)
    const totalWin = huntEntries.reduce((s, e) => s + (Number(e.win) || 0), 0)
    return { name: h.name || `Hunt #${h.id}`, profit: totalWin - totalBuyIn, buyIn: totalBuyIn, win: totalWin }
  })
  const totalProfit = huntProfits.reduce((s, h) => s + h.profit, 0)
  const avgMultiplier = huntProfits.length > 0
    ? huntProfits.reduce((s, h) => s + (h.buyIn > 0 ? h.win / h.buyIn : 0), 0) / huntProfits.length
    : 0
  const totalTournaments = tournaments.length

  // Wager stats
  const totalWagered = wagerSessions.reduce((s, w) => s + (Number(w.wagered) || Number(w.amount) || 0), 0)
  const biggestSession = wagerSessions.reduce((max, w) => {
    const val = Number(w.wagered) || Number(w.amount) || 0
    return val > max ? val : max
  }, 0)

  // Tournament win rate
  const tournamentsWon = tournaments.filter(t => t.winner_id === user?.id).length
  const winRate = totalTournaments > 0 ? ((tournamentsWon / totalTournaments) * 100).toFixed(1) : '0.0'

  // Chart data — top 10 hunts by absolute profit
  const chartHunts = [...huntProfits].sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit)).slice(0, 10)
  const maxProfit = Math.max(...chartHunts.map(h => Math.abs(h.profit)), 1)

  const statCards = [
    { label: ta.totalBonushunts, value: totalHunts, icon: BarChart3 },
    { label: ta.totalProfit, value: `€${totalProfit.toFixed(2)}`, icon: TrendingUp, color: totalProfit >= 0 ? '#34d399' : '#f87171' },
    { label: ta.avgMultiplier, value: `${avgMultiplier.toFixed(2)}x`, icon: Percent },
    { label: ta.totalTournaments, value: totalTournaments, icon: Trophy },
  ]

  if (!loaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ fontSize: 13, color: 'var(--label-color)' }}>Loading...</div>
      </div>
    )
  }

  if (totalHunts === 0 && totalTournaments === 0 && wagerSessions.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
        <BarChart3 size={32} style={{ color: 'var(--label-color)', opacity: 0.5 }} />
        <div style={{ fontSize: 13, color: 'var(--label-color)' }}>{ta.noData}</div>
      </div>
    )
  }

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} style={{
              ...S.card, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
              }}>
                <Icon size={18} style={{ color: card.color || gold }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 4 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: card.color || gold, fontVariantNumeric: 'tabular-nums' }}>
                  {card.value}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bonushunt Stats — Bar Chart */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ ...S.label, marginBottom: 14 }}>{ta.bonushuntStats}</p>
        <div style={{ ...S.card, padding: 20 }}>
          {chartHunts.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--label-color)', textAlign: 'center', padding: 20 }}>{ta.noData}</div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, padding: '0 4px' }}>
                {chartHunts.map((h, i) => {
                  const pct = Math.max((Math.abs(h.profit) / maxProfit) * 100, 5)
                  const isPositive = h.profit >= 0
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: isPositive ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>
                        {isPositive ? '+' : ''}{h.profit.toFixed(0)}
                      </div>
                      <div style={{
                        width: '100%', maxWidth: 40, borderRadius: '6px 6px 2px 2px',
                        height: `${pct}%`,
                        background: isPositive
                          ? 'linear-gradient(180deg, #d4af37, #b8962e)'
                          : 'linear-gradient(180deg, #f87171, #dc2626)',
                        transition: 'height 0.6s cubic-bezier(0.16,1,0.3,1)',
                        minHeight: 4,
                      }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {chartHunts.map((h, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: 'var(--label-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Wager Stats */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ ...S.label, marginBottom: 14 }}>{ta.wagerStats}</p>
        <div style={{ ...S.card, padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>
                {ta.totalWagered}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: gold, fontVariantNumeric: 'tabular-nums' }}>
                €{totalWagered.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>
                {ta.biggestSession}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: gold, fontVariantNumeric: 'tabular-nums' }}>
                €{biggestSession.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Stats */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ ...S.label, marginBottom: 14 }}>{ta.tournamentStats}</p>
        <div style={{ ...S.card, padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>
                {ta.totalTournaments}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: gold, fontVariantNumeric: 'tabular-nums' }}>
                {totalTournaments}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 }}>
                {ta.winRate}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: gold, fontVariantNumeric: 'tabular-nums' }}>
                {winRate}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
