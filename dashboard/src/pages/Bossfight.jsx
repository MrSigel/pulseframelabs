import { useEffect, useState } from 'react'
import { getAll, getOne, setOne, insert, update, remove, onTableChange } from '../lib/store'
import BossfightOverlay, { DEFAULT_THEME } from '../overlays/BossfightOverlay'
import { Plus, Trash2, Check, Info, Palette, RotateCcw, Swords, Play, Crown, UserPlus, ChevronDown, Sparkles } from 'lucide-react'
import ObsUrlBar from '../components/ObsUrlBar'
import SpinningWheel from '../components/SpinningWheel'
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

        {/* Text Color */}
        <div>
          <p style={S.sectionLabel}>{tc.textColor}</p>
          <Swatches value={theme.textPrimary} options={TEXT_PRESETS} onChange={v => set('textPrimary', v)} />
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
                  }}>{f.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sichtbarkeit */}
        <div>
          <p style={S.sectionLabel}>{tc.visibilityEffects}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <Toggle value={theme.showBorder} onChange={v => set('showBorder', v)} label={tc.showBorder} />
            <Toggle value={theme.glow}       onChange={v => set('glow', v)}       label={tc.glowEffect} />
            <Slider label={tc.overlayScale} value={Math.round((theme.overlayScale || 1) * 100)} min={50} max={200} format={v => v + '%'} onChange={v => set('overlayScale', v / 100)} />
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

// ── Gauntlet Management Panel ──────────────────────────────────────────────
function GauntletPanel({ session, onUpdate }) {
  const { t } = useLang()
  const tc = t.common
  const { user } = useAuth()
  const tbf = t.bossfight
  const [addForm, setAddForm] = useState({ username: '', game: '' })
  const [showBossSelect, setShowBossSelect] = useState(false)
  const [showWheel, setShowWheel] = useState(false)
  const [showAmountPopup, setShowAmountPopup] = useState(false)
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')
  const [amountResult, setAmountResult] = useState(null)
  const BOSSFIGHT_MAX_FIGHTERS = 8

  const participants = session.participants || []
  const duels        = session.duels || []
  const currentDuel  = session.current_duel || 0
  const challengers  = participants.filter(p => p.username !== session.boss_name)
  const currentChallenger = challengers[currentDuel] || null

  const save = async (changes) => {
    await update('bossfights', session.id, changes)
    onUpdate()
  }

  const addParticipant = async () => {
    if (!addForm.username.trim()) return
    const existing = participants.find(p => p.username.toLowerCase() === addForm.username.toLowerCase().trim())
    if (existing) return
    const updated = [...participants, { username: addForm.username.trim(), game: addForm.game.trim(), is_eliminated: false }]
    await save({ participants: updated })
    setAddForm({ username: '', game: '' })
  }

  const removeParticipant = async (username) => {
    const updated = participants.filter(p => p.username !== username)
    // If boss was removed, clear boss
    const changes = { participants: updated }
    if (session.boss_name === username) {
      changes.boss_name = ''
      changes.boss_game = ''
    }
    await save(changes)
  }

  const setBoss = async (username) => {
    const p = participants.find(pp => pp.username === username)
    await save({ boss_name: username, boss_game: p?.game || '' })
    setShowBossSelect(false)
  }

  const startFight = async () => {
    if (!session.boss_name || participants.length < 2) return
    const challs = participants.filter(p => p.username !== session.boss_name)
    const newDuels = challs.map((c, i) => ({
      challenger: c.username,
      boss_game: session.boss_game || '',
      winner: null,
      round: i + 1,
    }))
    await save({
      status: 'animating',
      boss_lives: challs.length,
      boss_max_lives: challs.length,
      duels: newDuels,
      current_duel: 0,
      winner_side: null,
    })
    // After animation completes (overlay sets status to 'live' automatically)
    // Fallback: if overlay doesn't transition, force it after timeout
    setTimeout(async () => {
      const data = await getAll('bossfights')
      const current = data.find(x => x.id === session.id)
      if (current && current.status === 'animating') {
        await save({ status: 'live' })
      }
    }, 15000)
  }

  const handleWheelComplete = async (selectedParticipants) => {
    const updated = selectedParticipants.map(p => ({ username: p.username, game: p.game || '', is_eliminated: false }))
    await save({ participants: updated, boss_name: '', boss_game: '' })
    setShowWheel(false)
  }

  const recordWin = async (winner) => {
    // winner is 'boss' or 'challenger'
    const updatedDuels = [...duels]
    updatedDuels[currentDuel] = { ...updatedDuels[currentDuel], winner }

    // Mark challenger as eliminated
    const updatedParticipants = participants.map(p =>
      p.username === currentChallenger.username ? { ...p, is_eliminated: true } : p
    )

    let newLives = session.boss_lives
    if (winner === 'challenger') {
      newLives = newLives - 1
    }

    const nextDuel = currentDuel + 1
    let winnerSide = null

    if (newLives <= 0) {
      winnerSide = 'players'
    } else if (nextDuel >= challengers.length) {
      winnerSide = 'boss'
    }

    await save({
      duels: updatedDuels,
      participants: updatedParticipants,
      boss_lives: newLives,
      current_duel: winnerSide ? currentDuel : nextDuel,
      winner_side: winnerSide,
      status: winnerSide ? 'finished' : 'live',
    })
  }

  const completeFight = async () => {
    await remove('bossfights', session.id)
    onUpdate()
  }

  // ── Join Open phase ─────────────────────────────────────────────────────
  if (session.status === 'join_open') {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {/* Add participant form */}
        <div>
          <p style={S.label}>{tbf.addParticipant}</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
            <input className="input" style={{ flex:'1 1 140px' }} placeholder={tc.username}
              value={addForm.username} onChange={e => setAddForm(p => ({ ...p, username: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addParticipant()} />
            <input className="input" style={{ flex:'1 1 160px' }} placeholder={tc.game}
              value={addForm.game} onChange={e => setAddForm(p => ({ ...p, game: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addParticipant()} />
            <HoverBtn onClick={addParticipant} disabled={!addForm.username.trim()}
              style={{ background:'rgba(52,211,153,0.15)', borderColor:'rgba(52,211,153,0.4)', color:'#34d399', opacity: !addForm.username.trim() ? 0.5 : 1 }}
              hoverStyle={{ background:'rgba(52,211,153,0.25)', boxShadow:'0 0 12px rgba(52,211,153,0.2)', transform:'translateY(-1px)' }}>
              <UserPlus size={14} /> {tc.add}
            </HoverBtn>
          </div>
        </div>

        {/* Participant list */}
        <div>
          <p style={S.label}>{tbf.participants} ({participants.length})</p>
          {participants.length === 0 ? (
            <div style={{ fontSize:12, color:'#4a4842', padding:'16px 0', textAlign:'center' }}>
              {tbf.noParticipants}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {participants.map((p, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:8,
                  background: p.username === session.boss_name ? 'rgba(212,175,55,0.12)' : 'var(--input-bg)',
                  border: `1px solid ${p.username === session.boss_name ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.08)'}`,
                }}>
                  {p.username === session.boss_name && <Crown size={12} style={{ color:'#fbbf24', flexShrink:0 }} />}
                  <span style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', flex:1 }}>{p.username}</span>
                  <span style={{ fontSize:11, color:'#7a7468' }}>{p.game || '\u2014'}</span>
                  <button onClick={() => removeParticipant(p.username)}
                    style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'#3a3a6a', transition:'color 0.15s', flexShrink:0 }}
                    onMouseEnter={e => e.currentTarget.style.color='#f87171'}
                    onMouseLeave={e => e.currentTarget.style.color='#3a3a6a'}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Set Boss / Start Fight */}
        {participants.length >= 2 && (
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            {/* Lucky Wheel button — only when more participants than max fighters */}
            {participants.length > BOSSFIGHT_MAX_FIGHTERS && (
              <HoverBtn onClick={() => setShowWheel(true)}
                style={{
                  background:'linear-gradient(135deg,#f59e0b,#d97706)',
                  borderColor:'rgba(251,191,36,0.5)',
                  color:'#fff',
                  boxShadow:'0 0 14px rgba(251,191,36,0.25)',
                }}
                hoverStyle={{ background:'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow:'0 0 22px rgba(251,191,36,0.45)', transform:'translateY(-1px)' }}>
                <Sparkles size={14} /> {tbf.luckyWheel} ({participants.length} &rarr; {BOSSFIGHT_MAX_FIGHTERS})
              </HoverBtn>
            )}
            {/* Boss selector */}
            <div style={{ position:'relative' }}>
              <HoverBtn onClick={() => setShowBossSelect(!showBossSelect)}
                style={{ background:'rgba(251,191,36,0.1)', borderColor:'rgba(251,191,36,0.3)', color:'#fbbf24' }}
                hoverStyle={{ background:'rgba(251,191,36,0.2)', borderColor:'rgba(251,191,36,0.5)', transform:'translateY(-1px)' }}>
                <Crown size={14} /> {session.boss_name ? `${tbf.boss}: ${session.boss_name}` : tbf.setBoss} <ChevronDown size={12} />
              </HoverBtn>
              {showBossSelect && (
                <div style={{
                  position:'absolute', top:'100%', left:0, marginTop:4, zIndex:100,
                  background:'linear-gradient(135deg, #1a1a3a, #0c0b14)', border:'1px solid rgba(212,175,55,0.3)',
                  borderRadius:10, padding:4, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,0.5)',
                }}>
                  {participants.map((p, i) => (
                    <button key={i} onClick={() => setBoss(p.username)} style={{
                      display:'block', width:'100%', textAlign:'left', padding:'6px 10px', borderRadius:6,
                      fontSize:12, fontWeight:500, cursor:'pointer', border:'none', transition:'all 0.12s',
                      background: p.username === session.boss_name ? 'rgba(212,175,55,0.2)' : 'transparent',
                      color: p.username === session.boss_name ? '#d4af37' : '#9090c0',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(212,175,55,0.15)'; e.currentTarget.style.color='#d4af37' }}
                      onMouseLeave={e => { e.currentTarget.style.background= p.username === session.boss_name ? 'rgba(212,175,55,0.2)' : 'transparent'; e.currentTarget.style.color= p.username === session.boss_name ? '#d4af37' : '#9090c0' }}>
                      {p.username === session.boss_name && '\u2654 '}{p.username}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Start button */}
            <HoverBtn onClick={startFight} disabled={!session.boss_name}
              style={{
                background: session.boss_name ? 'linear-gradient(135deg,#d4af37,#b8962e)' : 'rgba(50,50,80,0.5)',
                borderColor: session.boss_name ? 'rgba(212,175,55,0.4)' : 'rgba(50,50,80,0.3)',
                color: session.boss_name ? '#fff' : '#3a3a6a',
                boxShadow: session.boss_name ? '0 0 14px rgba(212,175,55,0.25)' : 'none',
              }}
              hoverStyle={session.boss_name ? { background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' } : {}}>
              <Play size={14} /> {tbf.startFight} ({challengers.length} {tbf.challenger.toLowerCase()}s)
            </HoverBtn>
          </div>
        )}

        {/* Spinning Wheel modal */}
        {showWheel && (
          <SpinningWheel
            participants={participants}
            selectCount={BOSSFIGHT_MAX_FIGHTERS}
            onComplete={handleWheelComplete}
            onClose={() => setShowWheel(false)}
          />
        )}
      </div>
    )
  }

  // ── Live phase ──────────────────────────────────────────────────────────
  if (session.status === 'live') {
    const playerWins = duels.filter(d => d.winner === 'challenger').length
    const bossWins   = duels.filter(d => d.winner === 'boss').length

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {/* Current duel */}
        {currentChallenger && (
          <div>
            <p style={S.label}>{tbf.currentDuel} (Round {currentDuel + 1} / {challengers.length})</p>
            <div style={{ display:'flex', alignItems:'center', gap:16, justifyContent:'center', padding:'16px 0' }}>
              {/* Challenger */}
              <div style={{
                textAlign:'center', padding:'12px 20px', borderRadius:10, minWidth:130,
                background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)',
              }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#34d399', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{tbf.challenger}</div>
                <div style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>{currentChallenger.username}</div>
                <div style={{ fontSize:11, color:'#7a7468', marginTop:2 }}>{currentChallenger.game || '\u2014'}</div>
              </div>

              <div style={{ fontSize:18, fontWeight:900, color:'#d4af37', textShadow:'0 0 12px rgba(212,175,55,0.3)' }}>{tbf.vs}</div>

              {/* Boss */}
              <div style={{
                textAlign:'center', padding:'12px 20px', borderRadius:10, minWidth:130,
                background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
              }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#f87171', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{tbf.boss}</div>
                <div style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>{session.boss_name}</div>
                <div style={{ fontSize:11, color:'#7a7468', marginTop:2 }}>{session.boss_game || '\u2014'}</div>
              </div>
            </div>

            {/* Amount button */}
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <HoverBtn onClick={() => { setShowAmountPopup(true); setAmount0(''); setAmount1(''); setAmountResult(null) }}
                style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#000', boxShadow:'0 0 14px rgba(212,175,55,0.2)' }}
                hoverStyle={{ boxShadow:'0 0 22px rgba(212,175,55,0.35)', transform:'translateY(-1px)' }}>
                <Trophy size={14} /> Enter Amounts
              </HoverBtn>
            </div>
          </div>
        )}

        {/* Boss HP */}
        <div style={{ textAlign:'center' }}>
          <p style={{ ...S.label, textAlign:'center' }}>{tbf.bossLives} {session.boss_lives} / {session.boss_max_lives}</p>
          <div style={{ display:'flex', justifyContent:'center', gap:4 }}>
            {Array.from({ length: session.boss_max_lives }, (_, i) => (
              <span key={i} style={{
                fontSize:16, color: i < session.boss_lives ? '#f87171' : 'rgba(255,255,255,0.15)',
                textShadow: i < session.boss_lives ? '0 0 6px rgba(239,68,68,0.4)' : 'none',
              }}>
                {i < session.boss_lives ? '\u25cf' : '\u25cb'}
              </span>
            ))}
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign:'center', fontSize:13, color:'#9090c0' }}>
          {tbf.score} <span style={{ fontWeight:700, color:'#34d399' }}>{playerWins}</span> \u2014 {tbf.boss} <span style={{ fontWeight:700, color:'#f87171' }}>{bossWins}</span>
        </div>

        {/* Duel history */}
        {duels.filter(d => d.winner).length > 0 && (
          <div>
            <p style={S.label}>{tbf.duelHistory}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {duels.filter(d => d.winner).map((d, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'5px 10px', borderRadius:6,
                  background:'var(--input-bg)', border:'1px solid rgba(212,175,55,0.06)',
                }}>
                  <span style={{ fontSize:10, color:'#4a4842', fontWeight:700, width:20, flexShrink:0 }}>#{d.round}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:'#c8cde8', flex:1 }}>{d.challenger}</span>
                  <span style={{
                    fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4,
                    background: d.winner === 'boss' ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.15)',
                    color: d.winner === 'boss' ? '#f87171' : '#34d399',
                    border: `1px solid ${d.winner === 'boss' ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.3)'}`,
                  }}>
                    {d.winner === 'boss' ? tbf.bossWon : tbf.challengerWon}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amount Popup */}
        {showAmountPopup && currentChallenger && (
          <div style={{
            position:'fixed', inset:0, zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center',
            background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)',
          }} onClick={() => setShowAmountPopup(false)}>
            <div onClick={e => e.stopPropagation()} style={{
              width:340, padding:24, borderRadius:16,
              background:'rgba(10,10,22,0.96)', border:'1px solid rgba(212,175,55,0.3)',
              boxShadow:'0 16px 60px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.08)',
            }}>
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <Trophy size={20} style={{ color:'#fbbf24', marginBottom:8 }} />
                <div style={{ fontSize:11, fontWeight:700, color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.1em' }}>Enter Amounts</div>
              </div>

              {/* Challenger */}
              <div style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 14px', marginBottom:8, borderRadius:10,
                background: amountResult === 'challenger' ? 'rgba(52,211,153,0.1)' : amountResult === 'boss' ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${amountResult === 'challenger' ? 'rgba(52,211,153,0.3)' : amountResult === 'boss' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
                transition:'all 0.4s',
              }}>
                <span style={{ fontSize:12, fontWeight:600, color: amountResult === 'challenger' ? '#34d399' : '#fff', flex:1 }}>{currentChallenger.username}</span>
                <input type="number" value={amount0} onChange={e => setAmount0(e.target.value)} placeholder="0.00"
                  disabled={amountResult !== null}
                  style={{ width:80, padding:'6px 10px', borderRadius:8, fontSize:13, fontWeight:700, textAlign:'right',
                    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(212,175,55,0.2)', color:'#fff', outline:'none', fontFamily:'monospace' }} />
              </div>

              <div style={{ textAlign:'center', margin:'4px 0', fontSize:10, fontWeight:800, color:'#fbbf24', letterSpacing:'0.15em' }}>VS</div>

              {/* Boss */}
              <div style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 14px', marginBottom:16, borderRadius:10,
                background: amountResult === 'boss' ? 'rgba(52,211,153,0.1)' : amountResult === 'challenger' ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${amountResult === 'boss' ? 'rgba(52,211,153,0.3)' : amountResult === 'challenger' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
                transition:'all 0.4s',
              }}>
                <span style={{ fontSize:12, fontWeight:600, color: amountResult === 'boss' ? '#34d399' : '#fff', flex:1 }}>{session.boss_name}</span>
                <input type="number" value={amount1} onChange={e => setAmount1(e.target.value)} placeholder="0.00"
                  disabled={amountResult !== null}
                  style={{ width:80, padding:'6px 10px', borderRadius:8, fontSize:13, fontWeight:700, textAlign:'right',
                    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(212,175,55,0.2)', color:'#fff', outline:'none', fontFamily:'monospace' }} />
              </div>

              {/* Result */}
              {amountResult === 'tie' && (
                <div style={{ textAlign:'center', padding:'8px', marginBottom:12, borderRadius:8, background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.25)', fontSize:11, fontWeight:600, color:'#fbbf24' }}>
                  Tie — enter new amounts
                </div>
              )}
              {amountResult && amountResult !== 'tie' && (
                <div style={{ textAlign:'center', padding:'8px', marginBottom:12, borderRadius:8, background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)', fontSize:11, fontWeight:700, color:'#34d399' }}>
                  {amountResult === 'challenger' ? currentChallenger.username : session.boss_name} wins!
                </div>
              )}

              {/* Buttons */}
              {amountResult === null && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setShowAmountPopup(false)} style={{ flex:1, padding:'10px', borderRadius:10, fontSize:12, fontWeight:600, background:'none', border:'1px solid rgba(255,255,255,0.1)', color:'#888', cursor:'pointer' }}>Cancel</button>
                  <button onClick={() => {
                    const a0 = Number(amount0) || 0
                    const a1 = Number(amount1) || 0
                    if (a0 === 0 && a1 === 0) return
                    if (a0 > 0 && a1 > 0) {
                      if (a0 === a1) { setAmountResult('tie'); setTimeout(() => { setAmountResult(null); setAmount0(''); setAmount1('') }, 2000); return }
                      const winner = a0 > a1 ? 'challenger' : 'boss'
                      setAmountResult(winner)
                      setTimeout(() => { recordWin(winner); setShowAmountPopup(false); setAmountResult(null) }, 1200)
                    }
                  }} disabled={!(Number(amount0) > 0 && Number(amount1) > 0)} style={{
                    flex:2, padding:'10px', borderRadius:10, fontSize:12, fontWeight:700,
                    background: (Number(amount0) > 0 && Number(amount1) > 0) ? 'linear-gradient(135deg,#d4af37,#b8962e)' : '#222',
                    color: (Number(amount0) > 0 && Number(amount1) > 0) ? '#000' : '#555', border:'none',
                    cursor: (Number(amount0) > 0 && Number(amount1) > 0) ? 'pointer' : 'not-allowed',
                  }}>Determine Winner</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Finished phase ────────────────────────────────────────────────────
  if (session.status === 'finished') {
    const playerWins = duels.filter(d => d.winner === 'challenger').length
    const bossWins   = duels.filter(d => d.winner === 'boss').length

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {/* Winner banner */}
        <div style={{
          textAlign:'center', padding:'20px 0', borderRadius:10,
          background: session.winner_side === 'boss' ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)',
          border: `1px solid ${session.winner_side === 'boss' ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.3)'}`,
        }}>
          <div style={{ fontSize:20, fontWeight:800, color: session.winner_side === 'boss' ? '#f87171' : '#34d399', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            {session.winner_side === 'boss' ? tbf.bossWinsTitle : tbf.playersWinTitle}
          </div>
          <div style={{ fontSize:13, color:'#9090c0', marginTop:6 }}>
            {tbf.finalScore} {playerWins} \u2014 {tbf.boss} {bossWins}
          </div>
        </div>

        {/* Duel history */}
        <div>
          <p style={S.label}>{tbf.duelHistory}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            {duels.filter(d => d.winner).map((d, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:8, padding:'5px 10px', borderRadius:6,
                background:'var(--input-bg)', border:'1px solid rgba(212,175,55,0.06)',
              }}>
                <span style={{ fontSize:10, color:'#4a4842', fontWeight:700, width:20, flexShrink:0 }}>#{d.round}</span>
                <span style={{ fontSize:12, fontWeight:600, color:'#c8cde8', flex:1 }}>{d.challenger}</span>
                <span style={{
                  fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4,
                  background: d.winner === 'boss' ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.15)',
                  color: d.winner === 'boss' ? '#f87171' : '#34d399',
                  border: `1px solid ${d.winner === 'boss' ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.3)'}`,
                }}>
                  {d.winner === 'boss' ? tbf.bossWon : tbf.challengerWon}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Complete button */}
        <div style={{ display:'flex', justifyContent:'center' }}>
          <HoverBtn onClick={completeFight}
            style={{ background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.25)', color:'#f87171' }}
            hoverStyle={{ background:'rgba(239,68,68,0.18)', borderColor:'rgba(239,68,68,0.5)', boxShadow:'0 0 14px rgba(239,68,68,0.2)', transform:'translateY(-1px)' }}>
            <Trash2 size={14} /> {tbf.completeRemove}
          </HoverBtn>
        </div>
      </div>
    )
  }

  return null
}

// ── Main page ────────────────────────────────────────────────────────────
export default function Bossfight() {
  const { t } = useLang()
  const tc = t.common
  const { user } = useAuth()
  const tbf = t.bossfight
  const [sessions, setSessions]   = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showNew, setShowNew]     = useState(false)
  const [showInfo, setShowInfo]   = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const [theme, setTheme]         = useState({ ...DEFAULT_THEME })
  const [form, setForm]           = useState({ name: '' })
  const baseUrl = window.location.origin
  const obsUrl  = `${baseUrl}/overlay/bossfight?uid=${user?.id || ""}`

  const reload = async () => {
    const data = await getAll('bossfights')
    setSessions(data)
    return data
  }

  useEffect(() => {
    reload().then(data => {
      if (data.length) setSelectedId((data.find(s => s.status === 'live' || s.status === 'join_open') || data[0]).id)
    })
    getOne('bossfight_theme').then(t => { if (t) setTheme(prev => ({ ...prev, ...t })) })
  }, [])

  useEffect(() => {
    const off = onTableChange('bossfights', () => {
      reload().then(data => {
        // Update selectedId if current session was removed
        if (selectedId && !data.find(s => s.id === selectedId)) {
          setSelectedId(data[0]?.id || null)
        }
      })
    })
    return off
  }, [selectedId])

  const selected = sessions.find(s => s.id === selectedId) || null

  const handleThemeChange = async (next) => { setTheme(next); await setOne('bossfight_theme', next) }

  const createSession = async () => {
    if (!form.name) return
    const data = await insert('bossfights', {
      name: form.name,
      status: 'join_open',
      boss_name: '',
      boss_game: '',
      boss_lives: 0,
      boss_max_lives: 0,
      participants: [],
      duels: [],
      current_duel: 0,
      winner_side: null,
    })
    setSessions(prev => [data, ...prev])
    setSelectedId(data.id)
    setForm({ name: '' })
    setShowNew(false)
  }

  const deleteSession = async () => {
    if (!selectedId) return
    setShowTheme(false); setShowInfo(false)
    await remove('bossfights', selectedId)
    setSessions(prev => { const next = prev.filter(s => s.id !== selectedId); setSelectedId(next[0]?.id || null); return next })
  }

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
        </>}

        <HoverBtn onClick={() => setShowNew(!showNew)}
          style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)' }}
          hoverStyle={{ background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
          <Plus size={14} /> {tbf.newBossfight}
        </HoverBtn>
      </div>

      {showTheme && <ThemePanel theme={theme} onChange={handleThemeChange} />}

      {showInfo && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:12,
          background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.12)',
          borderRadius:12, padding:'14px 18px', marginBottom:16,
          animation:'fade-up 0.18s ease-out',
        }}>
          <Swords size={16} style={{ color:'#d4af37', flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#d4af37' }}>{tbf.title}</span>
            <span style={{ fontSize:12, color:'#8a8478', lineHeight:1.6 }}>
              {tbf.infoText}
            </span>
          </div>
        </div>
      )}

      {showNew && (
        <div style={{ ...S.card, padding:20, marginBottom:20, animation:'fade-up 0.2s ease-out' }}>
          <p style={S.label}>{tbf.newBossfight}</p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
            <input className="input" style={{ flex:'1 1 200px' }} placeholder={tbf.name}
              value={form.name} onChange={e => setForm({ name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && createSession()} />
            <HoverBtn onClick={createSession} disabled={!form.name}
              style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', opacity: !form.name ? 0.5 : 1 }}
              hoverStyle={form.name ? { background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 18px rgba(212,175,55,0.4)', transform:'translateY(-1px)' } : {}}>
              <Check size={14} /> {tc.create}
            </HoverBtn>
          </div>
        </div>
      )}

      {/* Session tabs when multiple sessions exist */}
      {sessions.length > 1 && (
        <div style={{ display:'flex', gap:4, marginBottom:12, flexWrap:'wrap' }}>
          {sessions.map(s => (
            <button key={s.id} onClick={() => setSelectedId(s.id)} style={{
              padding:'5px 12px', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.12s',
              background: s.id === selectedId ? 'rgba(212,175,55,0.2)' : 'var(--input-bg)',
              border: `1px solid ${s.id === selectedId ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.08)'}`,
              color: s.id === selectedId ? '#d4af37' : '#5a5548',
            }}>
              {s.name}
              <span style={{ marginLeft:6, fontSize:9, color:'#4a4842', textTransform:'uppercase' }}>{s.status === 'join_open' ? tc.joining : s.status}</span>
            </button>
          ))}
        </div>
      )}

      {sessions.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>{tbf.empty}</div>
      ) : selected && (
        <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
          {/* Left: Management panel */}
          <div style={{ flex:'1 1 380px', ...S.card, padding:20, overflow:'visible' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Swords size={14} style={{ color:'#d4af37' }} />
                <span style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{selected.name}</span>
                <span style={{
                  fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:4, textTransform:'uppercase', letterSpacing:'0.08em',
                  background: selected.status === 'join_open' ? 'rgba(52,211,153,0.12)' : selected.status === 'live' ? 'rgba(251,191,36,0.12)' : 'rgba(212,175,55,0.12)',
                  color: selected.status === 'join_open' ? '#34d399' : selected.status === 'live' ? '#fbbf24' : '#d4af37',
                  border: `1px solid ${selected.status === 'join_open' ? 'rgba(52,211,153,0.3)' : selected.status === 'live' ? 'rgba(251,191,36,0.3)' : 'rgba(212,175,55,0.3)'}`,
                }}>
                  {selected.status === 'join_open' ? tc.joining : selected.status}
                </span>
              </div>
              {selected.status === 'join_open' && (
                <HoverBtn onClick={deleteSession}
                  style={{ borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:600, background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.25)', color:'#f87171' }}
                  hoverStyle={{ background:'rgba(239,68,68,0.18)', borderColor:'rgba(239,68,68,0.5)', transform:'translateY(-1px)' }}>
                  <Trash2 size={11} /> {tc.delete}
                </HoverBtn>
              )}
            </div>

            <GauntletPanel session={selected} onUpdate={reload} />
          </div>

          {/* Right: Overlay preview */}
          <div style={{ flex:'1 1 320px', minWidth:320 }}>
            <div style={{ ...S.card, border:'1px solid rgba(212,175,55,0.2)', overflow:'visible' }}>
              <div style={{ padding:'8px 16px', borderBottom:'1px solid rgba(212,175,55,0.06)' }}>
                <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#4a4842' }}>{tc.overlayPreview}</span>
              </div>
              <div style={{ padding:16 }}>
                <BossfightOverlay sessionId={selectedId} editable={false} showTooltips={showInfo} theme={theme} />
              </div>
              <ObsUrlBar obsUrl={obsUrl} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
