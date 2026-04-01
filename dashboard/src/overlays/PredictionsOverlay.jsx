import { useEffect, useState } from 'react'
import { getAllPublic, getOnePublic, onTableChange } from '../lib/store'
import { Trophy, Target } from 'lucide-react'

export const DEFAULT_THEME = {
  bgColor:       '10,10,22',
  bgColorLight:  '255,255,255',
  bgOpacity:     0.92,
  blur:          12,
  accentColor:   '99,102,241',
  textPrimary:   '#ffffff',
  textSecondary: '#a0a0d0',
  textMuted:     '#44447a',
  borderRadius:  12,
  borderWidth:   1,
  showBorder:    true,
  padding:       20,
  fontSize:      1,
  fontFamily:    'monospace',
  glow:          true,
}

const RANK_MEDALS = ['#fbbf24', '#94a3b8', '#cd7c3a']

export default function PredictionsOverlay({ theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [session, setSession]   = useState(null)
  const [entries, setEntries]   = useState([])
  const [round, setRound]       = useState(null)
  const [votes, setVotes]       = useState([])

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    getOnePublic('pfl_predictions_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    getOnePublic('pfl_theme_mode', uid).then(v => {
      if (v === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
  }, [uid, themeProp])

  const loadGuess = () => {
    // uid is optional - fallback to logged-in user
    getAllPublic('guess_sessions', uid).then(sessions => {
      const active = sessions.find(s => s.status === 'open' || s.status === 'closed' || s.status === 'finished') || null
      setSession(active)
      if (active) {
        getAllPublic('guess_entries', uid).then(allEntries => {
          setEntries(allEntries.filter(e => e.session_id === active.id))
        })
      } else {
        setEntries([])
      }
    })
  }

  const loadPrediction = () => {
    // uid is optional - fallback to logged-in user
    getAllPublic('prediction_rounds', uid).then(rounds => {
      const active = rounds.find(r => r.status === 'open' || r.status === 'locked' || r.status === 'resolved') || null
      setRound(active)
      if (active) {
        getAllPublic('prediction_votes', uid).then(allVotes => {
          setVotes(allVotes.filter(v => v.round_id === active.id))
        })
      } else {
        setVotes([])
      }
    })
  }

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    loadGuess()
    loadPrediction()
    const off1 = onTableChange('guess_sessions', loadGuess)
    const off2 = onTableChange('guess_entries', loadGuess)
    const off3 = onTableChange('prediction_rounds', loadPrediction)
    const off4 = onTableChange('prediction_votes', loadPrediction)
    return () => { off1(); off2(); off3(); off4() }
  }, [uid])

  const ac         = `rgba(${t.accentColor},`
  const glowShadow = t.glow ? `0 0 30px ${ac}0.12), inset 0 1px 0 rgba(255,255,255,0.03)` : 'none'

  const containerStyle = {
    fontFamily:     t.fontFamily,
    background:     `rgba(${t.bgColor},${t.bgOpacity})`,
    border:         t.showBorder ? `${t.borderWidth}px solid ${ac}0.25)` : 'none',
    borderRadius:   t.borderRadius,
    backdropFilter: `blur(${t.blur}px)`,
    padding:        t.padding,
    fontSize:       `${t.fontSize}em`,
    boxShadow:      glowShadow,
    transition:     'all 0.3s',
    minWidth:       320,
  }

  // Determine which mode to show: active guess session takes priority, then prediction round
  const showGuess = !!session
  const showPrediction = !showGuess && !!round

  if (!showGuess && !showPrediction) {
    return (
      <div style={{ ...containerStyle, color: t.textMuted, textAlign: 'center' }}>
        <span style={{ fontSize: '0.75em' }}>No active prediction</span>
      </div>
    )
  }

  // ── Mode 1: Number Guess ──────────────────────────────
  if (showGuess) {
    const statusLabels = { open: 'OPEN', closed: 'CLOSED', finished: 'FINISHED' }
    const statusColors = { open: '#34d399', closed: '#f59e0b', finished: '#6366f1' }

    let winners = []
    if (session.status === 'finished' && session.target_number != null) {
      winners = entries
        .map(e => ({ ...e, diff: Math.abs(e.guess - session.target_number) }))
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 3)
    }

    return (
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${ac}0.15)` }}>
          <Target size={14} style={{ color: `rgba(${t.accentColor},0.8)`, opacity: 0.8 }} />
          <span style={{ fontSize: '0.62em', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Guess Balance</span>
          <span style={{
            marginLeft: 'auto', fontSize: '0.55em', fontWeight: 700, textTransform: 'uppercase',
            padding: '2px 8px', borderRadius: 6,
            background: `${statusColors[session.status]}18`,
            border: `1px solid ${statusColors[session.status]}44`,
            color: statusColors[session.status],
          }}>
            {statusLabels[session.status]}
          </span>
        </div>

        {/* Finished: show target + winners */}
        {session.status === 'finished' && session.target_number != null && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.58em', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Target Value</span>
              <p style={{ fontSize: '1.4em', fontWeight: 700, color: t.textPrimary, margin: '4px 0 0' }}>
                {session.target_number}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {winners.map((w, idx) => {
                const color = idx < 3 ? RANK_MEDALS[idx] : t.textSecondary
                return (
                  <div key={w.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: `rgba(${t.bgColor},0.5)`,
                    border: `1px solid ${ac}${idx === 0 ? '0.22' : '0.1'})`,
                    borderRadius: Math.max(4, t.borderRadius - 4),
                    padding: '8px 12px',
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.62em', fontWeight: 700, flexShrink: 0,
                      background: `${color}18`, border: `1px solid ${color}44`, color,
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: '0.75em', fontWeight: 600, color: t.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {w.username}
                    </span>
                    <span style={{ fontSize: '0.65em', color: t.textSecondary, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {w.guess}
                    </span>
                    <span style={{ fontSize: '0.58em', color: t.textMuted, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      ({w.diff === 0 ? 'exact' : `+${w.diff}`})
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Open/Closed: show entry count */}
        {(session.status === 'open' || session.status === 'closed') && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <span style={{ fontSize: '1.2em', fontWeight: 700, color: t.textPrimary }}>{entries.length}</span>
            <span style={{ fontSize: '0.7em', color: t.textMuted, marginLeft: 6 }}>Guesses</span>
          </div>
        )}
      </div>
    )
  }

  // ── Mode 2: Prediction Wall (A vs B) ──────────────────────────────
  if (showPrediction) {
    const votesA = votes.filter(v => v.vote === 'a').length
    const votesB = votes.filter(v => v.vote === 'b').length
    const total  = votesA + votesB
    const pctA   = total > 0 ? Math.round((votesA / total) * 100) : 50
    const pctB   = total > 0 ? 100 - pctA : 50

    const statusLabels = { open: 'VOTING OPEN', locked: 'LOCKED', resolved: 'RESULT' }
    const statusColors = { open: '#34d399', locked: '#f59e0b', resolved: '#6366f1' }

    const winnerA = round.status === 'resolved' && round.result === 'a'
    const winnerB = round.status === 'resolved' && round.result === 'b'

    return (
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${ac}0.15)` }}>
          <Trophy size={14} style={{ color: `rgba(${t.accentColor},0.8)`, opacity: 0.8 }} />
          <span style={{ fontSize: '0.62em', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.18em', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {round.question || 'Prediction'}
          </span>
          <span style={{
            fontSize: '0.55em', fontWeight: 700, textTransform: 'uppercase',
            padding: '2px 8px', borderRadius: 6, flexShrink: 0,
            background: `${statusColors[round.status]}18`,
            border: `1px solid ${statusColors[round.status]}44`,
            color: statusColors[round.status],
          }}>
            {statusLabels[round.status]}
          </span>
        </div>

        {/* Vote bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Option A */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: Math.max(4, t.borderRadius - 4),
            border: winnerA ? '1px solid rgba(52,211,153,0.5)' : `1px solid ${ac}0.1)`,
            background: `rgba(${t.bgColor},0.5)`,
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: `${pctA}%`,
              background: winnerA ? 'rgba(52,211,153,0.15)' : 'rgba(59,130,246,0.12)',
              transition: 'width 0.5s ease',
            }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
              {winnerA && <Trophy size={12} style={{ color: '#34d399', flexShrink: 0 }} />}
              <span style={{ fontSize: '0.72em', fontWeight: 600, color: winnerA ? '#34d399' : '#60a5fa', flex: 1 }}>
                {round.option_a || 'Option A'}
              </span>
              <span style={{ fontSize: '0.65em', color: t.textMuted, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                {votesA}
              </span>
              <span style={{ fontSize: '0.72em', fontWeight: 700, color: winnerA ? '#34d399' : '#60a5fa', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                {pctA}%
              </span>
            </div>
          </div>

          {/* Option B */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: Math.max(4, t.borderRadius - 4),
            border: winnerB ? '1px solid rgba(52,211,153,0.5)' : `1px solid ${ac}0.1)`,
            background: `rgba(${t.bgColor},0.5)`,
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: `${pctB}%`,
              background: winnerB ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.12)',
              transition: 'width 0.5s ease',
            }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
              {winnerB && <Trophy size={12} style={{ color: '#34d399', flexShrink: 0 }} />}
              <span style={{ fontSize: '0.72em', fontWeight: 600, color: winnerB ? '#34d399' : '#f87171', flex: 1 }}>
                {round.option_b || 'Option B'}
              </span>
              <span style={{ fontSize: '0.65em', color: t.textMuted, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                {votesB}
              </span>
              <span style={{ fontSize: '0.72em', fontWeight: 700, color: winnerB ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                {pctB}%
              </span>
            </div>
          </div>
        </div>

        {/* Total votes */}
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <span style={{ fontSize: '0.58em', color: t.textMuted }}>{total} Votes</span>
        </div>
      </div>
    )
  }

  return null
}
