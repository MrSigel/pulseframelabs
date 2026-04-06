import { useEffect, useState, useRef } from 'react'
import { getAllPublic, getOnePublic, onTableChange, update } from '../lib/store'
import { Check, Trophy, X } from 'lucide-react'
import { getOverlayStrings } from './overlayI18n'

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
  overlayScale:   1,
  showPrizePool: true,
  showSlots:     true,
  showStatus:    true,
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? `${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)}` : '251,191,36'
}

// ── Animations (injected once) ──────────────────────────────────────────
const ANIM_ID = 'tournament-overlay-anims'
if (typeof document !== 'undefined' && !document.getElementById(ANIM_ID)) {
  const el = document.createElement('style')
  el.id = ANIM_ID
  el.textContent = `
    @keyframes to-glow-flash { 0% { opacity:0; } 30% { opacity:1; } 70% { opacity:1; } 100% { opacity:0; } }
    @keyframes to-slot-in { from { opacity:0; transform:translateX(-20px) scale(0.9); } to { opacity:1; transform:translateX(0) scale(1); } }
    @keyframes to-name-glow { 0% { box-shadow: 0 0 0px rgba(212,175,55,0); } 50% { box-shadow: 0 0 20px rgba(212,175,55,0.4); } 100% { box-shadow: 0 0 8px rgba(212,175,55,0.1); } }
    @keyframes to-pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
  `
  document.head.appendChild(el)
}

// ── Editable inline field ──────────────────────────────────────────────
function EditableField({ value, onChange, type = 'text', placeholder = '', style = {}, inputStyle = {} }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
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
        style={{ display:'flex', alignItems:'center', justifyContent:'center', width:20, height:20, borderRadius:5, background:'rgba(52,211,153,0.2)', border:'1px solid rgba(52,211,153,0.5)', cursor:'pointer', color:'#34d399', padding:0, flexShrink:0 }}>
        <Check size={11} />
      </button>
    </span>
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────────
function Tip({ label, visible, children }) {
  if (!visible) return children
  return (
    <span style={{ position:'relative', display:'inline-flex' }}>
      <span style={{
        position:'absolute', bottom:'calc(100% + 10px)', left:'50%', transform:'translateX(-50%)',
        zIndex:9999, pointerEvents:'none', fontSize:10, fontWeight:600, color:'#e0d9ff',
        background:'linear-gradient(135deg,rgba(30,18,60,0.98),rgba(20,12,45,0.98))',
        border:'1px solid rgba(99,102,241,0.55)', borderRadius:10,
        padding:'5px 10px', whiteSpace:'nowrap', boxShadow:'0 6px 20px rgba(0,0,0,0.55)',
      }}>
        {label}
        <span style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:'6px solid rgba(99,102,241,0.55)' }} />
      </span>
      {children}
    </span>
  )
}

const Placeholder = ({ text }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:120, fontFamily:'monospace', color:'#444466', fontSize:12 }}>{text}</div>
)

// ── Amount Popup ──────────────────────────────────────────────────────────
function AmountPopup({ s0, s1, onSubmit, onClose, ac, ot }) {
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')
  const [result, setResult] = useState(null) // null | 0 | 1 | 'tie'

  const handleSubmit = () => {
    const a0 = Number(amount0) || 0
    const a1 = Number(amount1) || 0
    if (a0 === 0 && a1 === 0) return
    if (a0 > 0 && a1 > 0) {
      if (a0 > a1) { setResult(0); setTimeout(() => onSubmit(0, a0, a1), 1200) }
      else if (a1 > a0) { setResult(1); setTimeout(() => onSubmit(1, a0, a1), 1200) }
      else { setResult('tie'); setTimeout(() => { setResult(null); setAmount0(''); setAmount1('') }, 2000) }
    }
  }

  const bothFilled = (Number(amount0) || 0) > 0 && (Number(amount1) || 0) > 0

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width:340, padding:24, borderRadius:16,
        background:'rgba(10,10,22,0.96)', border:`1px solid ${ac}0.3)`,
        boxShadow:`0 16px 60px rgba(0,0,0,0.6), 0 0 30px ${ac}0.08)`,
      }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <Trophy size={20} style={{ color:'#fbbf24', marginBottom:8 }} />
          <div style={{ fontSize:11, fontWeight:700, color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.1em' }}>{ot.enterAmounts}</div>
        </div>

        {/* Player 0 */}
        <div style={{
          display:'flex', alignItems:'center', gap:10, padding:'10px 14px', marginBottom:8,
          borderRadius:10, background: result === 0 ? 'rgba(52,211,153,0.1)' : result === 1 ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${result === 0 ? 'rgba(52,211,153,0.3)' : result === 1 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
          transition:'all 0.4s',
        }}>
          <span style={{ fontSize:12, fontWeight:600, color: result === 0 ? '#34d399' : '#fff', flex:1 }}>{s0.name || 'Player 1'}</span>
          <input type="number" value={amount0} onChange={e => setAmount0(e.target.value)} placeholder="0.00"
            disabled={result !== null}
            style={{ width:80, padding:'6px 10px', borderRadius:8, fontSize:13, fontWeight:700, textAlign:'right',
              background:'rgba(255,255,255,0.05)', border:`1px solid ${ac}0.2)`, color:'#fff', outline:'none', fontFamily:'monospace' }}
            onFocus={e => e.currentTarget.style.borderColor = `rgba(212,175,55,0.5)`}
            onBlur={e => e.currentTarget.style.borderColor = `rgba(99,102,241,0.2)`} />
        </div>

        {/* VS */}
        <div style={{ textAlign:'center', margin:'4px 0', fontSize:10, fontWeight:800, color:'#fbbf24', letterSpacing:'0.15em' }}>VS</div>

        {/* Player 1 */}
        <div style={{
          display:'flex', alignItems:'center', gap:10, padding:'10px 14px', marginBottom:16,
          borderRadius:10, background: result === 1 ? 'rgba(52,211,153,0.1)' : result === 0 ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${result === 1 ? 'rgba(52,211,153,0.3)' : result === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
          transition:'all 0.4s',
        }}>
          <span style={{ fontSize:12, fontWeight:600, color: result === 1 ? '#34d399' : '#fff', flex:1 }}>{s1.name || 'Player 2'}</span>
          <input type="number" value={amount1} onChange={e => setAmount1(e.target.value)} placeholder="0.00"
            disabled={result !== null}
            style={{ width:80, padding:'6px 10px', borderRadius:8, fontSize:13, fontWeight:700, textAlign:'right',
              background:'rgba(255,255,255,0.05)', border:`1px solid ${ac}0.2)`, color:'#fff', outline:'none', fontFamily:'monospace' }}
            onFocus={e => e.currentTarget.style.borderColor = `rgba(212,175,55,0.5)`}
            onBlur={e => e.currentTarget.style.borderColor = `rgba(99,102,241,0.2)`} />
        </div>

        {/* Result message */}
        {result === 'tie' && (
          <div style={{ textAlign:'center', padding:'8px', marginBottom:12, borderRadius:8, background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.25)', fontSize:11, fontWeight:600, color:'#fbbf24' }}>
            {ot.tie}
          </div>
        )}
        {result === 0 && (
          <div style={{ textAlign:'center', padding:'8px', marginBottom:12, borderRadius:8, background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)', fontSize:11, fontWeight:700, color:'#34d399' }}>
            {s0.name || 'Player 1'} {ot.wins}
          </div>
        )}
        {result === 1 && (
          <div style={{ textAlign:'center', padding:'8px', marginBottom:12, borderRadius:8, background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)', fontSize:11, fontWeight:700, color:'#34d399' }}>
            {s1.name || 'Player 2'} {ot.wins}
          </div>
        )}

        {/* Buttons */}
        {result === null && (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:10, fontSize:12, fontWeight:600, background:'none', border:'1px solid rgba(255,255,255,0.1)', color:'#888', cursor:'pointer' }}>Cancel</button>
            <button onClick={handleSubmit} disabled={!bothFilled} style={{
              flex:2, padding:'10px', borderRadius:10, fontSize:12, fontWeight:700,
              background: bothFilled ? 'linear-gradient(135deg,#d4af37,#b8962e)' : '#222',
              color: bothFilled ? '#000' : '#555', border:'none',
              cursor: bothFilled ? 'pointer' : 'not-allowed', transition:'all 0.2s',
            }}>{ot.determineWinner}</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Single player slot row ────────────────────────────────────────────────
function SlotRow({ name, game, win, defaultName, editable, showTooltips, onSaveName, onSaveGame, onSaveWin, isWinner, isLoser, canPickWinner, onPickWinner, animDelay, ot }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', gap:2,
      opacity: isLoser ? 0.4 : 1,
      transition: 'opacity 0.3s',
      animation: animDelay !== undefined ? `to-slot-in 0.5s ease-out ${animDelay}s both` : 'none',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.72em', fontWeight:600, color: isWinner ? '#34d399' : '#ffffff', lineHeight:1.2, minWidth:0 }}>
          {canPickWinner && (
            <button onClick={onPickWinner} title="Enter amounts"
              style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                width:16, height:16, borderRadius:4, padding:0, cursor:'pointer', flexShrink:0,
                background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.3)',
                color:'#fbbf24', transition:'all 0.15s',
              }}
              onMouseEnter={ev => { ev.currentTarget.style.background='rgba(251,191,36,0.3)' }}
              onMouseLeave={ev => { ev.currentTarget.style.background='rgba(251,191,36,0.12)' }}>
              <Trophy size={10} />
            </button>
          )}
          {isWinner && <Check size={11} style={{ color:'#34d399', flexShrink:0 }} />}
          {editable
            ? <Tip label={ot?.playerName || 'Player Name'} visible={showTooltips}>
                <EditableField value={name} onChange={onSaveName} placeholder={defaultName}
                  style={{ color: isWinner ? '#34d399' : isLoser ? '#666' : '#ffffff', textDecoration: isLoser ? 'line-through' : 'none' }}
                  inputStyle={{ width:72 }} />
              </Tip>
            : (name || <span style={{ color:'rgba(255,255,255,0.2)' }}>{defaultName}</span>)}
        </div>
        <div style={{ fontSize:'0.68em', fontWeight:600, color:'rgba(255,255,255,0.85)', lineHeight:1.2, textAlign:'right', flexShrink:0 }}>
          {editable
            ? <EditableField value={win} onChange={onSaveWin} placeholder="Win"
                style={{ color:'rgba(255,255,255,0.85)', textAlign:'right' }} inputStyle={{ width:52, textAlign:'right' }} />
            : (win || <span style={{ color:'rgba(255,255,255,0.2)' }}>—</span>)}
        </div>
      </div>
      <div style={{ fontSize:'0.68em', fontWeight:400, color: isLoser ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)', lineHeight:1.2 }}>
        {editable
          ? <Tip label="Game" visible={showTooltips}>
              <EditableField value={game} onChange={onSaveGame} placeholder="Game..."
                style={{ color:'rgba(255,255,255,0.7)' }} inputStyle={{ width:110 }} />
            </Tip>
          : (game || <span style={{ color:'rgba(255,255,255,0.15)' }}>—</span>)}
      </div>
    </div>
  )
}

// ── Bracket tree ──────────────────────────────────────────────────────────
function BracketTree({ slots, slotsData, onSaveSlot, t, editable, showTooltips, champion, onSaveChampion, bracketWinners, onPickWinner, tournamentStatus, animating, animatedSlots, ot }) {
  const ac = `rgba(${t.accentColor},`

  const MATCH_H = 82, MATCH_W = 156, CONN_W = 32, MATCH_GAP = 10, CHAMP_W = 124, CHAMP_H = 66
  const rad = Math.max(4, t.borderRadius - 4)

  const roundCounts = []
  for (let c = Math.floor(slots / 2); c >= 1; c = Math.floor(c / 2)) roundCounts.push(c)
  const numRounds = roundCounts.length
  const numR0 = roundCounts[0]

  const totalH = numR0 * MATCH_H + (numR0 - 1) * MATCH_GAP

  const allCenters = [Array.from({ length: numR0 }, (_, i) => i * (MATCH_H + MATCH_GAP) + MATCH_H / 2)]
  for (let r = 1; r < numRounds; r++) {
    const prev = allCenters[r - 1]
    const curr = []
    for (let i = 0; i < prev.length; i += 2) curr.push((prev[i] + prev[i + 1]) / 2)
    allCenters.push(curr)
  }

  const finalCenter = allCenters[numRounds - 1][0]
  const champConnStartX = (numRounds - 1) * (MATCH_W + CONN_W) + MATCH_W
  const champX = champConnStartX + CONN_W
  const totalW = champX + CHAMP_W

  const svgLines = []
  for (let r = 0; r < numRounds - 1; r++) {
    const centers = allCenters[r], nextCenters = allCenters[r + 1]
    const startX = r * (MATCH_W + CONN_W) + MATCH_W, midX = startX + CONN_W / 2, nextX = startX + CONN_W
    for (let i = 0; i < nextCenters.length; i++) {
      svgLines.push(
        <g key={`conn-${r}-${i}`} stroke={`rgba(${t.accentColor},0.3)`} strokeWidth="1" fill="none">
          <line x1={startX} y1={centers[i*2]} x2={midX} y2={centers[i*2]} />
          <line x1={startX} y1={centers[i*2+1]} x2={midX} y2={centers[i*2+1]} />
          <line x1={midX} y1={centers[i*2]} x2={midX} y2={centers[i*2+1]} />
          <line x1={midX} y1={nextCenters[i]} x2={nextX} y2={nextCenters[i]} />
        </g>
      )
    }
  }
  svgLines.push(<line key="champ-conn" x1={champConnStartX} y1={finalCenter} x2={champX} y2={finalCenter} stroke={`${ac}0.3)`} strokeWidth="1" />)

  const winners = bracketWinners || {}
  const isOngoing = tournamentStatus === 'ongoing'

  return (
    <div>
      <div style={{ position:'relative', width: totalW, height: totalH }}>
        <svg style={{ position:'absolute', top:0, left:0, width:totalW, height:totalH, pointerEvents:'none', overflow:'visible' }}>{svgLines}</svg>

        {roundCounts.map((_, r) => {
          const centers = allCenters[r]
          const colX = r * (MATCH_W + CONN_W)
          return centers.map((cy, i) => {
            const top = cy - MATCH_H / 2
            const key0 = `${r}-${i}-0`, key1 = `${r}-${i}-1`
            const s0 = slotsData?.[key0] || {}, s1 = slotsData?.[key1] || {}
            const def0 = r === 0 ? `Player ${i*2+1}` : `Winner ${i*2+1}`
            const def1 = r === 0 ? `Player ${i*2+2}` : `Winner ${i*2+2}`

            const matchKey = `${r}-${i}`
            const matchWinner = winners[matchKey]
            const hasWinner = matchWinner !== undefined && matchWinner !== null
            const bothHaveNames = !!(s0.name && s1.name)
            const canPick = editable && isOngoing && bothHaveNames && !hasWinner

            // Animation: only show slot if it's been animated in
            const slot0Visible = !animating || (r === 0 && animatedSlots.has(key0))
            const slot1Visible = !animating || (r === 0 && animatedSlots.has(key1))
            const slotAnimDelay0 = animating && slot0Visible ? 0 : undefined
            const slotAnimDelay1 = animating && slot1Visible ? 0 : undefined

            return (
              <div key={`match-${r}-${i}`} style={{
                position:'absolute', left: colX, top, width: MATCH_W, height: MATCH_H,
                background: `rgba(${t.bgColor},0.72)`,
                border: `1px solid ${hasWinner ? 'rgba(52,211,153,0.25)' : `${ac}0.18)`}`,
                borderRadius: rad,
              }}>
                <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-evenly', height:'100%', padding:'6px 10px', gap:0 }}>
                  {(r === 0 && !slot0Visible) ? (
                    <div style={{ height:28, display:'flex', alignItems:'center', fontSize:'0.68em', color:'rgba(255,255,255,0.15)' }}>{def0}</div>
                  ) : (
                    <SlotRow name={s0.name||''} game={s0.game||''} win={s0.win||''} defaultName={def0}
                      editable={editable} showTooltips={showTooltips && r===0 && i===0}
                      onSaveName={v => onSaveSlot(r,i,0,'name',v)} onSaveGame={v => onSaveSlot(r,i,0,'game',v)} onSaveWin={v => onSaveSlot(r,i,0,'win',v)}
                      isWinner={hasWinner && matchWinner===0} isLoser={hasWinner && matchWinner!==0}
                      canPickWinner={canPick} onPickWinner={() => onPickWinner(r,i,0)}
                      animDelay={slotAnimDelay0} ot={ot} />
                  )}
                  <div style={{ height:1, background:`${ac}0.1)`, margin:'4px 0' }} />
                  {(r === 0 && !slot1Visible) ? (
                    <div style={{ height:28, display:'flex', alignItems:'center', fontSize:'0.68em', color:'rgba(255,255,255,0.15)' }}>{def1}</div>
                  ) : (
                    <SlotRow name={s1.name||''} game={s1.game||''} win={s1.win||''} defaultName={def1}
                      editable={editable} showTooltips={false}
                      onSaveName={v => onSaveSlot(r,i,1,'name',v)} onSaveGame={v => onSaveSlot(r,i,1,'game',v)} onSaveWin={v => onSaveSlot(r,i,1,'win',v)}
                      isWinner={hasWinner && matchWinner===1} isLoser={hasWinner && matchWinner!==1}
                      canPickWinner={canPick} onPickWinner={() => onPickWinner(r,i,1)}
                      animDelay={slotAnimDelay1} ot={ot} />
                  )}
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
            ? <Tip label={ot?.tournamentWinner || 'Tournament Winner'} visible={showTooltips}>
                <EditableField value={champion || ''} onChange={onSaveChampion} placeholder="Champion..."
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

// ── Main overlay ──────────────────────────────────────────────────────────
export default function TournamentOverlay({ tournamentId, editable = false, showTooltips = false, theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [overlayLang, setOverlayLang] = useState('en')
  const [tournament, setTournament] = useState(null)
  const [amountPopup, setAmountPopup] = useState(null) // { round, matchIndex }
  const [animating, setAnimating] = useState(false)
  const [animatedSlots, setAnimatedSlots] = useState(new Set())
  const [showFlash, setShowFlash] = useState(false)
  const [flashName, setFlashName] = useState('')
  const prevStatusRef = useRef(null)

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    getOnePublic('tournament_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    const localMode = localStorage.getItem('pfl_theme_mode'); getOnePublic('pfl_theme_mode', uid).then(v => { const mode = v || localMode;
      if (mode === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
    getOnePublic('overlay_lang', uid).then(v => { if (v) setOverlayLang(v) })
    const localLang = localStorage.getItem('pfl_lang'); if (localLang) setOverlayLang(localLang)
  }, [uid, themeProp])

  const loadData = () => {
    // uid is optional - fallback to logged-in user
    getAllPublic('tournaments', uid).then(data => {
      const active = tournamentId
        ? (data.find(x => x.id === tournamentId) || null)
        : (data.find(x => x.status === 'ongoing') || data.find(x => x.status === 'animating') || data.find(x => x.status === 'join_open') || data.find(x => x.status === 'finished') || data[0] || null)
      setTournament(active)
    })
  }

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    loadData()
    const off = onTableChange('tournaments', loadData)
    return off
  }, [tournamentId, uid])

  // Detect status change to 'animating' and play animation
  useEffect(() => {
    if (!tournament) return
    const status = tournament.status
    if (status === 'animating' && prevStatusRef.current !== 'animating') {
      runAnimation()
    }
    prevStatusRef.current = status
  }, [tournament?.status])

  const runAnimation = () => {
    if (!tournament) return
    const max = tournament.max_participants || 8
    const slots = tournament.slots || {}
    setAnimating(true)
    setAnimatedSlots(new Set())

    // Collect all round-0 slot keys that have names
    const slotKeys = []
    for (let i = 0; i < max; i++) {
      const matchIndex = Math.floor(i / 2)
      const playerSlot = i % 2
      const key = `0-${matchIndex}-${playerSlot}`
      if (slots[key]?.name) slotKeys.push({ key, name: slots[key].name })
    }

    // Animate one by one
    let idx = 0
    const animateNext = () => {
      if (idx >= slotKeys.length) {
        // Done animating — transition to 'ongoing'
        setTimeout(() => {
          setAnimating(false)
          setShowFlash(false)
          update('tournaments', tournament.id, { status: 'ongoing' })
          setTournament(prev => ({ ...prev, status: 'ongoing' }))
        }, 600)
        return
      }

      const { key, name } = slotKeys[idx]
      // Flash the name
      setFlashName(name)
      setShowFlash(true)
      setTimeout(() => {
        setShowFlash(false)
        // Add slot to visible set
        setAnimatedSlots(prev => new Set([...prev, key]))
        idx++
        setTimeout(animateNext, 200)
      }, 800)
    }

    setTimeout(animateNext, 500)
  }

  const saveField = (field, raw) => {
    if (!tournament) return
    const value = (field === 'prize_pool' || field === 'max_participants') ? (Number(raw) || 0) : raw
    update('tournaments', tournament.id, { [field]: value })
    setTournament(prev => ({ ...prev, [field]: value }))
  }

  const saveSlot = (r, i, p, field, value) => {
    if (!tournament) return
    const key = `${r}-${i}-${p}`
    const newSlots = { ...(tournament.slots || {}), [key]: { ...(tournament.slots?.[key] || {}), [field]: value } }
    update('tournaments', tournament.id, { slots: newSlots })
    setTournament(prev => ({ ...prev, slots: newSlots }))
  }

  // Amount-based winner determination
  const handlePickWinner = (round, matchIndex, _playerIndex) => {
    setAmountPopup({ round, matchIndex })
  }

  const handleAmountSubmit = (winnerIdx, amount0, amount1) => {
    if (!tournament || !amountPopup) return
    const { round, matchIndex } = amountPopup
    const key0 = `${round}-${matchIndex}-0`, key1 = `${round}-${matchIndex}-1`

    // Save amounts to slots
    let newSlots = { ...(tournament.slots || {}) }
    newSlots[key0] = { ...(newSlots[key0] || {}), win: String(amount0) }
    newSlots[key1] = { ...(newSlots[key1] || {}), win: String(amount1) }

    const bracketKey = `${round}-${matchIndex}`
    const newWinners = { ...(tournament.bracket_winners || {}), [bracketKey]: winnerIdx }

    const winnerSlotKey = `${round}-${matchIndex}-${winnerIdx}`
    const winnerData = newSlots[winnerSlotKey] || {}

    const slotsCount = tournament.max_participants || 8
    const roundCounts = []
    for (let c = Math.floor(slotsCount / 2); c >= 1; c = Math.floor(c / 2)) roundCounts.push(c)
    const numRounds = roundCounts.length
    const isFinalRound = round === numRounds - 1

    if (isFinalRound) {
      const changes = { bracket_winners: newWinners, slots: newSlots, champion: winnerData.name || '', status: 'finished' }
      update('tournaments', tournament.id, changes)
      setTournament(prev => ({ ...prev, ...changes }))
    } else {
      const nextRound = round + 1
      const nextMatch = Math.floor(matchIndex / 2)
      const nextSlot = matchIndex % 2
      newSlots[`${nextRound}-${nextMatch}-${nextSlot}`] = { ...winnerData, win: '' }
      const changes = { bracket_winners: newWinners, slots: newSlots }
      update('tournaments', tournament.id, changes)
      setTournament(prev => ({ ...prev, ...changes }))
    }

    setAmountPopup(null)
  }

  const ot = getOverlayStrings(overlayLang)

  if (!tournament) return <Placeholder text={ot.noTournament} />

  const slots = tournament.max_participants || 8
  const ac = `rgba(${t.accentColor},`
  const glowShadow = t.glow ? `0 0 30px ${ac}0.12), inset 0 1px 0 rgba(255,255,255,0.03)` : 'none'
  const overlayScale = t.overlayScale || 1
  const status = tournament.status || 'join_open'

  const statusLabels = { join_open: ot.waiting, animating: ot.drawing, ongoing: ot.live, finished: ot.finished }
  const statusColors = { join_open: '#fbbf24', animating: '#fbbf24', ongoing: '#34d399', finished: '#818cf8' }

  // Get popup slot data
  const popupS0 = amountPopup ? (tournament.slots?.[`${amountPopup.round}-${amountPopup.matchIndex}-0`] || {}) : {}
  const popupS1 = amountPopup ? (tournament.slots?.[`${amountPopup.round}-${amountPopup.matchIndex}-1`] || {}) : {}

  return (
    <div style={{
      fontFamily: t.fontFamily,
      background: `rgba(${t.bgColor},${t.bgOpacity})`,
      border: t.showBorder ? `${t.borderWidth}px solid ${ac}0.25)` : 'none',
      borderRadius: t.borderRadius,
      backdropFilter: `blur(${t.blur}px)`,
      padding: t.padding,
      fontSize: `${t.fontSize}em`,
      boxShadow: glowShadow,
      transform: overlayScale !== 1 ? `scale(${overlayScale})` : 'none',
      transformOrigin: 'top left',
      transition: 'all 0.3s',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Gold flash overlay for animation */}
      {showFlash && (
        <div style={{
          position:'absolute', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(212,175,55,0.08)', animation:'to-glow-flash 0.8s ease-out forwards',
          pointerEvents:'none',
        }}>
          <div style={{ animation:'to-name-glow 0.8s ease-out', padding:'12px 28px', borderRadius:12, background:'rgba(10,10,22,0.9)', border:'1px solid rgba(212,175,55,0.4)' }}>
            <span style={{ fontSize:'1.2em', fontWeight:800, color:'#d4af37', letterSpacing:'0.02em' }}>{flashName}</span>
          </div>
        </div>
      )}

      {/* Status */}
      {t.showStatus && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background: statusColors[status] || '#44447a', boxShadow: `0 0 8px ${statusColors[status] || '#44447a'}`, animation: status === 'animating' ? 'to-pulse 1s ease-in-out infinite' : 'none' }} />
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

      {/* Bracket tree — always visible */}
      <div style={{ display:'flex', justifyContent:'center' }}>
        <BracketTree
          slots={slots}
          slotsData={(status === 'join_open') ? {} : (tournament.slots || {})}
          onSaveSlot={saveSlot}
          t={t}
          editable={editable}
          showTooltips={showTooltips}
          champion={tournament.champion || ''}
          onSaveChampion={v => saveField('champion', v)}
          bracketWinners={tournament.bracket_winners || {}}
          onPickWinner={handlePickWinner}
          tournamentStatus={status}
          animating={animating}
          animatedSlots={animatedSlots}
          ot={ot}
        />
      </div>

      {/* Amount popup */}
      {amountPopup && (
        <AmountPopup
          s0={popupS0}
          s1={popupS1}
          ac={ac}
          onSubmit={handleAmountSubmit}
          onClose={() => setAmountPopup(null)}
          ot={ot}
        />
      )}
    </div>
  )
}
