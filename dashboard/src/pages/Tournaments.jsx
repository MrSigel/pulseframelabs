import { useEffect, useState } from 'react'
import { getAll, getOne, setOne, insert, update, remove, onTableChange } from '../lib/store'
import TournamentOverlay, { DEFAULT_THEME } from '../overlays/TournamentOverlay'
import { Plus, Trash2, Copy, Check, Info, Palette, RotateCcw, Play, Users, UserPlus, Trophy, Sparkles } from 'lucide-react'
import SpinningWheel from '../components/SpinningWheel'
import { useLang } from '../context/LanguageContext'

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
  sectionLabel: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--label-color)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(212,175,55,0.08)' },
}

const BG_PRESETS     = [['10,10,22','#0a0a16'],['0,0,0','#000'],['8,10,30','#080a1e'],['18,8,40','#120828'],['15,15,15','#0f0f0f'],['20,8,20','#140814'],['240,237,230','#f0ede6'],['255,255,255','#ffffff'],['248,246,241','#f8f6f1'],['230,225,215','#e6e1d7']]
const ACCENT_PRESETS  = [['99,102,241','#d4af37'],['139,92,246','#d4af37'],['59,130,246','#3b82f6'],['34,211,238','#d4af37'],['52,211,153','#34d399'],['236,72,153','#ec4899'],['251,146,60','#fb923c'],['239,68,68','#ef4444']]
const HIGHLIGHT_PRESETS = [['#fbbf24','#fbbf24'],['#f59e0b','#f59e0b'],['#34d399','#34d399'],['#d4af37','#d4af37'],['#d4af37','#d4af37'],['#f87171','#f87171']]
const TEXT_PRESETS    = [['#ffffff','#ffffff'],['#e2e8f0','#e2e8f0'],['#c8cde8','#c8cde8'],['#f0e6ff','#f0e6ff']]
const FONT_OPTIONS    = [{ labelKey:'mono', value:'monospace' },{ labelKey:'sans', value:'system-ui, sans-serif' },{ labelKey:'inter', value:'Inter, sans-serif' },{ labelKey:'serif', value:'Georgia, serif' }]

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

function ThemePanel({ theme, onChange, tc, tt }) {
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
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Swatches value={theme.accentColor} options={ACCENT_PRESETS} onChange={v => set('accentColor', v)} size={24} />
            <div>
              <div style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>{tt.highlightFinal}</div>
              <Swatches value={theme.highlightColor} options={HIGHLIGHT_PRESETS} onChange={v => set('highlightColor', v)} size={22} />
            </div>
          </div>
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
                  }}>{tc[f.labelKey]}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sichtbarkeit */}
        <div>
          <p style={S.sectionLabel}>{tc.displayEffects}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <Toggle value={theme.showBorder}    onChange={v => set('showBorder', v)}    label={tc.showBorder} />
            <Toggle value={theme.glow}          onChange={v => set('glow', v)}          label={tc.glowEffect} />
            <Toggle value={theme.showPrizePool} onChange={v => set('showPrizePool', v)} label={tt.showPrizePool} />
            <Toggle value={theme.showSlots}     onChange={v => set('showSlots', v)}     label={tt.showSlots} />
            <Toggle value={theme.showStatus}    onChange={v => set('showStatus', v)}    label={tt.showStatus} />
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

// ── Participants Panel (visible during join_open) ──────────────────────────
function ParticipantsPanel({ tournament, onUpdate, tc, tt }) {
  const [addForm, setAddForm] = useState({ username: '', game: '' })
  const participants = tournament.participants || []
  const max = tournament.max_participants || 8

  const addParticipant = async () => {
    if (!addForm.username) return
    const updated = [...participants, { username: addForm.username, game: addForm.game }]
    await update('tournaments', tournament.id, { participants: updated })
    onUpdate({ participants: updated })
    setAddForm({ username: '', game: '' })
  }

  const removeParticipant = async (index) => {
    const updated = participants.filter((_, i) => i !== index)
    await update('tournaments', tournament.id, { participants: updated })
    onUpdate({ participants: updated })
  }

  return (
    <div style={{ ...S.card, padding:20, marginBottom:16, animation:'fade-up 0.18s ease-out' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Users size={14} style={{ color:'#d4af37' }} />
          <span style={S.label}>{tt.participants}</span>
        </div>
        <span style={{ fontSize:11, fontWeight:600, color: participants.length > max ? '#fbbf24' : participants.length >= max ? '#34d399' : '#6060a0' }}>
          {participants.length} / {max}{participants.length > max ? ` (${tt.luckyWheel})` : ''}
        </span>
      </div>

      {/* Add form */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'flex-end' }}>
        <input className="input" style={{ flex:'1 1 140px' }} placeholder={tc.username}
          value={addForm.username} onChange={e => setAddForm(p => ({ ...p, username: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && addParticipant()} />
        <input className="input" style={{ flex:'1 1 160px' }} placeholder={tt.gameName}
          value={addForm.game} onChange={e => setAddForm(p => ({ ...p, game: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && addParticipant()} />
        <HoverBtn onClick={addParticipant} disabled={!addForm.username}
          style={{ background:'rgba(212,175,55,0.1)', borderColor:'rgba(212,175,55,0.2)', color:'#d4af37', opacity: !addForm.username ? 0.5 : 1 }}
          hoverStyle={addForm.username ? { background:'rgba(212,175,55,0.12)', borderColor:'rgba(212,175,55,0.3)', transform:'translateY(-1px)' } : {}}>
          <UserPlus size={13} /> {tc.add}
        </HoverBtn>
      </div>

      {/* Participant list */}
      {participants.length === 0 ? (
        <div style={{ textAlign:'center', padding:'16px 0', color:'#4a4842', fontSize:12 }}>
          {tt.noParticipants}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {participants.map((p, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:10, padding:'6px 10px', borderRadius:8,
              background:'rgba(212,175,55,0.03)', border:'1px solid rgba(34,34,74,0.3)',
            }}>
              <span style={{ fontSize:11, fontWeight:600, color:'#c8cde8', flex:'0 0 24px', textAlign:'center' }}>{i + 1}</span>
              <span style={{ fontSize:12, fontWeight:600, color:'#e2e8f0', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.username}</span>
              <span style={{ fontSize:11, color:'#7a7468', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.game || '—'}</span>
              <button onClick={() => removeParticipant(i)} title={tc.delete}
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
  )
}

export default function Tournaments() {
  const { t } = useLang()
  const tt = t.tournaments
  const tc = t.common
  const [tournaments, setTournaments] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const [theme, setTheme] = useState({ ...DEFAULT_THEME })
  const [form, setForm] = useState({ name:'', max_participants:'8' })
  const [copied, setCopied] = useState(false)
  const [showWheel, setShowWheel] = useState(false)

  const baseUrl = window.location.origin
  const obsUrl  = `${baseUrl}/overlay/tournament`

  useEffect(() => {
    getAll('tournaments').then(data => {
      setTournaments(data)
      if (data.length) setSelectedId((data.find(t => t.status === 'ongoing') || data.find(t => t.status === 'join_open') || data[0]).id)
    })
    getOne('tournament_theme').then(t => { if (t) setTheme(prev => ({ ...prev, ...t })) })
  }, [])

  useEffect(() => {
    const off = onTableChange('tournaments', () => {
      getAll('tournaments').then(data => {
        setTournaments(data)
      })
    })
    return off
  }, [])

  const handleThemeChange = async (next) => { setTheme(next); await setOne('tournament_theme', next) }

  const selectedTournament = tournaments.find(t => t.id === selectedId) || null
  const selectedStatus = selectedTournament?.status || 'join_open'

  const createTournament = async () => {
    if (!form.name) return
    const data = await insert('tournaments', {
      name: form.name,
      max_participants: Number(form.max_participants) || 8,
      status: 'join_open',
      participants: [],
      slots: {},
      bracket_winners: {},
      champion: '',
    })
    setTournaments(prev => [data, ...prev])
    setSelectedId(data.id)
    setForm({ name:'', max_participants:'8' })
    setShowNew(false)
  }

  const startTournament = async () => {
    if (!selectedTournament) return
    const participants = selectedTournament.participants || []
    const max = selectedTournament.max_participants || 8

    if (participants.length < 2) return

    // Shuffle participants randomly
    const shuffled = [...participants].sort(() => Math.random() - 0.5)

    // Pad to max_participants with empty entries if needed
    while (shuffled.length < max) {
      shuffled.push({ username: '', game: '' })
    }

    // Build slots from shuffled participants (round 0 only)
    const slots = {}
    for (let i = 0; i < max; i++) {
      const matchIndex = Math.floor(i / 2)
      const playerSlot = i % 2
      const key = `0-${matchIndex}-${playerSlot}`
      slots[key] = { name: shuffled[i].username, game: shuffled[i].game, win: '' }
    }

    const changes = { status: 'ongoing', slots, bracket_winners: {}, champion: '' }
    await update('tournaments', selectedId, changes)
    setTournaments(prev => prev.map(t => t.id === selectedId ? { ...t, ...changes } : t))
  }

  const completeTournament = async () => {
    if (!selectedId) return
    await remove('tournaments', selectedId)
    setTournaments(prev => { const next = prev.filter(t => t.id !== selectedId); setSelectedId(next[0]?.id || null); return next })
  }

  const updateSelectedTournament = (changes) => {
    setTournaments(prev => prev.map(t => t.id === selectedId ? { ...t, ...changes } : t))
  }

  const copyUrl = () => { navigator.clipboard.writeText(obsUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const handleWheelComplete = async (selectedParticipants) => {
    if (!selectedTournament) return
    const updated = selectedParticipants.map(p => ({ username: p.username, game: p.game || '' }))
    await update('tournaments', selectedId, { participants: updated })
    updateSelectedTournament({ participants: updated })
    setShowWheel(false)
  }

  return (
    <div>
      {/* Action bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {tournaments.length > 0 && <>
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

          {/* Status-dependent action buttons */}
          {selectedStatus === 'join_open' && (
            <>
              {/* Lucky Wheel button — only when more participants than max */}
              {selectedTournament && (selectedTournament.participants || []).length > (selectedTournament.max_participants || 8) && (
                <HoverBtn onClick={() => setShowWheel(true)}
                  style={{
                    background:'linear-gradient(135deg,#f59e0b,#d97706)',
                    borderColor:'rgba(251,191,36,0.5)',
                    color:'#fff',
                    boxShadow:'0 0 14px rgba(251,191,36,0.25)',
                  }}
                  hoverStyle={{ background:'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow:'0 0 22px rgba(251,191,36,0.45)', transform:'translateY(-1px)' }}>
                  <Sparkles size={14} /> {tt.luckyWheel} ({(selectedTournament.participants || []).length} &rarr; {selectedTournament.max_participants || 8})
                </HoverBtn>
              )}
              <HoverBtn onClick={startTournament}
                disabled={!selectedTournament || (selectedTournament.participants || []).length < 2}
                style={{
                  background:'linear-gradient(135deg,#059669,#047857)',
                  borderColor:'rgba(52,211,153,0.4)',
                  color:'#fff',
                  boxShadow:'0 0 14px rgba(52,211,153,0.25)',
                  opacity: (!selectedTournament || (selectedTournament.participants || []).length < 2) ? 0.5 : 1,
                }}
                hoverStyle={{ background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 0 22px rgba(52,211,153,0.45)', transform:'translateY(-1px)' }}>
                <Play size={14} /> {tt.startTournament}
              </HoverBtn>
            </>
          )}

          {selectedStatus === 'finished' && selectedTournament?.champion && (
            <div style={{
              display:'flex', alignItems:'center', gap:8, padding:'8px 14px',
              background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)',
              borderRadius:10, fontSize:13, fontWeight:600, color:'#34d399',
            }}>
              <Trophy size={14} /> {tt.winnerLabel} {selectedTournament.champion}
            </div>
          )}
        </>}

        <HoverBtn onClick={() => setShowNew(!showNew)}
          style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.25)' }}
          hoverStyle={{ background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 22px rgba(212,175,55,0.45)', transform:'translateY(-1px)' }}>
          <Plus size={14} /> {tt.newTournament}
        </HoverBtn>
      </div>

      {showTheme && <ThemePanel theme={theme} onChange={handleThemeChange} tc={tc} tt={tt} />}

      {showInfo && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:12,
          background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.12)',
          borderRadius:12, padding:'14px 18px', marginBottom:16,
          animation:'fade-up 0.18s ease-out',
        }}>
          <Trophy size={16} style={{ color:'#d4af37', flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#d4af37' }}>{tt.title}</span>
            <span style={{ fontSize:12, color:'#8a8478', lineHeight:1.6 }}>
              {tt.infoText}
            </span>
          </div>
        </div>
      )}

      {showNew && (
        <div style={{ ...S.card, padding:20, marginBottom:20, animation:'fade-up 0.2s ease-out' }}>
          <p style={S.label}>{tt.newTournament}</p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
            <input className="input" style={{ flex:'1 1 200px' }} placeholder={tt.tournamentName}
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && createTournament()} />
            <select className="input" style={{ width:150 }}
              value={form.max_participants} onChange={e => setForm({...form, max_participants: e.target.value})}>
              <option value={4}>{tt.participants4}</option>
              <option value={8}>{tt.participants8}</option>
              <option value={16}>{tt.participants16}</option>
              <option value={32}>{tt.participants32}</option>
            </select>
            <HoverBtn onClick={createTournament} disabled={!form.name}
              style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', borderColor:'rgba(212,175,55,0.4)', color:'#fff', opacity: !form.name ? 0.5 : 1 }}
              hoverStyle={form.name ? { background:'linear-gradient(135deg,#e8c84a,#d4af37)', boxShadow:'0 0 18px rgba(212,175,55,0.4)', transform:'translateY(-1px)' } : {}}>
              <Check size={14} /> {tc.create}
            </HoverBtn>
          </div>
        </div>
      )}

      {/* Session tabs when multiple tournaments exist */}
      {tournaments.length > 1 && (
        <div style={{ display:'flex', gap:4, marginBottom:12, flexWrap:'wrap' }}>
          {tournaments.map(tr => (
            <button key={tr.id} onClick={() => setSelectedId(tr.id)} style={{
              padding:'5px 12px', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.12s',
              background: tr.id === selectedId ? 'rgba(212,175,55,0.2)' : 'var(--input-bg)',
              border: `1px solid ${tr.id === selectedId ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.08)'}`,
              color: tr.id === selectedId ? '#d4af37' : '#5a5548',
            }}>
              {tr.name}
              <span style={{ marginLeft:6, fontSize:9, color:'#4a4842', textTransform:'uppercase' }}>
                {tr.status === 'join_open' ? tc.joining : tr.status === 'ongoing' ? tc.live : tc.finished}
              </span>
            </button>
          ))}
        </div>
      )}

      {tournaments.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>{tt.empty}</div>
      ) : selectedTournament && (
        <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
          {/* Left: Management panel */}
          <div style={{ flex:'1 1 380px', ...S.card, padding:20, overflow:'visible' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Trophy size={14} style={{ color:'#d4af37' }} />
                <span style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{selectedTournament.name}</span>
                <span style={{
                  fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:4, textTransform:'uppercase', letterSpacing:'0.08em',
                  background: selectedStatus === 'join_open' ? 'rgba(52,211,153,0.12)' : selectedStatus === 'ongoing' ? 'rgba(251,191,36,0.12)' : 'rgba(212,175,55,0.08)',
                  color: selectedStatus === 'join_open' ? '#34d399' : selectedStatus === 'ongoing' ? '#fbbf24' : '#d4af37',
                  border: `1px solid ${selectedStatus === 'join_open' ? 'rgba(52,211,153,0.3)' : selectedStatus === 'ongoing' ? 'rgba(251,191,36,0.3)' : 'rgba(212,175,55,0.15)'}`,
                }}>
                  {selectedStatus === 'join_open' ? tc.joining : selectedStatus === 'ongoing' ? tc.live : tc.finished}
                </span>
              </div>
              <HoverBtn onClick={completeTournament}
                style={{ borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:600, background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.25)', color:'#f87171' }}
                hoverStyle={{ background:'rgba(239,68,68,0.18)', borderColor:'rgba(239,68,68,0.5)', transform:'translateY(-1px)' }}>
                <Trash2 size={11} /> {tc.delete}
              </HoverBtn>
            </div>

            {/* Participants panel — visible during join_open */}
            {selectedStatus === 'join_open' && (
              <ParticipantsPanel tournament={selectedTournament} onUpdate={updateSelectedTournament} tc={tc} tt={tt} />
            )}

            {/* Bracket info during ongoing/finished */}
            {selectedStatus === 'ongoing' && (
              <div style={{ fontSize:12, color:'#8a8478', padding:'8px 0' }}>
                {tt.clickTrophy}
              </div>
            )}
            {selectedStatus === 'finished' && selectedTournament.champion && (
              <div style={{
                textAlign:'center', padding:'16px 0', borderRadius:10,
                background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)',
              }}>
                <Trophy size={20} style={{ color:'#34d399', marginBottom:6 }} />
                <div style={{ fontSize:16, fontWeight:800, color:'#34d399' }}>{tt.champion} {selectedTournament.champion}</div>
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
                {selectedId && <TournamentOverlay tournamentId={selectedId} editable showTooltips={showInfo} theme={theme} />}
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
      )}

      {/* Spinning Wheel modal */}
      {showWheel && selectedTournament && (
        <SpinningWheel
          participants={selectedTournament.participants || []}
          selectCount={selectedTournament.max_participants || 8}
          onComplete={handleWheelComplete}
          onClose={() => setShowWheel(false)}
        />
      )}
    </div>
  )
}
