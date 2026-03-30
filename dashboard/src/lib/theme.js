// ── PulseFrame Premium Casino Theme ─────────────────────────────────────
// Single gold accent, dark background, warm tones — professional & modern

export const T = {
  // Accent
  gold:        '#d4af37',
  goldBright:  '#e8c84a',
  goldDark:    '#b8962e',
  goldRgb:     '212,175,55',

  // Backgrounds
  bgDeep:      '#07070f',
  bgCard:      '#0c0b14',
  bgCardAlt:   '#100f1a',
  bgHover:     '#14131f',
  bgInput:     '#0a0918',

  // Borders
  border:      'rgba(212,175,55,0.08)',
  borderLight: 'rgba(212,175,55,0.15)',
  borderFocus: 'rgba(212,175,55,0.3)',

  // Text
  text:        '#e8e2d4',
  textSub:     '#9a9488',
  textMuted:   '#4a4842',
  textDim:     '#2e2c28',

  // Semantic
  success:     '#4ade80',
  danger:      '#f87171',
  warning:     '#fbbf24',
  info:        '#60a5fa',
}

// Card base style
export const cardStyle = {
  background: `linear-gradient(135deg, ${T.bgCard}, ${T.bgCardAlt})`,
  border: `1px solid ${T.border}`,
  borderRadius: 14,
}

// Label style
export const labelStyle = {
  display: 'block', fontSize: 10, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.12em',
  color: T.textMuted, marginBottom: 8,
}

// Section label
export const sectionLabelStyle = {
  fontSize: 9, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.15em',
  color: T.textMuted, marginBottom: 10, paddingBottom: 6,
  borderBottom: `1px solid ${T.border}`,
}

// Button presets
export const btnPrimary = {
  background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
  border: `1px solid rgba(212,175,55,0.4)`,
  color: '#fff',
  boxShadow: `0 0 14px rgba(212,175,55,0.2)`,
}
export const btnPrimaryHover = {
  background: `linear-gradient(135deg, ${T.goldBright}, ${T.gold})`,
  boxShadow: `0 0 22px rgba(212,175,55,0.35)`,
  transform: 'translateY(-1px)',
}

export const btnInfo = (active) => ({
  background: active ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.05)',
  borderColor: active ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.12)',
  color: active ? T.gold : T.textMuted,
  boxShadow: active ? `0 0 12px rgba(212,175,55,0.12)` : 'none',
})
export const btnInfoHover = {
  background: 'rgba(212,175,55,0.1)',
  borderColor: 'rgba(212,175,55,0.3)',
  color: T.gold,
  transform: 'translateY(-1px)',
}

export const btnTheme = (active) => ({
  background: active ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.04)',
  borderColor: active ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.1)',
  color: active ? T.goldBright : T.textMuted,
  boxShadow: active ? `0 0 12px rgba(212,175,55,0.1)` : 'none',
})
export const btnThemeHover = {
  background: 'rgba(212,175,55,0.08)',
  borderColor: 'rgba(212,175,55,0.25)',
  color: T.goldBright,
  transform: 'translateY(-1px)',
}

export const btnDanger = {
  background: 'rgba(248,113,113,0.06)',
  borderColor: 'rgba(248,113,113,0.2)',
  color: '#f87171',
}
export const btnDangerHover = {
  background: 'rgba(248,113,113,0.14)',
  borderColor: 'rgba(248,113,113,0.4)',
  boxShadow: '0 0 14px rgba(248,113,113,0.15)',
  transform: 'translateY(-1px)',
}

// OBS URL bar
export const urlBarStyle = {
  padding: '10px 16px',
  borderTop: `1px solid ${T.border}`,
  display: 'flex', alignItems: 'center', gap: 8,
}

export const urlDot = {
  width: 5, height: 5, borderRadius: '50%',
  background: T.gold, flexShrink: 0,
  animation: 'glow-pulse 2s ease-in-out infinite',
}

export const urlText = {
  fontSize: 10, color: T.textSub, fontFamily: 'monospace',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
}

// Info panel
export const infoPanel = {
  display: 'flex', alignItems: 'flex-start', gap: 12,
  background: `rgba(212,175,55,0.04)`,
  border: `1px solid rgba(212,175,55,0.12)`,
  borderRadius: 12, padding: '14px 18px', marginBottom: 16,
  animation: 'fade-up 0.18s ease-out',
}
export const infoPanelTitle = { fontSize: 12, fontWeight: 600, color: T.gold }
export const infoPanelText = { fontSize: 12, color: T.textSub, lineHeight: 1.6 }
