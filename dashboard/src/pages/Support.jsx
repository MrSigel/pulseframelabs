import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { Send, MessageCircle, Check, AlertTriangle } from 'lucide-react'

const gold = '#d4af37'
const TELEGRAM_URL = 'https://t.me/pulseframelabs'

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
}

export default function Support() {
  const { t } = useLang()
  const { mode } = useTheme()
  const isDark = mode === 'dark'
  const ts = t.support
  const { user } = useAuth()

  const [name, setName] = useState(user?.user_metadata?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return
    setSending(true)
    setError('')
    const { error: err } = await supabase.from('support_tickets').insert({
      user_id: user?.id,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    })
    setSending(false)
    if (err) { setError(err.message); return }
    setSent(true)
    setSubject('')
    setMessage('')
    setTimeout(() => setSent(false), 4000)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    border: '1px solid var(--card-border)', color: 'var(--input-text)',
    outline: 'none', fontFamily: 'system-ui, sans-serif', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--input-text)', marginBottom: 20 }}>{ts.title}</h2>

      {error && (
        <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={13} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

        {/* Contact Form */}
        <div style={{ ...S.card, padding: 20, flex: '1 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Send size={16} style={{ color: gold }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--input-text)' }}>{ts.contactForm}</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ ...S.label }}>{ts.name}</p>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={ts.namePlaceholder} style={inputStyle} />
            </div>
            <div>
              <p style={{ ...S.label }}>{ts.email}</p>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={ts.email} style={inputStyle} />
            </div>
            <div>
              <p style={{ ...S.label }}>{ts.subject}</p>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder={ts.subjectPlaceholder} style={inputStyle} />
            </div>
            <div>
              <p style={{ ...S.label }}>{ts.message}</p>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={ts.messagePlaceholder}
                rows={5} style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} />
            </div>

            <button type="submit" disabled={sending || !subject.trim() || !message.trim()} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: (!sending && subject.trim() && message.trim()) ? `linear-gradient(135deg, ${gold}, #b8962e)` : isDark ? '#1a1818' : '#d8d4cc',
              border: 'none', color: (!sending && subject.trim() && message.trim()) ? '#000' : '#666',
              cursor: (!sending && subject.trim() && message.trim()) ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!sending && subject.trim() && message.trim()) { e.currentTarget.style.boxShadow = '0 0 18px rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
              <Send size={13} /> {sending ? '...' : ts.send}
            </button>

            {sent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#34d399', padding: '10px 14px', borderRadius: 10, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <Check size={14} />
                <div>
                  <div>{ts.sent}</div>
                  <div style={{ fontSize: 11, color: 'var(--label-color)', marginTop: 2 }}>{ts.sentDesc}</div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Telegram Live Chat */}
        <div style={{ ...S.card, padding: 20, flex: '1 1 320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', marginBottom: 16,
          }}>
            <MessageCircle size={24} style={{ color: gold }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--input-text)', marginBottom: 8 }}>{ts.telegramChat}</span>
          <p style={{ fontSize: 12, color: 'var(--label-color)', lineHeight: 1.6, marginBottom: 20, maxWidth: 260 }}>
            {ts.telegramDesc}
          </p>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: `linear-gradient(135deg, ${gold}, #b8962e)`,
            border: 'none', color: '#000', cursor: 'pointer', transition: 'all 0.2s',
            textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
            <MessageCircle size={14} /> {ts.openTelegram}
          </a>
        </div>

      </div>
    </div>
  )
}
