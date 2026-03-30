import { useEffect, useState } from 'react'
import { getAll, getOne, setOne, onTableChange } from '../lib/store'
import PersonalBestsOverlay, { DEFAULT_THEME } from '../overlays/PersonalBestsOverlay'
import { Info, Palette, Copy, Check, RotateCcw, Medal, Search, Trophy, Gamepad2, BarChart3, TrendingUp } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  sectionLabel: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--label-color)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(212,175,55,0.08)' },
}

const BG_PRESETS     = [['10,10,22','#0a0a16'],['0,0,0','#000'],['8,10,30','#080a1e'],['18,8,40','#120828'],['15,15,15','#0f0f0f'],['20,8,20','#140814'],['240,237,230','#f0ede6'],['255,255,255','#ffffff'],['248,246,241','#f8f6f1'],['230,225,215','#e6e1d7']]
const ACCENT_PRESETS = [['99,102,241','#d4af37'],['139,92,246','#d4af37'],['59,130,246','#3b82f6'],['34,211,238','#d4af37'],['52,211,153','#34d399'],['236,72,153','#ec4899'],['251,146,60','#fb923c'],['239,68,68','#ef4444']]
const TEXT_PRESETS   = [['#ffffff','#ffffff'],['#e2e8f0','#e2e8f0'],['#c8cde8','#c8cde8'],['#f0e6ff','#f0e6ff']]
const FONT_OPTIONS   = [{ label:'Mono', value:'monospace' },{ label:'Sans', value:'system-ui, sans-serif' },{ label:'Inter', value:'Inter, sans-serif' },{ label:'Serif', value:'Georgia, serif' }]

const TOP3_GLOWS = [
  '0 0 18px rgba(245,158,11,0.35), inset 0 0 12px rgba(245,158,11,0.08)',
  '0 0 14px rgba(148,163,184,0.30), inset 0 0 10px rgba(148,163,184,0.06)',
  '0 0 14px rgba(180,83,9,0.30), inset 0 0 10px rgba(180,83,9,0.06)',
]
const TOP3_BORDER_COLORS = [
  'rgba(245,158,11,0.45)',
  'rgba(148,163,184,0.40)',
  'rgba(180,83,9,0.40)',
]
const RANK_COLORS = ['#fbbf24', '#94a3b8', '#cd7c3a']

function derivePersonalBests(entries) {
  const map = new Map()
  for (const e of entries) {
    if (!e.win || e.win <= 0) continue
    const key = e.name.toLowerCase()
    const existing = map.get(key)
    if (existing) {
      existing.best_win = Math.max(existing.best_win, e.win)
      existing.appearances += 1
    } else {
      map.set(key, {
        game_name: e.name,
        best_win: e.win,
        appearances: 1,
      })
    }
  }
  return Array.from(map.values())
}

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

function ThemePanel({ theme, onChange, tc }) {
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
                    padding:'3px 8px', borderRadius:6, fontSize:11, cursor:'pointer',
                    fontFamily: f.value,
                    background: theme.fontFamily === f.value ? 'rgba(212,175,55,0.12)' : 'rgba(20,20,40,0.8)',
                    border: `1px solid ${theme.fontFamily === f.value ? 'rgba(212,175,55,0.3)' : 'rgba(50,50,80,0.5)'}`,
                    color: theme.fontFamily === f.value ? '#d4af37' : '#5a5548',
                    transition:'all 0.12s',
                  }}>{tc[f.label.toLowerCase()] || f.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <p style={S.sectionLabel}>{tc.displayEffects}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Slider label={tc.maxEntries} value={theme.maxEntries} min={3} max={15} onChange={v => set('maxEntries', v)} />
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

export default function PersonalBests() {
  const { t } = useLang()
  const tc = t.common
  const tp = t.personalBests

  const [bests, setBests]         = useState([])
  const [showInfo, setShowInfo]   = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const [theme, setTheme]         = useState(DEFAULT_THEME)
  const [copied, setCopied]       = useState(false)
  const [sortMode, setSortMode]   = useState('best_win')
  const [search, setSearch]       = useState('')

  const baseUrl = window.location.origin
  const obsUrl  = `${baseUrl}/overlay/personalbests`

  const loadData = async () => {
    const entries = await getAll('bonushunt_entries')
    const derived = derivePersonalBests(entries)
    setBests(derived)
  }

  useEffect(() => {
    getOne('personalbests_theme').then(t => { if (t) setTheme(prev => ({ ...prev, ...t })) })
    loadData()
    const off1 = onTableChange('bonushunt_entries', loadData)
    return () => { off1() }
  }, [])

  const handleThemeChange = async (next) => { setTheme(next); await setOne('personalbests_theme', next) }
  const copyUrl = () => { navigator.clipboard.writeText(obsUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  // Filter and sort
  const filtered = bests.filter(b => {
    if (!search.trim()) return true
    return b.game_name.toLowerCase().includes(search.trim().toLowerCase())
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'appearances') return b.appearances - a.appearances
    return b.best_win - a.best_win
  })

  // Stats
  const totalGames   = bests.length
  const bestWin      = bests.length ? Math.max(...bests.map(b => b.best_win)) : 0
  const totalPlays   = bests.reduce((s, b) => s + b.appearances, 0)
  const avgBestWin   = bests.length ? bests.reduce((s, b) => s + b.best_win, 0) / bests.length : 0
  const highestWin   = sorted.length ? sorted[0]?.best_win || 0 : 0

  return (
    <div>
      {/* Action bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        {bests.length > 0 && <>
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

      {/* Info panel */}
      {showInfo && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:12,
          background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.12)',
          borderRadius:12, padding:'14px 18px', marginBottom:16,
          animation:'fade-up 0.18s ease-out',
        }}>
          <Medal size={16} style={{ color:'#fbbf24', flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#d4af37' }}>{tp.title}</span>
            <span style={{ fontSize:12, color:'#8a8478', lineHeight:1.6 }}>
              {tp.infoText}
            </span>
          </div>
        </div>
      )}

      {showTheme && <ThemePanel theme={theme} onChange={handleThemeChange} tc={tc} />}

      {/* Stats summary cards */}
      {bests.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, marginBottom:20 }}>
          {[
            { label: tp.totalGames,        value: totalGames.toString(),                                                           color: '#d4af37', icon: Gamepad2 },
            { label: tp.bestWin,           value: bestWin.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' \u20AC',       color: '#fbbf24', icon: Trophy },
            { label: tp.totalPlays,        value: totalPlays.toString(),                                                           color: '#34d399', icon: BarChart3 },
            { label: tp.avgWin,            value: avgBestWin.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' \u20AC',    color: '#f472b6', icon: TrendingUp },
          ].map(s => (
            <div key={s.label} style={{ ...S.card, padding:'14px 16px', textAlign:'center' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginBottom:6 }}>
                <s.icon size={11} style={{ color: s.color, opacity: 0.7 }} />
                <p style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.12em', margin:0 }}>{s.label}</p>
              </div>
              <p style={{ fontSize:16, fontWeight:700, color: s.color, fontVariantNumeric:'tabular-nums', margin:0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {bests.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>
          {tp.empty}
        </div>
      ) : (
        <>
          {/* Sort + Search controls */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            {/* Sort buttons */}
            {[
              { key: 'best_win', label: tp.highestWin },
              { key: 'appearances', label: tp.mostPlayed },
            ].map(s => {
              const active = sortMode === s.key
              return (
                <button key={s.key} onClick={() => setSortMode(s.key)} style={{
                  padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer',
                  background: active ? 'rgba(212,175,55,0.12)' : 'var(--input-bg)',
                  border: `1px solid ${active ? 'rgba(212,175,55,0.3)' : 'rgba(50,50,80,0.4)'}`,
                  color: active ? '#d4af37' : '#5a5548',
                  transition:'all 0.15s',
                }}>{s.label}</button>
              )
            })}

            {/* Search */}
            <div style={{ flex:1, minWidth:160, position:'relative' }}>
              <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#4a4842', pointerEvents:'none' }} />
              <input
                type="text"
                placeholder={tp.searchGame}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width:'100%', padding:'7px 12px 7px 30px', borderRadius:9, fontSize:12,
                  background:'var(--input-bg)', border:'1px solid rgba(50,50,80,0.4)',
                  color:'#c8cde8', outline:'none', transition:'border-color 0.15s',
                  boxSizing:'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.3)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(50,50,80,0.4)' }}
              />
            </div>
          </div>

          {/* Leaderboard table */}
          <div style={{ ...S.card, overflow:'hidden', marginBottom:20 }}>
            {/* Table header */}
            <div style={{
              display:'grid', gridTemplateColumns:'48px 1fr 130px 90px minmax(0, 150px)',
              padding:'10px 16px', borderBottom:'1px solid rgba(212,175,55,0.08)',
              fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#4a4842',
            }}>
              <span>#</span>
              <span>{tp.colGame}</span>
              <span style={{ textAlign:'right' }}>{tp.colBestWin}</span>
              <span style={{ textAlign:'right' }}>{tp.colAppearances}</span>
              <span style={{ textAlign:'right', paddingRight:4 }} className="win-bar-col">{tp.colWinBar}</span>
            </div>

            {/* Rows */}
            {sorted.length === 0 && (
              <div style={{ textAlign:'center', padding:'24px 0', color:'#4a4842', fontSize:12 }}>
                {tc.noResults} &quot;{search}&quot;
              </div>
            )}
            {sorted.map((entry, idx) => {
              const rank = idx + 1
              const isTop3 = rank <= 3
              const rankColor = isTop3 ? RANK_COLORS[rank - 1] : '#5a5548'
              const barPct = highestWin > 0 ? (entry.best_win / highestWin) * 100 : 0
              const barColor = isTop3 ? RANK_COLORS[rank - 1] : '#d4af37'

              return (
                <div key={entry.game_name} style={{
                  display:'grid', gridTemplateColumns:'48px 1fr 130px 90px minmax(0, 150px)',
                  padding:'10px 16px', alignItems:'center',
                  borderBottom:'1px solid rgba(34,34,74,0.25)',
                  background: isTop3 ? `rgba(${rank === 1 ? '245,158,11' : rank === 2 ? '148,163,184' : '180,83,9'},0.04)` : 'transparent',
                  boxShadow: isTop3 ? TOP3_GLOWS[rank - 1] : 'none',
                  borderLeft: isTop3 ? `2px solid ${TOP3_BORDER_COLORS[rank - 1]}` : '2px solid transparent',
                  transition:'all 0.15s',
                }}>
                  {/* Rank */}
                  <span style={{
                    width:24, height:24, borderRadius:7,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:700,
                    background: isTop3 ? `${rankColor}18` : 'rgba(30,30,60,0.5)',
                    border: `1px solid ${isTop3 ? rankColor + '44' : 'rgba(212,175,55,0.08)'}`,
                    color: rankColor,
                  }}>
                    {rank}
                  </span>

                  {/* Game name */}
                  <span style={{
                    fontSize:13, fontWeight: isTop3 ? 600 : 500,
                    color: isTop3 ? '#e2e8f0' : '#a0a0d0',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    paddingRight:8,
                  }}>
                    {entry.game_name}
                  </span>

                  {/* Best win */}
                  <span style={{
                    textAlign:'right', fontSize:13, fontWeight:700,
                    color: rankColor,
                    fontVariantNumeric:'tabular-nums',
                  }}>
                    {entry.best_win.toLocaleString('de-DE', { minimumFractionDigits: 2 })} &euro;
                  </span>

                  {/* Appearances */}
                  <span style={{
                    textAlign:'right', fontSize:12, fontWeight:500,
                    color:'#7a7468', fontVariantNumeric:'tabular-nums',
                  }}>
                    {entry.appearances}x
                  </span>

                  {/* Win bar */}
                  <div className="win-bar-col" style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', paddingLeft:8 }}>
                    <div style={{
                      width:'100%', height:6, borderRadius:3,
                      background:'rgba(30,30,60,0.6)',
                      overflow:'hidden',
                    }}>
                      <div style={{
                        width: `${barPct}%`, height:'100%', borderRadius:3,
                        background: `linear-gradient(90deg, ${barColor}66, ${barColor})`,
                        transition:'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Overlay preview */}
          <div style={{ ...S.card, border:'1px solid rgba(212,175,55,0.2)', overflow:'visible' }}>
            <div style={{ padding:24 }}>
              <PersonalBestsOverlay theme={theme} />
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
        </>
      )}

      {/* Responsive style: hide win-bar column on narrow screens */}
      <style>{`
        @media (max-width: 700px) {
          .win-bar-col { display: none !important; }
        }
      `}</style>
    </div>
  )
}
