import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { User, Mail, Lock, Trash2, Check, AlertTriangle } from 'lucide-react'

const gold = '#d4af37'

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
}

export default function Settings() {
  const { t } = useLang()
  const { mode } = useTheme()
  const isDark = mode === 'dark'
  const ts = t.settings
  const { user, signOut } = useAuth()

  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [deleteText, setDeleteText] = useState('')

  const [savedUsername, setSavedUsername] = useState(false)
  const [savedEmail, setSavedEmail] = useState(false)
  const [savedPassword, setSavedPassword] = useState(false)
  const [error, setError] = useState('')

  const showSaved = (setter) => {
    setter(true)
    setTimeout(() => setter(false), 2500)
  }

  const handleUsername = async () => {
    if (!newUsername.trim()) return
    setError('')
    const { error: err } = await supabase.auth.updateUser({ data: { username: newUsername.trim() } })
    if (err) { setError(err.message); return }
    showSaved(setSavedUsername)
    setNewUsername('')
  }

  const handleEmail = async () => {
    if (!newEmail.trim()) return
    setError('')
    const { error: err } = await supabase.auth.updateUser({ email: newEmail.trim() })
    if (err) { setError(err.message); return }
    showSaved(setSavedEmail)
    setNewEmail('')
  }

  const handlePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) return
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) { setError(err.message); return }
    showSaved(setSavedPassword)
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleDelete = async () => {
    if (deleteText !== 'DELETE') return
    await signOut()
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    border: '1px solid var(--card-border)', color: 'var(--input-text)',
    outline: 'none', fontFamily: 'system-ui, sans-serif', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  const btnStyle = (enabled) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
    background: enabled ? `linear-gradient(135deg, ${gold}, #b8962e)` : isDark ? '#1a1818' : '#d8d4cc',
    border: 'none', color: enabled ? '#000' : '#666',
    cursor: enabled ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
  })

  const savedBadge = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#34d399', marginTop: 8 }}>
      <Check size={14} /> {ts.saved}
    </div>
  )

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--input-text)', marginBottom: 20 }}>{ts.title}</h2>

      {error && (
        <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={13} /> {error}
        </div>
      )}

      {/* Change Username */}
      <div style={{ ...S.card, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <User size={16} style={{ color: gold }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--input-text)' }}>{ts.changeUsername}</span>
        </div>
        <p style={{ ...S.label }}>{ts.currentUsername}</p>
        <p style={{ fontSize: 13, color: 'var(--input-text)', marginBottom: 12, marginTop: 0 }}>
          {user?.user_metadata?.username || '—'}
        </p>
        <p style={{ ...S.label }}>{ts.newUsername}</p>
        <input
          type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
          placeholder={ts.newUsername} style={inputStyle}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <button onClick={handleUsername} disabled={!newUsername.trim()} style={btnStyle(!!newUsername.trim())}
            onMouseEnter={e => { if (newUsername.trim()) { e.currentTarget.style.boxShadow = '0 0 18px rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
            {ts.changeUsername}
          </button>
          {savedUsername && savedBadge}
        </div>
      </div>

      {/* Change Email */}
      <div style={{ ...S.card, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Mail size={16} style={{ color: gold }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--input-text)' }}>{ts.changeEmail}</span>
        </div>
        <p style={{ ...S.label }}>{ts.currentEmail}</p>
        <p style={{ fontSize: 13, color: 'var(--input-text)', marginBottom: 12, marginTop: 0 }}>
          {user?.email || '—'}
        </p>
        <p style={{ ...S.label }}>{ts.newEmail}</p>
        <input
          type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
          placeholder={ts.newEmail} style={inputStyle}
        />
        <p style={{ fontSize: 11, color: 'var(--label-color)', marginTop: 8, marginBottom: 0 }}>{ts.emailChangeNote}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <button onClick={handleEmail} disabled={!newEmail.trim()} style={btnStyle(!!newEmail.trim())}
            onMouseEnter={e => { if (newEmail.trim()) { e.currentTarget.style.boxShadow = '0 0 18px rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
            {ts.changeEmail}
          </button>
          {savedEmail && savedBadge}
        </div>
      </div>

      {/* Change Password */}
      <div style={{ ...S.card, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Lock size={16} style={{ color: gold }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--input-text)' }}>{ts.changePassword}</span>
        </div>
        <p style={{ ...S.label }}>{ts.newPassword}</p>
        <input
          type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
          placeholder={ts.newPassword} style={{ ...inputStyle, marginBottom: 10 }}
        />
        <p style={{ ...S.label }}>{ts.confirmPassword}</p>
        <input
          type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
          placeholder={ts.confirmPassword} style={inputStyle}
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <p style={{ fontSize: 11, color: '#f87171', marginTop: 6, marginBottom: 0 }}>{t.login.pwNoMatch}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <button onClick={handlePassword} disabled={!newPassword || newPassword !== confirmPassword} style={btnStyle(newPassword && newPassword === confirmPassword)}
            onMouseEnter={e => { if (newPassword && newPassword === confirmPassword) { e.currentTarget.style.boxShadow = '0 0 18px rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
            {ts.changePassword}
          </button>
          {savedPassword && savedBadge}
        </div>
      </div>

      {/* Delete Account */}
      <div style={{ ...S.card, padding: 20, borderColor: 'rgba(248,113,113,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Trash2 size={16} style={{ color: '#f87171' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f87171' }}>{ts.deleteAccount}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--label-color)', marginBottom: 14, lineHeight: 1.6 }}>
          {ts.deleteWarning}
        </p>
        <p style={{ ...S.label }}>{ts.deleteConfirm}</p>
        <input
          type="text" value={deleteText} onChange={e => setDeleteText(e.target.value)}
          placeholder="DELETE" style={{ ...inputStyle, borderColor: deleteText === 'DELETE' ? 'rgba(248,113,113,0.4)' : undefined }}
        />
        <button onClick={handleDelete} disabled={deleteText !== 'DELETE'} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, marginTop: 12,
          background: deleteText === 'DELETE' ? 'linear-gradient(135deg, #f87171, #dc2626)' : isDark ? '#1a1818' : '#d8d4cc',
          border: 'none', color: deleteText === 'DELETE' ? '#fff' : '#666',
          cursor: deleteText === 'DELETE' ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
        }}>
          <Trash2 size={13} /> {ts.deleteAccount}
        </button>
      </div>
    </div>
  )
}
