import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { getAll, getOne, setOne, insert, update, remove, clearTable, onTableChange } from '../lib/store'
import PredictionsOverlay, { DEFAULT_THEME } from '../overlays/PredictionsOverlay'
import { Info, Palette, Copy, Check, RotateCcw, Target, Trash2, Trophy, Plus } from 'lucide-react'

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
  sectionLabel: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--label-color)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(212,175,55,0.08)' },
}

const BG_PRESETS     = [['10,10,22','#0a0a16'],['0,0,0','#000'],['8,10,30','#080a1e'],['18,8,40','#120828'],['15,15,15','#0f0f0f'],['20,8,20','#140814'],['240,237,230','#f0ede6'],['255,255,255','#ffffff'],['248,246,241','#f8f6f1'],['230,225,215','#e6e1d7']]
const ACCENT_PRESETS = [['99,102,241','#d4af37'],['139,92,246','#d4af37'],['59,130,246','#3b82f6'],['34,211,238','#d4af37'],['52,211,153','#34d399'],['236,72,153','#ec4899'],['251,146,60','#fb923c'],['239,68,68','#ef4444']]
const TEXT_PRESETS   = [['#ffffff','#ffffff'],['#e2e8f0','#e2e8f0'],['#c8cde8','#c8cde8'],['#f0e6ff','#f0e6ff']]
const FONT_OPTIONS   = [{ labelKey:'mono', value:'monospace' },{ labelKey:'sans', value:'system-ui, sans-serif' },{ labelKey:'inter', value:'Inter, sans-serif' },{ labelKey:'serif', value:'Georgia, serif' }]

const RANK_COLORS = ['#fbbf24', '#94a3b8', '#cd7c3a']

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
                  }}>{tc[f.labelKey]}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <p style={S.sectionLabel}>{tc.displayEffects}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
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

// ── Main page ───────────────────────────────────────────────────────────────
export default function Predictions() {
  const { t } = useLang()
  const tc = t.common
  const { user } = useAuth()
  const tp = t.predictions

  const [activeTab, setActiveTab]   = useState('tippspiel')
  const [showInfo, setShowInfo]     = useState(false)
  const [showTheme, setShowTheme]   = useState(false)
  const [theme, setTheme]           = useState(DEFAULT_THEME)
  const [copied, setCopied]         = useState(false)

  // Guessing Game state
  const [session, setSession]       = useState(null)
  const [entries, setEntries]       = useState([])
  const [targetInput, setTargetInput] = useState('')
  const [addUser, setAddUser]       = useState('')
  const [addGuess, setAddGuess]     = useState('')

  // Prediction Wall state
  const [round, setRound]           = useState(null)
  const [votes, setVotes]           = useState([])
  const [questionInput, setQuestionInput] = useState('')
  const [optionAInput, setOptionAInput]   = useState('')
  const [optionBInput, setOptionBInput]   = useState('')

  const baseUrl = window.location.origin
  const obsUrl  = `${baseUrl}/overlay/predictions?uid=${user?.id || ""}`

  const loadGuess = async () => {
    const sessions = await getAll('guess_sessions')
    const active = sessions.find(s => s.status === 'open' || s.status === 'closed' || s.status === 'finished') || null
    setSession(active)
    if (active) {
      const allEntries = await getAll('guess_entries')
      setEntries(allEntries.filter(e => e.session_id === active.id))
    } else {
      setEntries([])
    }
  }

  const loadPrediction = async () => {
    const rounds = await getAll('prediction_rounds')
    const active = rounds.find(r => r.status === 'open' || r.status === 'locked' || r.status === 'resolved') || null
    setRound(active)
    if (active) {
      const allVotes = await getAll('prediction_votes')
      setVotes(allVotes.filter(v => v.round_id === active.id))
    } else {
      setVotes([])
    }
  }

  useEffect(() => {
    loadGuess()
    loadPrediction()
    getOne('predictions_theme').then(t => { if (t) setTheme(prev => ({ ...prev, ...t })) })
    const off1 = onTableChange('guess_sessions', loadGuess)
    const off2 = onTableChange('guess_entries', loadGuess)
    const off3 = onTableChange('prediction_rounds', loadPrediction)
    const off4 = onTableChange('prediction_votes', loadPrediction)
    return () => { off1(); off2(); off3(); off4() }
  }, [])

  const handleThemeChange = async (next) => { setTheme(next); await setOne('predictions_theme', next) }
  const copyUrl = () => { navigator.clipboard.writeText(obsUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const hasData = !!session || !!round

  // ── Guessing Game actions ─────────────────────────────────────────────
  const startSession = async () => {
    // Clear any old finished sessions
    const old = await getAll('guess_sessions')
    for (const s of old) { if (s.status === 'finished') await remove('guess_sessions', s.id) }
    await insert('guess_sessions', { status: 'open', target_number: null })
    loadGuess()
  }

  const closeSession = async () => {
    if (!session) return
    await update('guess_sessions', session.id, { status: 'closed' })
    loadGuess()
  }

  const resolveSession = async () => {
    if (!session || !targetInput) return
    const target = parseFloat(targetInput)
    if (isNaN(target)) return
    await update('guess_sessions', session.id, { status: 'finished', target_number: target })
    setTargetInput('')
    loadGuess()
  }

  const resetSession = async () => {
    if (!session) return
    // Remove all entries for this session
    const allEntries = await getAll('guess_entries')
    for (const e of allEntries.filter(e => e.session_id === session.id)) await remove('guess_entries', e.id)
    await remove('guess_sessions', session.id)
    loadGuess()
  }

  const addManualGuess = async () => {
    if (!session || !addUser.trim() || !addGuess.trim()) return
    const guess = parseFloat(addGuess)
    if (isNaN(guess)) return
    const existing = entries.find(e => e.session_id === session.id && e.username === addUser.trim())
    if (existing) {
      await update('guess_entries', existing.id, { guess })
    } else {
      await insert('guess_entries', { session_id: session.id, username: addUser.trim(), guess })
    }
    setAddUser('')
    setAddGuess('')
    loadGuess()
  }

  // ── Prediction Wall actions ───────────────────────────────────────
  const startPrediction = async () => {
    if (!questionInput.trim() || !optionAInput.trim() || !optionBInput.trim()) return
    // Clear any old resolved rounds
    const old = await getAll('prediction_rounds')
    for (const r of old) { if (r.status === 'resolved') await remove('prediction_rounds', r.id) }
    await insert('prediction_rounds', { question: questionInput.trim(), option_a: optionAInput.trim(), option_b: optionBInput.trim(), status: 'open', result: null })
    setQuestionInput('')
    setOptionAInput('')
    setOptionBInput('')
    loadPrediction()
  }

  const lockPrediction = async () => {
    if (!round) return
    await update('prediction_rounds', round.id, { status: 'locked' })
    loadPrediction()
  }

  const resolvePrediction = async (winner) => {
    if (!round) return
    await update('prediction_rounds', round.id, { status: 'resolved', result: winner })
    loadPrediction()
  }

  const resetPrediction = async () => {
    if (!round) return
    const allVotes = await getAll('prediction_votes')
    for (const v of allVotes.filter(v => v.round_id === round.id)) await remove('prediction_votes', v.id)
    await remove('prediction_rounds', round.id)
    loadPrediction()
  }

  // Resolved tippspiel results
  let resolvedResults = []
  if (session && session.status === 'finished' && session.target_number != null) {
    resolvedResults = entries
      .map(e => ({ ...e, diff: Math.abs(e.guess - session.target_number) }))
      .sort((a, b) => a.diff - b.diff)
  }

  // Prediction vote counts
  const votesA = votes.filter(v => v.vote === 'a').length
  const votesB = votes.filter(v => v.vote === 'b').length

  const statusColors = { open: '#34d399', closed: '#f59e0b', finished: '#d4af37' }
  const predStatusColors = { open: '#34d399', locked: '#f59e0b', resolved: '#d4af37' }

  return (
    <div>
      {/* Action bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        {hasData && <>
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

        {!hasData && (
          <HoverBtn onClick={startSession}
            style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)' }}
            hoverStyle={{ background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
            <Plus size={14} /> {tp.newPrediction}
          </HoverBtn>
        )}
      </div>

      {/* Info panel */}
      {showInfo && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:12,
          background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.12)',
          borderRadius:12, padding:'14px 18px', marginBottom:16,
          animation:'fade-up 0.18s ease-out',
        }}>
          <Target size={16} style={{ color:'#fbbf24', flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#d4af37' }}>{tp.title}</span>
            <span style={{ fontSize:12, color:'#8a8478', lineHeight:1.6 }}>
              {tp.infoText}
            </span>
          </div>
        </div>
      )}

      {showTheme && <ThemePanel theme={theme} onChange={handleThemeChange} tc={tc} />}

      {!hasData ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>
          {tp.noActive}
        </div>
      ) : <>

      {/* Tab system */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
        {[
          { key: 'tippspiel', label: tp.guessingGame },
          { key: 'prediction_wall', label: tp.predictionWall },
        ].map(tab => {
          const active = activeTab === tab.key
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer',
              background: active ? 'rgba(212,175,55,0.12)' : 'var(--input-bg)',
              border: `1px solid ${active ? 'rgba(212,175,55,0.3)' : 'rgba(50,50,80,0.4)'}`,
              color: active ? '#d4af37' : '#5a5548',
              transition:'all 0.15s',
            }}>{tab.label}</button>
          )
        })}
      </div>

      {/* ── Tab 1: Guessing Game ─────────────────────────────────────────── */}
      {activeTab === 'tippspiel' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>

          {/* Left: Session controls */}
          <div style={{ ...S.card, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <span style={S.label}>{tp.guessingGame}</span>
              {session && (
                <span style={{
                  fontSize:10, fontWeight:700, textTransform:'uppercase',
                  padding:'3px 10px', borderRadius:6,
                  background: `${statusColors[session.status]}18`,
                  border: `1px solid ${statusColors[session.status]}44`,
                  color: statusColors[session.status],
                }}>
                  {session.status === 'open' ? tc.open : session.status === 'closed' ? tc.closed : tc.finished}
                </span>
              )}
            </div>

            {/* No session */}
            {!session && (
              <div style={{ textAlign:'center', padding:'24px 0', color:'#4a4842', fontSize:12 }}>
                {tp.noActiveGuess}
              </div>
            )}

            {/* Open session */}
            {session && session.status === 'open' && (
              <>
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:12, color:'#8a8478', marginBottom:8 }}>{entries.length} {tp.guessesReceived}</p>

                  {/* Manual add form */}
                  <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                    <input className="input" placeholder={tc.username} value={addUser} onChange={e => setAddUser(e.target.value)} style={{ flex:1 }} />
                    <input className="input" placeholder={tp.number} value={addGuess} onChange={e => setAddGuess(e.target.value)} style={{ width:80 }} />
                    <HoverBtn onClick={addManualGuess} disabled={!addUser.trim() || !addGuess.trim()}
                      style={{ background:'rgba(212,175,55,0.1)', borderColor:'rgba(212,175,55,0.15)', color:'#d4af37', padding:'6px 12px', fontSize:12 }}
                      hoverStyle={{ background:'rgba(212,175,55,0.12)', transform:'translateY(-1px)' }}>
                      +
                    </HoverBtn>
                  </div>

                  {/* Entries list */}
                  {entries.length > 0 && (
                    <div style={{ maxHeight:200, overflowY:'auto', borderTop:'1px solid rgba(212,175,55,0.08)' }}>
                      {entries.map(e => (
                        <div key={e.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(34,34,74,0.25)' }}>
                          <span style={{ fontSize:12, color:'#c8cde8', fontWeight:500 }}>{e.username}</span>
                          <span style={{ fontSize:12, color:'#d4af37', fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{e.guess}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <HoverBtn onClick={closeSession}
                  style={{ background:'rgba(245,158,11,0.15)', borderColor:'rgba(245,158,11,0.3)', color:'#f59e0b', width:'100%', justifyContent:'center' }}
                  hoverStyle={{ background:'rgba(245,158,11,0.25)', transform:'translateY(-1px)' }}>
                  {tc.close}
                </HoverBtn>
              </>
            )}

            {/* Closed session */}
            {session && session.status === 'closed' && (
              <>
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:12, color:'#8a8478', marginBottom:8 }}>{entries.length} {tp.guessesReceived}</p>

                  {entries.length > 0 && (
                    <div style={{ maxHeight:200, overflowY:'auto', borderTop:'1px solid rgba(212,175,55,0.08)', marginBottom:12 }}>
                      {entries.map(e => (
                        <div key={e.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(34,34,74,0.25)' }}>
                          <span style={{ fontSize:12, color:'#c8cde8', fontWeight:500 }}>{e.username}</span>
                          <span style={{ fontSize:12, color:'#d4af37', fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{e.guess}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display:'flex', gap:8 }}>
                    <input className="input" placeholder={tp.targetValue} type="number" value={targetInput} onChange={e => setTargetInput(e.target.value)} style={{ flex:1 }} />
                    <HoverBtn onClick={resolveSession} disabled={!targetInput}
                      style={{ background:'rgba(212,175,55,0.1)', borderColor:'rgba(212,175,55,0.15)', color:'#d4af37' }}
                      hoverStyle={{ background:'rgba(212,175,55,0.12)', transform:'translateY(-1px)' }}>
                      {tp.resolve}
                    </HoverBtn>
                  </div>
                </div>
              </>
            )}

            {/* Finished session */}
            {session && session.status === 'finished' && (
              <>
                <div style={{ textAlign:'center', marginBottom:14 }}>
                  <span style={{ fontSize:10, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.12em' }}>{tp.targetValue}</span>
                  <p style={{ fontSize:22, fontWeight:700, color:'#e2e8f0', margin:'4px 0' }}>{session.target_number}</p>
                </div>

                {/* Results */}
                <div style={{ borderTop:'1px solid rgba(212,175,55,0.08)', marginBottom:16 }}>
                  {resolvedResults.map((r, idx) => {
                    const color = idx < 3 ? RANK_COLORS[idx] : '#5a5548'
                    return (
                      <div key={r.id} style={{
                        display:'flex', alignItems:'center', gap:10, padding:'8px 0',
                        borderBottom:'1px solid rgba(34,34,74,0.25)',
                        background: idx < 3 ? `${color}08` : 'transparent',
                      }}>
                        <span style={{
                          width:22, height:22, borderRadius:6,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:11, fontWeight:700, flexShrink:0,
                          background: `${color}18`, border: `1px solid ${color}44`, color,
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ flex:1, fontSize:12, fontWeight:600, color: idx < 3 ? '#e2e8f0' : '#a0a0d0' }}>{r.username}</span>
                        <span style={{ fontSize:12, color:'#7a7468', fontVariantNumeric:'tabular-nums' }}>{r.guess}</span>
                        <span style={{ fontSize:11, color:'#4a4842', fontVariantNumeric:'tabular-nums' }}>({r.diff === 0 ? 'exact' : `\u00B1${r.diff}`})</span>
                      </div>
                    )
                  })}
                </div>

                <HoverBtn onClick={resetSession}
                  style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', border:'1px solid rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)', width:'100%', justifyContent:'center' }}
                  hoverStyle={{ boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
                  {tp.newGuessingGame}
                </HoverBtn>
              </>
            )}
          </div>

          {/* Right: Overlay preview */}
          <div style={{ ...S.card, border:'1px solid rgba(212,175,55,0.2)', overflow:'visible' }}>
            <div style={{ padding:24 }}>
              <PredictionsOverlay theme={theme} />
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
              {session && (
                <HoverBtn onClick={resetSession}
                  style={{ borderRadius:8, padding:'7px 12px', fontSize:12, fontWeight:600, background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.25)', color:'#f87171' }}
                  hoverStyle={{ background:'rgba(239,68,68,0.18)', borderColor:'rgba(239,68,68,0.5)', boxShadow:'0 0 14px rgba(239,68,68,0.2)', transform:'translateY(-1px)' }}>
                  <Trash2 size={12} /> {tc.complete}
                </HoverBtn>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Prediction Wall ───────────────────────────────────── */}
      {activeTab === 'prediction_wall' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>

          {/* Left: Round controls */}
          <div style={{ ...S.card, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <span style={S.label}>{tp.predictionWall}</span>
              {round && (
                <span style={{
                  fontSize:10, fontWeight:700, textTransform:'uppercase',
                  padding:'3px 10px', borderRadius:6,
                  background: `${predStatusColors[round.status]}18`,
                  border: `1px solid ${predStatusColors[round.status]}44`,
                  color: predStatusColors[round.status],
                }}>
                  {round.status === 'open' ? tc.open : round.status === 'locked' ? tc.closed : tc.finished}
                </span>
              )}
            </div>

            {/* No round */}
            {!round && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div>
                  <label style={S.label}>{tp.question}</label>
                  <input className="input" placeholder={tp.egWho} value={questionInput} onChange={e => setQuestionInput(e.target.value)} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <label style={S.label}>{tp.optionA}</label>
                    <input className="input" placeholder={tp.optionA} value={optionAInput} onChange={e => setOptionAInput(e.target.value)} />
                  </div>
                  <div>
                    <label style={S.label}>{tp.optionB}</label>
                    <input className="input" placeholder={tp.optionB} value={optionBInput} onChange={e => setOptionBInput(e.target.value)} />
                  </div>
                </div>
                <HoverBtn onClick={startPrediction} disabled={!questionInput.trim() || !optionAInput.trim() || !optionBInput.trim()}
                  style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', border:'1px solid rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)', justifyContent:'center' }}
                  hoverStyle={{ boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
                  {tp.startPrediction}
                </HoverBtn>
              </div>
            )}

            {/* Open round */}
            {round && round.status === 'open' && (
              <>
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', marginBottom:12 }}>{round.question}</p>

                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)' }}>
                      <span style={{ fontSize:12, fontWeight:600, color:'#60a5fa' }}>{round.option_a}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:'#60a5fa', fontVariantNumeric:'tabular-nums' }}>{votesA}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
                      <span style={{ fontSize:12, fontWeight:600, color:'#f87171' }}>{round.option_b}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:'#f87171', fontVariantNumeric:'tabular-nums' }}>{votesB}</span>
                    </div>
                  </div>
                </div>

                <HoverBtn onClick={lockPrediction}
                  style={{ background:'rgba(245,158,11,0.15)', borderColor:'rgba(245,158,11,0.3)', color:'#f59e0b', width:'100%', justifyContent:'center' }}
                  hoverStyle={{ background:'rgba(245,158,11,0.25)', transform:'translateY(-1px)' }}>
                  {tp.lockVoting}
                </HoverBtn>
              </>
            )}

            {/* Locked round */}
            {round && round.status === 'locked' && (
              <>
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', marginBottom:12 }}>{round.question}</p>

                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)' }}>
                      <span style={{ fontSize:12, fontWeight:600, color:'#60a5fa' }}>{round.option_a}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:'#60a5fa', fontVariantNumeric:'tabular-nums' }}>{votesA}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
                      <span style={{ fontSize:12, fontWeight:600, color:'#f87171' }}>{round.option_b}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:'#f87171', fontVariantNumeric:'tabular-nums' }}>{votesB}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display:'flex', gap:8 }}>
                  <HoverBtn onClick={() => resolvePrediction('a')}
                    style={{ flex:1, background:'rgba(59,130,246,0.15)', borderColor:'rgba(59,130,246,0.3)', color:'#60a5fa', justifyContent:'center' }}
                    hoverStyle={{ background:'rgba(59,130,246,0.25)', transform:'translateY(-1px)' }}>
                    <Trophy size={12} /> {tp.optionAWins}
                  </HoverBtn>
                  <HoverBtn onClick={() => resolvePrediction('b')}
                    style={{ flex:1, background:'rgba(239,68,68,0.15)', borderColor:'rgba(239,68,68,0.3)', color:'#f87171', justifyContent:'center' }}
                    hoverStyle={{ background:'rgba(239,68,68,0.25)', transform:'translateY(-1px)' }}>
                    <Trophy size={12} /> {tp.optionBWins}
                  </HoverBtn>
                </div>
              </>
            )}

            {/* Resolved round */}
            {round && round.status === 'resolved' && (
              <>
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', marginBottom:12 }}>{round.question}</p>

                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
                    <div style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:8,
                      background: round.result === 'a' ? 'rgba(52,211,153,0.1)' : 'rgba(59,130,246,0.05)',
                      border: `1px solid ${round.result === 'a' ? 'rgba(52,211,153,0.4)' : 'rgba(59,130,246,0.15)'}`,
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {round.result === 'a' && <Trophy size={12} style={{ color:'#34d399' }} />}
                        <span style={{ fontSize:12, fontWeight:600, color: round.result === 'a' ? '#34d399' : '#60a5fa' }}>{round.option_a}</span>
                      </div>
                      <span style={{ fontSize:14, fontWeight:700, color: round.result === 'a' ? '#34d399' : '#60a5fa', fontVariantNumeric:'tabular-nums' }}>{votesA}</span>
                    </div>
                    <div style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:8,
                      background: round.result === 'b' ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.05)',
                      border: `1px solid ${round.result === 'b' ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.15)'}`,
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {round.result === 'b' && <Trophy size={12} style={{ color:'#34d399' }} />}
                        <span style={{ fontSize:12, fontWeight:600, color: round.result === 'b' ? '#34d399' : '#f87171' }}>{round.option_b}</span>
                      </div>
                      <span style={{ fontSize:14, fontWeight:700, color: round.result === 'b' ? '#34d399' : '#f87171', fontVariantNumeric:'tabular-nums' }}>{votesB}</span>
                    </div>
                  </div>
                </div>

                <HoverBtn onClick={resetPrediction}
                  style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', border:'1px solid rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)', width:'100%', justifyContent:'center' }}
                  hoverStyle={{ boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
                  {tp.newPrediction}
                </HoverBtn>
              </>
            )}
          </div>

          {/* Right: Overlay preview */}
          <div style={{ ...S.card, border:'1px solid rgba(212,175,55,0.2)', overflow:'visible' }}>
            <div style={{ padding:24 }}>
              <PredictionsOverlay theme={theme} />
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
              {round && (
                <HoverBtn onClick={resetPrediction}
                  style={{ borderRadius:8, padding:'7px 12px', fontSize:12, fontWeight:600, background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.25)', color:'#f87171' }}
                  hoverStyle={{ background:'rgba(239,68,68,0.18)', borderColor:'rgba(239,68,68,0.5)', boxShadow:'0 0 14px rgba(239,68,68,0.2)', transform:'translateY(-1px)' }}>
                  <Trash2 size={12} /> {tc.complete}
                </HoverBtn>
              )}
            </div>
          </div>
        </div>
      )}
      </>}
    </div>
  )
}
