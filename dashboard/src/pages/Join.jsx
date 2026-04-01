import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { getAll, getOne, setOne, insert, update, remove, clearTable, onTableChange } from '../lib/store'
import JoinOverlay, { DEFAULT_THEME } from '../overlays/JoinOverlay'
import { Copy, Check, Info, Palette, RotateCcw, Users, Plus, Trash2 } from 'lucide-react'

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

// ── Main page ────────────────────────────────────────────────────────────
export default function Join() {
  const { t } = useLang()
  const tc = t.common
  const { user } = useAuth()
  const tj = t.join

  const [session, setSession]           = useState(null)
  const [participants, setParticipants] = useState([])
  const [showInfo, setShowInfo]         = useState(false)
  const [showTheme, setShowTheme]       = useState(false)
  const [theme, setTheme]               = useState(DEFAULT_THEME)
  const [copied, setCopied]             = useState(false)
  const [addForm, setAddForm]           = useState('')
  const [drawing, setDrawing]           = useState(false)
  const [displayName, setDisplayName]   = useState('')

  const baseUrl = window.location.origin
  const obsUrl  = `${baseUrl}/overlay/join?uid=${user?.id || ""}`

  const reload = async () => {
    const sessions = await getAll('join_sessions')
    const active = sessions.find(s => s.status === 'open' || s.status === 'closed' || s.status === 'finished') || null
    setSession(active)
    if (active) {
      const all = await getAll('join_participants')
      setParticipants(all.filter(p => p.session_id === active.id))
    } else {
      setParticipants([])
    }
  }

  useEffect(() => {
    reload()
    getOne('join_theme').then(t => { if (t) setTheme(prev => ({ ...prev, ...t })) })
    const off1 = onTableChange('join_sessions', reload)
    const off2 = onTableChange('join_participants', reload)
    return () => { off1(); off2() }
  }, [])

  const handleThemeChange = async (next) => { setTheme(next); await setOne('join_theme', next) }
  const copyUrl = () => { navigator.clipboard.writeText(obsUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const openSession = async () => {
    const data = await insert('join_sessions', { status: 'open', winner: null, created_at: new Date().toISOString() })
    setSession(data)
    setParticipants([])
    await setOne('join_draw_state', null)
  }

  const closeSession = async () => {
    if (!session) return
    await update('join_sessions', session.id, { status: 'closed' })
    reload()
  }

  const addParticipant = async () => {
    if (!addForm.trim() || !session) return
    const existing = participants.find(p => p.username.toLowerCase() === addForm.toLowerCase().trim())
    if (existing) return
    await insert('join_participants', { session_id: session.id, username: addForm.trim() })
    setAddForm('')
    reload()
  }

  const drawWinner = async () => {
    if (!session || participants.length === 0 || drawing) return
    setDrawing(true)

    const names = participants.map(p => p.username)
    const winnerName = names[Math.floor(Math.random() * names.length)]

    // Store spinning state for overlay
    await setOne('join_draw_state', { phase: 'spinning', participants: names, winner: winnerName, display_name: names[0] })

    // Animate: cycle through names with increasing delay
    let tick = 0
    const totalTicks = 30

    const runTick = async () => {
      tick++
      const randomName = names[Math.floor(Math.random() * names.length)]
      setDisplayName(randomName)
      await setOne('join_draw_state', { phase: 'spinning', participants: names, winner: winnerName, display_name: randomName })

      if (tick < totalTicks) {
        // Increasing delay: starts fast, slows down
        const delay = 60 + (tick * tick * 1.5)
        setTimeout(runTick, delay)
      } else {
        // Final: show winner
        setDisplayName(winnerName)
        await update('join_sessions', session.id, { status: 'finished', winner: winnerName })
        await setOne('join_draw_state', { phase: 'winner', winner: winnerName, participants: names })
        setDrawing(false)
        reload()
      }
    }

    setTimeout(runTick, 60)
  }

  const newRound = async () => {
    setShowTheme(false); setShowInfo(false)
    // Remove old session and participants
    if (session) {
      const oldParticipants = (await getAll('join_participants')).filter(p => p.session_id === session.id)
      for (const p of oldParticipants) await remove('join_participants', p.id)
      await remove('join_sessions', session.id)
    }
    await setOne('join_draw_state', null)
    setSession(null)
    setParticipants([])
    setDisplayName('')
  }

  const statusColor = session?.status === 'open' ? '#34d399' : session?.status === 'closed' ? '#3b82f6' : session?.status === 'finished' ? '#fbbf24' : '#4a4842'
  const statusLabel = session?.status === 'open' ? tc.open : session?.status === 'closed' ? tc.closed : session?.status === 'finished' ? tc.finished : ''

  return (
    <div>
      {/* Action bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        {session && <>
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

        {!session && (
          <HoverBtn onClick={openSession}
            style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)' }}
            hoverStyle={{ background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
            <Plus size={14} /> {tj.newJoin}
          </HoverBtn>
        )}
      </div>

      {showTheme && <ThemePanel theme={theme} onChange={handleThemeChange} tc={tc} />}

      {showInfo && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:12,
          background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.12)',
          borderRadius:12, padding:'14px 18px', marginBottom:16,
          animation:'fade-up 0.18s ease-out',
        }}>
          <Users size={16} style={{ color:'#d4af37', flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#d4af37' }}>{tj.title}</span>
            <span style={{ fontSize:12, color:'#8a8478', lineHeight:1.6 }}>
              {tj.infoText}
            </span>
          </div>
        </div>
      )}

      {/* No session state */}
      {!session ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>
          {tj.noActive}
        </div>
      ) : (
        <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>

          {/* Left: Session controls */}
          <div style={{ flex:'1 1 380px', ...S.card, padding:20, overflow:'visible' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Users size={14} style={{ color:'#d4af37' }} />
                <span style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{tj.title}</span>
                <span style={{
                  fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:4, textTransform:'uppercase', letterSpacing:'0.08em',
                  background: session.status === 'open' ? 'rgba(52,211,153,0.12)' : session.status === 'closed' ? 'rgba(59,130,246,0.12)' : 'rgba(251,191,36,0.12)',
                  color: statusColor,
                  border: `1px solid ${session.status === 'open' ? 'rgba(52,211,153,0.3)' : session.status === 'closed' ? 'rgba(59,130,246,0.3)' : 'rgba(251,191,36,0.3)'}`,
                }}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Status-dependent buttons */}
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
              {session.status === 'open' && (
                <HoverBtn onClick={closeSession}
                  style={{ background:'rgba(239,68,68,0.12)', borderColor:'rgba(239,68,68,0.35)', color:'#f87171' }}
                  hoverStyle={{ background:'rgba(239,68,68,0.25)', borderColor:'rgba(239,68,68,0.6)', boxShadow:'0 0 14px rgba(239,68,68,0.2)', transform:'translateY(-1px)' }}>
                  {tj.closeJoin}
                </HoverBtn>
              )}

              {session.status === 'closed' && (
                <HoverBtn onClick={drawWinner} disabled={participants.length === 0 || drawing}
                  style={{
                    background: participants.length > 0 ? 'linear-gradient(135deg,#d4af37,#b8962e)' : 'rgba(50,50,80,0.5)',
                    borderColor: participants.length > 0 ? 'rgba(212,175,55,0.4)' : 'rgba(50,50,80,0.3)',
                    color: participants.length > 0 ? '#fff' : '#3a3a6a',
                    boxShadow: participants.length > 0 ? '0 0 14px rgba(212,175,55,0.25)' : 'none',
                    opacity: drawing ? 0.6 : 1,
                  }}
                  hoverStyle={participants.length > 0 && !drawing ? { background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' } : {}}>
                  {tj.drawWinner}
                </HoverBtn>
              )}

              {session.status === 'finished' && (
                <HoverBtn onClick={newRound}
                  style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)' }}
                  hoverStyle={{ background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
                  {tj.newRound}
                </HoverBtn>
              )}
            </div>

            {/* Winner display */}
            {session.status === 'finished' && session.winner && (
              <div style={{
                textAlign:'center', padding:'16px 0', marginBottom:16, borderRadius:10,
                background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.25)',
              }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{tc.winner}</div>
                <div style={{
                  fontSize:20, fontWeight:800, color:'#fbbf24',
                  textShadow:'0 0 16px rgba(251,191,36,0.4)',
                }}>
                  {session.winner}
                </div>
              </div>
            )}

            {/* Drawing animation in dashboard */}
            {drawing && (
              <div style={{
                textAlign:'center', padding:'16px 0', marginBottom:16, borderRadius:10,
                background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.25)',
              }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{tj.drawing}</div>
                <div style={{
                  fontSize:20, fontWeight:800, color:'#d4af37',
                  textShadow:'0 0 16px rgba(212,175,55,0.4)',
                }}>
                  {displayName || '...'}
                </div>
              </div>
            )}

            {/* Participant count */}
            <div style={{ marginBottom:12 }}>
              <p style={S.label}>{participants.length} {tj.participants}</p>
            </div>

            {/* Participant grid */}
            {participants.length > 0 ? (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
                {participants.map((p, i) => {
                  const isWinner = session.status === 'finished' && session.winner && p.username.toLowerCase() === session.winner.toLowerCase()
                  return (
                    <div key={p.id || i} style={{
                      display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:8, fontSize:12, fontWeight:600,
                      background: isWinner ? 'rgba(251,191,36,0.15)' : 'var(--input-bg)',
                      border: `1px solid ${isWinner ? 'rgba(251,191,36,0.4)' : 'rgba(212,175,55,0.08)'}`,
                      color: isWinner ? '#fbbf24' : '#c8cde8',
                      boxShadow: isWinner ? '0 0 10px rgba(251,191,36,0.15)' : 'none',
                    }}>
                      <span style={{ fontSize:10, color:'#4a4842', fontWeight:700, minWidth:14 }}>#{i + 1}</span>
                      {p.username}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ fontSize:12, color:'#4a4842', padding:'16px 0', textAlign:'center', marginBottom:16 }}>
                {tj.noParticipants}
              </div>
            )}

            {/* Manual add form (for testing) */}
            {session.status === 'open' && (
              <div>
                <p style={S.label}>{tj.addManually}</p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
                  <input className="input" style={{ flex:'1 1 160px' }} placeholder={tc.username}
                    value={addForm} onChange={e => setAddForm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addParticipant()} />
                  <HoverBtn onClick={addParticipant} disabled={!addForm.trim()}
                    style={{ background:'rgba(52,211,153,0.15)', borderColor:'rgba(52,211,153,0.4)', color:'#34d399', opacity: !addForm.trim() ? 0.5 : 1 }}
                    hoverStyle={{ background:'rgba(52,211,153,0.25)', boxShadow:'0 0 12px rgba(52,211,153,0.2)', transform:'translateY(-1px)' }}>
                    <Plus size={14} /> {tc.add}
                  </HoverBtn>
                </div>
              </div>
            )}
          </div>

          {/* Right: Overlay preview */}
          <div style={{ flex:'1 1 320px', minWidth:320 }}>
            <div style={{ ...S.card, border:'1px solid rgba(212,175,55,0.2)', overflow:'visible' }}>
              <div style={{ padding:'8px 16px', borderBottom:'1px solid rgba(212,175,55,0.06)' }}>
                <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#4a4842' }}>{tc.overlayPreview}</span>
              </div>
              <div style={{ padding:16 }}>
                <JoinOverlay theme={theme} />
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
                <HoverBtn onClick={newRound}
                  style={{ borderRadius:8, padding:'7px 12px', fontSize:12, fontWeight:600, background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.25)', color:'#f87171' }}
                  hoverStyle={{ background:'rgba(239,68,68,0.18)', borderColor:'rgba(239,68,68,0.5)', boxShadow:'0 0 14px rgba(239,68,68,0.2)', transform:'translateY(-1px)' }}>
                  <Trash2 size={12} /> {tc.complete}
                </HoverBtn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
