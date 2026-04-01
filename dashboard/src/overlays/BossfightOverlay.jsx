import { useEffect, useState } from 'react'
import { getAllPublic, getOnePublic, onTableChange } from '../lib/store'
import { Swords } from 'lucide-react'

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

const Placeholder = ({ text }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:120, fontFamily:'monospace', color:'#444466', fontSize:12 }}>{text}</div>
)

// ── Main overlay ───────────────────────────────────────────────────────────
export default function BossfightOverlay({ sessionId, editable = false, showTooltips = false, theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [session, setSession] = useState(null)

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    getOnePublic('pfl_bossfight_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    getOnePublic('pfl_theme_mode', uid).then(v => {
      if (v === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
  }, [uid, themeProp])

  const loadData = () => {
    // uid is optional - fallback to logged-in user
    getAllPublic('bossfights', uid).then(data => {
      const active = sessionId
        ? (data.find(x => x.id === sessionId) || null)
        : (data.find(x => x.status === 'live' || x.status === 'join_open') || data[0] || null)
      setSession(active)
    })
  }

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    loadData()
    const off = onTableChange('bossfights', loadData)
    return off
  }, [sessionId, uid])

  if (!session) return <Placeholder text="No boss fight found" />

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
    minWidth:       420,
  }

  const participants = session.participants || []
  const duels        = session.duels || []
  const currentDuel  = session.current_duel || 0
  const bossLives    = session.boss_lives ?? 0
  const bossMaxLives = session.boss_max_lives ?? 0
  const winnerSide   = session.winner_side

  // Compute scores
  const playerWins = duels.filter(d => d.winner === 'challenger').length
  const bossWins   = duels.filter(d => d.winner === 'boss').length

  // Current challenger (non-boss participants)
  const challengers = participants.filter(p => p.username !== session.boss_name)
  const currentChallenger = challengers[currentDuel] || null

  // ── Join phase ────────────────────────────────────────────────────────
  if (session.status === 'join_open') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:'1.4em', fontWeight:800, color:t.textPrimary, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            <Swords size={20} style={{ verticalAlign:'middle', marginRight:8, color:`rgba(${t.accentColor},0.8)` }} />
            BOSS FIGHT
          </div>
          <div style={{ fontSize:'0.8em', color:t.textSecondary, marginTop:6 }}>Waiting for challengers...</div>
        </div>

        <div style={{ textAlign:'center', fontSize:'0.85em', color:t.textSecondary, marginBottom:12 }}>
          {participants.length} participant{participants.length !== 1 ? 's' : ''} joined
        </div>

        {participants.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
            {participants.map((p, i) => (
              <div key={i} style={{
                padding:'4px 10px', borderRadius:8, fontSize:'0.75em', fontWeight:600,
                background: p.username === session.boss_name ? `rgba(${t.accentColor},0.25)` : 'rgba(255,255,255,0.06)',
                border: `1px solid ${p.username === session.boss_name ? `rgba(${t.accentColor},0.5)` : 'rgba(255,255,255,0.08)'}`,
                color: p.username === session.boss_name ? t.textPrimary : t.textSecondary,
              }}>
                {p.username === session.boss_name && '\u2654 '}{p.username}
                {p.game && <span style={{ color:t.textMuted, marginLeft:4 }}>({p.game})</span>}
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign:'center', marginTop:16, fontSize:'0.75em', color:t.textMuted }}>
          Type <span style={{ color:`rgba(${t.accentColor},0.9)`, fontWeight:700 }}>!join GameName</span> in chat to enter
        </div>
      </div>
    )
  }

  // ── Live / Finished phase ─────────────────────────────────────────────
  return (
    <div style={containerStyle}>
      {/* Title */}
      <div style={{ textAlign:'center', marginBottom:16 }}>
        <div style={{ fontSize:'1.4em', fontWeight:800, color:t.textPrimary, letterSpacing:'0.08em', textTransform:'uppercase' }}>
          <Swords size={20} style={{ verticalAlign:'middle', marginRight:8, color:`rgba(${t.accentColor},0.8)` }} />
          BOSS FIGHT
        </div>
      </div>

      {/* Winner banner */}
      {winnerSide && (
        <div style={{
          textAlign:'center', padding:'12px 0', marginBottom:16, borderRadius:8,
          background: winnerSide === 'boss' ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.15)',
          border: `1px solid ${winnerSide === 'boss' ? 'rgba(239,68,68,0.4)' : 'rgba(52,211,153,0.4)'}`,
        }}>
          <div style={{ fontSize:'1.3em', fontWeight:800, color: winnerSide === 'boss' ? '#f87171' : '#34d399', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            {winnerSide === 'boss' ? 'BOSS WINS!' : 'PLAYERS WIN!'}
          </div>
        </div>
      )}

      {/* Current duel */}
      {!winnerSide && currentChallenger && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, marginBottom:16 }}>
          {/* Challenger */}
          <div style={{
            flex:'0 0 140px', textAlign:'center', padding:12, borderRadius:10,
            background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)',
          }}>
            <div style={{ fontSize:'0.7em', fontWeight:700, color:'#34d399', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Challenger</div>
            <div style={{ fontSize:'0.9em', fontWeight:700, color:t.textPrimary }}>{currentChallenger.username}</div>
            <div style={{ fontSize:'0.72em', color:t.textSecondary, marginTop:2 }}>{currentChallenger.game || '\u2014'}</div>
          </div>

          {/* VS */}
          <div style={{ fontSize:'1.2em', fontWeight:900, color:`rgba(${t.accentColor},0.8)`, textShadow:`0 0 12px rgba(${t.accentColor},0.3)` }}>VS</div>

          {/* Boss */}
          <div style={{
            flex:'0 0 140px', textAlign:'center', padding:12, borderRadius:10,
            background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
          }}>
            <div style={{ fontSize:'0.7em', fontWeight:700, color:'#f87171', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Boss</div>
            <div style={{ fontSize:'0.9em', fontWeight:700, color:t.textPrimary }}>{session.boss_name || 'BOSS'}</div>
            <div style={{ fontSize:'0.72em', color:t.textSecondary, marginTop:2 }}>{session.boss_game || '\u2014'}</div>
          </div>
        </div>
      )}

      {/* Finished but show last duel info */}
      {winnerSide && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, marginBottom:16 }}>
          <div style={{ flex:'0 0 140px', textAlign:'center', padding:12, borderRadius:10, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)' }}>
            <div style={{ fontSize:'0.7em', fontWeight:700, color:'#34d399', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Players</div>
            <div style={{ fontSize:'1.2em', fontWeight:800, color:t.textPrimary }}>{playerWins}</div>
          </div>
          <div style={{ fontSize:'1em', fontWeight:700, color:t.textMuted }}>\u2014</div>
          <div style={{ flex:'0 0 140px', textAlign:'center', padding:12, borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize:'0.7em', fontWeight:700, color:'#f87171', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Boss ({session.boss_name})</div>
            <div style={{ fontSize:'1.2em', fontWeight:800, color:t.textPrimary }}>{bossWins}</div>
          </div>
        </div>
      )}

      {/* Boss lives */}
      <div style={{ textAlign:'center', marginBottom:14 }}>
        <div style={{ fontSize:'0.72em', fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>
          Boss Lives: {bossLives} / {bossMaxLives}
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:3, flexWrap:'wrap' }}>
          {Array.from({ length: bossMaxLives }, (_, i) => (
            <span key={i} style={{ fontSize:'1em', color: i < bossLives ? '#f87171' : 'rgba(255,255,255,0.15)', textShadow: i < bossLives ? '0 0 6px rgba(239,68,68,0.4)' : 'none' }}>
              {i < bossLives ? '\u25cf' : '\u25cb'}
            </span>
          ))}
        </div>
      </div>

      {/* Score */}
      {(session.status === 'live' || session.status === 'finished') && !winnerSide && (
        <div style={{ textAlign:'center', marginBottom:14, fontSize:'0.8em', color:t.textSecondary }}>
          Score: Players <span style={{ fontWeight:700, color:'#34d399' }}>{playerWins}</span> \u2014 Boss <span style={{ fontWeight:700, color:'#f87171' }}>{bossWins}</span>
        </div>
      )}

      {/* Challenger list */}
      <div style={{ marginTop:12 }}>
        <div style={{ fontSize:'0.7em', fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8, textAlign:'center' }}>Challengers</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
          {challengers.map((p, i) => {
            const duel = duels.find(d => d.challenger === p.username)
            let icon = '\u25cf' // current/pending (filled circle)
            let color = t.textSecondary
            if (duel) {
              if (duel.winner === 'challenger') { icon = '\u2713'; color = '#34d399' }  // checkmark = won
              else { icon = '\u2717'; color = '#f87171' }  // x = lost
            }
            const isCurrent = i === currentDuel && !winnerSide
            return (
              <span key={i} style={{
                fontSize:'0.75em', fontWeight: isCurrent ? 700 : 500, color,
                padding:'3px 8px', borderRadius:6,
                background: isCurrent ? `rgba(${t.accentColor},0.15)` : 'transparent',
                border: isCurrent ? `1px solid rgba(${t.accentColor},0.3)` : '1px solid transparent',
              }}>
                {icon} {p.username}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
