import { useEffect, useState } from 'react'
import { getAllPublic, getOnePublic, onTableChange } from '../lib/store'
import { Sparkles, Trophy } from 'lucide-react'

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
  maxEntries:    8,
}

const COLORS = ['#818cf8','#a78bfa','#60a5fa','#34d399','#fbbf24','#f87171','#e879f9','#38bdf8']
const colorFor = (name) => COLORS[(name || '').charCodeAt(0) % COLORS.length]

export default function SlotRequestsOverlay({ theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [requests, setRequests]   = useState([])
  const [config, setConfig]       = useState({})

  useEffect(() => {
    if (!uid) return
    getOnePublic('pfl_slotrequests_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    getOnePublic('pfl_theme_mode', uid).then(v => {
      if (v === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
  }, [uid, themeProp])

  const loadData = () => {
    if (!uid) return
    getAllPublic('slot_requests', uid).then(d => setRequests(d))
    getOnePublic('slot_request_config', uid).then(c => setConfig(c || {}))
  }

  useEffect(() => {
    if (!uid) return
    loadData()
    const off1 = onTableChange('slot_requests', loadData)
    const interval = setInterval(loadData, 2000)
    return () => { off1(); clearInterval(interval) }
  }, [uid])

  const ac         = `rgba(${t.accentColor},`
  const glowShadow = t.glow ? `0 0 30px ${ac}0.12), inset 0 1px 0 rgba(255,255,255,0.03)` : 'none'
  const rad        = Math.max(4, t.borderRadius - 4)
  const selectedId = config.selected_id
  const isOpen     = config.open !== false

  const pendingRequests = requests.filter(r => r.status !== 'raffled')
  const visible = pendingRequests.slice(0, t.maxEntries || 8)

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
      minWidth:       300,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, paddingBottom:8, borderBottom:`1px solid ${ac}0.15)` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Sparkles size={13} style={{ color: `rgba(${t.accentColor},0.7)` }} />
          <span style={{ fontSize:'0.62em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.15em' }}>Slot Requests</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:'0.58em', color: t.textMuted, fontVariantNumeric:'tabular-nums' }}>{pendingRequests.length}</span>
          <span style={{
            fontSize:'0.5em', padding:'2px 6px', borderRadius:4,
            background: isOpen ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${isOpen ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: isOpen ? '#34d399' : '#f87171',
            fontWeight:600, textTransform:'uppercase',
          }}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Selected / Raffled game */}
      {selectedId && (() => {
        const sel = requests.find(r => r.id === selectedId)
        if (!sel) return null
        return (
          <div style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(139,92,246,0.06))',
            border: `1px solid rgba(251,191,36,0.3)`,
            borderRadius: rad, padding:'12px 14px', marginBottom:10,
            display:'flex', alignItems:'center', gap:12,
            boxShadow:'0 0 20px rgba(251,191,36,0.08)',
            animation:'fade-up 0.3s ease-out',
          }}>
            <Trophy size={18} style={{ color:'#fbbf24', flexShrink:0, filter:'drop-shadow(0 0 6px rgba(251,191,36,0.4))' }} />
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:'0.52em', color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:3, fontWeight:700 }}>Winner</div>
              <div style={{ fontSize:'0.88em', fontWeight:800, color: t.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textShadow:'0 0 12px rgba(251,191,36,0.2)' }}>
                {sel.game}
              </div>
              <div style={{ fontSize:'0.62em', color: colorFor(sel.username), fontWeight:700 }}>{sel.username}</div>
            </div>
            <Sparkles size={12} style={{ color:'#fbbf24', flexShrink:0, opacity:0.6 }} />
          </div>
        )
      })()}

      {/* Request list */}
      {visible.length === 0 ? (
        <div style={{ fontSize:'0.7em', color: t.textMuted, textAlign:'center', padding:'12px 0' }}>
          No requests — !sr GameName
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {visible.map((r, idx) => (
            <div key={r.id} style={{
              display:'flex', alignItems:'center', gap:8, padding:'6px 10px',
              background: r.id === selectedId ? `rgba(${t.accentColor},0.06)` : 'transparent',
              borderRadius: rad,
              border: r.id === selectedId ? `1px solid ${ac}0.15)` : '1px solid transparent',
            }}>
              <span style={{ fontSize:'0.58em', fontWeight:700, color: t.textMuted, width:18, textAlign:'center', flexShrink:0 }}>
                {idx + 1}
              </span>
              <span style={{ fontSize:'0.72em', fontWeight:600, color: t.textPrimary, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {r.game}
              </span>
              <span style={{ fontSize:'0.6em', fontWeight:600, color: colorFor(r.username), flexShrink:0 }}>
                {r.username}
              </span>
            </div>
          ))}
          {pendingRequests.length > (t.maxEntries || 8) && (
            <div style={{ fontSize:'0.58em', color: t.textMuted, textAlign:'center', padding:'4px 0' }}>
              +{pendingRequests.length - (t.maxEntries || 8)} more
            </div>
          )}
        </div>
      )}
    </div>
  )
}
