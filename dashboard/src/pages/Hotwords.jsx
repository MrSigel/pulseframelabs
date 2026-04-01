import { useEffect, useState } from 'react'
import { getAll, remove, clearTable, getOne, setOne, insert, update, onTableChange } from '../lib/store'
import HotwordsOverlay, { DEFAULT_THEME } from '../overlays/HotwordsOverlay'
import { Trash2, Copy, Check, Palette, RotateCcw, Info, Flame, Save } from 'lucide-react'
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
const FONT_OPTIONS   = [{ label:'Mono', value:'monospace' },{ label:'Sans', value:'system-ui, sans-serif' },{ label:'Inter', value:'Inter, sans-serif' },{ label:'Serif', value:'Georgia, serif' }]

const WORD_COLORS = [
  '#d4af37', '#d4af37', '#60a5fa', '#34d399', '#fbbf24',
  '#f87171', '#e879f9', '#38bdf8', '#4ade80', '#fb923c',
]

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

function ThemePanel({ theme, onChange }) {
  const { t } = useLang()
  const tc = t.common
  const { user } = useAuth()
  const th = t.hotwords
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
          <Swatches value={theme.accentColor} options={ACCENT_PRESETS} onChange={v => set('accentColor', v)} size={24} />
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
            <Slider label={tc.borderWidth} value={theme.borderWidth} min={0} max={4} format={v => `${v}px`} onChange={v => set('borderWidth', v)} />
            <Slider label={th.maxEntries} value={theme.maxEntries || 10} min={5} max={30} onChange={v => set('maxEntries', v)} />
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
                  }}>{f.label}</button>
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

export default function Hotwords() {
  const { t } = useLang()
  const tc = t.common
  const { user } = useAuth()
  const th = t.hotwords
  const [entries, setEntries]       = useState([])
  const [settings, setSettings]     = useState(null)
  const [showInfo, setShowInfo]     = useState(false)
  const [showTheme, setShowTheme]   = useState(false)
  const [theme, setTheme]           = useState(DEFAULT_THEME)
  const [copied, setCopied]         = useState(false)
  const [excludedInput, setExcludedInput] = useState('')

  const baseUrl = window.location.origin
  const obsUrl  = `${baseUrl}/overlay/hotwords?uid=${user?.id || ""}`

  const loadData = async () => {
    const e = await getAll('hotword_entries')
    const sorted = e.sort((a, b) => (b.count || 0) - (a.count || 0))
    const s = await getOne('hotword_settings')
    setEntries(sorted)
    if (s) {
      setSettings(s)
      setExcludedInput(Array.isArray(s.excluded_words) ? s.excluded_words.join(', ') : (s.excluded_words || ''))
    }
  }

  useEffect(() => {
    loadData()
    getOne('hotwords_theme').then(t => { if (t) setTheme(prev => ({ ...prev, ...t })) })
    const off = onTableChange('hotword_entries', loadData)
    return off
  }, [])

  const handleThemeChange = async (next) => { setTheme(next); await setOne('hotwords_theme', next) }
  const clearHotwords     = async () => { await clearTable('hotword_entries'); setEntries([]) }
  const deleteEntry       = async (id) => { await remove('hotword_entries', id); setEntries(prev => prev.filter(e => e.id !== id)) }
  const copyUrl           = () => { navigator.clipboard.writeText(obsUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const saveExcluded = async () => {
    const words = excludedInput.split(',').map(w => w.trim()).filter(Boolean)
    const data = { excluded_words: words }
    await setOne('hotword_settings', data)
    setSettings(data)
  }

  const totalWords    = entries.length
  const totalMentions = entries.reduce((s, e) => s + (e.count || 0), 0)
  const topWord       = entries.length > 0 ? entries[0] : null

  const hasEntries = entries.length > 0

  return (
    <div>
      {/* Action bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        {hasEntries && <>
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
      </div>

      {showTheme && <ThemePanel theme={theme} onChange={handleThemeChange} />}

      {showInfo && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:12,
          background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.12)',
          borderRadius:12, padding:'14px 18px', marginBottom:16,
          animation:'fade-up 0.18s ease-out',
        }}>
          <Flame size={16} style={{ color:'#d4af37', flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#d4af37' }}>{th.title}</span>
            <span style={{ fontSize:12, color:'#8a8478', lineHeight:1.6 }}>
              {th.infoText}
            </span>
          </div>
        </div>
      )}

      {!hasEntries ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>
          {th.empty}
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginBottom:20 }}>
            {[
              { label: th.totalWords,    value: totalWords },
              { label: th.totalMentions, value: totalMentions.toLocaleString() },
              { label: th.topWord,       value: topWord ? `${topWord.word} (${topWord.count})` : '—' },
            ].map(s => (
              <div key={s.label} style={{ ...S.card, padding:'14px 16px', textAlign:'center' }}>
                <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#4a4842', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#e2e8f0', fontVariantNumeric:'tabular-nums' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Two-column layout */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>

            {/* Left: Word list */}
            <div style={{ ...S.card, overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid rgba(212,175,55,0.08)' }}>
                <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#4a4842' }}>{th.wordList}</span>
                <HoverBtn onClick={clearHotwords}
                  style={{ borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:600, background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.25)', color:'#f87171' }}
                  hoverStyle={{ background:'rgba(239,68,68,0.18)', borderColor:'rgba(239,68,68,0.5)', boxShadow:'0 0 14px rgba(239,68,68,0.2)', transform:'translateY(-1px)' }}>
                  <Trash2 size={11} /> {th.clearAll}
                </HoverBtn>
              </div>
              <div style={{ maxHeight:400, overflowY:'auto' }}>
                {entries.map((entry, i) => {
                  const color = WORD_COLORS[i % WORD_COLORS.length]
                  return (
                    <div key={entry.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 16px', borderBottom:'1px solid #1a1a38' }} className="group">
                      <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }} />
                      <span style={{ fontSize:13, fontFamily:'monospace', color:'#c8cde8', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.word}</span>
                      <span style={{ fontSize:12, color:'#7a7468', fontVariantNumeric:'tabular-nums', flexShrink:0 }}>{entry.count}</span>
                      <button onClick={() => deleteEntry(entry.id)}
                        style={{ background:'none', border:'none', cursor:'pointer', padding:2, color:'#3a3a6a', lineHeight:0, transition:'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color='#f87171'} onMouseLeave={e => e.currentTarget.style.color='#3a3a6a'}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: Overlay preview + OBS URL */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ ...S.card, border:'1px solid rgba(212,175,55,0.2)', overflow:'visible' }}>
                <div style={{ padding:20 }}>
                  <HotwordsOverlay theme={theme} />
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
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Word Filter section */}
      {(hasEntries || settings) && (
        <div style={{ ...S.card, padding:20 }}>
          <span style={S.label}>{th.wordFilter}</span>
          <div style={{ display:'flex', gap:10, alignItems:'flex-end', marginTop:8 }}>
            <div style={{ flex:1 }}>
              <label style={{ ...S.label, marginBottom:4 }}>{th.excludedWords}</label>
              <input className="input" placeholder={th.filterPlaceholder}
                value={excludedInput} onChange={e => setExcludedInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveExcluded()} />
            </div>
            <HoverBtn onClick={saveExcluded}
              style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)' }}
              hoverStyle={{ background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
              <Save size={13} /> {tc.save}
            </HoverBtn>
          </div>
        </div>
      )}
    </div>
  )
}
