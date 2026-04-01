import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { getOnePublic, getAllPublic, insert } from '../lib/store'
import { supabase } from '../lib/supabase'
import { Globe, ExternalLink, ShoppingBag, Gift, Coins } from 'lucide-react'

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
  const [uid, setUid] = useState(null)
  const [config, setConfig] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [noSubscription, setNoSubscription] = useState(false)
  const [activeSection, setActiveSection] = useState('deals')
  const [storeItems, setStoreItems] = useState([])
  const [buyingItem, setBuyingItem] = useState(null)
  const [twitchName, setTwitchName] = useState('')
  const [buySuccess, setBuySuccess] = useState(false)

  // Look up slug → user_id
  useEffect(() => {
    if (!name) { setNotFound(true); return }
    supabase.from('public_pages').select('user_id').eq('slug', name.toLowerCase()).maybeSingle()
      .then(({ data }) => {
        if (data?.user_id) {
          setUid(data.user_id)
        } else {
          setNotFound(true)
          document.title = 'Not Found'
        }
      })
  }, [name])

  // Check subscription once uid is resolved
  useEffect(() => {
    if (!uid) return
    supabase.from('subscriptions').select('expires_at').eq('user_id', uid).gte('expires_at', new Date().toISOString()).limit(1).maybeSingle()
      .then(({ data }) => {
        if (!data) setNoSubscription(true)
      })
  }, [uid])

  // Load website data once uid is resolved
  useEffect(() => {
    if (!uid) return
    getAllPublic('store_items', uid).then(items => {
      setStoreItems((items || []).filter(i => i.visible !== false))
    })
    getOnePublic('website_config', uid).then(site => {
      if (site) {
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
  }, [uid])

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

  if (noSubscription) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0914', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <Globe size={32} style={{ color: '#333', marginBottom: 12 }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#555' }}>This page is not available</p>
          <p style={{ fontSize: 12, color: '#333', marginTop: 6 }}>The streamer's subscription is not active.</p>
        </div>
      </div>
    )
  }

  if (!config) return null

  const c = config
  const p = c.primaryColor || '#d4af37'
  const rad = c.borderRadius ?? 14
  const ff = c.fontFamily || 'system-ui, sans-serif'
  const tc = c.textColor || '#fff'
  const cw = c.contentWidth || 740
  const scale = (c.siteScale || 100) / 100
  const LABELS = { about: 'About', schedule: 'Schedule', socials: 'Socials', stats: 'Stats', gallery: 'Gallery', donate: 'Donate', deals: 'Deals', store: 'Store' }

  // Reorder sections: deals first, add store if items exist
  const sections = [...(c.sections || [])]
  const dealsIdx = sections.indexOf('deals')
  if (dealsIdx > 0) { sections.splice(dealsIdx, 1); sections.unshift('deals') }
  if (storeItems.length > 0 && !sections.includes('store')) { sections.push('store') }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: c.bgColor || '#0a0914', fontFamily: ff, color: tc, position: 'relative' }}>
      <style>{`--sp-c: ${p};`}</style>
      <ParticleBackground color={p} />

      {/* ── Navigation ───────────────────────────────────────────────── */}
      {(c.showNavbar ?? true) && <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: `1px solid ${p}10`,
        backdropFilter: (c.navBlur ?? true) ? 'blur(16px)' : 'none',
        position: (c.navPosition || 'sticky') === 'sticky' ? 'sticky' : 'relative', top: 0, zIndex: 100,
        background: `${c.bgColor || '#0a0914'}cc`,
      }}>
        {/* Logo — left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {c.customIcon ? (
            <img src={c.customIcon} alt="" style={{ width: 28, height: 28, borderRadius: Math.max(4, rad - 6), objectFit: 'contain' }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: Math.max(4, rad - 6), background: `${p}15`, border: `1px solid ${p}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: p }}>
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
              padding: '6px 14px', borderRadius: Math.max(4, rad - 6),
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
      </nav>}

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: cw, width: '100%', margin: '0 auto', padding: '32px 20px 40px', display: 'flex', flexDirection: 'column', gap: 32, position: 'relative', zIndex: 1, fontSize: `${scale}em` }}>

        {/* Only show active section */}
        {activeSection === 'deals' && (c.deals || []).length > 0 && (
          <section id="deals" style={{ animation: 'sp-fade-up 0.5s ease-out' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>Casino Deals</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {c.deals.map((deal, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px',
                  background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: rad, transition: 'all 0.25s', cursor: deal.link ? 'pointer' : 'default',
                  animation: `sp-fade-up 0.4s ease-out ${i * 0.08}s both`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${p}40`; e.currentTarget.style.background = `${p}08`; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${p}10` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                  {deal.image ? (
                    <img src={deal.image} alt="" style={{ width: 90, height: 45, objectFit: 'contain', borderRadius: Math.max(4, rad - 6), flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 90, height: 45, borderRadius: Math.max(4, rad - 6), background: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{deal.title}</div>
                  </div>
                  {deal.link ? (
                    <a href={deal.link} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 22px', borderRadius: Math.max(4, rad - 4), fontSize: 13, fontWeight: 700,
                      background: `linear-gradient(135deg, ${p}, ${p}cc)`, color: '#000', textDecoration: 'none',
                      transition: 'all 0.2s', flexShrink: 0, position: 'relative', overflow: 'hidden',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 20px ${p}60`; e.currentTarget.style.transform = 'scale(1.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                      <span style={{ position: 'absolute', top: 0, width: 40, height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'sp-shine 2s ease-in-out infinite' }} />
                      {deal.btnText || 'Play Now'} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ padding: '10px 22px', borderRadius: Math.max(4, rad - 4), fontSize: 13, fontWeight: 700, background: p, color: '#000', flexShrink: 0 }}>
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
            <section key={s} id="about" style={{ padding: '24px', borderRadius: rad, background: `${p}05`, border: `1px solid ${p}0c`, animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>About</h2>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{c.aboutText || `Welcome to ${c.title}'s page.`}</p>
            </section>
          )
          if (s === 'schedule') return (
            <section key={s} id="schedule" style={{ padding: '24px', borderRadius: rad, background: `${p}05`, border: `1px solid ${p}0c`, animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Stream Schedule</h2>
              {(c.scheduleEntries || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {c.scheduleEntries.map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: Math.max(4, rad - 6), background: `${p}06`, border: `1px solid ${p}10` }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: p, width: 80, flexShrink: 0 }}>{e.day}</span>
                      <span style={{ fontSize: 12, color: '#aaa' }}>{e.time}</span>
                    </div>
                  ))}
                </div>
              ) : <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>No schedule set.</p>}
            </section>
          )
          if (s === 'socials') return (
            <section key={s} id="socials" style={{ animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>Social Links</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(c.socials || {}).filter(([, v]) => v).map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 20px', borderRadius: Math.max(4, rad - 4), fontSize: 13, fontWeight: 600,
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
            <section key={s} id="stats" style={{ padding: '24px', borderRadius: rad, background: `${p}05`, border: `1px solid ${p}0c`, animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Stats</h2>
              {(c.statsEntries || []).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                  {c.statsEntries.map((e, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: Math.max(4, rad - 6), background: `${p}06`, border: `1px solid ${p}10` }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: p }}>{e.value}</div>
                      <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{e.label}</div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ fontSize: 13, color: '#888' }}>No stats available.</p>}
            </section>
          )
          if (s === 'gallery') return (
            <section key={s} id="gallery" style={{ padding: '24px', borderRadius: rad, background: `${p}05`, border: `1px solid ${p}0c`, animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Gallery</h2>
              {(c.galleryUrls || []).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {c.galleryUrls.filter(u => u).map((url, i) => (
                    <div key={i} style={{ borderRadius: Math.max(4, rad - 6), overflow: 'hidden', border: `1px solid ${p}15`, aspectRatio: '16/9' }}>
                      {url.includes('twitch.tv/') || url.includes('youtube.com/') || url.includes('youtu.be/') ? (
                        <iframe src={url.replace('watch?v=', 'embed/').replace('clips.twitch.tv/', 'clips.twitch.tv/embed?clip=')} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                      ) : (
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                  ))}
                </div>
              ) : <p style={{ fontSize: 13, color: '#888' }}>No content yet.</p>}
            </section>
          )
          if (s === 'donate') return (
            <section key={s} id="donate" style={{ padding: '24px', borderRadius: rad, background: `${p}05`, border: `1px solid ${p}0c`, animation: 'sp-fade-up 0.5s ease-out' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Donate</h2>
              {c.donateText && <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{c.donateText}</p>}
              {c.donateLink ? (
                <a href={c.donateLink} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px',
                  borderRadius: Math.max(4, rad - 4), fontSize: 13, fontWeight: 700,
                  background: `linear-gradient(135deg, ${p}, ${p}cc)`, color: '#000',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 20px ${p}60`; e.currentTarget.style.transform = 'scale(1.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                  Donate <ExternalLink size={12} />
                </a>
              ) : <p style={{ fontSize: 13, color: '#888' }}>No donation link set.</p>}
            </section>
          )
          return null
        })}

        {/* ── Store Section ──────────────────────────────────────────── */}
        {activeSection === 'store' && storeItems.length > 0 && (
          <section id="store" style={{ animation: 'sp-fade-up 0.5s ease-out' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={14} /> Store
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {storeItems.map((item, i) => (
                <div key={item.id} style={{
                  padding: 16, borderRadius: rad,
                  background: 'rgba(255,255,255,0.025)', border: `1px solid rgba(255,255,255,0.06)`,
                  transition: 'all 0.25s', display: 'flex', flexDirection: 'column', gap: 10,
                  animation: `sp-fade-up 0.4s ease-out ${i * 0.06}s both`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${p}40`; e.currentTarget.style.background = `${p}06`; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.transform = 'none' }}>
                  {/* Image */}
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: Math.max(4, rad - 4), border: `1px solid ${p}15` }} />
                  ) : (
                    <div style={{ width: '100%', height: 80, borderRadius: Math.max(4, rad - 4), background: `${p}08`, border: `1px solid ${p}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Gift size={24} style={{ color: `${p}40` }} />
                    </div>
                  )}
                  {/* Info */}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{item.name}</div>
                    {item.description && <div style={{ fontSize: 11, color: '#777', marginTop: 4, lineHeight: 1.5 }}>{item.description}</div>}
                  </div>
                  {/* Price + Buy */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Coins size={14} style={{ color: p }} />
                      <span style={{ fontSize: 16, fontWeight: 700, color: p }}>{item.price_points}</span>
                      <span style={{ fontSize: 10, color: '#555' }}>pts</span>
                    </div>
                    <button onClick={() => { setBuyingItem(item); setTwitchName(''); setBuySuccess(false) }} style={{
                      padding: '6px 14px', borderRadius: Math.max(4, rad - 6), fontSize: 11, fontWeight: 700,
                      background: `linear-gradient(135deg, ${p}, ${p}cc)`, color: '#000',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 16px ${p}50`; e.currentTarget.style.transform = 'scale(1.05)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                      Redeem
                    </button>
                  </div>
                  {item.quantity_available !== -1 && (
                    <div style={{ fontSize: 9, color: '#555' }}>{item.quantity_available} left</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Buy Modal ──────────────────────────────────────────────── */}
        {buyingItem && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          }} onClick={() => setBuyingItem(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              width: 360, padding: 28, borderRadius: 16,
              background: c.bgColor || '#0a0914', border: `1px solid ${p}30`,
              boxShadow: `0 16px 60px rgba(0,0,0,0.5), 0 0 30px ${p}10`,
              animation: 'sp-fade-up 0.3s ease-out',
            }}>
              {buySuccess ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '2px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Gift size={22} style={{ color: '#34d399' }} />
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Redemption Submitted!</p>
                  <p style={{ fontSize: 12, color: '#888', margin: '0 0 20px', lineHeight: 1.6 }}>
                    <span style={{ color: p, fontWeight: 600 }}>{twitchName}</span> will receive <span style={{ color: p, fontWeight: 600 }}>{buyingItem.name}</span>. The streamer will process your request.
                  </p>
                  <button onClick={() => setBuyingItem(null)} style={{
                    width: '100%', padding: '12px', borderRadius: Math.max(4, rad - 4), fontSize: 13, fontWeight: 700,
                    background: `linear-gradient(135deg, ${p}, ${p}cc)`, color: '#000', border: 'none', cursor: 'pointer',
                  }}>Close</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    {buyingItem.image_url ? (
                      <img src={buyingItem.image_url} alt="" style={{ width: 48, height: 48, borderRadius: Math.max(4, rad - 4), objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: Math.max(4, rad - 4), background: `${p}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Gift size={20} style={{ color: p }} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{buyingItem.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Coins size={12} style={{ color: p }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: p }}>{buyingItem.price_points} pts</span>
                      </div>
                    </div>
                  </div>

                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', marginBottom: 8 }}>
                    Twitch Username *
                  </label>
                  <input value={twitchName} onChange={e => setTwitchName(e.target.value)} placeholder="your_twitch_name"
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: Math.max(4, rad - 4), fontSize: 13,
                      background: 'rgba(255,255,255,0.05)', border: `1px solid ${p}20`, color: '#fff',
                      outline: 'none', fontFamily: 'system-ui', boxSizing: 'border-box', marginBottom: 16,
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = `${p}50`}
                    onBlur={e => e.currentTarget.style.borderColor = `${p}20`} />

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setBuyingItem(null)} style={{
                      flex: 1, padding: '12px', borderRadius: Math.max(4, rad - 4), fontSize: 13, fontWeight: 600,
                      background: 'none', border: `1px solid rgba(255,255,255,0.1)`, color: '#888', cursor: 'pointer',
                    }}>Cancel</button>
                    <button disabled={!twitchName.trim()} onClick={async () => {
                      await insert('store_redemptions', {
                        item_id: buyingItem.id, item_name: buyingItem.name,
                        viewer_username: twitchName.trim(), status: 'pending',
                        price_points: buyingItem.price_points,
                      })
                      setBuySuccess(true)
                    }} style={{
                      flex: 2, padding: '12px', borderRadius: Math.max(4, rad - 4), fontSize: 13, fontWeight: 700,
                      background: !twitchName.trim() ? '#333' : `linear-gradient(135deg, ${p}, ${p}cc)`,
                      color: !twitchName.trim() ? '#666' : '#000', border: 'none',
                      cursor: !twitchName.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    }}>
                      <Gift size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 6 }} />
                      Redeem with Points
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer — pushed to bottom ────────────────────────────────── */}
      {(c.showFooter ?? true) && (
        <footer style={{ textAlign: 'center', padding: '20px 20px 24px', borderTop: `1px solid ${p}08`, position: 'relative', zIndex: 1, marginTop: 'auto' }}>
          <p style={{ fontSize: 10, color: '#333' }}>Powered by <span style={{ color: p }}>Pulseframelabs</span></p>
        </footer>
      )}
    </div>
  )
}
