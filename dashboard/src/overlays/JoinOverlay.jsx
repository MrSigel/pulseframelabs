import { useEffect, useState } from 'react'
import { getAllPublic, getOnePublic, onTableChange } from '../lib/store'
import { Users } from 'lucide-react'

export const DEFAULT_THEME = {
  bgColor: '10,10,22', bgColorLight: '255,255,255', bgOpacity: 0.92, blur: 12,
  accentColor: '99,102,241', textPrimary: '#ffffff',
  textSecondary: '#a0a0d0', textMuted: '#44447a',
  borderRadius: 12, borderWidth: 1, showBorder: true,
  padding: 20, fontSize: 1, fontFamily: 'monospace', glow: true,
}

const Placeholder = ({ text }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:120, fontFamily:'monospace', color:'#444466', fontSize:12 }}>{text}</div>
)

export default function JoinOverlay({ theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [session, setSession]         = useState(null)
  const [participants, setParticipants] = useState([])
  const [drawState, setDrawState]     = useState(null)

  useEffect(() => {
    if (!uid) return
    getOnePublic('pfl_join_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    getOnePublic('pfl_theme_mode', uid).then(v => {
      if (v === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
  }, [uid, themeProp])

  const loadData = () => {
    if (!uid) return
    getAllPublic('join_sessions', uid).then(sessions => {
      const active = sessions.find(s => s.status === 'open' || s.status === 'closed' || s.status === 'finished') || null
      setSession(active)
      if (active) {
        getAllPublic('join_participants', uid).then(all => {
          setParticipants(all.filter(p => p.session_id === active.id))
        })
      } else {
        setParticipants([])
      }
    })
    getOnePublic('join_draw_state', uid).then(d => setDrawState(d || null))
  }

  useEffect(() => {
    if (!uid) return
    loadData()
    const off1 = onTableChange('join_sessions', loadData)
    const off2 = onTableChange('join_participants', loadData)
    return () => { off1(); off2() }
  }, [uid])

  // Also poll draw state for animation
  useEffect(() => {
    if (!uid) return
    const iv = setInterval(() => {
      getOnePublic('join_draw_state', uid).then(d => setDrawState(d || null))
    }, 80)
    return () => clearInterval(iv)
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

  if (!session) return <Placeholder text="No join session active" />

  // ── Drawing / Spinning phase ────────────────────────────────────────────
  if (drawState && drawState.phase === 'spinning') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:'1.4em', fontWeight:800, color:t.textPrimary, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            <Users size={20} style={{ verticalAlign:'middle', marginRight:8, color:`rgba(${t.accentColor},0.8)` }} />
            DRAWING...
          </div>
        </div>
        <div style={{
          textAlign:'center', fontSize:'2em', fontWeight:900, color:`rgba(${t.accentColor},1)`,
          textShadow:`0 0 20px rgba(${t.accentColor},0.6), 0 0 40px rgba(${t.accentColor},0.3)`,
          padding:'20px 0', letterSpacing:'0.05em',
          animation:'pulse 0.15s ease-in-out infinite alternate',
        }}>
          {drawState.display_name || '...'}
        </div>
        <div style={{ textAlign:'center', fontSize:'0.8em', color:t.textMuted, marginTop:8 }}>
          {participants.length} participants
        </div>
      </div>
    )
  }

  // ── Winner phase ────────────────────────────────────────────────────────
  if ((session.status === 'finished' || (drawState && drawState.phase === 'winner')) && (session.winner || drawState?.winner)) {
    const winnerName = drawState?.winner || session.winner
    return (
      <div style={containerStyle}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:'1.2em', fontWeight:800, color:t.textPrimary, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            <Users size={20} style={{ verticalAlign:'middle', marginRight:8, color:`rgba(${t.accentColor},0.8)` }} />
            WINNER
          </div>
        </div>
        <div style={{
          textAlign:'center', fontSize:'2.2em', fontWeight:900, letterSpacing:'0.05em',
          color:'#fbbf24', padding:'16px 0',
          textShadow:'0 0 20px rgba(251,191,36,0.6), 0 0 40px rgba(251,191,36,0.3), 0 0 60px rgba(251,191,36,0.15)',
        }}>
          {winnerName}
        </div>
        <div style={{ textAlign:'center', fontSize:'0.85em', color:t.textSecondary, marginTop:8 }}>
          out of {drawState?.participants?.length || participants.length} participants
        </div>
      </div>
    )
  }

  // ── Open phase ──────────────────────────────────────────────────────────
  if (session.status === 'open') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:'1.4em', fontWeight:800, color:t.textPrimary, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            <Users size={20} style={{ verticalAlign:'middle', marginRight:8, color:`rgba(${t.accentColor},0.8)` }} />
            !JOIN IS OPEN
          </div>
          <div style={{ fontSize:'0.8em', color:t.textSecondary, marginTop:6 }}>Type <span style={{ color:`rgba(${t.accentColor},0.9)`, fontWeight:700 }}>!join</span> in chat to participate</div>
        </div>

        <div style={{ textAlign:'center', fontSize:'0.85em', color:t.textSecondary, marginBottom:12 }}>
          {participants.length} participant{participants.length !== 1 ? 's' : ''} joined
        </div>

        {participants.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
            {participants.map((p, i) => (
              <div key={i} style={{
                padding:'4px 10px', borderRadius:8, fontSize:'0.75em', fontWeight:600,
                background:'rgba(255,255,255,0.06)',
                border:'1px solid rgba(255,255,255,0.08)',
                color:t.textSecondary,
              }}>
                {p.username}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Closed phase (waiting to draw) ──────────────────────────────────────
  if (session.status === 'closed') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:'1.4em', fontWeight:800, color:t.textPrimary, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            <Users size={20} style={{ verticalAlign:'middle', marginRight:8, color:`rgba(${t.accentColor},0.8)` }} />
            !JOIN CLOSED
          </div>
          <div style={{ fontSize:'0.8em', color:t.textSecondary, marginTop:6 }}>{participants.length} participant{participants.length !== 1 ? 's' : ''} — waiting for draw</div>
        </div>

        {participants.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
            {participants.map((p, i) => (
              <div key={i} style={{
                padding:'4px 10px', borderRadius:8, fontSize:'0.75em', fontWeight:600,
                background:'rgba(255,255,255,0.06)',
                border:'1px solid rgba(255,255,255,0.08)',
                color:t.textSecondary,
              }}>
                {p.username}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return <Placeholder text="No join session active" />
}
