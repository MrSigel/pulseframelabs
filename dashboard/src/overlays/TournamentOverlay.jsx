import { useEffect, useState } from 'react'
import { getAllPublic, getOnePublic, onTableChange, update } from '../lib/store'
import { Check, Trophy } from 'lucide-react'

export const DEFAULT_THEME = {
  bgColor:       '10,10,22',
  bgColorLight:  '255,255,255',
  bgOpacity:     0.92,
  blur:          12,
  accentColor:   '99,102,241',
  textPrimary:   '#ffffff',
  textSecondary: '#a0a0d0',
  textMuted:     '#44447a',
  highlightColor:'#fbbf24',
  borderRadius:  12,
  borderWidth:   1,
  showBorder:    true,
  padding:       20,
  fontSize:      1,
  fontFamily:    'monospace',
  glow:          true,
  showPrizePool: true,
  showSlots:     true,
  showStatus:    true,
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? `${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)}` : '251,191,36'
}

// ── Editable inline field ──────────────────────────────────────────────────
function EditableField({ value, onChange, type = 'text', placeholder = '', style = {}, inputStyle = {} }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal]         = useState(value)
  useEffect(() => { if (!editing) setVal(value) }, [value, editing])
  const confirm = () => { setEditing(false); onChange(val) }
  const cancel  = () => { setEditing(false); setVal(value) }

  if (!editing) {
    return (
      <span className="editable-hint" onClick={() => setEditing(true)} title="Click to edit" style={style}>
        {value || <span style={{ opacity: 0.3 }}>{placeholder}</span>}
      </span>
    )
  }
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
      <input autoFocus type={type} value={val} placeholder={placeholder}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel() }}
        style={{ background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.5)', borderRadius:4, color:'#fff', outline:'none', fontFamily:'inherit', padding:'2px 6px', ...inputStyle }}
      />
      <button onClick={confirm}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', width:20, height:20, borderRadius:5, background:'rgba(52,211,153,0.2)', border:'1px solid rgba(52,211,153,0.5)', cursor:'pointer', color:'#34d399', padding:0, flexShrink:0 }}
        onMouseEnter={ev => { ev.currentTarget.style.background='rgba(52,211,153,0.35)' }}
        onMouseLeave={ev => { ev.currentTarget.style.background='rgba(52,211,153,0.2)' }}>
        <Check size={11} />
      </button>
    </span>
  )
}

// ── Tooltip bubble ─────────────────────────────────────────────────────────
function Tip({ label, visible, children }) {
  if (!visible) return children
  return (
    <span style={{ position:'relative', display:'inline-flex' }}>
      <span style={{
        position:'absolute', bottom:'calc(100% + 10px)', left:'50%',
        transform:'translateX(-50%)',
        zIndex:9999, pointerEvents:'none',
        fontSize:10, fontWeight:600, color:'#e0d9ff',
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

// ── Single player slot row ─────────────────────────────────────────────────
function SlotRow({ name, game, win, defaultName, editable, showTooltips, onSaveName, onSaveGame, onSaveWin, isWinner, isLoser, canPickWinner, onPickWinner }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', gap:2,
      opacity: isLoser ? 0.4 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* Name + Win on same row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.72em', fontWeight:600, color: isWinner ? '#34d399' : '#ffffff', lineHeight:1.2, minWidth:0 }}>
          {canPickWinner && (
            <button onClick={onPickWinner} title="Pick as winner"
              style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                width:16, height:16, borderRadius:4, padding:0, cursor:'pointer', flexShrink:0,
                background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.3)',
                color:'#fbbf24', transition:'all 0.15s',
              }}
              onMouseEnter={ev => { ev.currentTarget.style.background='rgba(251,191,36,0.3)'; ev.currentTarget.style.borderColor='rgba(251,191,36,0.6)' }}
              onMouseLeave={ev => { ev.currentTarget.style.background='rgba(251,191,36,0.12)'; ev.currentTarget.style.borderColor='rgba(251,191,36,0.3)' }}>
              <Trophy size={10} />
            </button>
          )}
          {isWinner && <Check size={11} style={{ color:'#34d399', flexShrink:0 }} />}
          {editable
            ? <Tip label="Player Name" visible={showTooltips}>
                <EditableField value={name} onChange={onSaveName}
                  placeholder={defaultName}
                  style={{ color: isWinner ? '#34d399' : isLoser ? '#666' : '#ffffff', textDecoration: isLoser ? 'line-through' : 'none' }}
                  inputStyle={{ width:72 }} />
              </Tip>
            : (name || <span style={{ color:'rgba(255,255,255,0.35)' }}>{defaultName}</span>)}
        </div>
        <div style={{ fontSize:'0.68em', fontWeight:600, color:'rgba(255,255,255,0.85)', lineHeight:1.2, textAlign:'right', flexShrink:0 }}>
          {editable
            ? <EditableField value={win} onChange={onSaveWin}
                placeholder="Win"
                style={{ color:'rgba(255,255,255,0.85)', textAlign:'right' }}
                inputStyle={{ width:52, textAlign:'right' }} />
            : (win || <span style={{ color:'rgba(255,255,255,0.2)' }}>—</span>)}
        </div>
      </div>
      {/* Game */}
      <div style={{ fontSize:'0.68em', fontWeight:400, color: isLoser ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)', lineHeight:1.2 }}>
        {editable
          ? <Tip label="Game" visible={showTooltips}>
              <EditableField value={game} onChange={onSaveGame}
                placeholder="Game..."
                style={{ color:'rgba(255,255,255,0.7)' }}
                inputStyle={{ width:110 }} />
            </Tip>
          : (game || <span style={{ color:'rgba(255,255,255,0.25)' }}>—</span>)}
      </div>
    </div>
  )
}

// ── Tournament bracket tree ────────────────────────────────────────────────
function BracketTree({ slots, slotsData, onSaveSlot, t, editable, showTooltips, champion, onSaveChampion, bracketWinners, onPickWinner, tournamentStatus }) {
  const ac    = `rgba(${t.accentColor},`

  const MATCH_H   = 82
  const MATCH_W   = 156
  const CONN_W    = 32
  const MATCH_GAP = 10
  const CHAMP_W   = 124
  const CHAMP_H   = 66
  const rad       = Math.max(4, t.borderRadius - 4)

  // Build round counts: [slots/2, slots/4, ..., 1]
  const roundCounts = []
  for (let c = Math.floor(slots / 2); c >= 1; c = Math.floor(c / 2)) roundCounts.push(c)
  const numRounds = roundCounts.length
  const numR0     = roundCounts[0]

  const totalH = numR0 * MATCH_H + (numR0 - 1) * MATCH_GAP

  const allCenters = [
    Array.from({ length: numR0 }, (_, i) => i * (MATCH_H + MATCH_GAP) + MATCH_H / 2),
  ]
  for (let r = 1; r < numRounds; r++) {
    const prev = allCenters[r - 1]
    const curr = []
    for (let i = 0; i < prev.length; i += 2) curr.push((prev[i] + prev[i + 1]) / 2)
    allCenters.push(curr)
  }

  const finalCenter    = allCenters[numRounds - 1][0]
  const champConnStartX = (numRounds - 1) * (MATCH_W + CONN_W) + MATCH_W
  const champX          = champConnStartX + CONN_W
  const totalW          = champX + CHAMP_W

  // SVG connectors
  const svgLines = []
  for (let r = 0; r < numRounds - 1; r++) {
    const centers     = allCenters[r]
    const nextCenters = allCenters[r + 1]
    const startX = r * (MATCH_W + CONN_W) + MATCH_W
    const midX   = startX + CONN_W / 2
    const nextX  = startX + CONN_W
    for (let i = 0; i < nextCenters.length; i++) {
      const topY = centers[i * 2]
      const botY = centers[i * 2 + 1]
      const midY = nextCenters[i]
      svgLines.push(
        <g key={`conn-${r}-${i}`} stroke={`rgba(${t.accentColor},0.3)`} strokeWidth="1" fill="none">
          <line x1={startX} y1={topY} x2={midX}  y2={topY} />
          <line x1={startX} y1={botY} x2={midX}  y2={botY} />
          <line x1={midX}   y1={topY} x2={midX}  y2={botY} />
          <line x1={midX}   y1={midY} x2={nextX} y2={midY} />
        </g>
      )
    }
  }
  svgLines.push(
    <line key="champ-conn"
      x1={champConnStartX} y1={finalCenter}
      x2={champX}          y2={finalCenter}
      stroke={`${ac}0.3)`} strokeWidth="1" />
  )

  const winners = bracketWinners || {}
  const isOngoing = tournamentStatus === 'ongoing'

  return (
    <div>
      <div style={{ position:'relative', width: totalW, height: totalH }}>

        <svg style={{ position:'absolute', top:0, left:0, width:totalW, height:totalH, pointerEvents:'none', overflow:'visible' }}>
          {svgLines}
        </svg>

        {roundCounts.map((_, r) => {
          const centers = allCenters[r]
          const colX    = r * (MATCH_W + CONN_W)
          return centers.map((cy, i) => {
            const top = cy - MATCH_H / 2

            const key0 = `${r}-${i}-0`
            const key1 = `${r}-${i}-1`
            const s0   = slotsData?.[key0] || {}
            const s1   = slotsData?.[key1] || {}
            const def0 = r === 0 ? `Player ${i * 2 + 1}` : `Winner ${i * 2 + 1}`
            const def1 = r === 0 ? `Player ${i * 2 + 2}` : `Winner ${i * 2 + 2}`

            const matchKey = `${r}-${i}`
            const matchWinner = winners[matchKey]
            const hasWinner = matchWinner !== undefined && matchWinner !== null
            const bothHaveNames = !!(s0.name && s1.name)
            // Show pick-winner buttons only in editable mode, ongoing status, both players named, no winner yet
            const canPick = editable && isOngoing && bothHaveNames && !hasWinner

            return (
              <div key={`match-${r}-${i}`} style={{
                position:'absolute', left: colX, top,
                width: MATCH_W, height: MATCH_H,
                background: `rgba(${t.bgColor},0.72)`,
                border: `1px solid ${hasWinner ? 'rgba(52,211,153,0.25)' : `${ac}0.18)`}`,
                borderRadius: rad,
                boxShadow: 'none',
              }}>
                <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-evenly', height:'100%', padding:'6px 10px', gap:0 }}>
                  <SlotRow
                    name={s0.name || ''} game={s0.game || ''} win={s0.win || ''} defaultName={def0}
                    editable={editable}
                    showTooltips={showTooltips && r === 0 && i === 0}
                    onSaveName={v => onSaveSlot(r, i, 0, 'name', v)}
                    onSaveGame={v => onSaveSlot(r, i, 0, 'game', v)}
                    onSaveWin={v => onSaveSlot(r, i, 0, 'win', v)}
                    isWinner={hasWinner && matchWinner === 0}
                    isLoser={hasWinner && matchWinner !== 0}
                    canPickWinner={canPick}
                    onPickWinner={() => onPickWinner(r, i, 0)}
                  />
                  <div style={{ height:1, background:`${ac}0.1)`, margin:'4px 0' }} />
                  <SlotRow
                    name={s1.name || ''} game={s1.game || ''} win={s1.win || ''} defaultName={def1}
                    editable={editable}
                    showTooltips={false}
                    onSaveName={v => onSaveSlot(r, i, 1, 'name', v)}
                    onSaveGame={v => onSaveSlot(r, i, 1, 'game', v)}
                    onSaveWin={v => onSaveSlot(r, i, 1, 'win', v)}
                    isWinner={hasWinner && matchWinner === 1}
                    isLoser={hasWinner && matchWinner !== 1}
                    canPickWinner={canPick}
                    onPickWinner={() => onPickWinner(r, i, 1)}
                  />
                </div>
              </div>
            )
          })
        })}

        {/* Champion box */}
        <div style={{
          position:'absolute', left: champX, top: finalCenter - CHAMP_H / 2,
          width: CHAMP_W, height: CHAMP_H,
          background: champion ? 'rgba(52,211,153,0.08)' : `rgba(${t.bgColor},0.72)`,
          border: `1px solid ${champion ? 'rgba(52,211,153,0.3)' : `${ac}0.18)`}`,
          borderRadius: rad,
          boxShadow: champion ? '0 0 20px rgba(52,211,153,0.1)' : 'none',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:5, padding:'6px 8px', textAlign:'center',
        }}>
          <Trophy size={14} style={{ color: champion ? '#fbbf24' : t.textSecondary, opacity: champion ? 1 : 0.7, flexShrink:0 }} />
          {editable
            ? <Tip label="Tournament Winner" visible={showTooltips}>
                <EditableField value={champion || ''} onChange={onSaveChampion}
                  placeholder="Champion..."
                  style={{ fontSize:'0.72em', fontWeight:700, color: champion ? '#34d399' : t.textMuted }}
                  inputStyle={{ width:88, textAlign:'center' }} />
              </Tip>
            : <span style={{ fontSize:'0.72em', fontWeight:700, color: champion ? '#34d399' : t.textMuted }}>
                {champion || 'TBD'}
              </span>
          }
        </div>

      </div>
    </div>
  )
}

// ── Main overlay ───────────────────────────────────────────────────────────
export default function TournamentOverlay({ tournamentId, editable = false, showTooltips = false, theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [tournament, setTournament] = useState(null)

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    getOnePublic('pfl_tournament_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    getOnePublic('pfl_theme_mode', uid).then(v => {
      if (v === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
  }, [uid, themeProp])

  const loadData = () => {
    // uid is optional - fallback to logged-in user
    getAllPublic('tournaments', uid).then(data => {
      const active = tournamentId
        ? (data.find(x => x.id === tournamentId) || null)
        : (data.find(x => x.status === 'ongoing') || data.find(x => x.status === 'finished') || data[0] || null)
      setTournament(active)
    })
  }

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    loadData()
    const off = onTableChange('tournaments', loadData)
    return off
  }, [tournamentId, uid])

  const saveField = (field, raw) => {
    if (!tournament) return
    const value = (field === 'prize_pool' || field === 'max_participants') ? (Number(raw) || 0) : raw
    update('tournaments', tournament.id, { [field]: value })
    setTournament(prev => ({ ...prev, [field]: value }))
  }

  const saveSlot = (r, i, p, field, value) => {
    if (!tournament) return
    const key      = `${r}-${i}-${p}`
    const newSlots = { ...(tournament.slots || {}), [key]: { ...(tournament.slots?.[key] || {}), [field]: value } }
    update('tournaments', tournament.id, { slots: newSlots })
    setTournament(prev => ({ ...prev, slots: newSlots }))
  }

  const saveWinner = (round, matchIndex, playerIndex) => {
    if (!tournament) return
    const key = `${round}-${matchIndex}`
    const newWinners = { ...(tournament.bracket_winners || {}), [key]: playerIndex }

    const winnerSlotKey = `${round}-${matchIndex}-${playerIndex}`
    const winnerData = tournament.slots?.[winnerSlotKey] || {}

    let newSlots = { ...(tournament.slots || {}) }

    const slotsCount = tournament.max_participants || 8
    const roundCounts = []
    for (let c = Math.floor(slotsCount / 2); c >= 1; c = Math.floor(c / 2)) roundCounts.push(c)
    const numRounds = roundCounts.length
    const isFinalRound = round === numRounds - 1

    if (isFinalRound) {
      const changes = {
        bracket_winners: newWinners,
        slots: newSlots,
        champion: winnerData.name || '',
        status: 'finished',
      }
      update('tournaments', tournament.id, changes)
      setTournament(prev => ({ ...prev, ...changes }))
    } else {
      const nextRound = round + 1
      const nextMatch = Math.floor(matchIndex / 2)
      const nextSlot = matchIndex % 2
      const nextKey = `${nextRound}-${nextMatch}-${nextSlot}`

      newSlots[nextKey] = { ...winnerData }

      const changes = { bracket_winners: newWinners, slots: newSlots }
      update('tournaments', tournament.id, changes)
      setTournament(prev => ({ ...prev, ...changes }))
    }
  }

  if (!tournament) return <Placeholder text="No tournament found" />

  const slots      = tournament.max_participants || 8
  const ac         = `rgba(${t.accentColor},`
  const glowShadow = t.glow ? `0 0 30px ${ac}0.12), inset 0 1px 0 rgba(255,255,255,0.03)` : 'none'

  const containerStyle = {
    fontFamily:     t.fontFamily,
    background:     `rgba(${t.bgColor},${t.bgOpacity})`,
    border:         t.showBorder ? `${t.borderWidth}px solid ${ac}0.25)` : 'none',
    borderRadius:   t.borderRadius,
    backdropFilter: `blur(${t.blur}px)`,
    padding:        t.padding,
    fontSize:       `${t.fontSize}em`,
    boxShadow:      glowShadow,
    transition:     'all 0.3s',
  }

  // Status badge
  const statusLabels = { join_open: 'Joining Open', ongoing: 'Live', finished: 'Finished' }
  const statusColors = { join_open: '#fbbf24', ongoing: '#34d399', finished: '#818cf8' }
  const status = tournament.status || 'join_open'

  return (
    <div style={{ ...containerStyle }}>

      {/* Status indicator */}
      {t.showStatus && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background: statusColors[status] || '#44447a', boxShadow: `0 0 8px ${statusColors[status] || '#44447a'}` }} />
          <span style={{ fontSize:'0.7em', fontWeight:700, color: statusColors[status] || '#44447a', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            {statusLabels[status] || status}
          </span>
          {tournament.champion && status === 'finished' && (
            <span style={{ fontSize:'0.7em', fontWeight:600, color:'#fbbf24', marginLeft:8 }}>
              Champion: {tournament.champion}
            </span>
          )}
        </div>
      )}

      {/* ── Bracket tree ────────────────────────────────────────────────── */}
      {(status === 'ongoing' || status === 'finished') && (
        <div style={{ display:'flex', justifyContent:'center' }}>
          <BracketTree
            slots={slots}
            slotsData={tournament.slots || {}}
            onSaveSlot={saveSlot}
            t={t}
            editable={editable}
            showTooltips={showTooltips}
            champion={tournament.champion || ''}
            onSaveChampion={v => saveField('champion', v)}
            bracketWinners={tournament.bracket_winners || {}}
            onPickWinner={saveWinner}
            tournamentStatus={status}
          />
        </div>
      )}

      {/* join_open: show participant count */}
      {status === 'join_open' && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:80, color: t.textMuted, fontSize:'0.75em' }}>
          Waiting for participants... ({(tournament.participants || []).length} / {tournament.max_participants || 8})
        </div>
      )}

    </div>
  )
}
