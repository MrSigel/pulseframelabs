import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { Lock, Check, X, ArrowRight, Eye, EyeOff } from 'lucide-react'

const gold = '#d4af37'

function validatePassword(pw) {
  return { length: pw.length >= 8, uppercase: /[A-Z]/.test(pw), special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) }
}

export default function ResetPassword() {
  const { t } = useLang()
  const { mode } = useTheme()
  const isDark = mode === 'dark'
  const tl = t.login
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [ready, setReady] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const v = validatePassword(password)
  const allValid = v.length && v.uppercase && v.special && password === confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!allValid) return
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); return }
    setSuccess(true)
  }

  const panelBg = isDark ? 'rgba(14,12,22,0.85)' : 'rgba(248,246,241,0.92)'
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(212,175,55,0.15)' : 'rgba(139,109,31,0.15)'
  const inputColor = isDark ? '#f0ece4' : '#1a1714'
  const subtitleColor = isDark ? '#8a8478' : '#7a7468'
  const dimColor = isDark ? '#4a4842' : '#b0a898'

  const inputStyle = {
    width: '100%', padding: '13px 16px', paddingRight: 44, borderRadius: 12, fontSize: 13,
    background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor,
    outline: 'none', fontFamily: 'system-ui, sans-serif', transition: 'border-color 0.25s, box-shadow 0.25s',
    boxSizing: 'border-box',
  }

  const colors = ['#f87171', '#fbbf24', '#34d399']
  const score = [v.length, v.uppercase, v.special].filter(Boolean).length

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#08071a' : '#f5f3ee', fontFamily: 'system-ui, sans-serif', transition: 'background 0.4s' }}>

      <div style={{
        width: 420, padding: '40px 36px', borderRadius: 20,
        background: panelBg, backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(212,175,55,0.1)' : 'rgba(139,109,31,0.1)'}`,
        boxShadow: isDark ? '0 16px 60px rgba(0,0,0,0.6)' : '0 16px 60px rgba(0,0,0,0.1)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
            border: '1px solid rgba(212,175,55,0.25)',
          }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: gold }}>P</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: isDark ? '#f0ece4' : '#1a1714' }}>
            Pulseframe<span style={{ color: gold }}>labs</span>
          </span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#fff' : '#1a1714', margin: '0 0 6px' }}>
          {tl.resetPassword}
        </h1>

        {success ? (
          <div style={{ marginTop: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderRadius: 12,
              background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
              fontSize: 13, fontWeight: 600, color: '#34d399', marginBottom: 20,
            }}>
              <Check size={16} /> {tl.passwordResetSuccess}
            </div>
            <button onClick={() => navigate('/login')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
              padding: '13px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              background: `linear-gradient(135deg, ${gold}, #b8962e)`,
              border: 'none', color: '#000', cursor: 'pointer', transition: 'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
              <ArrowRight size={14} /> {tl.backToLogin}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
            {/* New Password */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: subtitleColor, marginBottom: 6 }}>
                <Lock size={10} style={{ color: dimColor }} /> {tl.newPassword}
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={tl.newPassword} style={inputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: dimColor, padding: 0,
                }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Password Strength */}
            {password && (
              <div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < score ? colors[score - 1] : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />)}
                </div>
                {[{ ok: v.length, l: tl.pwLength }, { ok: v.uppercase, l: tl.pwUppercase }, { ok: v.special, l: tl.pwSpecial }].map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: r.ok ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${r.ok ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.3s',
                    }}>
                      {r.ok && <Check size={8} style={{ color: '#34d399' }} />}
                    </div>
                    <span style={{ fontSize: 10, color: r.ok ? '#9a9488' : '#4a4842' }}>{r.l}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: subtitleColor, marginBottom: 6 }}>
                <Lock size={10} style={{ color: dimColor }} /> {tl.confirmNewPassword}
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={tl.confirmNewPassword} style={{ ...inputStyle, paddingRight: 16 }} />
              </div>
            </div>

            {confirm && password !== confirm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <X size={12} style={{ color: '#f87171' }} />
                <span style={{ fontSize: 10, color: '#f87171' }}>{tl.pwNoMatch}</span>
              </div>
            )}

            {error && (
              <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <X size={13} /> {error}
              </div>
            )}

            <button type="submit" disabled={!allValid} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
              padding: '13px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, marginTop: 4,
              background: allValid ? `linear-gradient(135deg, ${gold}, #b8962e)` : isDark ? '#1a1818' : '#d8d4cc',
              border: 'none', color: allValid ? '#000' : dimColor,
              cursor: allValid ? 'pointer' : 'not-allowed', transition: 'all 0.25s',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => { if (allValid) { e.currentTarget.style.boxShadow = '0 0 28px rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
              {tl.resetPassword} <ArrowRight size={14} />
            </button>

            <p style={{ fontSize: 11, color: dimColor, textAlign: 'center', marginTop: 4 }}>
              <span onClick={() => navigate('/login')} style={{ color: gold, cursor: 'pointer', fontWeight: 600 }}>{tl.backToLogin}</span>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
