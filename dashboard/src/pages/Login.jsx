import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, Eye, EyeOff, Check, X, Play, Mail, User, Lock, ArrowRight, Sun, Moon, MailCheck, RefreshCw } from 'lucide-react'

const gold = '#d4af37'

// ── Animations ───────────────────────────────────────────────────────────
const ANIM_ID = 'login-page-anims'
if (typeof document !== 'undefined' && !document.getElementById(ANIM_ID)) {
  const el = document.createElement('style')
  el.id = ANIM_ID
  el.textContent = `
    @keyframes lp-fade-in { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes lp-slide-up { from { opacity:0; transform:translateY(20px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes lp-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
    @keyframes lp-pulse { 0%,100% { opacity:.4; } 50% { opacity:1; } }
    @keyframes lp-btn-shine { 0% { left:-100%; } 100% { left:200%; } }
    @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    .login-input:focus { border-color: rgba(212,175,55,0.4) !important; box-shadow: 0 0 16px rgba(212,175,55,0.08) !important; }
    .login-input::placeholder { color: rgba(255,255,255,0.2); }
  `
  document.head.appendChild(el)
}

// ── Particle Background ──────────────────────────────────────────────────
function ParticleBg() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    let w, h, anim
    const resize = () => { w = c.width = c.offsetWidth * 2; h = c.height = c.offsetHeight * 2; ctx.scale(2, 2) }
    resize()
    const pts = Array.from({ length: 50 }, () => ({
      x: Math.random() * (w/2), y: Math.random() * (h/2),
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random() * 2,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, w/2, h/2)
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = w/2; if (p.x > w/2) p.x = 0
        if (p.y < 0) p.y = h/2; if (p.y > h/2) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(212,175,55,0.12)'; ctx.fill()
      }
      for (let i = 0; i < pts.length; i++) for (let j = i+1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx*dx+dy*dy)
        if (d < 130) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(212,175,55,${(1-d/130)*0.06})`; ctx.lineWidth = 0.5; ctx.stroke() }
      }
      anim = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(anim)
  }, [])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}

// ── Password strength ────────────────────────────────────────────────────
function validatePassword(pw) {
  return { length: pw.length >= 8, uppercase: /[A-Z]/.test(pw), special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) }
}

function PasswordStrength({ password, labels }) {
  const v = validatePassword(password)
  const score = [v.length, v.uppercase, v.special].filter(Boolean).length
  const colors = ['#f87171', '#fbbf24', '#34d399']
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[0,1,2].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i < score ? colors[score-1] : 'rgba(255,255,255,0.08)', transition:'background 0.3s' }} />)}
      </div>
      {[{ ok:v.length, l: labels[0] }, { ok:v.uppercase, l: labels[1] }, { ok:v.special, l: labels[2] }].map((r,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <div style={{ width:14, height:14, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', background: r.ok ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)', border:`1px solid ${r.ok ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`, transition:'all 0.3s' }}>
            {r.ok && <Check size={8} style={{ color:'#34d399' }} />}
          </div>
          <span style={{ fontSize:10, color: r.ok ? '#9a9488' : '#4a4842' }}>{r.l}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────
export default function Login() {
  const { signIn, signUp, resendConfirmation } = useAuth()
  const { theme: th, mode, toggle: toggleTheme } = useTheme()
  const { lang, toggle: toggleLang, t: translations } = useLang()
  const tl = translations.login
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [regUser, setRegUser] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regPass2, setRegPass2] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const switchTab = (tb) => { setTab(tb); setError(''); document.title = `Pulseframelabs - ${tb === 'login' ? tl.signIn : tl.register}` }
  if (typeof document !== 'undefined') document.title = `Pulseframelabs - ${tab === 'login' ? tl.signIn : tl.register}`

  const handleLogin = async (e) => {
    e.preventDefault(); setError('')
    const r = await signIn(loginEmail, loginPass)
    if (r?.error) {
      if (r.error.message === 'EMAIL_NOT_CONFIRMED') {
        setError(tl.emailNotConfirmed)
        setSentEmail(loginEmail)
      } else {
        setError(r.error.message)
      }
    } else {
      navigate('/')
    }
  }
  const handleRegister = async (e) => {
    e.preventDefault(); setError('')
    if (!regUser.trim()) { setError(tl.usernameRequired); return }
    if (!regEmail.trim()) { setError(tl.emailRequired); return }
    const v = validatePassword(regPass)
    if (!v.length || !v.uppercase || !v.special) { setError(tl.pwRequirements); return }
    if (regPass !== regPass2) { setError(tl.pwNoMatch); return }
    const r = await signUp(regUser.trim(), regEmail.trim(), regPass)
    if (r?.error) { setError(r.error.message); return }
    if (r?.confirmEmail) {
      setSentEmail(regEmail.trim())
      setEmailSent(true)
    } else {
      navigate('/')
    }
  }
  const handleResend = async () => {
    if (!sentEmail || resending) return
    setResending(true); setResent(false)
    await resendConfirmation(sentEmail)
    setResending(false); setResent(true)
    setTimeout(() => setResent(false), 4000)
  }

  const pwValid = validatePassword(regPass)
  const regReady = regUser.trim() && regEmail.trim() && pwValid.length && pwValid.uppercase && pwValid.special && regPass === regPass2

  const isDark = mode === 'dark'
  const panelBg = isDark ? 'rgba(14,12,22,0.85)' : 'rgba(248,246,241,0.92)'
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(212,175,55,0.15)' : 'rgba(139,109,31,0.15)'
  const inputColor = isDark ? '#f0ece4' : '#1a1714'
  const subtitleColor = isDark ? '#8a8478' : '#7a7468'
  const dimColor = isDark ? '#4a4842' : '#b0a898'

  const eyeBtn = (
    <button type="button" onClick={() => setShowPass(!showPass)} style={{
      position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
      background:'none', border:'none', cursor:'pointer', color:dimColor, padding:0, transition:'color 0.15s',
    }} onMouseEnter={e => e.currentTarget.style.color = gold} onMouseLeave={e => e.currentTarget.style.color = dimColor}>
      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  )

  const renderInput = (icon, label, type, value, onChange, placeholder, autoComplete, extra, delay = 0) => (
    <div style={{ animation: `lp-fade-in 0.4s ease-out ${delay}s both` }}>
      <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:subtitleColor, marginBottom:6 }}>
        {icon} {label}
      </label>
      <div style={{ position:'relative' }}>
        <input className="login-input" type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
          style={{ width:'100%', padding:'13px 16px', paddingRight: extra ? 44 : 16, borderRadius:12, fontSize:13, background:inputBg, border:`1px solid ${inputBorder}`, color:inputColor, outline:'none', fontFamily:'system-ui,sans-serif', transition:'border-color 0.25s, box-shadow 0.25s', boxSizing:'border-box' }} />
        {extra}
      </div>
    </div>
  )

  const submitBtn = (children, disabled) => (
    <button type="submit" disabled={disabled} style={{
      display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%',
      padding:'13px 20px', borderRadius:12, fontSize:14, fontWeight:700,
      background: disabled ? (isDark ? '#1a1818' : '#d8d4cc') : `linear-gradient(135deg, ${gold}, #b8962e)`,
      border:'none', color: disabled ? dimColor : '#000', cursor: disabled ? 'not-allowed' : 'pointer',
      transition:'all 0.25s', marginTop:8, position:'relative', overflow:'hidden',
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.boxShadow = `0 0 28px rgba(212,175,55,0.3)`; e.currentTarget.style.transform = 'translateY(-2px)' }}}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
      {!disabled && <span style={{ position:'absolute', top:0, width:60, height:'100%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)', animation:'lp-btn-shine 3s ease-in-out infinite' }} />}
      {children}
    </button>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', background: isDark ? '#08071a' : '#f5f3ee', fontFamily:'system-ui,sans-serif', transition:'background 0.4s' }}>

      {/* ── Left Panel (35%) ──────────────────────────────────────────── */}
      <div style={{
        width:'35%', minWidth:380, maxWidth:480, display:'flex', flexDirection:'column',
        justifyContent:'center', padding:'48px 44px', position:'relative', zIndex:2,
        background: panelBg, backdropFilter:'blur(20px)',
        borderRight:`1px solid ${isDark ? 'rgba(212,175,55,0.08)' : 'rgba(139,109,31,0.08)'}`,
        transition:'background 0.4s',
      }}>
        {/* Gold accent */}
        <div style={{ position:'absolute', left:0, top:'10%', bottom:'10%', width:1, background:`linear-gradient(180deg, transparent, ${gold}30, transparent)` }} />

        {/* Language toggle */}
        <button onClick={toggleLang} title={lang === 'en' ? 'Deutsch' : 'English'} style={{
          position:'absolute', top:20, right:64, width:34, height:34, borderRadius:10,
          display:'flex', alignItems:'center', justifyContent:'center',
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          border:`1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          cursor:'pointer', transition:'all 0.3s', color:gold, padding:0,
          fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.02em',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `${gold}40`; e.currentTarget.style.boxShadow = `0 0 12px ${gold}15` }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}>
          {lang === 'en' ? 'DE' : 'EN'}
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          position:'absolute', top:20, right:20, width:34, height:34, borderRadius:10,
          display:'flex', alignItems:'center', justifyContent:'center',
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          border:`1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          cursor:'pointer', transition:'all 0.3s', color:gold, padding:0,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `${gold}40`; e.currentTarget.style.boxShadow = `0 0 12px ${gold}15` }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}>
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Logo */}
        <div style={{ marginBottom:32, animation:'lp-slide-up 0.5s ease-out' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div style={{ width:38, height:38, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))`, border:'1px solid rgba(212,175,55,0.25)', position:'relative', overflow:'hidden', animation:'lp-float 4s ease-in-out infinite' }}>
              <div style={{ position:'absolute', inset:3, border:'1.5px solid transparent', borderTopColor:'rgba(212,175,55,0.6)', borderRightColor:'rgba(212,175,55,0.2)', borderRadius:'50%', animation:'spin 3s linear infinite' }} />
              <span style={{ position:'absolute', fontSize:15, fontWeight:800, color:gold, textShadow:'0 0 8px rgba(212,175,55,0.3)' }}>P</span>
            </div>
            <span style={{ fontSize:16, fontWeight:800, color: isDark ? '#f0ece4' : '#1a1714', letterSpacing:'-0.01em' }}>
              Pulseframe<span style={{ color:gold }}>labs</span>
            </span>
          </div>
          <h1 style={{ fontSize:26, fontWeight:800, color: isDark ? '#fff' : '#1a1714', margin:'0 0 6px', lineHeight:1.2 }}>
            {emailSent ? tl.emailSent : tab === 'login' ? tl.welcomeBack : tl.getStarted}
          </h1>
          <p style={{ fontSize:13, color:subtitleColor, margin:0, lineHeight:1.5 }}>
            {emailSent ? '' : tab === 'login' ? tl.signInSub : tl.registerSub}
          </p>
        </div>

        {/* ── Email Confirmation Screen ─────────────────────────── */}
        {emailSent ? (
          <div style={{ animation:'lp-slide-up 0.5s ease-out 0.1s both' }}>
            {/* Success icon */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
              <div style={{
                width:72, height:72, borderRadius:'50%',
                background:`rgba(212,175,55,0.08)`, border:`2px solid rgba(212,175,55,0.25)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                animation:'lp-float 3s ease-in-out infinite',
              }}>
                <MailCheck size={32} style={{ color:gold }} />
              </div>
            </div>

            {/* Email info */}
            <div style={{
              padding:'16px 20px', borderRadius:12, marginBottom:16,
              background: isDark ? 'rgba(212,175,55,0.06)' : 'rgba(139,109,31,0.06)',
              border:`1px solid ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(139,109,31,0.15)'}`,
            }}>
              <p style={{ fontSize:13, color: isDark ? '#e8e2d4' : '#1a1714', lineHeight:1.7, margin:'0 0 8px', textAlign:'center' }}>
                {tl.emailSentDesc}
              </p>
              <p style={{ fontSize:12, fontWeight:600, color:gold, textAlign:'center', margin:0, wordBreak:'break-all' }}>
                {sentEmail}
              </p>
            </div>

            {/* Spam hint */}
            <p style={{ fontSize:11, color:dimColor, textAlign:'center', marginBottom:20 }}>
              {tl.checkSpam}
            </p>

            {/* Resend button */}
            <button onClick={handleResend} disabled={resending} style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%',
              padding:'12px 20px', borderRadius:12, fontSize:13, fontWeight:600,
              background:'none', cursor: resending ? 'not-allowed' : 'pointer',
              border:`1px solid ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(139,109,31,0.2)'}`,
              color: resent ? '#34d399' : gold, transition:'all 0.25s',
            }}
              onMouseEnter={e => { if (!resending) { e.currentTarget.style.borderColor = `${gold}50`; e.currentTarget.style.background = `${gold}08` }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(212,175,55,0.2)' : 'rgba(139,109,31,0.2)'; e.currentTarget.style.background = 'none' }}>
              <RefreshCw size={14} style={{ animation: resending ? 'spin 1s linear infinite' : 'none' }} />
              {resent ? tl.resent : tl.resend}
            </button>

            {/* Back to login */}
            <button onClick={() => { setEmailSent(false); setError(''); switchTab('login') }} style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%',
              padding:'12px 20px', marginTop:10, borderRadius:12, fontSize:13, fontWeight:600,
              background:`linear-gradient(135deg, ${gold}, #b8962e)`,
              border:'none', color:'#000', cursor:'pointer', transition:'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 28px rgba(212,175,55,0.3)`; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
              <ArrowRight size={14} /> {tl.backToLogin}
            </button>
          </div>
        ) : (<>

        {/* Tabs */}
        <div style={{
          display:'flex', gap:0, marginBottom:24, borderRadius:12, overflow:'hidden',
          border:`1px solid ${isDark ? 'rgba(212,175,55,0.12)' : 'rgba(139,109,31,0.12)'}`,
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          animation:'lp-slide-up 0.5s ease-out 0.1s both',
        }}>
          {[{ key:'login', label: tl.signIn, Icon:LogIn }, { key:'register', label: tl.register, Icon:UserPlus }].map(tb => (
            <button key={tb.key} onClick={() => switchTab(tb.key)} style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              flex:1, padding:'11px 16px', fontSize:12, fontWeight:600, cursor:'pointer',
              background: tab === tb.key ? `${gold}15` : 'transparent',
              borderRight: tb.key === 'login' ? `1px solid ${isDark ? 'rgba(212,175,55,0.08)' : 'rgba(139,109,31,0.08)'}` : 'none',
              border:'none', color: tab === tb.key ? gold : dimColor, transition:'all 0.25s', position:'relative',
            }}>
              {tab === tb.key && <div style={{ position:'absolute', bottom:0, left:'20%', right:'20%', height:2, background:gold, borderRadius:1 }} />}
              <tb.Icon size={13} /> {tb.label}
            </button>
          ))}
        </div>

        {/* ── Login Form ──────────────────────────────────────────── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} key="login" style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {renderInput(<Mail size={10} style={{ color:dimColor }} />, tl.email, 'email', loginEmail, e => setLoginEmail(e.target.value), tl.emailPlaceholder, 'email', null, 0.05)}
            {renderInput(<Lock size={10} style={{ color:dimColor }} />, tl.password, showPass ? 'text' : 'password', loginPass, e => setLoginPass(e.target.value), tl.passwordPlaceholder, 'current-password', eyeBtn, 0.1)}
            {error && (
              <div style={{ animation:'lp-fade-in 0.2s ease-out' }}>
                <div style={{ fontSize:12, color:'#f87171', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
                  <X size={13} /> {error}
                </div>
                {sentEmail && error === tl.emailNotConfirmed && (
                  <button type="button" onClick={handleResend} disabled={resending} style={{
                    display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%',
                    padding:'10px', marginTop:8, borderRadius:10, fontSize:12, fontWeight:600,
                    background:'none', border:`1px solid ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(139,109,31,0.2)'}`,
                    color: resent ? '#34d399' : gold, cursor: resending ? 'not-allowed' : 'pointer', transition:'all 0.2s',
                  }}>
                    <RefreshCw size={12} style={{ animation: resending ? 'spin 1s linear infinite' : 'none' }} />
                    {resent ? tl.resent : tl.resend}
                  </button>
                )}
              </div>
            )}
            <div style={{ animation:'lp-fade-in 0.4s ease-out 0.15s both' }}>{submitBtn(<>{tl.signInBtn} <ArrowRight size={14} /></>)}</div>
            <p style={{ fontSize:11, color:dimColor, textAlign:'center', marginTop:4 }}>
              {tl.noAccount} <span onClick={() => switchTab('register')} style={{ color:gold, cursor:'pointer', fontWeight:600 }}>{tl.register}</span>
            </p>
          </form>
        )}

        {/* ── Register Form ───────────────────────────────────────── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} key="register" style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {renderInput(<User size={10} style={{ color:dimColor }} />, tl.username, 'text', regUser, e => setRegUser(e.target.value), tl.usernamePlaceholder, 'username', null, 0.05)}
            {renderInput(<Mail size={10} style={{ color:dimColor }} />, tl.email, 'email', regEmail, e => setRegEmail(e.target.value), tl.emailPlaceholder, 'email', null, 0.1)}
            {renderInput(<Lock size={10} style={{ color:dimColor }} />, tl.password, showPass ? 'text' : 'password', regPass, e => setRegPass(e.target.value), tl.createPasswordPlaceholder, 'new-password', eyeBtn, 0.15)}
            {regPass && <PasswordStrength password={regPass} labels={[tl.pwLength, tl.pwUppercase, tl.pwSpecial]} />}
            {renderInput(<Lock size={10} style={{ color:dimColor }} />, tl.confirmPassword, showPass ? 'text' : 'password', regPass2, e => setRegPass2(e.target.value), tl.repeatPasswordPlaceholder, 'new-password', null, 0.2)}
            {regPass2 && regPass !== regPass2 && <div style={{ display:'flex', alignItems:'center', gap:6 }}><X size={12} style={{ color:'#f87171' }} /><span style={{ fontSize:10, color:'#f87171' }}>{tl.pwNoMatch}</span></div>}
            {error && <div style={{ fontSize:12, color:'#f87171', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}><X size={13} /> {error}</div>}
            <div style={{ animation:'lp-fade-in 0.4s ease-out 0.25s both' }}>{submitBtn(<>{tl.createAccountBtn} <ArrowRight size={14} /></>, !regReady)}</div>
            <p style={{ fontSize:11, color:dimColor, textAlign:'center', marginTop:4 }}>
              {tl.hasAccount} <span onClick={() => switchTab('login')} style={{ color:gold, cursor:'pointer', fontWeight:600 }}>{tl.signIn}</span>
            </p>
          </form>
        )}

        </>)}

        <div style={{ position:'absolute', bottom:20, left:44, right:44, textAlign:'center' }}>
          <p style={{ fontSize:9, color:dimColor }}>{tl.terms}</p>
        </div>
      </div>

      {/* ── Right Panel (65%) — Animated Background ───────────────────── */}
      <div style={{ flex:1, position:'relative', overflow:'hidden', background: isDark ? '#0a0918' : '#edeae3', transition:'background 0.4s' }}>
        <ParticleBg />

        {/* Ambient glows */}
        <div style={{ position:'absolute', top:'20%', left:'30%', width:400, height:400, borderRadius:'50%', background:`radial-gradient(circle, ${gold}06 0%, transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'15%', right:'20%', width:300, height:300, borderRadius:'50%', background:`radial-gradient(circle, ${gold}04 0%, transparent 70%)`, pointerEvents:'none' }} />

        {/* Video placeholder */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{
            width:'60%', maxWidth:540, aspectRatio:'16/9', borderRadius:20,
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border:`1px solid ${isDark ? 'rgba(212,175,55,0.08)' : 'rgba(139,109,31,0.08)'}`,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14,
            backdropFilter:'blur(4px)',
            boxShadow: isDark ? `0 0 60px rgba(212,175,55,0.02)` : '0 8px 40px rgba(0,0,0,0.05)',
            animation:'lp-slide-up 0.6s ease-out 0.3s both',
          }}>
            <div style={{ position:'absolute', top:-1, left:20, right:20, height:1, background:`linear-gradient(90deg, transparent, ${gold}15, transparent)` }} />
            <div style={{
              width:60, height:60, borderRadius:'50%',
              background:`rgba(212,175,55,0.08)`, border:`1px solid rgba(212,175,55,0.18)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', transition:'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `rgba(212,175,55,0.15)`; e.currentTarget.style.boxShadow = `0 0 30px rgba(212,175,55,0.15)`; e.currentTarget.style.transform = 'scale(1.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = `rgba(212,175,55,0.08)`; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
              <Play size={24} style={{ color:gold, marginLeft:3 }} />
            </div>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:12, fontWeight:600, color: isDark ? '#5a5548' : '#8a8478', margin:'0 0 4px' }}>{tl.platformOverview}</p>
              <p style={{ fontSize:10, color:dimColor, margin:0 }}>{tl.videoSoon}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
