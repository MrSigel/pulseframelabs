import { useEffect, useState, useRef } from 'react'
import { getAll, getOne, setOne, insert, update, remove, clearTable, onTableChange } from '../lib/store'
import { Info, Plus, Trash2, Copy, Check, Swords, Timer, Users, Trophy } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const gold = '#d4af37'
const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
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

export default function PointsBattle() {
  const { t } = useLang()
  const tc = t.common
  const tp = t.pointsBattle
  const [session, setSession] = useState(null)
  const [bets, setBets] = useState([])
  const [showInfo, setShowInfo] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const timerRef = useRef(null)

  const [form, setForm] = useState({
    options: [{ keyword: '', label: '' }, { keyword: '', label: '' }],
    min_points: '10', max_points: '1000', duration: '120',
  })

  const reload = async () => {
    const sessions = await getAll('points_battle_sessions')
    const active = sessions.find(s => s.status === 'active') || sessions.find(s => s.status === 'finished') || null
    setSession(active)
    if (active) setBets((await getAll('points_battle_bets')).filter(b => b.session_id === active.id))
    else setBets([])
  }

  useEffect(() => {
    reload()
    const off = onTableChange('points_battle_bets', reload)
    return off
  }, [])

  // Countdown timer
  useEffect(() => {
    if (session?.status === 'active' && session.duration_seconds) {
      const elapsed = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
      const left = Math.max(0, session.duration_seconds - elapsed)
      setRemaining(left)

      if (left <= 0) { finishBattle(); return }

      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); finishBattle(); return 0 }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [session?.id, session?.status])

  const startBattle = async () => {
    const options = form.options.filter(o => o.keyword.trim() && o.label.trim())
    if (options.length < 2) return
    const data = await insert('points_battle_sessions', {
      options, min_points: Number(form.min_points) || 10,
      max_points: Number(form.max_points) || 1000,
      duration_seconds: Number(form.duration) || 120,
      status: 'active', started_at: new Date().toISOString(),
    })
    setSession(data)
    setBets([])
    setShowNew(false)
    setRemaining(Number(form.duration) || 120)
  }

  const finishBattle = async () => {
    if (!session) return
    await update('points_battle_sessions', session.id, { status: 'finished', ended_at: new Date().toISOString() })
    clearInterval(timerRef.current)
    reload()
  }

  const resetBattle = async () => {
    if (!session) return
    const allBets = await getAll('points_battle_bets')
    for (const b of allBets.filter(b => b.session_id === session.id)) {
      await remove('points_battle_bets', b.id)
    }
    await remove('points_battle_sessions', session.id)
    clearInterval(timerRef.current)
    setSession(null)
    setBets([])
    setRemaining(0)
  }

  const addOption = () => setForm(p => ({ ...p, options: [...p.options, { keyword: '', label: '' }] }))
  const updateOption = (i, field, val) => setForm(p => ({ ...p, options: p.options.map((o, j) => j === i ? { ...o, [field]: val } : o) }))
  const removeOption = (i) => setForm(p => ({ ...p, options: p.options.filter((_, j) => j !== i) }))

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // Stats per option
  const optionStats = (session?.options || []).map((opt, i) => {
    const optBets = bets.filter(b => b.option_index === i)
    return { ...opt, total: optBets.reduce((s, b) => s + (b.amount || 0), 0), count: optBets.length }
  })
  const totalPool = optionStats.reduce((s, o) => s + o.total, 0)
  const totalBettors = bets.length

  const BAR_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

  return (
    <div>
      {/* Action bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        {session && (
          <HoverBtn onClick={() => setShowInfo(!showInfo)}
            style={{ background: showInfo ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.05)', borderColor: showInfo ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.12)', color: showInfo ? gold : '#4a4842' }}
            hoverStyle={{ background:'rgba(212,175,55,0.1)', borderColor:'rgba(212,175,55,0.3)', color:gold, transform:'translateY(-1px)' }}>
            <Info size={14} /> {tc.info}
          </HoverBtn>
        )}
        {!session && (
          <HoverBtn onClick={() => setShowNew(!showNew)}
            style={{ background:`linear-gradient(135deg,${gold},#b8962e)`, borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.2)' }}
            hoverStyle={{ background:`linear-gradient(135deg,#e8c84a,${gold})`, boxShadow:'0 0 22px rgba(212,175,55,0.35)', transform:'translateY(-1px)' }}>
            <Plus size={14} /> {tp.newBattle}
          </HoverBtn>
        )}
      </div>

      {showInfo && (
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, background:'rgba(212,175,55,0.04)', border:'1px solid rgba(212,175,55,0.12)', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
          <Swords size={16} style={{ color:gold, flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:gold }}>{tp.title}</span>
            <span style={{ fontSize:12, color:'#8a8478', lineHeight:1.6 }}>
              {tp.infoText}
            </span>
          </div>
        </div>
      )}

      {/* New battle form */}
      {showNew && (
        <div style={{ ...S.card, padding:20, marginBottom:20 }}>
          <p style={S.label}>{tp.newPointsBattle}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <span style={S.label}>{tp.options}</span>
              {form.options.map((opt, i) => (
                <div key={i} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'center' }}>
                  <input className="input" placeholder={tp.keywordPlaceholder} value={opt.keyword}
                    onChange={e => updateOption(i, 'keyword', e.target.value)} style={{ width:120 }} />
                  <input className="input" placeholder={tp.labelPlaceholder} value={opt.label}
                    onChange={e => updateOption(i, 'label', e.target.value)} style={{ flex:1 }} />
                  {form.options.length > 2 && (
                    <button onClick={() => removeOption(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'#4a4842', padding:0 }}
                      onMouseEnter={e => e.currentTarget.style.color='#f87171'} onMouseLeave={e => e.currentTarget.style.color='#4a4842'}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addOption} style={{ fontSize:11, color:gold, background:'none', border:'none', cursor:'pointer', padding:0, marginTop:4 }}>{tp.addOption}</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <div><span style={S.label}>{tp.minPoints}</span><input className="input" type="number" value={form.min_points} onChange={e => setForm(p => ({ ...p, min_points: e.target.value }))} /></div>
              <div><span style={S.label}>{tp.maxPoints}</span><input className="input" type="number" value={form.max_points} onChange={e => setForm(p => ({ ...p, max_points: e.target.value }))} /></div>
              <div><span style={S.label}>{tp.duration}</span><input className="input" type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} /></div>
            </div>
            <HoverBtn onClick={startBattle} disabled={form.options.filter(o => o.keyword.trim() && o.label.trim()).length < 2}
              style={{ background:`linear-gradient(135deg,${gold},#b8962e)`, borderColor:'rgba(212,175,55,0.4)', color:'#fff', opacity: form.options.filter(o => o.keyword.trim() && o.label.trim()).length < 2 ? 0.5 : 1 }}
              hoverStyle={{ boxShadow:'0 0 22px rgba(212,175,55,0.35)', transform:'translateY(-1px)' }}>
              <Swords size={14} /> {tp.startBattle}
            </HoverBtn>
          </div>
        </div>
      )}

      {/* No session */}
      {!session && !showNew && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>{tp.noActive}</div>
      )}

      {/* Active / Finished battle */}
      {session && (
        <div style={{ ...S.card, padding:20 }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Swords size={16} style={{ color:gold }} />
              <span style={{ fontSize:15, fontWeight:700, color:'#e8e2d4' }}>{tp.title}</span>
              <span style={{
                fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:6, textTransform:'uppercase',
                background: session.status === 'active' ? 'rgba(52,211,153,0.12)' : 'rgba(212,175,55,0.12)',
                color: session.status === 'active' ? '#34d399' : gold,
                border: `1px solid ${session.status === 'active' ? 'rgba(52,211,153,0.3)' : 'rgba(212,175,55,0.3)'}`,
              }}>{session.status === 'active' ? tc.live : tc.finished}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {session.status === 'active' && (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:18, fontWeight:700, color: remaining < 30 ? '#f87171' : '#e8e2d4', fontVariantNumeric:'tabular-nums' }}>
                    <Timer size={14} /> {fmtTime(remaining)}
                  </div>
                  <HoverBtn onClick={finishBattle}
                    style={{ background:'rgba(248,113,113,0.06)', borderColor:'rgba(248,113,113,0.2)', color:'#f87171', padding:'6px 12px', fontSize:11 }}
                    hoverStyle={{ background:'rgba(248,113,113,0.14)', transform:'translateY(-1px)' }}>
                    {tp.stop}
                  </HoverBtn>
                </>
              )}
              <HoverBtn onClick={resetBattle}
                style={{ background:'rgba(248,113,113,0.06)', borderColor:'rgba(248,113,113,0.2)', color:'#f87171', padding:'6px 12px', fontSize:11 }}
                hoverStyle={{ background:'rgba(248,113,113,0.14)', transform:'translateY(-1px)' }}>
                <Trash2 size={12} /> {tc.reset}
              </HoverBtn>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:12, marginBottom:20 }}>
            <div style={{ ...S.card, padding:'10px 16px', flex:1, textAlign:'center' }}>
              <div style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{tp.totalPool}</div>
              <div style={{ fontSize:18, fontWeight:700, color:gold }}>{totalPool.toLocaleString()}</div>
            </div>
            <div style={{ ...S.card, padding:'10px 16px', flex:1, textAlign:'center' }}>
              <div style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{tp.bettors}</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#e8e2d4' }}>{totalBettors}</div>
            </div>
            <div style={{ ...S.card, padding:'10px 16px', flex:1, textAlign:'center' }}>
              <div style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{tp.command}</div>
              <div style={{ fontSize:12, fontWeight:600, color:gold, fontFamily:'monospace' }}>!bet keyword amount</div>
            </div>
          </div>

          {/* Option bars */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {optionStats.map((opt, i) => {
              const pct = totalPool > 0 ? (opt.total / totalPool * 100) : 0
              const color = BAR_COLORS[i % BAR_COLORS.length]
              return (
                <div key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'#e8e2d4' }}>{opt.label}</span>
                      <span style={{ fontSize:10, color:'#4a4842', fontFamily:'monospace' }}>!bet {opt.keyword}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:11, color:'#5a5548' }}>{opt.count} {tp.bets}</span>
                      <span style={{ fontSize:13, fontWeight:700, color }}>{opt.total.toLocaleString()} {tp.pts}</span>
                      <span style={{ fontSize:11, fontWeight:600, color:'#5a5548' }}>{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div style={{ height:10, background:'rgba(255,255,255,0.03)', borderRadius:5, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:5, transition:'width 0.5s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent bets */}
          {bets.length > 0 && (
            <div style={{ marginTop:20 }}>
              <span style={S.label}>{tp.recentBets} ({bets.length})</span>
              <div style={{ maxHeight:200, overflowY:'auto' }}>
                {bets.slice(-20).reverse().map(b => {
                  const opt = (session.options || [])[b.option_index]
                  const color = BAR_COLORS[b.option_index % BAR_COLORS.length]
                  return (
                    <div key={b.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', borderBottom:'1px solid rgba(212,175,55,0.04)' }}>
                      <span style={{ fontSize:12, fontWeight:600, color:'#d4cfc4', flex:1 }}>{b.viewer_username}</span>
                      <span style={{ fontSize:10, fontWeight:600, color, padding:'2px 8px', borderRadius:4, background:`${color}15`, border:`1px solid ${color}30` }}>{opt?.label || '?'}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:'#e8e2d4', fontVariantNumeric:'tabular-nums' }}>{b.amount} {tp.pts}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
