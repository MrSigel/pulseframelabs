import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAllPublic, getOnePublic, onTableChange, insert, update, remove } from '../lib/store'
import { Plus, Trash2, Check } from 'lucide-react'

export const DEFAULT_THEME = {
  bgColor:       '10,10,22',
  bgColorLight:  '255,255,255',
  bgOpacity:     0.92,
  blur:          12,
  accentColor:   '99,102,241',
  positiveColor: '#34d399',
  negativeColor: '#f87171',
  textPrimary:   '#ffffff',
  textSecondary: '#a0a0d0',
  textMuted:     '#44447a',
  borderRadius:  12,
  borderWidth:   1,
  showBorder:    true,
  padding:       20,
  fontSize:      1,
  fontFamily:    'monospace',
  glow:          true,
  showHeader:    true,
  showProfit:    true,
  showTotalWin:  true,
  showNumbers:   true,
}

// ── Editable inline field ──────────────────────────────────────────────────
function EditableField({ value, onChange, type = 'text', style = {}, inputStyle = {} }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  useEffect(() => { if (!editing) setVal(value) }, [value, editing])
  const confirm = () => { setEditing(false); onChange(val) }
  const cancel  = () => { setEditing(false); setVal(value) }

  if (!editing) {
    return (
      <span className="editable-hint" onClick={() => setEditing(true)} title="Click to edit" style={style}>
        {value}
      </span>
    )
  }
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
      <input autoFocus type={type} value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel() }}
        style={{ background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.5)', borderRadius:4, color:'#fff', outline:'none', fontFamily:'inherit', padding:'2px 8px', ...inputStyle }}
      />
      <button onClick={confirm}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', width:22, height:22, borderRadius:6, background:'rgba(52,211,153,0.2)', border:'1px solid rgba(52,211,153,0.5)', cursor:'pointer', color:'#34d399', padding:0 }}
        onMouseEnter={ev => { ev.currentTarget.style.background='rgba(52,211,153,0.35)' }}
        onMouseLeave={ev => { ev.currentTarget.style.background='rgba(52,211,153,0.2)' }}>
        <Check size={12} />
      </button>
    </span>
  )
}

// ── Entry win input ────────────────────────────────────────────────────────
function EntryWinInput({ entry, onSave, onDelete, positiveColor }) {
  const inputRef = useRef(null)
  const baseWin  = useRef(entry.win || 0)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    baseWin.current = entry.win || 0
    if (inputRef.current) inputRef.current.value = String(entry.win || 0)
    setDirty(false)
  }, [entry.id, entry.win])

  const handleInput = () => setDirty(Number(inputRef.current?.value ?? 0) !== baseWin.current)
  const confirm = () => {
    const v = inputRef.current?.value ?? '0'
    onSave(entry.id, v)
    baseWin.current = Number(v) || 0
    setDirty(false)
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
      <input ref={inputRef} type="number" defaultValue={entry.win || 0}
        onInput={handleInput} onKeyDown={e => e.key === 'Enter' && confirm()}
        style={{
          width:80, background:'rgba(0,0,0,0.3)',
          border:`1px solid ${dirty ? 'rgba(52,211,153,0.7)' : entry.win > 0 ? 'rgba(52,211,153,0.35)' : 'rgba(50,50,80,0.6)'}`,
          borderRadius:6, padding:'3px 8px', fontSize:'0.9em',
          color: dirty || entry.win > 0 ? positiveColor : '#7070a0',
          fontVariantNumeric:'tabular-nums', outline:'none', textAlign:'right', fontFamily:'inherit',
          transition:'border-color 0.15s',
        }}
      />
      {dirty && (
        <button onClick={confirm}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', width:22, height:22, borderRadius:6, background:'rgba(52,211,153,0.2)', border:'1px solid rgba(52,211,153,0.5)', cursor:'pointer', color:'#34d399', padding:0 }}
          onMouseEnter={ev => { ev.currentTarget.style.background='rgba(52,211,153,0.35)' }}
          onMouseLeave={ev => { ev.currentTarget.style.background='rgba(52,211,153,0.2)' }}>
          <Check size={12} />
        </button>
      )}
      <button onClick={() => onDelete(entry.id)}
        style={{ background:'none', border:'none', cursor:'pointer', color:'#3a3a6a', padding:2, lineHeight:0 }}
        onMouseEnter={ev => ev.currentTarget.style.color='#f87171'}
        onMouseLeave={ev => ev.currentTarget.style.color='#3a3a6a'}>
        <Trash2 size={12} />
      </button>
    </div>
  )
}

// ── Tooltip bubble ─────────────────────────────────────────────────────────
function Tip({ label, visible, children }) {
  if (!visible) return children
  return (
    <span style={{ position:'relative', display:'inline-flex' }}>
      <span style={{
        position:'absolute', bottom:'calc(100% + 10px)', left:'50%', transform:'translateX(-50%)',
        zIndex:200, pointerEvents:'none', fontSize:10, fontWeight:600, color:'#e0d9ff',
        background:'linear-gradient(135deg,rgba(30,18,60,0.98),rgba(20,12,45,0.98))',
        border:'1px solid rgba(99,102,241,0.55)', borderRadius:10,
        padding:'5px 10px', whiteSpace:'nowrap',
        boxShadow:'0 6px 20px rgba(0,0,0,0.55)', letterSpacing:'0.04em',
      }}>
        {label}
        <span style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:'6px solid rgba(99,102,241,0.55)' }} />
        <span style={{ position:'absolute', top:'calc(100% - 1px)', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'5px solid rgba(20,12,45,0.98)' }} />
      </span>
      {children}
    </span>
  )
}

const Placeholder = ({ text }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:120, fontFamily:'monospace', color:'#444466', fontSize:12 }}>{text}</div>
)

// ── Main overlay ───────────────────────────────────────────────────────────
export default function BonushuntOverlay({ huntId, editable = false, showTooltips = false, theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [params] = useSearchParams()
  const mode = params.get('mode') || 'normal'
  const [hunt, setHunt] = useState(null)
  const [entries, setEntries] = useState([])
  const [newEntry, setNewEntry] = useState('')
  const [newBuyIn, setNewBuyIn] = useState('')

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    getOnePublic('pfl_bonushunt_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    getOnePublic('pfl_theme_mode', uid).then(v => {
      if (v === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
  }, [uid, themeProp])

  const loadData = () => {
    // uid is optional - fallback to logged-in user
    getAllPublic('bonushunts', uid).then(hunts => {
      if (!hunts.length) { setHunt(null); setEntries([]); return }
      const active = huntId
        ? (hunts.find(h => h.id === huntId) || null)
        : (hunts.find(h => h.status === 'active') || hunts[0])
      if (!active) { setHunt(null); setEntries([]); return }
      setHunt(active)
      getAllPublic('bonushunt_entries', uid).then(allEntries => {
        setEntries(allEntries.filter(e => e.bonushunt_id === active.id).sort((a, b) => a.position - b.position))
      })
    })
  }

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    loadData()
    const off1 = onTableChange('bonushunts', loadData)
    const off2 = onTableChange('bonushunt_entries', loadData)
    return () => { off1(); off2() }
  }, [huntId, uid])

  const saveHuntField = (field, raw) => {
    if (!hunt) return
    const value = field === 'start_balance' ? (Number(raw) || 0) : raw
    if (field === 'start_balance') {
      const totalWin = entries.reduce((s, e) => s + (e.win || 0), 0)
      const totalBuyIn = entries.reduce((s, e) => s + (e.buy_in || 0), 0)
      const newBal = value + totalWin - totalBuyIn
      update('bonushunts', hunt.id, { start_balance: value, current_balance: newBal })
      setHunt(h => ({ ...h, start_balance: value, current_balance: newBal }))
    } else {
      update('bonushunts', hunt.id, { [field]: value })
      setHunt(h => ({ ...h, [field]: value }))
    }
  }

  const saveWin = (entryId, raw) => {
    const win = Number(raw) || 0
    const entry = entries.find(e => e.id === entryId)
    const multiplier = entry && entry.buy_in > 0 ? win / entry.buy_in : 0
    update('bonushunt_entries', entryId, { win, multiplier })
    const updated = entries.map(e => e.id === entryId ? { ...e, win, multiplier } : e)
    setEntries(updated)
    const totalW = updated.reduce((s, e) => s + (e.win || 0), 0)
    const totalB = updated.reduce((s, e) => s + (e.buy_in || 0), 0)
    const newBal = (hunt.start_balance || 0) + totalW - totalB
    update('bonushunts', hunt.id, { current_balance: newBal })
    setHunt(h => ({ ...h, current_balance: newBal }))
  }

  const addEntry = () => {
    if (!newEntry.trim() || !hunt) return
    const buyIn = Number(newBuyIn) || 0
    insert('bonushunt_entries', { bonushunt_id: hunt.id, name: newEntry.trim(), buy_in: buyIn, win: 0, multiplier: 0, position: entries.length + 1 }).then(row => {
      if (row) setEntries(prev => [...prev, row])
    })
    setNewEntry('')
    setNewBuyIn('')
  }

  const deleteEntry = (id) => {
    remove('bonushunt_entries', id)
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    const totalW = updated.reduce((s, e) => s + (e.win || 0), 0)
    const totalB = updated.reduce((s, e) => s + (e.buy_in || 0), 0)
    const newBal = (hunt.start_balance || 0) + totalW - totalB
    update('bonushunts', hunt.id, { current_balance: newBal })
    setHunt(h => ({ ...h, current_balance: newBal }))
  }

  if (!hunt) return <Placeholder text="No bonus hunt found" />

  const totalBuyIn = entries.reduce((s, e) => s + (e.buy_in || 0), 0)
  const totalWin   = entries.reduce((s, e) => s + (e.win || 0), 0)
  const currentBalance = (hunt.start_balance || 0) + totalWin - totalBuyIn
  const played     = entries.filter(e => e.win > 0).length
  const total      = entries.length

  // Required X: what multiplier remaining entries need to hit
  const remainingNeeded = Math.max(0, (hunt.start_balance || 0) - totalWin)
  const remainingBuyIn  = entries.filter(e => !e.win || e.win <= 0).reduce((s, e) => s + (e.buy_in || 0), 0)
  const requiredX       = remainingBuyIn > 0 ? remainingNeeded / remainingBuyIn : 0

  const profit = currentBalance - (hunt.start_balance || 0)
  const ac     = `rgba(${t.accentColor},`

  // Find CURRENT and NEXT unplayed entries
  const unplayedIndices = entries.reduce((arr, e, i) => { if (!e.win || e.win <= 0) arr.push(i); return arr }, [])
  const currentIdx = unplayedIndices.length > 0 ? unplayedIndices[0] : -1
  const nextIdx    = unplayedIndices.length > 1 ? unplayedIndices[1] : -1

  // compact mode (OBS only)
  if (mode === 'compact' && !editable) {
    return (
      <div style={{ fontFamily: t.fontFamily, background:`rgba(${t.bgColor},${t.bgOpacity})`, border:`1px solid ${ac}0.2)`, borderRadius: t.borderRadius, backdropFilter:`blur(${t.blur}px)`, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, minWidth:480 }}>
        <div>
          <div style={{ fontSize:'0.64em', color:`${ac}0.5)`, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:3 }}>Bonushunt</div>
          <div style={{ fontSize:'1.15em', fontWeight:700, color: t.textPrimary }}>{hunt.name}</div>
        </div>
        {[
          { l:'Games',      v: `${played}/${total}`,                        c: t.textPrimary },
          { l:'Total Buy-In', v: totalBuyIn.toLocaleString(),               c: t.textSecondary },
          { l:'Total Win',  v: totalWin.toLocaleString(),                   c: totalWin >= totalBuyIn ? t.positiveColor : t.negativeColor },
          { l:'Required X', v: `${requiredX.toFixed(2)}x`,                  c: requiredX <= 100 ? t.positiveColor : t.negativeColor },
        ].map(s => (
          <div key={s.l} style={{ textAlign:'center' }}>
            <div style={{ fontSize:'0.64em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.12em' }}>{s.l}</div>
            <div style={{ fontSize:'1.6em', fontWeight:700, color: s.c, fontVariantNumeric:'tabular-nums' }}>{s.v}</div>
          </div>
        ))}
      </div>
    )
  }

  // stat boxes to show
  const allStats = [
    { l:'Games',       edField:null,              raw: null,                v: `${played}/${total}`,              c: t.textPrimary },
    { l:'Start',       edField:'start_balance',   raw: hunt.start_balance||0, v:(hunt.start_balance||0).toLocaleString(), c: t.textSecondary },
    { l:'Total Buy-In', edField:null,             raw: null,                v: totalBuyIn.toLocaleString(),       c: t.textSecondary },
    { l:'Total Win',   edField:null,              raw: null,                v: totalWin.toLocaleString(),         c: totalWin >= totalBuyIn ? t.positiveColor : t.negativeColor, hide: !t.showTotalWin },
    { l:'Required X',  edField:null,              raw: null,                v: `${requiredX.toFixed(2)}x`,        c: requiredX <= 100 ? t.positiveColor : t.negativeColor },
    { l:'Profit',      edField:null,              raw: null,                v:(profit>=0?'+':'')+profit.toLocaleString(), c: profit>=0 ? t.positiveColor : t.negativeColor, hide: !t.showProfit },
  ].filter(s => !s.hide)

  const rad   = Math.max(4, t.borderRadius - 4)
  const glowShadow = t.glow ? `0 0 30px ${ac}0.12), inset 0 1px 0 rgba(255,255,255,0.03)` : 'none'

  // Helper: determine entry border color
  const entryBorderColor = (e) => {
    if (!e.win || e.win <= 0) return `${ac}0.08)` // gray/unplayed
    const mult = e.buy_in > 0 ? e.win / e.buy_in : 0
    return mult >= requiredX ? `rgba(52,211,153,0.5)` : `rgba(248,113,113,0.5)` // green or red
  }

  return (
    <div style={{
      fontFamily: t.fontFamily,
      background: `rgba(${t.bgColor},${t.bgOpacity})`,
      border: t.showBorder ? `${t.borderWidth}px solid ${ac}0.25)` : 'none',
      borderRadius: t.borderRadius,
      backdropFilter: `blur(${t.blur}px)`,
      padding: t.padding,
      minWidth: 380,
      fontSize: `${t.fontSize}em`,
      boxShadow: glowShadow,
      transition: 'all 0.3s',
    }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${allStats.length},1fr)`, gap:8, marginBottom:14 }}>
        {allStats.map(s => (
          <div key={s.l} style={{ background:`rgba(${t.bgColor},0.6)`, border:`1px solid ${ac}0.15)`, borderRadius: rad, padding:'6px 8px', textAlign:'center' }}>
            <div style={{ fontSize:'0.58em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>{s.l}</div>
            <div style={{ fontSize:'0.9em', fontWeight:700, color: s.c, fontVariantNumeric:'tabular-nums' }}>
              {editable && s.edField
                ? <Tip label="Start Balance" visible={showTooltips}><EditableField value={s.raw} type="number" onChange={v => saveHuntField(s.edField, v)} style={{ fontSize:'1em', fontWeight:700, color: s.c }} inputStyle={{ fontSize:'0.85em', color: s.c, width:70, textAlign:'center', background:'transparent' }} /></Tip>
                : s.v}
            </div>
          </div>
        ))}
      </div>

      {/* Entries */}
      {(entries.length > 0 || editable) && (
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {entries.map((e, i) => {
            const mult = e.buy_in > 0 ? (e.win || 0) / e.buy_in : 0
            const isCurrent = i === currentIdx
            const isNext    = i === nextIdx
            const borderCol = entryBorderColor(e)
            const multColor = (!e.win || e.win <= 0) ? t.textMuted : (mult >= requiredX ? t.positiveColor : t.negativeColor)

            return (
              <div key={e.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:`rgba(${t.bgColor},0.5)`, border:`1px solid ${borderCol}`, borderRadius: rad, padding:'6px 12px', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:0 }}>
                  {t.showNumbers && <span style={{ fontSize:'0.64em', color: t.textMuted, minWidth:16, textAlign:'right', fontVariantNumeric:'tabular-nums', flexShrink:0 }}>{e.position || i+1}</span>}
                  <span style={{ fontSize:'0.85em', color: t.textSecondary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.name}</span>
                  {isCurrent && <span style={{ fontSize:'0.6em', fontWeight:700, color:'#000', background:'#facc15', borderRadius:4, padding:'1px 6px', flexShrink:0, letterSpacing:'0.05em' }}>CURRENT</span>}
                  {isNext && <span style={{ fontSize:'0.6em', fontWeight:700, color:'#000', background:'#94a3b8', borderRadius:4, padding:'1px 6px', flexShrink:0, letterSpacing:'0.05em' }}>NEXT</span>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                  {/* Buy-in */}
                  <span style={{ fontSize:'0.75em', color: t.textMuted, fontVariantNumeric:'tabular-nums' }}>{(e.buy_in || 0).toLocaleString()}</span>
                  {/* Multiplier */}
                  <span style={{ fontSize:'0.75em', fontWeight:700, color: multColor, fontVariantNumeric:'tabular-nums', minWidth:42, textAlign:'right' }}>{e.win > 0 ? `${mult.toFixed(2)}x` : '—'}</span>
                  {/* Win */}
                  {editable
                    ? <Tip label="Enter win" visible={showTooltips}><EntryWinInput entry={e} onSave={saveWin} onDelete={deleteEntry} positiveColor={t.positiveColor} /></Tip>
                    : <span style={{ fontSize:'0.85em', fontWeight:700, color: e.win > 0 ? t.positiveColor : t.textMuted, fontVariantNumeric:'tabular-nums', flexShrink:0 }}>{e.win > 0 ? `+${e.win.toLocaleString()}` : '—'}</span>
                  }
                </div>
              </div>
            )
          })}

          {editable && (
            <div style={{ display:'flex', gap:6, marginTop:6 }}>
              <input value={newEntry} onChange={e => setNewEntry(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEntry()}
                placeholder="Add game…"
                style={{ flex:1, background:`rgba(${t.bgColor},0.4)`, border:`1px dashed ${ac}0.3)`, borderRadius: rad, padding:'6px 12px', fontSize:'0.85em', color: t.textSecondary, fontFamily:'inherit', outline:'none' }}
              />
              <input value={newBuyIn} onChange={e => setNewBuyIn(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEntry()}
                placeholder="Bet"
                type="number"
                style={{ width:90, background:`rgba(${t.bgColor},0.4)`, border:`1px dashed ${ac}0.3)`, borderRadius: rad, padding:'6px 12px', fontSize:'0.85em', color: t.textSecondary, fontFamily:'inherit', outline:'none' }}
              />
              <button onClick={addEntry}
                style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius: rad, background:`${ac}0.15)`, border:`1px solid ${ac}0.3)`, color:`${ac}0.9)`, fontSize:'0.85em', cursor:'pointer', fontFamily:'inherit' }}>
                <Plus size={12} /> Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
