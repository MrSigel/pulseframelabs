import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { getOnePublic } from '../lib/store'
import { Globe, ExternalLink } from 'lucide-react'

// ── Particle Canvas ──────────────────────────────────────────────────────
function ParticleBackground({ color }) {
  const canvasRef = useRef(null)
  const particles = useRef([])
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)

    // Create particles
    const count = 60
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const pts = particles.current

      // Update + draw particles
      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = color + '30'
        ctx.fill()
      }

      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = color + Math.floor((1 - dist / 150) * 20).toString(16).padStart(2, '0')
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [color])

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
}

// ── Inject keyframes once ────────────────────────────────────────────────
const STYLE_ID = 'streamer-page-anims'
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = `
    @keyframes sp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes sp-glow-pulse { 0%,100% { box-shadow: 0 0 8px var(--sp-c); } 50% { box-shadow: 0 0 24px var(--sp-c); } }
    @keyframes sp-shine { 0% { left: -100%; } 100% { left: 200%; } }
    @keyframes sp-fade-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  `
  document.head.appendChild(el)
}

// ── Main Page ────────────────────────────────────────────────────────────
export default function StreamerPage() {
  const { name } = useParams()
  const uid = new URLSearchParams(window.location.search).get('uid')
  const [config, setConfig] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [activeSection, setActiveSection] = useState('deals')

  useEffect(() => {
    if (!uid) { setNotFound(true); return }
    getOnePublic('website_config', uid).then(site => {
      if (site && site.title && site.title.toLowerCase().replace(/\s+/g, '') === (name || '').toLowerCase()) {
        setConfig(site)
        const secs = site.sections || []
        setActiveSection(secs.includes('deals') ? 'deals' : secs[0] || null)
        document.title = `${site.title} — Pulseframelabs`
        document.documentElement.style.background = site.bgColor || '#0a0914'
        document.body.style.background = site.bgColor || '#0a0914'
      } else {
        setNotFound(true)
        document.title = 'Not Found'
      }
      document.body.style.margin = '0'
    })
  }, [name, uid])

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0914', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <Globe size={32} style={{ color: '#333', marginBottom: 12 }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#555' }}>Page not found</p>
          <p style={{ fontSize: 12, color: '#333', marginTop: 6 }}>/s/{name} does not exist</p>
        </div>
      </div>
    )
  }

  if (!config) return null

  const c = config
  const p = c.primaryColor || '#d4af37'
  const LABELS = { about: 'About', schedule: 'Schedule', socials: 'Socials', stats: 'Stats', gallery: 'Gallery', donate: 'Donate', deals: 'Deals' }

  // Reorder sections: deals first
  const sections = [...(c.sections || [])]
  const dealsIdx = sections.indexOf('deals')
  if (dealsIdx > 0) { sections.splice(dealsIdx, 1); sections.unshift('deals') }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: c.bgColor || '#0a0914', fontFamily: 'system-ui, sans-serif', color: '#fff', position: 'relative' }}>
      <style>{`--sp-c: ${p};`}</style>
      <ParticleBackground color={p} />

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: `1px solid ${p}10`,
        backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100,
        background: `${c.bgColor || '#0a0914'}cc`,
      }}>
        {/* Logo — left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {c.customIcon ? (
            <img src={c.customIcon} alt="" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain' }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${p}15`, border: `1px solid ${p}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: p }}>
              {c.title[0].toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{c.title}</span>
        </div>

        {/* Nav links — center */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {sections.map(s => (
            <button key={s} onClick={(e) => { e.preventDefault(); setActiveSection(s) }} style={{
              fontSize: 11, fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
              padding: '6px 14px', borderRadius: 8,
              color: activeSection === s ? '#000' : `${p}aa`,
              background: activeSection === s ? p : 'transparent',
              border: `1px solid ${activeSection === s ? p : 'transparent'}`,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (activeSection !== s) { e.currentTarget.style.background = `${p}15`; e.currentTarget.style.borderColor = `${p}30`; e.currentTarget.style.color = p } }}
              onMouseLeave={e => { if (activeSection !== s) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = `${p}aa` } }}>
              {LABELS[s] || s}
            </button>
          ))}
        </div>

        {/* Spacer — right (balances the layout) */}
        <div style={{ width: 120, flexShrink: 0 }} />
      </nav>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: 740, width: '100%', margin: '0 auto', padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 32, position: 'relative', zIndex: 1 }}>

        {/* Only show active section */}
        {activeSection === 'deals' && (c.deals || []).length > 0 && (
          <section id="deals" style={{ animation: 'sp-fade-up 0.5s ease-out' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>Casino Deals</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {c.deals.map((deal, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px',
                  background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, transition: 'all 0.25s', cursor: deal.link ? 'pointer' : 'default',
                  animation: `sp-fade-up 0.4s ease-out ${i * 0.08}s both`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${p}40`; e.currentTarget.style.background = `${p}08`; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${p}10` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                  {deal.image ? (
                    <img src={deal.image} alt="" style={{ width: 90, height: 45, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 90, height: 45, borderRadius: 8, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{deal.title}</div>
                  </div>
                  {deal.link ? (
                    <a href={deal.link} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                      background: `linear-gradient(135deg, ${p}, ${p}cc)`, color: '#000', textDecoration: 'none',
                      transition: 'all 0.2s', flexShrink: 0, position: 'relative', overflow: 'hidden',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 20px ${p}60`; e.currentTarget.style.transform = 'scale(1.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                      <span style={{ position: 'absolute', top: 0, width: 40, height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'sp-shine 2s ease-in-out infinite' }} />
                      {deal.btnText || 'Play Now'} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: p, color: '#000', flexShrink: 0 }}>
                      {deal.btnText || 'Play Now'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Other sections — only active */}
        {sections.filter(s => s !== 'deals' && s === activeSection).map(s => {
          if (s === 'about') return (
            <section key={s} id="about" style={{ padding: '24px', borderRadius: 14, background: `${p}05`, border: `1px solid ${p}0c`, animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>About</h2>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>Welcome to {c.title}'s page. Content coming soon.</p>
            </section>
          )
          if (s === 'schedule') return (
            <section key={s} id="schedule" style={{ padding: '24px', borderRadius: 14, background: `${p}05`, border: `1px solid ${p}0c`, animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Stream Schedule</h2>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>Schedule will be displayed here.</p>
            </section>
          )
          if (s === 'socials') return (
            <section key={s} id="socials" style={{ animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>Social Links</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(c.socials || {}).filter(([, v]) => v).map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: `${p}0a`, border: `1px solid ${p}18`,
                    color: p, textDecoration: 'none', textTransform: 'capitalize',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${p}18`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${p}15` }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${p}0a`; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                    {k} <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            </section>
          )
          if (s === 'stats') return (
            <section key={s} id="stats" style={{ padding: '24px', borderRadius: 14, background: `${p}05`, border: `1px solid ${p}0c`, animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Stats</h2>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>Stats will be displayed here.</p>
            </section>
          )
          if (s === 'gallery') return (
            <section key={s} id="gallery" style={{ padding: '24px', borderRadius: 14, background: `${p}05`, border: `1px solid ${p}0c`, animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Gallery</h2>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>Clips and highlights will be shown here.</p>
            </section>
          )
          if (s === 'donate') return (
            <section key={s} id="donate" style={{ padding: '24px', borderRadius: 14, background: `${p}05`, border: `1px solid ${p}0c`, animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Donate</h2>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>Donation info will be displayed here.</p>
            </section>
          )
          return null
        })}
      </div>

      {/* ── Footer — pushed to bottom ────────────────────────────────── */}
      <footer style={{ textAlign: 'center', padding: '20px 20px 24px', borderTop: `1px solid ${p}08`, position: 'relative', zIndex: 1, marginTop: 'auto' }}>
        <p style={{ fontSize: 10, color: '#333' }}>Powered by <span style={{ color: p }}>Pulseframelabs</span></p>
      </footer>
    </div>
  )
}
