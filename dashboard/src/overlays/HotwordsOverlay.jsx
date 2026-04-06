import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAllPublic, getOnePublic, onTableChange } from '../lib/store'
import { getOverlayStrings } from './overlayI18n'

const BADGE_COLORS = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

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
  maxEntries:    10,
}

export default function HotwordsOverlay({ theme: themeProp }) {
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [params] = useSearchParams()
  const [themeFromStore, setThemeFromStore] = useState(null)
  const t = { ...DEFAULT_THEME, ...(themeProp || themeFromStore) }

  const [overlayLang, setOverlayLang] = useState('en')
  const [entries, setEntries] = useState([])

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    getOnePublic('hotwords_theme', uid).then(v => { if (v) setThemeFromStore(v) })
    const localMode = localStorage.getItem('pfl_theme_mode'); getOnePublic('pfl_theme_mode', uid).then(v => { const mode = v || localMode;
      if (mode === 'light' && !themeProp) { setThemeFromStore(prev => ({ ...(prev || {}), bgColor: DEFAULT_THEME.bgColorLight || '255,255,255', textPrimary: '#1a1714', textSecondary: '#6b6560', textMuted: '#9a9488' })) }
    })
    getOnePublic('overlay_lang', uid).then(v => { if (v) setOverlayLang(v) })
    const localLang = localStorage.getItem('pfl_lang'); if (localLang) setOverlayLang(localLang)
  }, [uid, themeProp])

  const loadData = () => {
    // uid is optional - fallback to logged-in user
    getAllPublic('hotword_entries', uid).then(d => setEntries(d.sort((a, b) => (b.count || 0) - (a.count || 0))))
  }

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    loadData()
    const off = onTableChange('hotword_entries', loadData)
    return off
  }, [uid])

  if (!entries.length) return <div style={{ color: '#444466', fontSize: 12, fontFamily: 'monospace', padding: 16 }}>No hot words yet</div>

  const ot = getOverlayStrings(overlayLang)
  const top = entries.slice(0, t.maxEntries || 10)
  const ac = `rgba(${t.accentColor},`
  const glowShadow = t.glow ? `0 0 30px ${ac}0.12), inset 0 1px 0 rgba(255,255,255,0.03)` : 'none'
  const overlayScale = t.overlayScale || 1

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
      minWidth:       320,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 14 }}>🔥</span>
        <span style={{ fontSize: 9, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>{ot.hotWords}</span>
        <span style={{ fontSize: 9, color: `rgba(${t.bgColor.split(',').map(() => '100').join(',')},0.4)`, marginLeft: 'auto' }}>{top.length} tracked</span>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {top.map((e, i) => {
          const color = BADGE_COLORS[i % BADGE_COLORS.length]
          return (
            <span key={e.id} style={{
              fontSize: 13 * t.fontSize,
              fontWeight: 700,
              fontFamily: t.fontFamily,
              color: color,
              background: color + '14',
              border: `1px solid ${color}30`,
              borderRadius: 8,
              padding: '4px 10px',
              transition: 'all 0.3s',
            }}>
              {e.word.toUpperCase()}
              <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 5, fontWeight: 600 }}>({e.count})</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
