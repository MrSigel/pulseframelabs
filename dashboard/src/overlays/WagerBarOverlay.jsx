import { useEffect, useState } from 'react'
import { getAllPublic, getOnePublic, onTableChange, update } from '../lib/store'
import { Check } from 'lucide-react'

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
  barHeight:     14,
}

// ── Editable inline field ──────────────────────────────────────────────────
function EditableField({ value, onChange, type = 'text', placeholder = '', style = {}, inputStyle = {} }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal]         = useState(value)
  useEffect(() => { if (!editing) setVal(value) }, [value, editing])
  const confirm = () => { setEditing(false); onChange(val) }
  const cancel  = () => { setEditing(false); setVal(value) }

  if (!editing) {
    return (
      <span className="editable-hint" onClick={() => setEditing(true)} title="Click to edit" style={style}>
        {value || <span style={{ opacity: 0.3 }}>{placeholder}</span>}
      </span>
    )
  }
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
      <input autoFocus type={type} value={val} placeholder={placeholder}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel() }}
        style={{ background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.5)', borderRadius:4, color:'#fff', outline:'none', fontFamily:'inherit', padding:'2px 6px', ...inputStyle }}
      />
      <button onClick={confirm}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', width:20, height:20, borderRadius:5, background:'rgba(52,211,153,0.2)', border:'1px solid rgba(52,211,153,0.5)', cursor:'pointer', color:'#34d399', padding:0, flexShrink:0 }}
        onMouseEnter={ev => { ev.currentTarget.style.background='rgba(52,211,153,0.35)' }}
        onMouseLeave={ev => { ev.currentTarget.style.background='rgba(52,211,153,0.2)' }}>
        <Check size={11} />
      </button>
    </span>
  )
}

const Placeholder = ({ text }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:80, fontFamily:'monospace', color:'#444466', fontSize:12 }}>{text}</div>
)

// ── Shimmer keyframes (injected once) ─────────────────────────────────────
const SHIMMER_ID = 'wager-bar-shimmer-style'
if (typeof document !== 'undefined' && !document.getElementById(SHIMMER_ID)) {
  const styleEl = document.createElement('style')
  styleEl.id = SHIMMER_ID
  styleEl.textContent = `
    @keyframes wager-shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `
  document.head.appendChild(styleEl)
}

// ── Bar color by percentage ───────────────────────────────────────────────
function getBarGradient(pct) {
  if (pct >= 75) return 'linear-gradient(90deg, #10b981, #34d399)'
  if (pct >= 40) return 'linear-gradient(90deg, #f59e0b, #fbbf24)'
  return 'linear-gradient(90deg, #ef4444, #f97316)'
}

// ── Main overlay ───────────────────────────────────────────────────────────
export default function WagerBarOverlay({ sessionId, editable = false, theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [session, setSession] = useState(null)

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    getOnePublic('pfl_wager_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    getOnePublic('pfl_theme_mode', uid).then(v => {
      if (v === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
  }, [uid, themeProp])

  const loadData = () => {
    // uid is optional - fallback to logged-in user
    getAllPublic('wager_sessions', uid).then(data => {
      const active = sessionId
        ? (data.find(x => x.id === sessionId) || null)
        : (data.find(x => x.status === 'active') || data[0] || null)
      setSession(active)
    })
  }

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    loadData()
    const off = onTableChange('wager_sessions', loadData)
    return off
  }, [sessionId, uid])

  const saveField = (field, raw) => {
    if (!session) return
    const numFields = ['wager_amount', 'wagered_amount', 'deposit_amount', 'bonus_amount']
    const value = numFields.includes(field) ? (Number(raw) || 0) : raw
    update('wager_sessions', session.id, { [field]: value })
    setSession(prev => ({ ...prev, [field]: value }))
  }

  if (!session) return <Placeholder text="No wager session found" />

  const ac         = `rgba(${t.accentColor},`
  const glowShadow = t.glow ? `0 0 30px ${ac}0.12), inset 0 1px 0 rgba(255,255,255,0.03)` : 'none'

  const wagerAmount  = Number(session.wager_amount) || 0
  const wageredAmount = Number(session.wagered_amount) || 0
  const depositAmount = Number(session.deposit_amount) || 0
  const bonusAmount   = Number(session.bonus_amount) || 0

  const left       = Math.max(0, wagerAmount - wageredAmount)
  const pct        = wagerAmount > 0 ? Math.min(100, (wageredAmount / wagerAmount) * 100) : 0
  const multiplier = depositAmount > 0 ? (wageredAmount / depositAmount).toFixed(1) : '0.0'
  const start      = depositAmount + bonusAmount
  const cur        = session.currency === 'USD' ? '$' : '€'
  const rad        = Math.max(4, t.borderRadius - 4)

  const fmtNum = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })

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
      minWidth:       340,
    }}>

      {/* Header: Casino + Bonus Type */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:'0.68em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:3 }}>
            {editable
              ? <EditableField value={session.header_text || ''} onChange={v => saveField('header_text', v)}
                  placeholder="Header Text" style={{ color: t.textMuted }} inputStyle={{ width:160 }} />
              : (session.header_text || '')}
          </div>
          <div style={{ fontSize:'0.9em', fontWeight:700, color: t.textPrimary }}>
            {editable
              ? <EditableField value={session.casino_name} onChange={v => saveField('casino_name', v)}
                  placeholder="Casino Name" style={{ color: t.textPrimary, fontWeight:700 }} inputStyle={{ width:160 }} />
              : (session.casino_name || 'Casino')}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <span style={{
            fontSize:'0.58em', padding:'3px 8px', borderRadius:5,
            background: session.bonus_type === 'sticky' ? 'rgba(239,68,68,0.12)' : 'rgba(52,211,153,0.12)',
            border: `1px solid ${session.bonus_type === 'sticky' ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.3)'}`,
            color: session.bonus_type === 'sticky' ? '#f87171' : '#34d399',
            fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em',
          }}>
            {session.bonus_type === 'sticky' ? 'Sticky' : 'Non-Sticky'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ fontSize:'0.62em', color: t.textMuted }}>Wager Progress</span>
          <span style={{ fontSize:'0.62em', fontWeight:700, color: pct >= 100 ? '#34d399' : t.textSecondary, fontVariantNumeric:'tabular-nums' }}>
            {pct.toFixed(1)}%
          </span>
        </div>
        <div style={{
          height: t.barHeight || 14, background:`rgba(${t.bgColor},0.6)`,
          border:`1px solid ${ac}0.12)`, borderRadius: rad,
          overflow:'hidden', position:'relative',
        }}>
          <div style={{
            height:'100%', width:`${pct}%`, borderRadius: rad,
            background: getBarGradient(pct),
            transition:'width 0.5s ease',
            position:'relative', overflow:'hidden',
          }}>
            {/* Shimmer effect */}
            <div style={{
              position:'absolute', inset:0,
              background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
              animation: 'wager-shimmer 2s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
        {/* TOTAL */}
        <div style={{ background:`rgba(${t.bgColor},0.5)`, border:`1px solid ${ac}0.1)`, borderRadius: rad, padding:'8px 10px' }}>
          <div style={{ fontSize:'0.55em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Total</div>
          <div style={{ fontSize:'0.82em', fontWeight:700, color: t.textPrimary, fontVariantNumeric:'tabular-nums' }}>
            {editable
              ? <EditableField value={wagerAmount} type="number"
                  onChange={v => saveField('wager_amount', v)}
                  style={{ color: t.textPrimary, fontWeight:700 }} inputStyle={{ width:80 }} />
              : `${fmtNum(wagerAmount)} ${cur}`}
          </div>
        </div>

        {/* CASINO */}
        <div style={{ background:`rgba(${t.bgColor},0.5)`, border:`1px solid ${ac}0.1)`, borderRadius: rad, padding:'8px 10px' }}>
          <div style={{ fontSize:'0.55em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Casino</div>
          <div style={{ fontSize:'0.82em', fontWeight:700, color: t.textPrimary, fontVariantNumeric:'tabular-nums', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {session.casino_name || '—'}
          </div>
        </div>

        {/* LEFT */}
        <div style={{ background:`rgba(${t.bgColor},0.5)`, border:`1px solid ${ac}0.1)`, borderRadius: rad, padding:'8px 10px' }}>
          <div style={{ fontSize:'0.55em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Left</div>
          <div style={{ fontSize:'0.82em', fontWeight:700, color: '#fbbf24', fontVariantNumeric:'tabular-nums' }}>
            {fmtNum(left)} {cur}
          </div>
        </div>

        {/* START */}
        <div style={{ background:`rgba(${t.bgColor},0.5)`, border:`1px solid ${ac}0.1)`, borderRadius: rad, padding:'8px 10px' }}>
          <div style={{ fontSize:'0.55em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Start</div>
          <div style={{ fontSize:'0.82em', fontWeight:700, color: '#34d399', fontVariantNumeric:'tabular-nums' }}>
            {fmtNum(start)} {cur}
          </div>
        </div>

        {/* WAGERED */}
        <div style={{ background:`rgba(${t.bgColor},0.5)`, border:`1px solid ${ac}0.1)`, borderRadius: rad, padding:'8px 10px' }}>
          <div style={{ fontSize:'0.55em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Wagered</div>
          <div style={{ fontSize:'0.82em', fontWeight:700, color: t.textPrimary, fontVariantNumeric:'tabular-nums' }}>
            {editable
              ? <EditableField value={wageredAmount} type="number"
                  onChange={v => saveField('wagered_amount', v)}
                  style={{ color: t.textPrimary, fontWeight:700 }} inputStyle={{ width:80 }} />
              : `${fmtNum(wageredAmount)} ${cur}`}
          </div>
        </div>

        {/* MULTIPLIER */}
        <div style={{ background:`rgba(${t.bgColor},0.5)`, border:`1px solid ${ac}0.1)`, borderRadius: rad, padding:'8px 10px' }}>
          <div style={{ fontSize:'0.55em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Multiplier</div>
          <div style={{ fontSize:'0.82em', fontWeight:700, color: '#22d3ee', fontVariantNumeric:'tabular-nums' }}>
            {multiplier}x
          </div>
        </div>
      </div>
    </div>
  )
}
