import { useEffect, useState, useRef, useCallback } from 'react'
import { getAll, getOne, setOne, insert, remove, clearTable, update } from '../lib/store'
import SlotRequestsOverlay, { DEFAULT_THEME } from '../overlays/SlotRequestsOverlay'
import { Plus, Trash2, Copy, Check, Palette, RotateCcw, Sparkles, Lock, Unlock, Shuffle, Trophy, X, Info } from 'lucide-react'
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
                    padding:'3px 8px', borderRadius:6, fontSize:11, cursor:'pointer', fontFamily: f.value,
                    background: theme.fontFamily === f.value ? 'rgba(212,175,55,0.12)' : 'rgba(20,20,40,0.8)',
                    border: `1px solid ${theme.fontFamily === f.value ? 'rgba(212,175,55,0.3)' : 'rgba(50,50,80,0.5)'}`,
                    color: theme.fontFamily === f.value ? '#d4af37' : '#5a5548', transition:'all 0.12s',
                  }}>{tc[f.label.toLowerCase()] || f.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div>
          <p style={S.sectionLabel}>{tc.displayEffects}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Slider label={tc.maxEntries} value={theme.maxEntries} min={3} max={20} onChange={v => set('maxEntries', v)} />
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

const COLORS = ['#d4af37','#d4af37','#60a5fa','#34d399','#fbbf24','#f87171','#e879f9','#38bdf8']
const colorFor = (name) => COLORS[(name || '').charCodeAt(0) % COLORS.length]

export default function SlotRequests() {
  const { t } = useLang()
  const tc = t.common
  const ts = t.slotRequests

  const [requests, setRequests]   = useState([])
  const [config, setConfigState]  = useState({ open: true, selected_id: null })
  const [showNew, setShowNew]     = useState(false)
  const [showInfo, setShowInfo]   = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const [theme, setTheme]         = useState(DEFAULT_THEME)
  const [form, setForm]           = useState({ username: '', game: '' })
  const [copied, setCopied]       = useState(false)
  const [raffleAnim, setRaffleAnim] = useState(false)
  const [raffleModal, setRaffleModal] = useState(false)
  const [raffleDisplay, setRaffleDisplay] = useState('')
  const [raffleWinner, setRaffleWinner] = useState(null)
  const raffleTimers = useRef([])

  const baseUrl = window.location.origin
  const obsUrl  = `${baseUrl}/overlay/slotrequests`

  const loadRequests = async () => { const data = await getAll('slot_requests'); setRequests(data) }

  const pendingRequests = requests.filter(r => r.status !== 'raffled')

  useEffect(() => {
    loadRequests()
    getOne('slotrequests_theme').then(t => { if (t) setTheme(prev => ({ ...prev, ...t })) })
    getOne('slot_request_config').then(c => { if (c) setConfigState(c) })
  }, [])

  const saveConfig = async (next) => { setConfigState(next); await setOne('slot_request_config', next) }

  const handleThemeChange = async (next) => { setTheme(next); await setOne('slotrequests_theme', next) }

  const addRequest = async () => {
    if (!form.username || !form.game) return
    await insert('slot_requests', { username: form.username.trim(), game: form.game.trim(), status: 'pending' })
    setForm({ username: '', game: '' })
    await loadRequests()
  }

  const removeRequest = async (id) => {
    await remove('slot_requests', id)
    if (config.selected_id === id) await saveConfig({ ...config, selected_id: null })
    await loadRequests()
  }

  const clearAll = async () => {
    await clearTable('slot_requests')
    await saveConfig({ ...config, selected_id: null })
    setRequests([])
  }

  const toggleOpen = () => saveConfig({ ...config, open: !config.open })

  const cleanupTimers = () => { raffleTimers.current.forEach(t => clearTimeout(t)); raffleTimers.current = [] }

  const runRaffle = useCallback((pool) => {
    if (!pool || pool.length === 0) return
    cleanupTimers()
    setRaffleAnim(true)
    setRaffleModal(true)
    setRaffleWinner(null)
    setRaffleDisplay('')

    const ticks = []
    // Phase 1: 15 ticks at 60ms — fast
    for (let i = 0; i < 15; i++) ticks.push({ delay: i * 60, pool })
    const p1End = 15 * 60
    // Phase 2: 10 ticks at 150ms — medium
    for (let i = 0; i < 10; i++) ticks.push({ delay: p1End + i * 150, pool })
    const p2End = p1End + 10 * 150
    // Phase 3: 5 ticks at 350ms — slow
    for (let i = 0; i < 5; i++) ticks.push({ delay: p2End + i * 350, pool })
    const p3End = p2End + 5 * 350

    ticks.forEach(({ delay, pool: p }) => {
      const t = setTimeout(() => {
        const rand = p[Math.floor(Math.random() * p.length)]
        setRaffleDisplay(rand.username)
      }, delay)
      raffleTimers.current.push(t)
    })

    // Final: reveal winner after last tick + 600ms
    const finalDelay = p3End + 600
    const tf = setTimeout(() => {
      const winner = pool[Math.floor(Math.random() * pool.length)]
      setRaffleDisplay(winner.username)
      setRaffleWinner(winner)
      setRaffleAnim(false)
      saveConfig({ ...config, selected_id: winner.id })
    }, finalDelay)
    raffleTimers.current.push(tf)
  }, [config])

  const raffle = () => {
    if (pendingRequests.length === 0) return
    runRaffle(pendingRequests)
  }

  const handleReRoll = () => {
    runRaffle(pendingRequests)
  }

  const handleConfirmClear = async () => {
    if (raffleWinner) {
      await update('slot_requests', raffleWinner.id, { status: 'raffled' })
    }
    // Remove all pending requests
    const all = await getAll('slot_requests')
    for (const r of all) { if (r.status !== 'raffled') await remove('slot_requests', r.id) }
    setRaffleModal(false)
    setRaffleWinner(null)
    await loadRequests()
  }

  const handleConfirmKeep = async () => {
    if (raffleWinner) {
      await update('slot_requests', raffleWinner.id, { status: 'raffled' })
    }
    setRaffleModal(false)
    setRaffleWinner(null)
    await loadRequests()
  }

  const copyUrl = () => { navigator.clipboard.writeText(obsUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const hasRequests = requests.length > 0

  return (
    <div>
      {/* Raffle Modal */}
      {raffleModal && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:9999,
          background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          animation:'fade-up 0.15s ease-out',
        }}>
          <div style={{
            ...S.card, padding:32, minWidth:380, maxWidth:480, textAlign:'center',
            border:'1px solid rgba(251,191,36,0.3)',
            boxShadow:'0 0 60px rgba(251,191,36,0.1), 0 0 120px rgba(212,175,55,0.08)',
          }}>
            {!raffleWinner ? (
              <>
                <Shuffle size={28} style={{ color:'#fbbf24', marginBottom:16, animation:'spin 0.8s linear infinite' }} />
                <div style={{ fontSize:10, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:12 }}>
                  {ts.raffleInProgress}
                </div>
                <div style={{
                  fontSize:28, fontWeight:800, color:'#fbbf24', padding:'16px 0',
                  textShadow:'0 0 20px rgba(251,191,36,0.4)',
                  fontFamily:'monospace',
                }}>
                  {raffleDisplay || '...'}
                </div>
              </>
            ) : (
              <>
                <Trophy size={32} style={{ color:'#fbbf24', marginBottom:12 }} />
                <div style={{ fontSize:10, color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:8 }}>
                  {tc.winner}
                </div>
                <div style={{
                  fontSize:28, fontWeight:800, color:'#fff', marginBottom:6,
                  textShadow:'0 0 20px rgba(251,191,36,0.3)',
                }}>
                  {raffleWinner.username}
                </div>
                <div style={{ fontSize:15, color:'#d4af37', fontWeight:600, marginBottom:4 }}>
                  <Sparkles size={13} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />
                  {raffleWinner.game}
                </div>
                <div style={{ display:'flex', gap:8, marginTop:24, justifyContent:'center', flexWrap:'wrap' }}>
                  <HoverBtn onClick={handleReRoll}
                    style={{ background:'rgba(251,191,36,0.1)', borderColor:'rgba(251,191,36,0.35)', color:'#fbbf24' }}
                    hoverStyle={{ background:'rgba(251,191,36,0.2)', transform:'translateY(-1px)' }}>
                    <Shuffle size={13} /> {ts.reRoll}
                  </HoverBtn>
                  <HoverBtn onClick={handleConfirmClear}
                    style={{ background:'rgba(239,68,68,0.1)', borderColor:'rgba(239,68,68,0.3)', color:'#f87171' }}
                    hoverStyle={{ background:'rgba(239,68,68,0.18)', transform:'translateY(-1px)' }}>
                    <Trash2 size={13} /> {ts.confirmClear}
                  </HoverBtn>
                  <HoverBtn onClick={handleConfirmKeep}
                    style={{ background:'rgba(52,211,153,0.1)', borderColor:'rgba(52,211,153,0.35)', color:'#34d399' }}
                    hoverStyle={{ background:'rgba(52,211,153,0.18)', transform:'translateY(-1px)' }}>
                    <Check size={13} /> {ts.confirmKeep}
                  </HoverBtn>
                </div>
              </>
            )}
            {raffleWinner && (
              <button onClick={() => { setRaffleModal(false); setRaffleWinner(null) }}
                style={{ position:'absolute', top:12, right:12, background:'none', border:'none', cursor:'pointer', color:'#4a4842', padding:4 }}
                onMouseEnter={e => e.currentTarget.style.color='#9090c0'}
                onMouseLeave={e => e.currentTarget.style.color='#4a4842'}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {hasRequests && (<>
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
        </>)}

        <HoverBtn onClick={() => setShowNew(!showNew)}
          style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)' }}
          hoverStyle={{ background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
          <Plus size={14} /> {ts.newRequest}
        </HoverBtn>

        {hasRequests && <>
          <HoverBtn onClick={toggleOpen}
            style={{ background: config.open ? 'rgba(52,211,153,0.1)':'rgba(239,68,68,0.08)', borderColor: config.open ? 'rgba(52,211,153,0.35)':'rgba(239,68,68,0.25)', color: config.open ? '#34d399':'#f87171' }}
            hoverStyle={{ transform:'translateY(-1px)' }}>
            {config.open ? <Unlock size={13} /> : <Lock size={13} />}
            {config.open ? tc.open : tc.closed}
          </HoverBtn>

          <HoverBtn onClick={raffle} disabled={raffleAnim || pendingRequests.length === 0}
            style={{ background:'rgba(251,191,36,0.1)', borderColor:'rgba(251,191,36,0.35)', color:'#fbbf24', boxShadow: raffleAnim ? '0 0 16px rgba(251,191,36,0.3)' : 'none' }}
            hoverStyle={{ background:'rgba(251,191,36,0.18)', boxShadow:'0 0 16px rgba(251,191,36,0.3)', transform:'translateY(-1px)' }}>
            <Shuffle size={13} /> {raffleAnim ? ts.rolling : ts.raffle}
          </HoverBtn>

          <HoverBtn onClick={clearAll}
            style={{ background:'rgba(239,68,68,0.06)', borderColor:'rgba(239,68,68,0.2)', color:'#f87171' }}
            hoverStyle={{ background:'rgba(239,68,68,0.14)', borderColor:'rgba(239,68,68,0.4)', transform:'translateY(-1px)' }}>
            <Trash2 size={13} /> {tc.clearAll}
          </HoverBtn>
        </>}
      </div>

      {showTheme && <ThemePanel theme={theme} onChange={handleThemeChange} tc={tc} />}

      {showInfo && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:12,
          background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.12)',
          borderRadius:12, padding:'14px 18px', marginBottom:16,
          animation:'fade-up 0.18s ease-out',
        }}>
          <Sparkles size={16} style={{ color:'#d4af37', flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#d4af37' }}>{ts.title}</span>
            <span style={{ fontSize:12, color:'#8a8478', lineHeight:1.6 }}>
              {ts.infoText}
            </span>
          </div>
        </div>
      )}

      {showNew && (
        <div style={{ ...S.card, padding:20, marginBottom:20, animation:'fade-up 0.2s ease-out' }}>
          <p style={S.label}>{ts.newRequest}</p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
            <div style={{ flex:'0 0 160px' }}>
              <label style={{ ...S.label, marginBottom:4 }}>{tc.username}</label>
              <input className="input" placeholder={ts.viewerName} value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
            </div>
            <div style={{ flex:'1 1 200px' }}>
              <label style={{ ...S.label, marginBottom:4 }}>{tc.game}</label>
              <input className="input" placeholder={ts.egGame} value={form.game}
                onChange={e => setForm(p => ({ ...p, game: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addRequest()} />
            </div>
            <HoverBtn onClick={addRequest} disabled={!form.username || !form.game}
              style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', opacity: (form.username && form.game) ? 1 : 0.5 }}
              hoverStyle={(form.username && form.game) ? { background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 18px rgba(212,175,55,0.4)', transform:'translateY(-1px)' } : {}}>
              <Check size={14} /> {tc.add}
            </HoverBtn>
          </div>
        </div>
      )}

      {/* Request list + Overlay */}
      {!hasRequests ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>
          {ts.empty}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'flex-start' }}>

          {/* Left: Request list */}
          <div style={{ ...S.card, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e1e42', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#4a4842' }}>
                {pendingRequests.length} {ts.pendingTotal.split(' / ')[0]} / {requests.length} {ts.pendingTotal.split(' / ')[1]}
              </span>
              {config.selected_id && (() => {
                const sel = requests.find(r => r.id === config.selected_id)
                return sel ? (
                  <span style={{ fontSize:10, color:'#fbbf24', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                    <Sparkles size={10} /> {sel.game}
                  </span>
                ) : null
              })()}
            </div>
            <div style={{ maxHeight:400, overflowY:'auto' }}>
              {requests.map((r, idx) => {
                const isRaffled = r.status === 'raffled'
                return (
                  <div key={r.id} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'10px 16px',
                    borderBottom:'1px solid #14142e',
                    background: r.id === config.selected_id ? 'rgba(251,191,36,0.04)' : 'transparent',
                    opacity: isRaffled ? 0.4 : 1,
                    transition:'opacity 0.2s',
                  }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'#3a3a6a', width:20, textAlign:'center', flexShrink:0 }}>{idx + 1}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'#c8cde8', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {r.game}
                    </span>
                    {isRaffled && (
                      <span style={{
                        fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em',
                        background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.3)',
                        color:'#fbbf24', borderRadius:4, padding:'2px 6px', flexShrink:0,
                      }}>{ts.won}</span>
                    )}
                    <span style={{ fontSize:11, fontWeight:600, color: colorFor(r.username), flexShrink:0 }}>
                      {r.username}
                    </span>
                    <button onClick={() => removeRequest(r.id)}
                      style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'#3a3a6a', transition:'color 0.15s', flexShrink:0 }}
                      onMouseEnter={e => e.currentTarget.style.color='#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color='#3a3a6a'}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Overlay preview */}
          <div style={{ ...S.card, border:'1px solid rgba(212,175,55,0.2)', overflow:'visible' }}>
            <div style={{ padding:20 }}>
              <SlotRequestsOverlay theme={theme} />
            </div>
            <div style={{ padding:'10px 16px', borderTop:'1px solid rgba(212,175,55,0.06)', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#d4af37', animation:'glow-pulse 2s ease-in-out infinite', flexShrink:0 }} />
              <span style={{ fontSize:10, color:'#e2e8f0', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{obsUrl}</span>
              <HoverBtn onClick={copyUrl}
                style={{ borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, background: copied ? 'rgba(52,211,153,0.15)':'rgba(212,175,55,0.18)', borderColor: copied ? 'rgba(52,211,153,0.5)':'rgba(212,175,55,0.5)', color: copied ? '#34d399':'#d4af37' }}
                hoverStyle={!copied ? { background:'rgba(212,175,55,0.28)', transform:'translateY(-1px)' } : {}}>
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? tc.copied : tc.copyObs}
              </HoverBtn>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
