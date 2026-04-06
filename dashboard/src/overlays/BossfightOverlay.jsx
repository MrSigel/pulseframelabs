import { useEffect, useState, useRef } from 'react'
import { getAllPublic, getOnePublic, onTableChange } from '../lib/store'
import { Swords, Trophy } from 'lucide-react'
import { getOverlayStrings } from './overlayI18n'

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
  overlayScale:   1,
}

// ── Animations ──────────────────────────────────────────────────────────
const ANIM_ID = 'bossfight-overlay-anims'
if (typeof document !== 'undefined' && !document.getElementById(ANIM_ID)) {
  const el = document.createElement('style')
  el.id = ANIM_ID
  el.textContent = `
    @keyframes bf-glow-flash { 0% { opacity:0; } 30% { opacity:1; } 70% { opacity:1; } 100% { opacity:0; } }
    @keyframes bf-slot-in { from { opacity:0; transform:translateX(-20px) scale(0.9); } to { opacity:1; transform:translateX(0) scale(1); } }
    @keyframes bf-name-glow { 0% { box-shadow: 0 0 0px rgba(212,175,55,0); } 50% { box-shadow: 0 0 20px rgba(212,175,55,0.4); } 100% { box-shadow: 0 0 8px rgba(212,175,55,0.1); } }
    @keyframes bf-pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
  `
  document.head.appendChild(el)
}

const Placeholder = ({ text }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:120, fontFamily:'monospace', color:'#444466', fontSize:12 }}>{text}</div>
)

// ── Main overlay ──────────────────────────────────────────────────────────
export default function BossfightOverlay({ sessionId, editable = false, showTooltips = false, theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [overlayLang, setOverlayLang] = useState('en')
  const [session, setSession] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [animatedIdx, setAnimatedIdx] = useState(-1)
  const [showFlash, setShowFlash] = useState(false)
  const [flashName, setFlashName] = useState('')
  const prevStatusRef = useRef(null)

  useEffect(() => {
    getOnePublic('bossfight_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    const localMode = localStorage.getItem('pfl_theme_mode'); getOnePublic('pfl_theme_mode', uid).then(v => { const mode = v || localMode;
      if (mode === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
    getOnePublic('overlay_lang', uid).then(v => { if (v) setOverlayLang(v) })
    const localLang = localStorage.getItem('pfl_lang'); if (localLang) setOverlayLang(localLang)
  }, [uid, themeProp])

  const loadData = () => {
    getAllPublic('bossfights', uid).then(data => {
      const active = sessionId
        ? (data.find(x => x.id === sessionId) || null)
        : (data.find(x => x.status === 'live' || x.status === 'animating' || x.status === 'join_open') || data[0] || null)
      setSession(active)
    })
  }

  useEffect(() => {
    loadData()
    const off = onTableChange('bossfights', loadData)
    return off
  }, [sessionId, uid])

  // Detect animation status
  useEffect(() => {
    if (!session) return
    if (session.status === 'animating' && prevStatusRef.current !== 'animating') {
      runAnimation()
    }
    prevStatusRef.current = session.status
  }, [session?.status])

  const runAnimation = () => {
    if (!session) return
    const participants = session.participants || []
    setAnimating(true)
    setAnimatedIdx(-1)

    let idx = 0
    const animateNext = () => {
      if (idx >= participants.length) {
        setTimeout(() => {
          setAnimating(false)
          setShowFlash(false)
        }, 600)
        return
      }

      setFlashName(participants[idx].username)
      setShowFlash(true)
      setTimeout(() => {
        setShowFlash(false)
        setAnimatedIdx(idx)
        idx++
        setTimeout(animateNext, 200)
      }, 800)
    }

    setTimeout(animateNext, 500)
  }

  const ot = getOverlayStrings(overlayLang)

  if (!session) return <Placeholder text={ot.noBossfight} />

  const ac         = `rgba(${t.accentColor},`
  const glowShadow = t.glow ? `0 0 30px ${ac}0.12), inset 0 1px 0 rgba(255,255,255,0.03)` : 'none'
  const overlayScale = t.overlayScale || 1

  const containerStyle = {
    fontFamily:     t.fontFamily,
    background:     `rgba(${t.bgColor},${t.bgOpacity})`,
    border:         t.showBorder ? `${t.borderWidth}px solid ${ac}0.25)` : 'none',
    borderRadius:   t.borderRadius,
    backdropFilter: `blur(${t.blur}px)`,
    padding:        t.padding,
    fontSize:       `${t.fontSize}em`,
    boxShadow:      glowShadow,
    transform:      overlayScale !== 1 ? `scale(${overlayScale})` : 'none',
    transformOrigin: 'top left',
    transition:     'all 0.3s',
    minWidth:       420,
    position:       'relative',
    overflow:       'hidden',
  }

  const participants = session.participants || []
  const duels        = session.duels || []
  const currentDuel  = session.current_duel || 0
  const bossLives    = session.boss_lives ?? 0
  const bossMaxLives = session.boss_max_lives ?? 0
  const winnerSide   = session.winner_side

  const playerWins = duels.filter(d => d.winner === 'challenger').length
  const bossWins   = duels.filter(d => d.winner === 'boss').length

  const challengers = participants.filter(p => p.username !== session.boss_name)
  const currentChallenger = challengers[currentDuel] || null

  const status = session.status || 'join_open'
  const statusLabels = { join_open: ot.waiting, animating: ot.drawing, live: ot.live, finished: ot.finished }
  const statusColors = { join_open: '#fbbf24', animating: '#fbbf24', live: '#34d399', finished: '#818cf8' }

  return (
    <div style={containerStyle}>

      {/* Gold flash for animation */}
      {showFlash && (
        <div style={{
          position:'absolute', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(212,175,55,0.08)', animation:'bf-glow-flash 0.8s ease-out forwards',
          pointerEvents:'none',
        }}>
          <div style={{ animation:'bf-name-glow 0.8s ease-out', padding:'12px 28px', borderRadius:12, background:'rgba(10,10,22,0.9)', border:'1px solid rgba(212,175,55,0.4)' }}>
            <span style={{ fontSize:'1.2em', fontWeight:800, color:'#d4af37', letterSpacing:'0.02em' }}>{flashName}</span>
          </div>
        </div>
      )}

      {/* Title + Status */}
      <div style={{ textAlign:'center', marginBottom:16 }}>
        <div style={{ fontSize:'1.4em', fontWeight:800, color:t.textPrimary, letterSpacing:'0.08em', textTransform:'uppercase' }}>
          <Swords size={20} style={{ verticalAlign:'middle', marginRight:8, color:`rgba(${t.accentColor},0.8)` }} />
          {ot.bossFight}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:8 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background: statusColors[status] || '#44447a', boxShadow:`0 0 8px ${statusColors[status] || '#44447a'}`, animation: status === 'animating' ? 'bf-pulse 1s ease-in-out infinite' : 'none' }} />
          <span style={{ fontSize:'0.7em', fontWeight:700, color: statusColors[status] || '#44447a', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            {statusLabels[status] || status}
          </span>
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
            {winnerSide === 'boss' ? ot.bossWins : ot.playersWin}
          </div>
        </div>
      )}

      {/* Current duel (live) */}
      {!winnerSide && currentChallenger && (status === 'live') && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, marginBottom:16 }}>
          <div style={{
            flex:'0 0 140px', textAlign:'center', padding:12, borderRadius:10,
            background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)',
          }}>
            <div style={{ fontSize:'0.7em', fontWeight:700, color:'#34d399', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{ot.challenger}</div>
            <div style={{ fontSize:'0.9em', fontWeight:700, color:t.textPrimary }}>{currentChallenger.username}</div>
            <div style={{ fontSize:'0.72em', color:t.textSecondary, marginTop:2 }}>{currentChallenger.game || '\u2014'}</div>
          </div>

          <div style={{ fontSize:'1.2em', fontWeight:900, color:`rgba(${t.accentColor},0.8)`, textShadow:`0 0 12px rgba(${t.accentColor},0.3)` }}>VS</div>

          <div style={{
            flex:'0 0 140px', textAlign:'center', padding:12, borderRadius:10,
            background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
          }}>
            <div style={{ fontSize:'0.7em', fontWeight:700, color:'#f87171', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{ot.boss}</div>
            <div style={{ fontSize:'0.9em', fontWeight:700, color:t.textPrimary }}>{session.boss_name || 'BOSS'}</div>
            <div style={{ fontSize:'0.72em', color:t.textSecondary, marginTop:2 }}>{session.boss_game || '\u2014'}</div>
          </div>
        </div>
      )}

      {/* Finished scores */}
      {winnerSide && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, marginBottom:16 }}>
          <div style={{ flex:'0 0 140px', textAlign:'center', padding:12, borderRadius:10, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)' }}>
            <div style={{ fontSize:'0.7em', fontWeight:700, color:'#34d399', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{ot.players}</div>
            <div style={{ fontSize:'1.2em', fontWeight:800, color:t.textPrimary }}>{playerWins}</div>
          </div>
          <div style={{ fontSize:'1em', fontWeight:700, color:t.textMuted }}>\u2014</div>
          <div style={{ flex:'0 0 140px', textAlign:'center', padding:12, borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize:'0.7em', fontWeight:700, color:'#f87171', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{ot.boss} ({session.boss_name})</div>
            <div style={{ fontSize:'1.2em', fontWeight:800, color:t.textPrimary }}>{bossWins}</div>
          </div>
        </div>
      )}

      {/* Boss lives */}
      <div style={{ textAlign:'center', marginBottom:14 }}>
        <div style={{ fontSize:'0.72em', fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>
          {ot.bossLives}: {bossLives} / {bossMaxLives}
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:3, flexWrap:'wrap' }}>
          {Array.from({ length: bossMaxLives }, (_, i) => (
            <span key={i} style={{ fontSize:'1em', color: i < bossLives ? '#f87171' : 'rgba(255,255,255,0.15)', textShadow: i < bossLives ? '0 0 6px rgba(239,68,68,0.4)' : 'none' }}>
              {i < bossLives ? '\u25cf' : '\u25cb'}
            </span>
          ))}
        </div>
      </div>

      {/* Score (live) */}
      {(status === 'live') && !winnerSide && (
        <div style={{ textAlign:'center', marginBottom:14, fontSize:'0.8em', color:t.textSecondary }}>
          {ot.score}: {ot.players} <span style={{ fontWeight:700, color:'#34d399' }}>{playerWins}</span> \u2014 {ot.boss} <span style={{ fontWeight:700, color:'#f87171' }}>{bossWins}</span>
        </div>
      )}

      {/* Challenger list — always visible */}
      <div style={{ marginTop:12 }}>
        <div style={{ fontSize:'0.7em', fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8, textAlign:'center' }}>{ot.challengers}</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
          {challengers.map((p, i) => {
            const duel = duels.find(d => d.challenger === p.username)
            let icon = '\u25cf'
            let color = t.textSecondary
            if (duel) {
              if (duel.winner === 'challenger') { icon = '\u2713'; color = '#34d399' }
              else { icon = '\u2717'; color = '#f87171' }
            }
            const isCurrent = i === currentDuel && !winnerSide && status === 'live'

            // Animation: only show if animated in
            const isVisible = !animating || i <= animatedIdx
            if (!isVisible) return (
              <span key={i} style={{ fontSize:'0.75em', padding:'3px 8px', borderRadius:6, color:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.05)' }}>
                \u25cf ???
              </span>
            )

            return (
              <span key={i} style={{
                fontSize:'0.75em', fontWeight: isCurrent ? 700 : 500, color,
                padding:'3px 8px', borderRadius:6,
                background: isCurrent ? `rgba(${t.accentColor},0.15)` : 'transparent',
                border: isCurrent ? `1px solid rgba(${t.accentColor},0.3)` : '1px solid transparent',
                animation: animating && i === animatedIdx ? 'bf-slot-in 0.4s ease-out' : 'none',
              }}>
                {icon} {p.username}
              </span>
            )
          })}
        </div>
      </div>

      {/* Join hint */}
      {status === 'join_open' && participants.length === 0 && (
        <div style={{ textAlign:'center', marginTop:16, fontSize:'0.75em', color:t.textMuted }}>
          Type <span style={{ color:`rgba(${t.accentColor},0.9)`, fontWeight:700 }}>!join GameName</span> in chat to enter
        </div>
      )}
    </div>
  )
}
