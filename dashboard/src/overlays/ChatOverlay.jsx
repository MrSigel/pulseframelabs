import { useEffect, useState, useRef } from 'react'
import { getAllPublic, getOnePublic, onTableChange } from '../lib/store'

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
  padding:       16,
  fontSize:      1,
  fontFamily:    'monospace',
  glow:          true,
  maxMessages:   8,
}

const COLORS = ['#818cf8','#a78bfa','#60a5fa','#34d399','#fbbf24','#f87171','#e879f9','#38bdf8']
const colorFor = (name) => COLORS[(name || '').charCodeAt(0) % COLORS.length]
const fmtTime  = (iso) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }

const ROLE_COLORS = {
  moderator: '#22c55e',
  subscriber: '#a78bfa',
  viewer: '#60a5fa',
}

const ROLE_BADGES = {
  moderator: 'M',
  subscriber: 'S',
  viewer: 'V',
}

export default function ChatOverlay({ theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [messages, setMessages] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    getOnePublic('chat_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    const localMode = localStorage.getItem('pfl_theme_mode'); getOnePublic('pfl_theme_mode', uid).then(v => { const mode = v || localMode;
      if (mode === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
  }, [uid, themeProp])

  const loadMessages = () => {
    // uid is optional - fallback to logged-in user
    getAllPublic('chat_messages', uid).then(d => setMessages(d.slice(0, 50).reverse()))
  }

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    loadMessages()
    const off = onTableChange('chat_messages', loadMessages)
    return off
  }, [uid])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const ac         = `rgba(${t.accentColor},`
  const glowShadow = t.glow ? `0 0 30px ${ac}0.12), inset 0 1px 0 rgba(255,255,255,0.03)` : 'none'
  const recent     = messages.slice(-(t.maxMessages || 8))

  return (
    <div style={{
      fontFamily:     t.fontFamily,
      background:     `rgba(${t.bgColor},${t.bgOpacity})`,
      border:         t.showBorder ? `${t.borderWidth}px solid ${ac}0.25)` : 'none',
      borderRadius:   t.borderRadius,
      backdropFilter: `blur(${t.blur}px)`,
      padding:        t.padding,
      fontSize:       `${t.fontSize}em`,
      boxShadow:      glowShadow,
      transition:     'all 0.3s',
      minWidth:       360,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${ac}0.15)` }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:`rgba(${t.accentColor},1)`, animation:'glow-pulse 2s ease-in-out infinite' }} />
        <span style={{ fontSize:'0.6em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.15em' }}>Live Chat</span>
        <span style={{ fontSize:'0.6em', color:`${ac}0.35)`, marginLeft:'auto' }}>{messages.length}</span>
      </div>

      {/* Messages */}
      {recent.length === 0
        ? <div style={{ color: t.textMuted, fontSize:'0.75em', textAlign:'center', padding:16 }}>No messages yet</div>
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {recent.map(m => {
              const role = m.user_role || 'viewer'
              const roleColor = ROLE_COLORS[role] || ROLE_COLORS.viewer
              const roleBadge = ROLE_BADGES[role] || ROLE_BADGES.viewer
              const nameColor = m.user_role ? roleColor : colorFor(m.username)
              return (
                <div key={m.id} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                  <span style={{ fontSize:'0.6em', color: t.textMuted, flexShrink:0, marginTop:2, fontVariantNumeric:'tabular-nums', width:32 }}>
                    {fmtTime(m.sent_at || m.created_at)}
                  </span>
                  <span style={{
                    width:16, height:16, borderRadius:'50%', flexShrink:0, marginTop:1,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.5em', fontWeight:700, lineHeight:1, color: roleColor,
                    background: roleColor + '22', border: `1px solid ${roleColor}`,
                  }}>
                    {roleBadge}
                  </span>
                  <span style={{ fontSize:'0.75em', fontWeight:700, flexShrink:0, color: nameColor }}>
                    {m.username}:
                  </span>
                  <span style={{ fontSize:'0.75em', color: t.textSecondary, wordBreak:'break-word', minWidth:0, lineHeight:1.4 }}>
                    {m.message}
                  </span>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )
      }
    </div>
  )
}
