import { useEffect, useState } from 'react'
import { getAll, getOne, setOne, insert, remove, update, onTableChange } from '../lib/store'
import WagerBarOverlay, { DEFAULT_THEME } from '../overlays/WagerBarOverlay'
import { Plus, Trash2, Copy, Check, Palette, RotateCcw, Info, Gauge } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
  sectionLabel: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--label-color)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(212,175,55,0.08)' },
}

const BG_PRESETS     = [['10,10,22','#0a0a16'],['0,0,0','#000'],['8,10,30','#080a1e'],['18,8,40','#120828'],['15,15,15','#0f0f0f'],['20,8,20','#140814'],['240,237,230','#f0ede6'],['255,255,255','#ffffff'],['248,246,241','#f8f6f1'],['230,225,215','#e6e1d7']]
const ACCENT_PRESETS = [['99,102,241','#d4af37'],['139,92,246','#d4af37'],['59,130,246','#3b82f6'],['34,211,238','#d4af37'],['52,211,153','#34d399'],['236,72,153','#ec4899'],['251,146,60','#fb923c'],['239,68,68','#ef4444']]
const TEXT_PRESETS   = [['#ffffff','#ffffff'],['#e2e8f0','#e2e8f0'],['#c8cde8','#c8cde8'],['#f0e6ff','#f0e6ff']]
const FONT_OPTIONS   = [{ labelKey:'mono', value:'monospace' },{ labelKey:'sans', value:'system-ui, sans-serif' },{ labelKey:'inter', value:'Inter, sans-serif' },{ labelKey:'serif', value:'Georgia, serif' }]

function HoverBtn({ onClick, children, style, hoverStyle, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:6, borderRadius:10, padding:'8px 14px', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', transition:'all 0.15s', border:'1px solid transparent', ...style, ...(hov && !disabled ? hoverStyle : {}) }}>
      {children}
    </button>
  )
}

function Slider({ label, value, min, max, step = 1, format, onChange }) {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:10, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</span>
        <span style={{ fontSize:10, color:'#7a7468', fontVariantNumeric:'tabular-nums' }}>{format ? format(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="theme-slider" style={{ width:'100%' }} />
    </div>
  )
}

function Swatches({ value, options, onChange, size = 22 }) {
  return (
    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
      {options.map(([val, hex]) => (
        <button key={val} onClick={() => onChange(val)} title={val}
          style={{
            width: size, height: size, borderRadius:6, cursor:'pointer', flexShrink:0,
            background: hex,
            border: `2px solid ${value === val ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: value === val ? `0 0 8px ${hex}88` : 'none',
            transition:'all 0.12s',
          }}
        />
      ))}
    </div>
  )
}

function Toggle({ value, onChange, label }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
      <div onClick={() => onChange(!value)} style={{
        width:32, height:18, borderRadius:9, position:'relative', cursor:'pointer', flexShrink:0,
        background: value ? 'rgba(212,175,55,0.8)' : 'rgba(40,40,70,0.8)',
        border: `1px solid ${value ? 'rgba(212,175,55,0.3)' : 'rgba(60,60,90,0.5)'}`,
        transition:'all 0.2s',
      }}>
        <div style={{ position:'absolute', top:2, left: value ? 13 : 2, width:12, height:12, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.4)' }} />
      </div>
      <span style={{ fontSize:11, color:'#7a7468' }}>{label}</span>
    </label>
  )
}

function ThemePanel({ theme, onChange, tc, tw }) {
  const set = (key, val) => onChange({ ...theme, [key]: val })

  return (
    <div style={{ ...S.card, padding:20, marginBottom:16, animation:'fade-up 0.18s ease-out' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:20 }}>

        <div>
          <p style={S.sectionLabel}>{tc.background}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <Swatches value={theme.bgColor} options={BG_PRESETS} onChange={v => set('bgColor', v)} />
            <Slider label={tc.opacity} value={Math.round(theme.bgOpacity * 100)} min={0} max={100} format={v => `${v}%`} onChange={v => set('bgOpacity', v / 100)} />
            <Slider label={tc.blur} value={theme.blur} min={0} max={24} format={v => `${v}px`} onChange={v => set('blur', v)} />
          </div>
        </div>

        <div>
          <p style={S.sectionLabel}>{tc.accentColor}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Swatches value={theme.accentColor} options={ACCENT_PRESETS} onChange={v => set('accentColor', v)} size={24} />
          </div>
        </div>

        <div>
          <p style={S.sectionLabel}>{tc.textColor}</p>
          <Swatches value={theme.textPrimary} options={TEXT_PRESETS} onChange={v => set('textPrimary', v)} />
        </div>

        <div>
          <p style={S.sectionLabel}>{tc.layout}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Slider label={tc.borderRadius} value={theme.borderRadius} min={0} max={24} format={v => `${v}px`} onChange={v => set('borderRadius', v)} />
            <Slider label={tc.padding} value={theme.padding} min={8} max={40} format={v => `${v}px`} onChange={v => set('padding', v)} />
            <Slider label={tc.barHeight} value={theme.barHeight} min={6} max={28} format={v => `${v}px`} onChange={v => set('barHeight', v)} />
            <Slider label={tc.borderWidth} value={theme.borderWidth} min={0} max={4} format={v => `${v}px`} onChange={v => set('borderWidth', v)} />
          </div>
        </div>

        <div>
          <p style={S.sectionLabel}>{tc.font}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Slider label={tc.fontSize} value={Math.round(theme.fontSize * 10)} min={7} max={16} format={v => `${(v/10).toFixed(1)}x`} onChange={v => set('fontSize', v / 10)} />
            <div>
              <div style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{tc.fontFamily}</div>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {FONT_OPTIONS.map(f => (
                  <button key={f.value} onClick={() => set('fontFamily', f.value)} style={{
                    padding:'3px 8px', borderRadius:6, fontSize:11, cursor:'pointer', fontFamily: f.value,
                    background: theme.fontFamily === f.value ? 'rgba(212,175,55,0.12)' : 'rgba(20,20,40,0.8)',
                    border: `1px solid ${theme.fontFamily === f.value ? 'rgba(212,175,55,0.3)' : 'rgba(50,50,80,0.5)'}`,
                    color: theme.fontFamily === f.value ? '#d4af37' : '#5a5548', transition:'all 0.12s',
                  }}>{tc[f.labelKey]}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <p style={S.sectionLabel}>{tc.visibilityEffects}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <Toggle value={theme.showBorder} onChange={v => set('showBorder', v)} label={tc.showBorder} />
            <Toggle value={theme.glow}       onChange={v => set('glow', v)}       label={tc.glowEffect} />
            <Slider label={tc.overlayScale} value={Math.round((theme.overlayScale || 1) * 100)} min={50} max={200} format={v => v + '%'} onChange={v => set('overlayScale', v / 100)} />
          </div>
        </div>

      </div>

      <div style={{ marginTop:16, paddingTop:12, borderTop:'1px solid rgba(212,175,55,0.08)', display:'flex', justifyContent:'flex-end' }}>
        <button onClick={() => onChange(DEFAULT_THEME)}
          style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#4a4842', background:'none', border:'1px solid rgba(60,60,90,0.4)', borderRadius:7, padding:'5px 10px', cursor:'pointer', transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color='#9090c0'; e.currentTarget.style.borderColor='rgba(212,175,55,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.color='#4a4842'; e.currentTarget.style.borderColor='rgba(60,60,90,0.4)' }}>
          <RotateCcw size={11} /> {tc.reset}
        </button>
      </div>
    </div>
  )
}

export default function WagerBar() {
  const { t } = useLang()
  const tw = t.wager
  const tc = t.common
  const { user } = useAuth()
  const [sessions, setSessions]     = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showNew, setShowNew]       = useState(false)
  const [showInfo, setShowInfo]     = useState(false)
  const [showTheme, setShowTheme]   = useState(false)
  const [theme, setTheme]           = useState(DEFAULT_THEME)
  const [copied, setCopied]         = useState(false)
  const [form, setForm]             = useState({
    casino_name: '', bonus_type: 'non-sticky', currency: 'EUR',
    deposit_amount: '', bonus_amount: '', wager_amount: '',
  })

  const baseUrl = window.location.origin
  const obsUrl  = `${baseUrl}/overlay/wager?uid=${user?.id || ""}`

  useEffect(() => {
    getOne('wager_theme').then(t => { if (t) setTheme(prev => ({ ...prev, ...t })) })
    getAll('wager_sessions').then(data => {
      setSessions(data)
      if (data.length) setSelectedId((data.find(s => s.status === 'active') || data[0]).id)
    })
  }, [])

  useEffect(() => {
    const off = onTableChange('wager_sessions', () => getAll('wager_sessions').then(d => setSessions(d)))
    return off
  }, [])

  const handleThemeChange = async (next) => { setTheme(next); await setOne('wager_theme', next) }

  const createSession = async () => {
    if (!form.casino_name || !form.wager_amount) return
    const data = await insert('wager_sessions', {
      casino_name:    form.casino_name,
      header_text:    '',
      bonus_type:     form.bonus_type,
      currency:       form.currency,
      deposit_amount: Number(form.deposit_amount) || 0,
      bonus_amount:   Number(form.bonus_amount) || 0,
      wager_amount:   Number(form.wager_amount) || 0,
      wagered_amount: 0,
      status:         'active',
    })
    setSessions(prev => [data, ...prev])
    setSelectedId(data.id)
    setForm({ casino_name:'', bonus_type:'non-sticky', currency:'EUR', deposit_amount:'', bonus_amount:'', wager_amount:'' })
    setShowNew(false)
  }

  const resetSession = async () => {
    if (!selectedId) return
    await update('wager_sessions', selectedId, {
      wagered_amount: 0,
      deposit_amount: 0,
      bonus_amount:   0,
      wager_amount:   0,
    })
    const data = await getAll('wager_sessions')
    setSessions(data)
  }

  const completeSession = async () => {
    if (!selectedId) return
    await remove('wager_sessions', selectedId)
    setSessions(prev => { const next = prev.filter(s => s.id !== selectedId); setSelectedId(next[0]?.id || null); return next })
  }

  const copyUrl = () => { navigator.clipboard.writeText(obsUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const currencySymbol = form.currency === 'USD' ? '$' : '€'

  return (
    <div>
      {/* Action bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        {sessions.length > 0 && <>
          <HoverBtn onClick={() => setShowInfo(!showInfo)}
            style={{ background: showInfo ? 'rgba(212,175,55,0.12)':'rgba(212,175,55,0.05)', borderColor: showInfo ? 'rgba(212,175,55,0.35)':'rgba(212,175,55,0.12)', color: showInfo ? '#d4af37':'#5a5548', boxShadow: showInfo ? '0 0 12px rgba(212,175,55,0.12)':'none' }}
            hoverStyle={{ background:'rgba(212,175,55,0.1)', borderColor:'rgba(212,175,55,0.3)', color:'#d4af37', transform:'translateY(-1px)' }}>
            <Info size={14} /> {tc.info}
          </HoverBtn>

          <HoverBtn onClick={() => setShowTheme(!showTheme)}
            style={{ background: showTheme ? 'rgba(212,175,55,0.15)':'rgba(212,175,55,0.06)', borderColor: showTheme ? 'rgba(212,175,55,0.55)':'rgba(212,175,55,0.2)', color: showTheme ? '#d4af37':'#4a4842', boxShadow: showTheme ? '0 0 12px rgba(212,175,55,0.15)':'none' }}
            hoverStyle={{ background:'rgba(212,175,55,0.14)', borderColor:'rgba(212,175,55,0.5)', color:'#d4af37', transform:'translateY(-1px)' }}>
            <Palette size={14} /> {tc.themeSettings}
          </HoverBtn>
          <HoverBtn onClick={resetSession}
            style={{ background:'rgba(251,191,36,0.08)', borderColor:'rgba(251,191,36,0.25)', color:'#fbbf24' }}
            hoverStyle={{ background:'rgba(251,191,36,0.18)', borderColor:'rgba(251,191,36,0.5)', boxShadow:'0 0 14px rgba(251,191,36,0.2)', transform:'translateY(-1px)' }}>
            <RotateCcw size={14} /> {tc.reset}
          </HoverBtn>
        </>}

        <HoverBtn onClick={() => setShowNew(!showNew)}
          style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)' }}
          hoverStyle={{ background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
          <Plus size={14} /> {tw.newWager}
        </HoverBtn>
      </div>

      {showTheme && <ThemePanel theme={theme} onChange={handleThemeChange} tc={tc} tw={tw} />}

      {showInfo && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:12,
          background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.12)',
          borderRadius:12, padding:'14px 18px', marginBottom:16,
          animation:'fade-up 0.18s ease-out',
        }}>
          <Gauge size={16} style={{ color:'#d4af37', flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#d4af37' }}>{tw.title}</span>
            <span style={{ fontSize:12, color:'#8a8478', lineHeight:1.6 }}>
              {tw.infoText}
            </span>
          </div>
        </div>
      )}

      {showNew && (
        <div style={{ ...S.card, padding:20, marginBottom:20, animation:'fade-up 0.2s ease-out' }}>
          <p style={S.label}>{tw.newWagerSession}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12, marginBottom:12 }}>
            <div>
              <label style={{ ...S.label, marginBottom:4 }}>{tw.casinoName}</label>
              <input className="input" placeholder="e.g. Stake" value={form.casino_name}
                onChange={e => setForm(p => ({ ...p, casino_name: e.target.value }))} />
            </div>
            <div>
              <label style={{ ...S.label, marginBottom:4 }}>{tw.bonusType}</label>
              <select className="input" value={form.bonus_type} onChange={e => setForm(p => ({ ...p, bonus_type: e.target.value }))}>
                <option value="non-sticky">{tw.nonSticky}</option>
                <option value="sticky">{tw.sticky}</option>
              </select>
            </div>
            <div>
              <label style={{ ...S.label, marginBottom:4 }}>{tw.currency}</label>
              <select className="input" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label style={{ ...S.label, marginBottom:4 }}>{tw.depositAmount} ({currencySymbol})</label>
              <input className="input" type="number" placeholder="0" value={form.deposit_amount}
                onChange={e => setForm(p => ({ ...p, deposit_amount: e.target.value }))} />
            </div>
            <div>
              <label style={{ ...S.label, marginBottom:4 }}>{tw.bonusAmount} ({currencySymbol})</label>
              <input className="input" type="number" placeholder="0" value={form.bonus_amount}
                onChange={e => setForm(p => ({ ...p, bonus_amount: e.target.value }))} />
            </div>
            <div>
              <label style={{ ...S.label, marginBottom:4 }}>{tw.wagerAmount} ({currencySymbol}) *</label>
              <input className="input" type="number" placeholder="10000" value={form.wager_amount}
                onChange={e => setForm(p => ({ ...p, wager_amount: e.target.value }))} />
            </div>
          </div>
          <HoverBtn onClick={createSession} disabled={!form.casino_name || !form.wager_amount}
            style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', opacity: (form.casino_name && form.wager_amount) ? 1 : 0.5 }}
            hoverStyle={(form.casino_name && form.wager_amount) ? { background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 18px rgba(212,175,55,0.4)', transform:'translateY(-1px)' } : {}}>
            <Check size={14} /> {tc.create}
          </HoverBtn>
        </div>
      )}

      {sessions.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>{tw.noSessions}</div>
      ) : (
        <div style={{ ...S.card, border:'1px solid rgba(212,175,55,0.2)', overflow:'visible' }}>
          <div style={{ padding:24 }}>
            {selectedId && <WagerBarOverlay sessionId={selectedId} editable theme={theme} />}
          </div>

          <div style={{ padding:'10px 16px', borderTop:'1px solid rgba(212,175,55,0.06)', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'#d4af37', animation:'glow-pulse 2s ease-in-out infinite', flexShrink:0 }} />
            <span style={{ fontSize:10, color:'var(--input-text)', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{obsUrl}</span>
            <HoverBtn onClick={copyUrl}
              style={{ borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, background: copied ? 'rgba(52,211,153,0.15)':'rgba(212,175,55,0.18)', borderColor: copied ? 'rgba(52,211,153,0.5)':'rgba(212,175,55,0.5)', color: copied ? '#34d399':'#d4af37', boxShadow: copied ? '0 0 10px rgba(52,211,153,0.15)':'0 0 10px rgba(212,175,55,0.15)' }}
              hoverStyle={!copied ? { background:'rgba(212,175,55,0.28)', boxShadow:'0 0 18px rgba(212,175,55,0.3)', transform:'translateY(-1px)' } : {}}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? tc.copied : tc.copyObs}
            </HoverBtn>
            <HoverBtn onClick={completeSession}
              style={{ borderRadius:8, padding:'7px 12px', fontSize:12, fontWeight:600, background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.25)', color:'#f87171' }}
              hoverStyle={{ background:'rgba(239,68,68,0.18)', borderColor:'rgba(239,68,68,0.5)', boxShadow:'0 0 14px rgba(239,68,68,0.2)', transform:'translateY(-1px)' }}>
              <Trash2 size={12} /> {tc.complete}
            </HoverBtn>
          </div>
        </div>
      )}
    </div>
  )
}
