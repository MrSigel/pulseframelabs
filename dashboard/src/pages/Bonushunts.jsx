import { useEffect, useState } from 'react'
import { getAll, getOne, setOne, insert, update, remove, removeWhere, onTableChange } from '../lib/store'
import BonushuntOverlay, { DEFAULT_THEME } from '../overlays/BonushuntOverlay'
import { Plus, Trash2, Copy, Check, Info, Palette, RotateCcw, Gem } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
  sectionLabel: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--label-color)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(212,175,55,0.08)' },
}

const BG_PRESETS     = [['10,10,22','#0a0a16'],['0,0,0','#000'],['8,10,30','#080a1e'],['18,8,40','#120828'],['15,15,15','#0f0f0f'],['20,8,20','#140814'],['240,237,230','#f0ede6'],['255,255,255','#ffffff'],['248,246,241','#f8f6f1'],['230,225,215','#e6e1d7']]
const ACCENT_PRESETS = [['99,102,241','#d4af37'],['139,92,246','#d4af37'],['59,130,246','#3b82f6'],['34,211,238','#d4af37'],['52,211,153','#34d399'],['236,72,153','#ec4899'],['251,146,60','#fb923c'],['239,68,68','#ef4444']]
const POS_PRESETS   = [['#34d399','#34d399'],['#4ade80','#4ade80'],['#22c55e','#22c55e'],['#a3e635','#a3e635']]
const NEG_PRESETS   = [['#f87171','#f87171'],['#ef4444','#ef4444'],['#fb923c','#fb923c'],['#f43f5e','#f43f5e']]
const TEXT_PRESETS  = [['#ffffff','#ffffff'],['#e2e8f0','#e2e8f0'],['#c8cde8','#c8cde8'],['#f0e6ff','#f0e6ff']]
const FONT_OPTIONS  = [{ labelKey:'mono', value:'monospace' },{ labelKey:'sans', value:'system-ui, sans-serif' },{ labelKey:'inter', value:'Inter, sans-serif' },{ labelKey:'serif', value:'Georgia, serif' }]

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

function ThemePanel({ theme, onChange, tc, tb }) {
  const set = (key, val) => onChange({ ...theme, [key]: val })

  return (
    <div style={{ ...S.card, padding:20, marginBottom:16, animation:'fade-up 0.18s ease-out' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:20 }}>

        {/* Background */}
        <div>
          <p style={S.sectionLabel}>{tc.background}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <Swatches value={theme.bgColor} options={BG_PRESETS} onChange={v => set('bgColor', v)} />
            <Slider label={tc.opacity} value={Math.round(theme.bgOpacity * 100)} min={0} max={100} format={v => `${v}%`} onChange={v => set('bgOpacity', v / 100)} />
            <Slider label={tc.blur} value={theme.blur} min={0} max={24} format={v => `${v}px`} onChange={v => set('blur', v)} />
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <p style={S.sectionLabel}>{tc.accentColor}</p>
          <Swatches value={theme.accentColor} options={ACCENT_PRESETS} onChange={v => set('accentColor', v)} size={24} />
        </div>

        {/* Value Colors */}
        <div>
          <p style={S.sectionLabel}>{tb.valueColors}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div>
              <div style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>{tb.win}</div>
              <Swatches value={theme.positiveColor} options={POS_PRESETS} onChange={v => set('positiveColor', v)} />
            </div>
            <div>
              <div style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>{tb.loss}</div>
              <Swatches value={theme.negativeColor} options={NEG_PRESETS} onChange={v => set('negativeColor', v)} />
            </div>
            <div>
              <div style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>{tc.textColor}</div>
              <Swatches value={theme.textPrimary} options={TEXT_PRESETS} onChange={v => set('textPrimary', v)} />
            </div>
          </div>
        </div>

        {/* Layout */}
        <div>
          <p style={S.sectionLabel}>{tc.layout}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Slider label={tc.borderRadius} value={theme.borderRadius} min={0} max={24} format={v => `${v}px`} onChange={v => set('borderRadius', v)} />
            <Slider label={tc.padding} value={theme.padding} min={8} max={40} format={v => `${v}px`} onChange={v => set('padding', v)} />
            <Slider label={tc.borderWidth} value={theme.borderWidth} min={0} max={4} format={v => `${v}px`} onChange={v => set('borderWidth', v)} />
          </div>
        </div>

        {/* Font */}
        <div>
          <p style={S.sectionLabel}>{tc.font}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Slider label={tc.fontSize} value={Math.round(theme.fontSize * 10)} min={7} max={16} format={v => `${(v/10).toFixed(1)}x`} onChange={v => set('fontSize', v / 10)} />
            <div>
              <div style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{tc.fontFamily}</div>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {FONT_OPTIONS.map(f => (
                  <button key={f.value} onClick={() => set('fontFamily', f.value)} style={{
                    padding:'3px 8px', borderRadius:6, fontSize:11, cursor:'pointer',
                    fontFamily: f.value,
                    background: theme.fontFamily === f.value ? 'rgba(212,175,55,0.12)' : 'rgba(20,20,40,0.8)',
                    border: `1px solid ${theme.fontFamily === f.value ? 'rgba(212,175,55,0.3)' : 'rgba(50,50,80,0.5)'}`,
                    color: theme.fontFamily === f.value ? '#d4af37' : '#5a5548',
                    transition:'all 0.12s',
                  }}>{tc[f.labelKey]}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <p style={S.sectionLabel}>{tc.visibilityEffects}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <Toggle value={theme.showBorder}  onChange={v => set('showBorder', v)}  label={tc.showBorder} />
            <Toggle value={theme.glow}        onChange={v => set('glow', v)}        label={tc.glowEffect} />
            <Toggle value={theme.showHeader}  onChange={v => set('showHeader', v)}  label={tb.showTitle} />
            <Toggle value={theme.showProfit}  onChange={v => set('showProfit', v)}  label={tb.showProfit} />
            <Toggle value={theme.showTotalWin} onChange={v => set('showTotalWin', v)} label={tb.showTotalWin} />
            <Toggle value={theme.showNumbers} onChange={v => set('showNumbers', v)} label={tb.showNumbers} />
          </div>
        </div>

      </div>

      {/* Reset */}
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

export default function Bonushunts() {
  const { t } = useLang()
  const tb = t.bonushunt
  const tc = t.common
  const [hunts, setHunts] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const [theme, setTheme] = useState({ ...DEFAULT_THEME })
  const [form, setForm] = useState({ name:'', start_balance:'' })
  const [copied, setCopied] = useState(false)

  const baseUrl = window.location.origin
  const obsUrl  = `${baseUrl}/overlay/bonushunt?mode=normal`

  useEffect(() => {
    getAll('bonushunts').then(data => {
      setHunts(data)
      if (data.length) setSelectedId((data.find(h => h.status === 'active') || data[0]).id)
    })
    getOne('bonushunt_theme').then(t => { if (t) setTheme(prev => ({ ...prev, ...t })) })
  }, [])

  useEffect(() => {
    const off = onTableChange('bonushunts', () => getAll('bonushunts').then(d => setHunts(d)))
    return off
  }, [])

  const handleThemeChange = async (next) => { setTheme(next); await setOne('bonushunt_theme', next) }

  const createHunt = async () => {
    if (!form.name) return
    const bal = Number(form.start_balance) || 0
    const data = await insert('bonushunts', { name: form.name, start_balance: bal, current_balance: bal, status: 'active' })
    setHunts(prev => [data, ...prev])
    setSelectedId(data.id)
    setForm({ name:'', start_balance:'' })
    setShowNew(false)
  }

  const completeHunt = async () => {
    if (!selectedId) return
    await removeWhere('bonushunt_entries', 'bonushunt_id', selectedId)
    await remove('bonushunts', selectedId)
    setHunts(prev => { const next = prev.filter(h => h.id !== selectedId); setSelectedId(next[0]?.id || null); return next })
  }

  const copyUrl = () => { navigator.clipboard.writeText(obsUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div>
      {/* Action bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        {hunts.length > 0 && <>
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
        </>}

        <HoverBtn onClick={() => setShowNew(!showNew)}
          style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)' }}
          hoverStyle={{ background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
          <Plus size={14} /> {tb.newBonushunt}
        </HoverBtn>
      </div>

      {showTheme && <ThemePanel theme={theme} onChange={handleThemeChange} tc={tc} tb={tb} />}

      {showInfo && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:12,
          background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.12)',
          borderRadius:12, padding:'14px 18px', marginBottom:16,
          animation:'fade-up 0.18s ease-out',
        }}>
          <Gem size={16} style={{ color:'#d4af37', flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#d4af37' }}>{tb.title}</span>
            <span style={{ fontSize:12, color:'#8a8478', lineHeight:1.6 }}>
              {tb.infoText}
            </span>
          </div>
        </div>
      )}

      {showNew && (
        <div style={{ ...S.card, padding:20, marginBottom:20, animation:'fade-up 0.2s ease-out' }}>
          <p style={S.label}>{tb.newBonushunt}</p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
            <input className="input" style={{ flex:'1 1 200px' }} placeholder={tb.huntName}
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && createHunt()} />
            <input className="input" style={{ width:140 }} placeholder={tb.startBalance} type="number"
              value={form.start_balance} onChange={e => setForm({...form, start_balance: e.target.value})} />
            <HoverBtn onClick={createHunt} disabled={!form.name}
              style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', opacity: !form.name ? 0.5 : 1 }}
              hoverStyle={form.name ? { background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 18px rgba(212,175,55,0.4)', transform:'translateY(-1px)' } : {}}>
              <Check size={14} /> {tc.create}
            </HoverBtn>
          </div>
        </div>
      )}

      {hunts.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>{tb.empty}</div>
      ) : (
        <div style={{ ...S.card, border:'1px solid rgba(212,175,55,0.2)', overflow:'visible' }}>
          <div style={{ padding:24 }}>
            {selectedId && <BonushuntOverlay huntId={selectedId} editable showTooltips={showInfo} theme={theme} />}
          </div>

          <div style={{ padding:'10px 16px', borderTop:'1px solid rgba(212,175,55,0.06)', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'#d4af37', animation:'glow-pulse 2s ease-in-out infinite', flexShrink:0 }} />
            <span style={{ fontSize:10, color:'#e2e8f0', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{obsUrl}</span>
            <HoverBtn onClick={copyUrl}
              style={{ borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, background: copied ? 'rgba(52,211,153,0.15)':'rgba(212,175,55,0.18)', borderColor: copied ? 'rgba(52,211,153,0.5)':'rgba(212,175,55,0.5)', color: copied ? '#34d399':'#d4af37', boxShadow: copied ? '0 0 10px rgba(52,211,153,0.15)':'0 0 10px rgba(212,175,55,0.15)' }}
              hoverStyle={!copied ? { background:'rgba(212,175,55,0.28)', boxShadow:'0 0 18px rgba(212,175,55,0.3)', transform:'translateY(-1px)' } : {}}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? tc.copied : tc.copyObs}
            </HoverBtn>
            <HoverBtn onClick={completeHunt}
              style={{ borderRadius:8, padding:'7px 12px', fontSize:12, fontWeight:600, background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.25)', color:'#f87171' }}
              hoverStyle={{ background:'rgba(239,68,68,0.18)', borderColor:'rgba(239,68,68,0.5)', boxShadow:'0 0 14px rgba(239,68,68,0.2)', transform:'translateY(-1px)' }}>
              <Trash2 size={12} /> {tb.completed}
            </HoverBtn>
          </div>
        </div>
      )}
    </div>
  )
}
