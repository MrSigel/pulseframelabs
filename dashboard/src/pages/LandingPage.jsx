import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Gauge, Medal, Sparkles, Gem, Trophy, Sword, Flame, Target, Radio,
  MessageSquare, Bot, Globe, Coins, Swords, ArrowRight, ChevronDown,
  Zap, Crown, Check, Monitor, Shield, Star, Play, Layers, Sun, Moon
} from 'lucide-react'
import { useLang } from '../context/LanguageContext'


const FEATURE_ICONS = [Gauge, Gem, Trophy, Sword, Sparkles, Medal, Swords, Coins, Target, Flame, Bot, Globe, Radio, MessageSquare]
const WHY_ICONS = [Layers, Zap, MessageSquare, Monitor, Bot, Globe]
const SETUP_ICONS = [Shield, Bot, Monitor, Layers, MessageSquare, Play]

const gold = '#d4af37'
const champagne = '#d4c5a9'

// ── Theme colors ─────────────────────────────────────────────────────────
const themes = {
  dark: {
    bg: '#06060c', bgNav: 'rgba(6,6,12,0.88)', bgCard: 'rgba(255,255,255,0.015)',
    bgCardHover: 'rgba(212,175,55,0.03)', bgGlass: 'rgba(255,255,255,0.01)',
    text: '#f5f0e8', textSub: '#94a3b8', textMuted: '#64748b', textDim: '#3a3530',
    border: 'rgba(255,255,255,0.04)', borderHover: 'rgba(212,175,55,0.15)',
    borderGold: 'rgba(212,175,55,0.08)', particle: '212,175,55', particleAlpha: 0.15,
    lineAlpha: 0.12, glowAlpha: 0.06, goldOnBg: gold,
  },
  light: {
    bg: '#f8f6f1', bgNav: 'rgba(248,246,241,0.92)', bgCard: 'rgba(0,0,0,0.02)',
    bgCardHover: 'rgba(212,175,55,0.06)', bgGlass: 'rgba(255,255,255,0.6)',
    text: '#1a1714', textSub: '#6b7280', textMuted: '#9ca3af', textDim: '#c8c4bb',
    border: 'rgba(0,0,0,0.06)', borderHover: 'rgba(212,175,55,0.25)',
    borderGold: 'rgba(212,175,55,0.12)', particle: '139,109,31', particleAlpha: 0.12,
    lineAlpha: 0.06, glowAlpha: 0.03, goldOnBg: '#8B6D1F',
  },
}

// ── Global Styles ────────────────────────────────────────────────────────
const SID = 'lp-final-css'
if (typeof document !== 'undefined' && !document.getElementById(SID)) {
  const s = document.createElement('style')
  s.id = SID
  s.textContent = `
    @keyframes lpf-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes lpf-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes lpf-fade-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    @keyframes lpf-scale-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
    @keyframes lpf-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes lpf-marquee-rev{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
    @keyframes lpf-glow{0%,100%{opacity:.4}50%{opacity:.8}}
    @keyframes lpf-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes lpf-pulse-dot{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.3);opacity:1}}
    @keyframes lpf-btn-shine{0%{left:-100%}100%{left:200%}}
    html{scroll-behavior:smooth}body{margin:0;background:#06060c}
    @font-face{font-family:'Display';src:local('Georgia');font-display:swap}
  `
  document.head.appendChild(s)
}

// ── 3D Particle Network ──────────────────────────────────────────────────
function ParticleNetwork({ theme }) {
  const ref = useRef(null)
  const mouse = useRef({ x: -999, y: -999 })
  const themeRef = useRef(theme)
  useEffect(() => { themeRef.current = theme }, [theme])
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    let w, h, anim
    const dpr = Math.min(window.devicePixelRatio, 2)
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight
      c.width = w * dpr; c.height = h * dpr
      c.style.width = w + 'px'; c.style.height = h + 'px'
      ctx.scale(dpr, dpr)
    }
    resize(); window.addEventListener('resize', resize)

    const onMouse = (e) => { mouse.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMouse)

    class Particle {
      constructor() {
        this.x = Math.random() * w; this.y = Math.random() * h
        this.vx = (Math.random() - 0.5) * 0.4; this.vy = (Math.random() - 0.5) * 0.4
        this.baseSize = 1.2 + Math.random() * 2.5
        this.size = this.baseSize
        this.pulse = Math.random() * Math.PI * 2
        this.isPulsing = Math.random() < 0.08
      }
      update(t) {
        // Organic wave movement
        this.x += this.vx + Math.sin(t * 0.3 + this.pulse) * 0.15
        this.y += this.vy + Math.cos(t * 0.25 + this.pulse) * 0.1
        // Mouse repulsion
        const mx = mouse.current.x, my = mouse.current.y
        const dx = this.x - mx, dy = this.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          const force = (1 - dist / 200) * 2
          this.x += (dx / dist) * force
          this.y += (dy / dist) * force
        }
        // Boundary wrap
        if (this.x < -20) this.x = w + 20
        if (this.x > w + 20) this.x = -20
        if (this.y < -20) this.y = h + 20
        if (this.y > h + 20) this.y = -20
        // Pulse
        if (this.isPulsing) {
          this.size = this.baseSize * (1 + Math.sin(t * 2 + this.pulse) * 0.3)
        }
      }
      draw(ctx) {
        // Soft glow
        const pc = themeRef.current.particle
        const pa = themeRef.current.particleAlpha
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 8)
        g.addColorStop(0, `rgba(${pc},${this.isPulsing ? pa * 2 : pa * 0.8})`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 8, 0, Math.PI * 2); ctx.fill()
        // Core
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${pc},${this.isPulsing ? 0.7 : 0.35})`; ctx.fill()
      }
    }

    const pts = Array.from({ length: 75 }, () => new Particle())
    let t = 0
    const draw = () => {
      t += 0.01
      ctx.clearRect(0, 0, w, h)
      pts.forEach(p => { p.update(t); p.draw(ctx) })
      // Connection lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 160) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(${themeRef.current.particle},${(1 - d / 160) * themeRef.current.lineAlpha})`; ctx.lineWidth = 0.8; ctx.stroke()
          }
        }
      }
      anim = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMouse); cancelAnimationFrame(anim) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

// ── Scroll Reveal ────────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef(null); const [v, setV] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect() } }, { threshold }); o.observe(el); return () => o.disconnect() }, [])
  return [ref, v]
}
function R({ children, delay = 0, style = {} }) {
  const [ref, v] = useReveal()
  return <div ref={ref} style={{ ...style, opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(28px)', transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s` }}>{children}</div>
}

// ── Glass Card ───────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, hover = true }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      padding: 'clamp(22px, 3vw, 32px)', borderRadius: 12,
      background: hov && hover ? 'rgba(212,175,55,0.03)' : 'rgba(255,255,255,0.015)',
      border: `1px solid ${hov && hover ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)'}`,
      backdropFilter: 'blur(12px)',
      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      transform: hov && hover ? 'translateY(-4px)' : 'none',
      boxShadow: hov && hover ? `0 16px 48px rgba(0,0,0,0.3), 0 0 24px rgba(212,175,55,0.04)` : 'none',
      position: 'relative', overflow: 'hidden', ...style,
    }}>
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: -1, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${gold}${hov ? '40' : '00'}, transparent)`, transition: 'all 0.4s' }} />
      {children}
    </div>
  )
}

// ── Magnetic Button ──────────────────────────────────────────────────────
function MagBtn({ children, primary, onClick, style = {} }) {
  const ref = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [hov, setHov] = useState(false)
  const onMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return
    setOffset({ x: (e.clientX - r.left - r.width / 2) * 0.12, y: (e.clientY - r.top - r.height / 2) * 0.12 })
  }, [])
  return (
    <button ref={ref} onClick={onClick}
      onMouseMove={onMove} onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setOffset({ x: 0, y: 0 }) }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: primary ? '14px 34px' : '14px 28px', borderRadius: 8,
        fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${hov ? 1.02 : 1})`,
        transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s, background 0.3s',
        ...(primary ? {
          background: `linear-gradient(135deg, ${gold}, ${gold}dd)`, border: 'none', color: '#0a0810',
          boxShadow: hov ? `0 4px 30px rgba(212,175,55,0.3), 0 0 60px rgba(212,175,55,0.1)` : `0 2px 12px rgba(212,175,55,0.15)`,
        } : {
          background: 'transparent', border: `1px solid rgba(212,175,55,0.25)`, color: gold,
          boxShadow: hov ? `0 0 20px rgba(212,175,55,0.08)` : 'none',
        }),
        ...style,
      }}>
      {primary && <div style={{ position: 'absolute', top: 0, width: 60, height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', animation: 'lpf-btn-shine 3s ease-in-out infinite' }} />}
      {children}
    </button>
  )
}


// ══════════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mode, setMode] = useState(() => localStorage.getItem('lp_theme') || 'dark')
  const { lang, toggle: toggleLang, t: translations } = useLang()
  const t = translations.landing

  const th = themes[mode]
  const toggleTheme = () => { const next = mode === 'dark' ? 'light' : 'dark'; setMode(next); localStorage.setItem('lp_theme', next) }

  useEffect(() => {
    document.title = 'Pulseframelabs — Stream Like a High Roller'
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const ff = "'Georgia','Times New Roman',serif"

  return (
    <div style={{ minHeight: '100vh', color: th.text, fontFamily: "'Inter',system-ui,sans-serif", background: th.bg, transition: 'background 0.5s, color 0.5s' }}>
      <ParticleNetwork theme={th} />

      {/* ═══ NAVIGATION ═════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        background: scrolled ? th.bgNav : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(1.2)' : 'none',
        borderBottom: scrolled ? `1px solid ${th.borderGold}` : '1px solid transparent',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: scrolled ? '14px 24px' : '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'padding 0.5s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
              border: '1px solid rgba(212,175,55,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ position:'absolute', inset:2, border:'1.5px solid transparent', borderTopColor:'rgba(212,175,55,0.6)', borderRightColor:'rgba(212,175,55,0.2)', borderRadius:'50%', animation:'lpf-spin 3s linear infinite' }} />
              <div style={{ width:10, height:10, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,175,55,0.4), rgba(212,175,55,0.05) 70%)', animation:'lpf-glow 2s ease-in-out infinite' }} />
              <span style={{ position:'absolute', fontSize:13, fontWeight:800, color:gold, textShadow:'0 0 8px rgba(212,175,55,0.3)' }}>P</span>
            </div>
            <span style={{ fontFamily: ff, fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Pulseframe<span style={{ color: gold }}>labs</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {[{ label: t.nav.features, href: '#features' }, { label: t.nav.pricing, href: '#pricing' }, { label: t.nav.setup, href: '#setup' }].map(l => (
              <a key={l.href} href={l.href} style={{ fontSize: '0.8rem', fontWeight: 500, color: th.textSub, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'color 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.color = gold}
                onMouseLeave={e => e.currentTarget.style.color = th.textSub}>{l.label}</a>
            ))}
            {/* Language Toggle */}
            <button onClick={toggleLang} title={lang === 'en' ? 'Deutsch' : 'English'} style={{
              width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: mode === 'dark' ? th.border : 'rgba(0,0,0,0.04)',
              border: `1px solid ${th.border}`, cursor: 'pointer', transition: 'all 0.3s', padding: 0,
              color: th.goldOnBg, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.02em',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${gold}40`; e.currentTarget.style.boxShadow = `0 0 12px ${gold}15` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = th.border; e.currentTarget.style.boxShadow = 'none' }}>
              {lang === 'en' ? 'DE' : 'EN'}
            </button>
            {/* Dark/Light Toggle */}
            <button onClick={toggleTheme} title={mode === 'dark' ? 'Switch to Light' : 'Switch to Dark'} style={{
              width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: mode === 'dark' ? th.border : 'rgba(0,0,0,0.04)',
              border: `1px solid ${th.border}`, cursor: 'pointer', transition: 'all 0.3s', padding: 0,
              color: th.goldOnBg,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${gold}40`; e.currentTarget.style.boxShadow = `0 0 12px ${gold}15` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = th.border; e.currentTarget.style.boxShadow = 'none' }}>
              {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <MagBtn primary onClick={() => navigate('/login')}>{t.nav.cta}</MagBtn>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'clamp(140px, 18vh, 200px) 24px clamp(80px, 10vh, 120px)', position: 'relative', zIndex: 1 }}>
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)', width: '50vw', maxWidth: 700, aspectRatio: '1', borderRadius: '50%', background: `radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 60%)`, filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 700, position: 'relative' }}>
          {/* Label */}
          <div style={{ animation: 'lpf-fade-up 0.8s ease-out', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, transparent, ${gold}40)` }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: gold }}>
              {t.hero.label}
            </span>
            <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, ${gold}40, transparent)` }} />
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: ff, fontSize: 'clamp(2.8rem, 6vw, 4.2rem)', fontWeight: 700, lineHeight: 1.05, margin: '0 0 20px', letterSpacing: '-0.02em', animation: 'lpf-fade-up 0.8s ease-out 0.15s both' }}>
            {t.hero.title1}{' '}
            <span style={{
              background: `linear-gradient(90deg, ${gold}, #f5e6b8, ${gold}, #f5d86e)`,
              backgroundSize: '300% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'lpf-shimmer 5s linear infinite',
            }}>{t.hero.title2}</span>
          </h1>

          {/* Gold divider */}
          <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: '0 auto 20px', animation: 'lpf-fade-up 0.8s ease-out 0.3s both' }} />

          {/* Subtitle */}
          <p style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)', color: th.textSub, lineHeight: 1.8, maxWidth: 500, margin: '0 auto 36px', animation: 'lpf-fade-up 0.8s ease-out 0.4s both' }}>
            {t.hero.sub}
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', animation: 'lpf-fade-up 0.8s ease-out 0.55s both' }}>
            <MagBtn primary onClick={() => navigate('/login')}>{t.hero.cta1} <ArrowRight size={14} /></MagBtn>
            <MagBtn onClick={() => document.getElementById('features')?.scrollIntoView()}>{t.hero.cta2}</MagBtn>
          </div>

          {/* Scroll indicator */}
          <div style={{ marginTop: 64, animation: 'lpf-float 2.5s ease-in-out infinite' }}>
            <ChevronDown size={18} style={{ color: `${gold}30` }} />
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE ════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: 'clamp(18px, 3vw, 32px) 0', overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)' }}>
        {[false, true].map((reverse, ri) => (
          <div key={ri} style={{ display: 'flex', animation: `${reverse ? 'lpf-marquee-rev' : 'lpf-marquee'} ${reverse ? 40 : 35}s linear infinite`, width: 'max-content', marginBottom: ri === 0 ? 10 : 0 }}>
            {[...t.marquee, ...t.marquee].map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, paddingRight: 16 }}>
                <span style={{ fontSize: ri === 0 ? 'clamp(1rem, 1.5vw, 1.25rem)' : 'clamp(0.8rem, 1.1vw, 0.92rem)', fontWeight: ri === 0 ? 500 : 400, color: ri === 0 ? '#94a3b8' : '#64748b', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{item}</span>
                <span style={{ width: 5, height: 5, background: gold, transform: 'rotate(45deg)', opacity: 0.3, flexShrink: 0 }} />
              </span>
            ))}
          </div>
        ))}
      </section>

      {/* ═══ STATS ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(60px, 10vw, 100px) 24px' }}>
        <R>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(40px, 6vw, 80px)', flexWrap: 'wrap' }}>
            {t.stats.map((s, i) => (
              <R key={s.label} delay={i * 0.08} style={{ textAlign: 'center', flex: '1 1 140px' }}>
                <div style={{ fontFamily: ff, fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 700, color: gold, lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: th.textMuted }}>{s.label}</div>
              </R>
            ))}
          </div>
        </R>
      </section>

      {/* ═══ FEATURES ═══════════════════════════════════════════════════ */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: 'clamp(80px, 12vw, 140px) 24px' }}>
        <R style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, transparent, ${gold}30)` }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: gold }}>{t.featuresSection.label}</span>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, ${gold}30, transparent)` }} />
          </div>
          <h2 style={{ fontFamily: ff, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            {t.featuresSection.title}
          </h2>
        </R>

        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(8px, 1.5vw, 12px)' }}>
          {t.featuresSection.items.map((f, i) => (
            <R key={i} delay={i * 0.03}>
              <GlassCard style={{ padding: 'clamp(16px, 2vw, 22px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', fontWeight: 600, color: th.textMuted, padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p style={{ fontSize: 'clamp(0.85rem, 1vw, 0.95rem)', color: th.textSub, lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ color: '#f5f0e8' }}>{f.t}</strong> — {f.d}
                  </p>
                </div>
              </GlassCard>
            </R>
          ))}
        </div>
      </section>

      {/* ═══ WHY PULSEFRAMELABS ═══════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(60px, 10vw, 100px) 24px' }}>
        <R style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 56px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, transparent, ${gold}30)` }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: gold }}>{t.why.label}</span>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, ${gold}30, transparent)` }} />
          </div>
          <h2 style={{ fontFamily: ff, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            {t.why.title}
          </h2>
        </R>

        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
          {t.why.items.map((item, i) => {
            const Icon = WHY_ICONS[i]
            return (
            <R key={i} delay={i * 0.05}>
              <GlassCard>
                <Icon size={20} style={{ color: gold, marginBottom: 14 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.75, margin: 0 }}>{item.desc}</p>
              </GlassCard>
            </R>
            )
          })}
        </div>
      </section>

      {/* ═══ CHAT COMMANDS SHOWCASE ═══════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(60px, 10vw, 100px) 24px' }}>
        <R style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 56px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, transparent, ${gold}30)` }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: gold }}>{t.commands.label}</span>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, ${gold}30, transparent)` }} />
          </div>
          <h2 style={{ fontFamily: ff, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            {t.commands.title}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: 460, margin: '0 auto' }}>{t.commands.sub}</p>
        </R>

        <div style={{ maxWidth: 700, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 8 }}>
          {t.commands.items.map((c, i) => (
            <R key={c.cmd + c.args} delay={i * 0.04}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                borderRadius: 10, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem', fontWeight: 700, color: gold, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {c.cmd}{c.args ? ' ' + c.args : ''}
                </code>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{c.desc}</span>
              </div>
            </R>
          ))}
        </div>
      </section>

      {/* ═══ SETUP ══════════════════════════════════════════════════════ */}
      <section id="setup" style={{ position: 'relative', zIndex: 1, padding: 'clamp(80px, 12vw, 140px) 24px' }}>
        <R style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, transparent, ${gold}30)` }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: gold }}>{t.setupSection.label}</span>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, ${gold}30, transparent)` }} />
          </div>
          <h2 style={{ fontFamily: ff, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            {t.setupSection.title}
          </h2>
        </R>

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'clamp(12px, 1.5vw, 16px)' }}>
          {t.setupSection.items.map((step, i) => (
            <R key={step.n} delay={i * 0.1}>
              <GlassCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{ fontFamily: ff, fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 700, color: gold, opacity: 0.2, lineHeight: 0.9 }}>{step.n}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: gold, padding: '3px 10px', borderRadius: 20, border: `1px solid rgba(212,175,55,0.2)` }}>{step.time}</span>
                </div>
                <h3 style={{ fontFamily: ff, fontSize: 'clamp(1.1rem, 1.5vw, 1.25rem)', fontWeight: 600, margin: '0 0 8px' }}>{step.t}</h3>
                <p style={{ fontSize: '0.88rem', color: th.textSub, lineHeight: 1.7, margin: 0 }}>{step.d}</p>
              </GlassCard>
            </R>
          ))}
        </div>
      </section>


      {/* ═══ PRICING ════════════════════════════════════════════════════ */}
      <section id="pricing" style={{ position: 'relative', zIndex: 1, padding: 'clamp(80px, 12vw, 140px) 24px' }}>
        <R style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, transparent, ${gold}30)` }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: gold }}>{t.pricing.label}</span>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, ${gold}30, transparent)` }} />
          </div>
          <h2 style={{ fontFamily: ff, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            {t.pricing.title}
          </h2>
          <p style={{ fontSize: '0.9rem', color: th.textSub, maxWidth: 460, margin: '0 auto' }}>{t.pricing.sub}</p>
        </R>

        {/* Pricing Cards */}
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: 'clamp(10px, 1.5vw, 14px)' }}>
          {[
            { name: t.pricing.trial, desc: t.pricing.trialDesc, credits: 10, price: '€9.90', duration: t.pricing.day, perMonth: null, save: null, popular: false },
            { name: t.pricing.monthly, desc: t.pricing.monthlyDesc, credits: 100, price: '€89', duration: t.pricing.month, perMonth: '€89', save: null, popular: false },
            { name: t.pricing.quarterly, desc: t.pricing.quarterlyDesc, credits: 260, price: '€229', duration: t.pricing.months3, perMonth: '~€76', save: '15%', popular: true },
            { name: t.pricing.halfYear, desc: t.pricing.halfYearDesc, credits: 460, price: '€399', duration: t.pricing.months6, perMonth: '~€67', save: '25%', popular: false },
            { name: t.pricing.annual, desc: t.pricing.annualDesc, credits: 800, price: '€699', duration: t.pricing.months12, perMonth: '~€58', save: '35%', popular: false },
          ].map((plan, i) => (
            <R key={plan.name} delay={i * 0.08}>
              <div
                style={{
                  position: 'relative', padding: 'clamp(22px, 3vw, 28px)', borderRadius: 14,
                  background: plan.popular
                    ? `linear-gradient(135deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02))`
                    : th.bgCard,
                  border: `1px solid ${plan.popular ? `rgba(212,175,55,0.25)` : th.border}`,
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: 12, right: -28, background: gold, color: '#0a0810',
                    fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    padding: '3px 32px', transform: 'rotate(45deg)', transformOrigin: 'center',
                  }}>
                    {t.pricing.popular}
                  </div>
                )}

                {/* Top accent */}
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -1, left: '10%', right: '10%', height: 2, background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
                )}

                {/* Plan name */}
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ fontFamily: ff, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: plan.popular ? gold : th.text }}>
                    {plan.name}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: th.textMuted, margin: 0, lineHeight: 1.4 }}>{plan.desc}</p>
                </div>

                {/* Credits */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
                  padding: '6px 10px', borderRadius: 8,
                  background: plan.popular ? 'rgba(212,175,55,0.08)' : (mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                  border: `1px solid ${plan.popular ? 'rgba(212,175,55,0.15)' : th.border}`,
                }}>
                  <Coins size={14} style={{ color: gold, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.9rem', fontWeight: 700, color: gold }}>{plan.credits}</span>
                  <span style={{ fontSize: '0.7rem', color: th.textMuted }}>{t.pricing.credits}</span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: ff, fontSize: 'clamp(1.8rem, 2.5vw, 2.2rem)', fontWeight: 700, color: th.text, lineHeight: 1 }}>
                      {plan.price}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: '0.72rem', color: th.textMuted }}>{plan.duration}</span>
                    {plan.perMonth && (
                      <span style={{ fontSize: '0.72rem', color: th.textSub, fontWeight: 500 }}>
                        ({plan.perMonth}{t.pricing.perMonth})
                      </span>
                    )}
                  </div>
                  {plan.save && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8,
                      padding: '3px 10px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 600,
                      background: 'rgba(52,211,153,0.1)', color: '#34d399',
                      border: '1px solid rgba(52,211,153,0.2)',
                    }}>
                      {t.pricing.save} {plan.save}
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <MagBtn primary={plan.popular} onClick={() => navigate('/login')} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                  {t.pricing.choosePlan}
                </MagBtn>
              </div>
            </R>
          ))}
        </div>

        {/* How It Works */}
        <R>
          <div style={{ maxWidth: 800, margin: '48px auto 0', padding: 'clamp(22px, 3vw, 32px)', borderRadius: 14, background: th.bgCard, border: `1px solid ${th.border}`, backdropFilter: 'blur(12px)' }}>
            <h4 style={{ fontFamily: ff, fontSize: '1rem', fontWeight: 700, margin: '0 0 20px', textAlign: 'center', color: gold }}>
              {t.pricing.howItWorks}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12 }}>
              {[t.pricing.step1, t.pricing.step2, t.pricing.step3, t.pricing.step4].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${th.border}` }}>
                  <span style={{ fontFamily: ff, fontSize: '1.4rem', fontWeight: 700, color: gold, opacity: 0.3, lineHeight: 1, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: '0.78rem', color: th.textSub, lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.7rem', color: th.textMuted, textAlign: 'center', marginTop: 16, marginBottom: 0 }}>
              {t.pricing.cryptoNote}
            </p>
          </div>
        </R>

        {/* All features included */}
        <R>
          <div style={{ maxWidth: 700, margin: '24px auto 0', padding: 'clamp(22px, 3vw, 32px)', borderRadius: 14, background: th.bgCard, border: `1px solid ${th.border}`, backdropFilter: 'blur(12px)' }}>
            <h4 style={{ fontFamily: ff, fontSize: '1rem', fontWeight: 700, margin: '0 0 16px', textAlign: 'center', color: gold }}>
              {t.pricing.allFeatures}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '8px 24px' }}>
              {t.pricing.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                    background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={10} style={{ color: gold }} />
                  </div>
                  <span style={{ fontSize: '0.82rem', color: th.textSub }}>{f}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.72rem', color: th.textMuted, textAlign: 'center', marginTop: 16, marginBottom: 0, lineHeight: 1.6 }}>
              {t.pricing.freeNote}
            </p>
          </div>
        </R>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(80px, 14vw, 180px) 24px' }}>
        <R>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60vw', maxWidth: 700, aspectRatio: '1', borderRadius: '50%', background: `radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 60%)`, filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, transparent, ${gold}30)` }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: gold }}>{t.ctaSection.label}</span>
              <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, ${gold}30, transparent)` }} />
            </div>
            <h2 style={{ fontFamily: ff, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em', position: 'relative' }}>
              {t.ctaSection.title}
            </h2>
            <div style={{ width: 50, height: 1, background: `linear-gradient(90deg, transparent, ${gold}60, transparent)`, margin: '0 auto 16px' }} />
            <p style={{ fontSize: '0.95rem', color: th.textSub, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.8, position: 'relative' }}>
              {t.ctaSection.sub}
            </p>
            <MagBtn primary onClick={() => navigate('/login')} style={{ position: 'relative' }}>
              {t.ctaSection.cta} <ArrowRight size={14} />
            </MagBtn>
          </div>
        </R>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ position:'relative', zIndex:1, padding:'48px 24px 32px', textAlign:'center', borderTop:'1px solid rgba(212,175,55,0.04)' }}>
        <p style={{ fontSize:'0.78rem', fontWeight:500, color:'#3a3530', letterSpacing:'0.06em' }}>
          © <span style={{ color:'rgba(212,175,55,0.4)' }}>Pulseframelabs</span> {new Date().getFullYear()}. {t.footer}
        </p>
      </footer>
    </div>
  )
}
