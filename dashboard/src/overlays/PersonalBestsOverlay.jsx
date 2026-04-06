import { useEffect, useState } from 'react'
import { getAllPublic, getOnePublic, onTableChange } from '../lib/store'
import { Medal } from 'lucide-react'
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
  borderRadius:  12,
  borderWidth:   1,
  showBorder:    true,
  padding:       20,
  fontSize:      1,
  fontFamily:    'monospace',
  glow:          true,
  overlayScale:   1,
  maxEntries:    5,
}

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

export default function PersonalBestsOverlay({ theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [overlayLang, setOverlayLang] = useState('en')
  const [bests, setBests] = useState([])

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    getOnePublic('personalbests_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    const localMode = localStorage.getItem('pfl_theme_mode'); getOnePublic('pfl_theme_mode', uid).then(v => { const mode = v || localMode;
      if (mode === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
    getOnePublic('overlay_lang', uid).then(v => { if (v) setOverlayLang(v) })
    const localLang = localStorage.getItem('pfl_lang'); if (localLang) setOverlayLang(localLang)
  }, [uid, themeProp])

  const loadData = () => {
    // uid is optional - fallback to logged-in user
    getAllPublic('bonushunt_entries', uid).then(entries => {
      const derived = derivePersonalBests(entries)
      derived.sort((a, b) => b.best_win - a.best_win)
      setBests(derived)
    })
  }

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    loadData()
    const off1 = onTableChange('bonushunt_entries', loadData)
    return () => { off1() }
  }, [uid])

  const ot = getOverlayStrings(overlayLang)
  const ac         = `rgba(${t.accentColor},`
  const glowShadow = t.glow ? `0 0 30px ${ac}0.12), inset 0 1px 0 rgba(255,255,255,0.03)` : 'none'
  const overlayScale = t.overlayScale || 1
  const top        = bests.slice(0, t.maxEntries || 5)

  if (!top.length) {
    return (
      <div style={{
        fontFamily: t.fontFamily, background: `rgba(${t.bgColor},${t.bgOpacity})`,
        border: t.showBorder ? `${t.borderWidth}px solid ${ac}0.25)` : 'none',
        borderRadius: t.borderRadius, backdropFilter: `blur(${t.blur}px)`,
        padding: t.padding, fontSize: `${t.fontSize}em`, boxShadow: glowShadow, transform: overlayScale !== 1 ? `scale(${overlayScale})` : 'none', transformOrigin: 'top left',
        color: t.textMuted, textAlign: 'center', minWidth: 320,
      }}>
        <span style={{ fontSize: '0.75em' }}>No wins yet</span>
      </div>
    )
  }

  return (
    <div style={{
      fontFamily:     t.fontFamily,
      background:     `rgba(${t.bgColor},${t.bgOpacity})`,
      border:         t.showBorder ? `${t.borderWidth}px solid ${ac}0.25)` : 'none',
      borderRadius:   t.borderRadius,
      backdropFilter: `blur(${t.blur}px)`,
      padding:        t.padding,
      fontSize:       `${t.fontSize}em`,
      boxShadow:      glowShadow, transform: overlayScale !== 1 ? `scale(${overlayScale})` : 'none', transformOrigin: 'top left',
      transition:     'all 0.3s',
      minWidth:       340,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, paddingBottom:8, borderBottom:`1px solid ${ac}0.15)` }}>
        <Medal size={14} style={{ color: '#fbbf24', opacity:0.8 }} />
        <span style={{ fontSize:'0.62em', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.18em' }}>{ot.personalBests}</span>
      </div>

      {/* Rows */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {top.map((entry, idx) => {
          const rank  = idx + 1
          const color = rank <= 3 ? RANK_COLORS[rank - 1] : t.textSecondary
          return (
            <div key={entry.game_name} style={{
              display:'flex', alignItems:'center', gap:10,
              background: `rgba(${t.bgColor},0.5)`,
              border: `1px solid ${ac}${rank === 1 ? '0.22' : '0.1'})`,
              borderRadius: Math.max(4, t.borderRadius - 4),
              padding:'8px 12px',
            }}>
              {/* Rank */}
              <span style={{
                width:22, height:22, borderRadius:6,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.62em', fontWeight:700, flexShrink:0,
                background: rank <= 3 ? `${color}18` : 'rgba(30,30,60,0.5)',
                border: `1px solid ${rank <= 3 ? color + '44' : 'rgba(34,34,74,0.5)'}`,
                color,
              }}>
                {rank}
              </span>

              {/* Game name */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'0.75em', fontWeight:600, color: t.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {entry.game_name}
                </div>
              </div>

              {/* Appearances */}
              <span style={{
                fontSize:'0.58em', color: t.textMuted, flexShrink:0,
                fontVariantNumeric:'tabular-nums',
              }}>
                {entry.appearances}x
              </span>

              {/* Win */}
              <span style={{
                fontSize:'0.78em', fontWeight:700, color, flexShrink:0,
                fontVariantNumeric:'tabular-nums',
              }}>
                +{entry.best_win.toLocaleString('en-US')} &euro;
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
