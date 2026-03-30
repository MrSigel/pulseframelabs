import { useState } from 'react'
import { Monitor, ExternalLink, Copy, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function OverlayFrame({ tabs, overlayType, overlayModes, children, height = 240 }) {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const { user } = useAuth()

  const uid = user?.id
  const baseUrl = window.location.origin
  const currentMode = overlayModes?.[active] || tabs?.[active]?.toLowerCase().replace(' ', '-') || 'normal'
  const obsUrl = uid ? `${baseUrl}/overlay/${overlayType}?uid=${uid}&mode=${currentMode}` : null

  const copyUrl = () => {
    if (!obsUrl) return
    navigator.clipboard.writeText(obsUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openOverlay = () => {
    if (!obsUrl) return
    window.open(obsUrl, '_blank', 'width=800,height=600,noopener')
  }

  return (
    <div className="card mt-7" style={{ overflow: 'visible' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px 0', borderBottom: '1px solid rgba(139,92,246,0.12)', paddingBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 6,
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
              }} />
              <Monitor size={11} style={{ color: '#8b5cf6', position: 'relative' }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#5a5a8a' }}>Overlay Preview</span>
          </div>
          {obsUrl && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={openOverlay}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 10, color: '#a78bfa',
                  border: '1px solid rgba(139,92,246,0.3)',
                  background: 'rgba(139,92,246,0.08)',
                  padding: '3px 8px', borderRadius: 6,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.18)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(139,92,246,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <ExternalLink size={10} /> Open
              </button>
              <button
                onClick={copyUrl}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 10, color: copied ? '#34d399' : '#5a5a8a',
                  border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(34,34,74,0.8)'}`,
                  background: copied ? 'rgba(52,211,153,0.08)' : 'transparent',
                  padding: '3px 8px', borderRadius: 6,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {copied ? <Check size={10} /> : <Copy size={10} />}
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          )}
        </div>
        {tabs && tabs.length > 1 && (
          <div style={{ display: 'flex' }}>
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`overlay-tab ${i === active ? 'overlay-tab-active' : 'overlay-tab-inactive'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div style={{ padding: 16 }}>
        <div className="overlay-frame" style={{ minHeight: height }}>
          {/* Corner decorations */}
          <div className="corner-tl" />
          <div className="corner-tr" />
          <div className="corner-bl" />
          <div className="corner-br" />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, width: '100%', minHeight: height }}>
            {Array.isArray(children) ? children[active] : children}
          </div>
        </div>

        {/* OBS URL bar */}
        {obsUrl && (
          <div style={{
            marginTop: 8,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(8,8,26,0.8)',
            border: '1px solid rgba(34,34,74,0.6)',
            borderRadius: 8, padding: '6px 12px',
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#8b5cf6',
              boxShadow: '0 0 6px #8b5cf6',
              flexShrink: 0,
              animation: 'glow-pulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 10, color: '#2e2e5a', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{obsUrl}</span>
          </div>
        )}
      </div>
    </div>
  )
}
