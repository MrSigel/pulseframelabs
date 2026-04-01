import { useState, useEffect } from 'react'
import { getOne, setOne } from '../lib/store'
import { supabase } from '../lib/supabase'
import { Globe, ChevronRight, ChevronLeft, Check, Palette, Type, Layout, Image, Link2, Eye, RotateCcw, ExternalLink, Info, Upload, Gamepad2, Zap, Crown, Star, Diamond, Flame, Trophy } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const gold = '#d4af37'

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
}

const COLOR_PRESETS = [
  { tKey: 'gold',    primary: '#d4af37', bg: '#0a0914', accent: '#f5e6b8' },
  { tKey: 'purple',  primary: '#8b5cf6', bg: '#0a0818', accent: '#c4b5fd' },
  { tKey: 'blue',    primary: '#3b82f6', bg: '#080a14', accent: '#93c5fd' },
  { tKey: 'emerald', primary: '#10b981', bg: '#080f0a', accent: '#6ee7b7' },
  { tKey: 'red',     primary: '#ef4444', bg: '#140808', accent: '#fca5a5' },
  { tKey: 'cyan',    primary: '#06b6d4', bg: '#080f14', accent: '#67e8f9' },
  { tKey: 'pink',    primary: '#ec4899', bg: '#140810', accent: '#f9a8d4' },
  { tKey: 'orange',  primary: '#f97316', bg: '#140e08', accent: '#fdba74' },
]

const ICON_OPTIONS = [
  { tKey: 'globe',   value: 'globe',   Comp: Globe },
  { tKey: 'gamepad', value: 'gamepad', Comp: Gamepad2 },
  { tKey: 'zap',     value: 'zap',     Comp: Zap },
  { tKey: 'crown',   value: 'crown',   Comp: Crown },
  { tKey: 'star',    value: 'star',    Comp: Star },
  { tKey: 'diamond', value: 'diamond', Comp: Diamond },
  { tKey: 'flame',   value: 'flame',   Comp: Flame },
  { tKey: 'trophy',  value: 'trophy',  Comp: Trophy },
]

const SECTION_OPTIONS = [
  { key: 'about',    tLabel: 'aboutMe',       tDesc: 'aboutMeDesc' },
  { key: 'schedule', tLabel: 'schedule',       tDesc: 'scheduleDesc' },
  { key: 'socials',  tLabel: 'socialLinks',    tDesc: 'socialLinksDesc' },
  { key: 'stats',    tLabel: 'stats',          tDesc: 'statsDesc' },
  { key: 'gallery',  tLabel: 'gallery',        tDesc: 'galleryDesc' },
  { key: 'donate',   tLabel: 'donate',         tDesc: 'donateDesc' },
  { key: 'deals',    tLabel: 'casinoDeals',    tDesc: 'casinoDealsDesc' },
]

const SOCIAL_PLATFORMS = [
  { key: 'twitch',    tKey: 'twitch',    placeholder: 'https://twitch.tv/...' },
  { key: 'youtube',   tKey: 'youtube',   placeholder: 'https://youtube.com/...' },
  { key: 'twitter',   tKey: 'twitterX',  placeholder: 'https://x.com/...' },
  { key: 'instagram', tKey: 'instagram', placeholder: 'https://instagram.com/...' },
  { key: 'discord',   tKey: 'discord',   placeholder: 'https://discord.gg/...' },
  { key: 'tiktok',    tKey: 'tiktok',    placeholder: 'https://tiktok.com/@...' },
  { key: 'kick',      tKey: 'kick',      placeholder: 'https://kick.com/...' },
]

const WIZARD_STEPS = [
  { tKey: 'branding', Icon: Type },
  { tKey: 'colors', Icon: Palette },
  { tKey: 'icon', Icon: Image },
  { tKey: 'sections', Icon: Layout },
  { tKey: 'socials', Icon: Link2 },
  { tKey: 'deals', Icon: Diamond },
  { tKey: 'preview', Icon: Eye },
]

function HoverBtn({ onClick, children, style, hoverStyle, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:6, borderRadius:10, padding:'8px 14px', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', transition:'all 0.15s', border:'1px solid transparent', ...style, ...(hov && !disabled ? hoverStyle : {}) }}>
      {children}
    </button>
  )
}

// ── Website Preview ──────────────────────────────────────────────────────
function WebsitePreview({ config }) {
  const { t } = useLang()
  const tw = t.website
  const c = config
  return (
    <div style={{
      background: c.bgColor || '#0a0914', borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${c.primaryColor || gold}22`, minHeight: 300,
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: `1px solid ${c.primaryColor || gold}15`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `${c.primaryColor || gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: c.primaryColor || gold }}>
            {(c.title || 'S')[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{c.title || tw.myWebsite}</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {(c.sections || []).slice(0, 3).map(s => (
            <span key={s} style={{ fontSize: 10, color: `${c.primaryColor || gold}99`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {tw[SECTION_OPTIONS.find(o => o.key === s)?.tLabel] || s}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '40px 20px 30px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, margin: '0 auto 14px',
          background: `${c.primaryColor || gold}15`, border: `1px solid ${c.primaryColor || gold}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 800, color: c.primaryColor || gold,
        }}>
          {(c.title || 'S')[0].toUpperCase()}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>{c.title || tw.myWebsite}</h1>
        <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{c.tagline || tw.welcomeStream}</p>
      </div>

      {/* Sections preview */}
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(c.sections || []).map(s => {
          const opt = SECTION_OPTIONS.find(o => o.key === s)
          return (
            <div key={s} style={{
              padding: '10px 14px', borderRadius: 8,
              background: `${c.primaryColor || gold}06`, border: `1px solid ${c.primaryColor || gold}10`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.primaryColor || gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                {tw[opt?.tLabel] || s}
              </div>
              <div style={{ fontSize: 11, color: '#666' }}>{tw[opt?.tDesc] || ''}</div>
            </div>
          )
        })}

        {/* Casino deals preview */}
        {(c.deals || []).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {c.deals.map((deal, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
              }}>
                {deal.image ? (
                  <img src={deal.image} alt="" style={{ width: 40, height: 26, objectFit: 'contain', borderRadius: 4, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 40, height: 26, borderRadius: 4, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', flex: 1 }}>{deal.title}</span>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
                  background: c.primaryColor || gold, color: '#000',
                }}>{deal.btnText || tw.playNow}</span>
              </div>
            ))}
          </div>
        )}

        {/* Social links preview */}
        {Object.keys(c.socials || {}).filter(k => c.socials[k]).length > 0 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', paddingTop: 8 }}>
            {Object.entries(c.socials || {}).filter(([, v]) => v).map(([k]) => (
              <div key={k} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: `${c.primaryColor || gold}10`, color: c.primaryColor || gold,
                border: `1px solid ${c.primaryColor || gold}20`, textTransform: 'capitalize',
              }}>{k}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Wizard ───────────────────────────────────────────────────────────────
function WebsiteWizard({ initial, onSave, onCancel }) {
  const { t } = useLang()
  const { mode } = useTheme()
  const isDark = mode === 'dark'
  const tw = t.website
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState(initial || {
    title: '', tagline: '', primaryColor: '#d4af37', bgColor: '#0a0914',
    accentColor: '#f5e6b8', icon: 'globe', sections: ['about', 'socials'],
    socials: {}, deals: [],
  })

  const set = (key, val) => setConfig(prev => ({ ...prev, [key]: val }))
  const canNext = step === 0 ? config.title.trim() : true
  const isLast = step === WIZARD_STEPS.length - 1

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
        {WIZARD_STEPS.map((ws, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < WIZARD_STEPS.length - 1 ? 1 : 0 }}>
            <div
              onClick={() => i < step && setStep(i)}
              style={{
                width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0, cursor: i < step ? 'pointer' : 'default',
                background: step >= i ? `linear-gradient(135deg, ${gold}, #b8962e)` : 'rgba(212,175,55,0.08)',
                border: `1px solid ${step >= i ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.12)'}`,
                color: step >= i ? '#fff' : '#4a4842',
                boxShadow: step >= i ? `0 0 10px rgba(212,175,55,0.2)` : 'none',
                transition: 'all 0.2s',
              }}>
              {step > i ? <Check size={12} /> : <ws.Icon size={12} />}
            </div>
            {i < WIZARD_STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1, background: step > i ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.08)', margin: '0 6px', transition: 'background 0.3s' }} />
            )}
          </div>
        ))}
        <span style={{ marginLeft: 12, fontSize: 11, color: '#5a5548' }}>{tw[WIZARD_STEPS[step].tKey]}</span>
      </div>

      <div style={{ ...S.card, padding: 28 }}>

        {/* Step 0: Branding */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={S.label}>{tw.websiteTitle}</label>
              <input className="input" placeholder={tw.egStreamer} value={config.title}
                onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label style={S.label}>{tw.tagline}</label>
              <input className="input" placeholder={tw.egTagline} value={config.tagline || ''}
                onChange={e => set('tagline', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 1: Colors */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={S.label}>{tw.colorTheme}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {COLOR_PRESETS.map(cp => (
                  <button key={cp.tKey} onClick={() => { set('primaryColor', cp.primary); set('bgColor', cp.bg); set('accentColor', cp.accent) }}
                    style={{
                      padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                      background: config.primaryColor === cp.primary ? `${cp.primary}15` : 'rgba(255,255,255,0.02)',
                      border: `2px solid ${config.primaryColor === cp.primary ? cp.primary : 'rgba(255,255,255,0.05)'}`,
                      transition: 'all 0.15s',
                    }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: cp.primary, margin: '0 auto 6px', boxShadow: `0 0 10px ${cp.primary}40` }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: config.primaryColor === cp.primary ? cp.primary : '#5a5548' }}>{tw[cp.tKey]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={S.label}>{tw.customColor}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={config.primaryColor} onChange={e => set('primaryColor', e.target.value)}
                  style={{ width: 40, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }} />
                <span style={{ fontSize: 12, color: '#5a5548', fontFamily: 'monospace' }}>{config.primaryColor}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Icon */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={S.label}>{tw.chooseIcon}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {ICON_OPTIONS.map(ico => {
                  const active = config.icon === ico.value && !config.customIcon
                  return (
                    <button key={ico.value} onClick={() => { set('icon', ico.value); set('customIcon', null) }}
                      style={{
                        padding: '14px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                        background: active ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `2px solid ${active ? gold : 'rgba(255,255,255,0.05)'}`,
                        transition: 'all 0.15s',
                      }}>
                      <ico.Comp size={22} style={{ color: active ? gold : '#5a5548', marginBottom: 4 }} />
                      <div style={{ fontSize: 10, fontWeight: 600, color: active ? gold : '#5a5548' }}>{tw[ico.tKey]}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom upload */}
            <div>
              <label style={S.label}>{tw.uploadIcon}</label>
              <p style={{ fontSize: 11, color: '#5a5548', marginBottom: 10 }}>
                {tw.uploadHint}
              </p>
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 20px', borderRadius: 10, cursor: 'pointer',
                background: config.customIcon ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
                border: `2px dashed ${config.customIcon ? gold : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.15s',
              }}>
                {config.customIcon ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={config.customIcon} alt="icon" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'contain' }} />
                    <span style={{ fontSize: 12, color: gold, fontWeight: 600 }}>{tw.iconUploaded}</span>
                  </div>
                ) : (
                  <>
                    <Upload size={16} style={{ color: '#5a5548' }} />
                    <span style={{ fontSize: 12, color: '#5a5548' }}>{tw.clickUpload}</span>
                  </>
                )}
                <input type="file" accept="image/png,image/svg+xml,image/webp" style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > 512 * 1024) { alert('File too large. Max 512 KB.'); return }
                    const reader = new FileReader()
                    reader.onload = () => { set('customIcon', reader.result); set('icon', 'custom') }
                    reader.readAsDataURL(file)
                  }} />
              </label>
              {config.customIcon && (
                <button onClick={() => { set('customIcon', null); set('icon', 'globe') }}
                  style={{ fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, padding: 0 }}>
                  {tw.removeIcon}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Sections */}
        {step === 3 && (
          <div>
            <label style={S.label}>{tw.websiteSections}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SECTION_OPTIONS.map(sec => {
                const active = (config.sections || []).includes(sec.key)
                return (
                  <button key={sec.key} onClick={() => {
                    const cur = config.sections || []
                    set('sections', active ? cur.filter(s => s !== sec.key) : [...cur, sec.key])
                  }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                      borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      background: active ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.01)',
                      border: `1px solid ${active ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.04)'}`,
                      transition: 'all 0.15s',
                    }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      background: active ? gold : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {active && <Check size={12} style={{ color: '#000' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#e8e2d4' : '#5a5548' }}>{tw[sec.tLabel]}</div>
                      <div style={{ fontSize: 10, color: '#4a4842', marginTop: 1 }}>{tw[sec.tDesc]}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 4: Socials */}
        {step === 4 && (
          <div>
            <label style={S.label}>{tw.socialLinks}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SOCIAL_PLATFORMS.map(sp => (
                <div key={sp.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#5a5548', width: 70, flexShrink: 0 }}>{tw[sp.tKey]}</span>
                  <input className="input" placeholder={sp.placeholder} value={(config.socials || {})[sp.key] || ''}
                    onChange={e => set('socials', { ...config.socials, [sp.key]: e.target.value })}
                    style={{ flex: 1 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Casino Deals */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={S.label}>{tw.casinoDeals}</label>
              <p style={{ fontSize: 11, color: '#5a5548', marginBottom: 12 }}>
                {tw.casinoDealsInfo}
              </p>
            </div>

            {/* Existing deals */}
            {(config.deals || []).map((deal, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.1)',
                borderRadius: 10,
              }}>
                {deal.image ? (
                  <img src={deal.image} alt="" style={{ width: 48, height: 32, objectFit: 'contain', borderRadius: 6, flexShrink: 0, background: '#111' }} />
                ) : (
                  <div style={{ width: 48, height: 32, borderRadius: 6, background: 'rgba(212,175,55,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Diamond size={14} style={{ color: '#4a4842' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--input-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deal.title || tw.untitledDeal}</div>
                  <div style={{ fontSize: 10, color: 'var(--label-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deal.link || tw.noLink}</div>
                </div>
                <button onClick={() => set('deals', (config.deals || []).filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a4842', padding: 0, transition: 'color 0.15s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4a4842'}>
                  <RotateCcw size={13} />
                </button>
              </div>
            ))}

            {/* Add new deal form */}
            <div style={{
              padding: 16, borderRadius: 10,
              background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(212,175,55,0.12)',
            }}>
              <p style={{ ...S.label, marginBottom: 12 }}>{tw.addDeal}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--label-color)', display: 'block', marginBottom: 4 }}>{tw.casinoLogo}</span>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                    borderRadius: 8, cursor: 'pointer',
                    background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                  }}>
                    <Upload size={13} style={{ color: 'var(--label-color)' }} />
                    <span style={{ fontSize: 11, color: 'var(--label-color)' }} id="deal-file-label">{tw.chooseImage}</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} id="deal-image-input"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (file.size > 200 * 1024) { alert('Max 200 KB'); return }
                        const reader = new FileReader()
                        reader.onload = () => { document.getElementById('deal-image-input').dataset.result = reader.result; document.getElementById('deal-file-label').textContent = file.name }
                        reader.readAsDataURL(file)
                      }} />
                  </label>
                </div>
                <input className="input" placeholder={tw.dealHeadline} id="deal-title-input" />
                <input className="input" placeholder={tw.dealBtnText} id="deal-btn-input" />
                <input className="input" placeholder={tw.dealLinkUrl} id="deal-link-input" />
                <button onClick={() => {
                  const title = document.getElementById('deal-title-input').value.trim()
                  const link = document.getElementById('deal-link-input').value.trim()
                  const btnText = document.getElementById('deal-btn-input').value.trim() || tw.playNow
                  const image = document.getElementById('deal-image-input')?.dataset?.result || null
                  if (!title) return
                  set('deals', [...(config.deals || []), { title, link, btnText, image }])
                  document.getElementById('deal-title-input').value = ''
                  document.getElementById('deal-link-input').value = ''
                  document.getElementById('deal-btn-input').value = ''
                  document.getElementById('deal-file-label').textContent = tw.chooseImage
                  delete document.getElementById('deal-image-input').dataset.result
                }} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
                  color: gold, cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.18)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'none' }}>
                  <Check size={12} /> {tw.addDeal}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Preview */}
        {step === 6 && (
          <div>
            <label style={S.label}>{tw.preview}</label>
            <WebsitePreview config={config} />
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <div>
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#d4af37', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 10, cursor: 'pointer', padding: '8px 14px', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 20px rgba(212,175,55,0.3)'; e.currentTarget.style.transform='translateY(-1px)' }} onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none' }}>
                <ChevronLeft size={13} /> Back
              </button>
            ) : (
              <button onClick={onCancel} style={{ fontSize: 12, fontWeight: 600, color: '#f87171', background: isDark ? 'rgba(248,113,113,0.06)' : 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, cursor: 'pointer', padding: '6px 14px', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background='rgba(248,113,113,0.15)'; e.currentTarget.style.borderColor='rgba(248,113,113,0.5)'; e.currentTarget.style.transform='translateY(-1px)' }} onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(248,113,113,0.06)' : 'rgba(248,113,113,0.08)'; e.currentTarget.style.borderColor='rgba(248,113,113,0.3)'; e.currentTarget.style.transform='none' }}>
                {tw.cancel}
              </button>
            )}
          </div>
          <HoverBtn onClick={() => {
            if (isLast) { onSave(config) }
            else if (canNext) { setStep(step + 1) }
          }} disabled={!canNext}
            style={{
              background: isLast ? `linear-gradient(135deg, ${gold}, #b8962e)` : `rgba(212,175,55,0.1)`,
              borderColor: isLast ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.25)',
              color: isLast ? '#fff' : gold,
              boxShadow: isLast ? '0 0 14px rgba(212,175,55,0.2)' : 'none',
              opacity: canNext ? 1 : 0.4,
            }}
            hoverStyle={canNext ? { boxShadow: '0 0 20px rgba(212,175,55,0.3)', transform: 'translateY(-1px)' } : {}}>
            {isLast ? <><Check size={14} /> {tw.saveWebsite}</> : <>Next <ChevronRight size={14} /></>}
          </HoverBtn>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────
export default function Website() {
  const { t } = useLang()
  const { user } = useAuth()
  const tc = t.common
  const tw = t.website
  const [website, setWebsite] = useState(null)
  const [showWizard, setShowWizard] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    getOne('website_config').then(d => setWebsite(d))
  }, [])

  const saveWebsite = async (config) => {
    await setOne('website_config', config)
    setWebsite(config)
    setShowWizard(false)
    // Save slug → user_id mapping for public access
    if (config.title && user?.id) {
      const slug = config.title.toLowerCase().replace(/\s+/g, '')
      await supabase.from('public_pages').upsert(
        { user_id: user.id, slug, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
    }
  }

  const deleteWebsite = async () => {
    await setOne('website_config', null)
    setWebsite(null)
    // Remove slug mapping
    if (user?.id) {
      await supabase.from('public_pages').delete().eq('user_id', user.id)
    }
  }

  if (showWizard) {
    return <WebsiteWizard initial={website} onSave={saveWebsite} onCancel={() => setShowWizard(false)} />
  }

  return (
    <div>
      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {website && (
          <HoverBtn onClick={() => setShowInfo(!showInfo)}
            style={{ background: showInfo ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.05)', borderColor: showInfo ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.12)', color: showInfo ? gold : '#4a4842', boxShadow: showInfo ? '0 0 12px rgba(212,175,55,0.12)' : 'none' }}
            hoverStyle={{ background: 'rgba(212,175,55,0.1)', borderColor: 'rgba(212,175,55,0.3)', color: gold, transform: 'translateY(-1px)' }}>
            <Info size={14} /> {tc.info}
          </HoverBtn>
        )}

        <HoverBtn onClick={() => setShowWizard(true)}
          style={{ background: `linear-gradient(135deg, ${gold}, #b8962e)`, borderColor: 'rgba(212,175,55,0.4)', color: '#fff', boxShadow: '0 0 14px rgba(212,175,55,0.2)' }}
          hoverStyle={{ background: `linear-gradient(135deg, #e8c84a, ${gold})`, boxShadow: '0 0 22px rgba(212,175,55,0.35)', transform: 'translateY(-1px)' }}>
          {website ? tw.editWebsite : tw.newWebsite}
        </HoverBtn>

        {website && (
          <HoverBtn onClick={deleteWebsite}
            style={{ background: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.2)', color: '#f87171' }}
            hoverStyle={{ background: 'rgba(248,113,113,0.14)', borderColor: 'rgba(248,113,113,0.4)', transform: 'translateY(-1px)' }}>
            <RotateCcw size={14} /> {tw.reset}
          </HoverBtn>
        )}
      </div>

      {/* Info panel */}
      {showInfo && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 16,
          animation: 'fade-up 0.18s ease-out',
        }}>
          <Globe size={16} style={{ color: gold, flexShrink: 0, marginTop: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: gold }}>{tw.websiteBuilder}</span>
            <span style={{ fontSize: 12, color: '#8a8478', lineHeight: 1.6 }}>
              {tw.websiteBuilderInfo}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      {!website ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#4a4842', fontSize: 13 }}>
          {tw.empty}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Left: Config summary */}
          <div style={{ flex: '1 1 300px', ...S.card, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Globe size={14} style={{ color: gold }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#e8e2d4' }}>{website.title}</span>
            </div>

            {/* Public URL */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)',
              borderRadius: 10, marginBottom: 12,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: gold, flexShrink: 0, animation: 'glow-pulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 11, color: 'var(--input-text)', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {window.location.origin}/s/{website.title.toLowerCase().replace(/\s+/g, '')}
              </span>
              <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/s/${website.title.toLowerCase().replace(/\s+/g, '')}`)
              }} style={{
                fontSize: 10, fontWeight: 600, color: gold, background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.25)', borderRadius: 6, padding: '4px 10px',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,0.1)'}>
                {tw.copy}
              </button>
              <button onClick={() => window.open(`/s/${website.title.toLowerCase().replace(/\s+/g, '')}`, '_blank')} style={{
                fontSize: 10, fontWeight: 600, color: gold, background: 'none',
                border: '1px solid rgba(212,175,55,0.2)', borderRadius: 6, padding: '4px 10px',
                cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4,
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                {tw.open} <ExternalLink size={10} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {website.tagline && (
                <div>
                  <span style={S.label}>{tw.tagline}</span>
                  <span style={{ fontSize: 12, color: '#8a8478' }}>{website.tagline}</span>
                </div>
              )}
              <div>
                <span style={S.label}>{tw.primaryColor}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: website.primaryColor, boxShadow: `0 0 8px ${website.primaryColor}40` }} />
                  <span style={{ fontSize: 11, color: '#5a5548', fontFamily: 'monospace' }}>{website.primaryColor}</span>
                </div>
              </div>
              <div>
                <span style={S.label}>{tw.sections}</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(website.sections || []).map(s => (
                    <span key={s} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)', color: gold }}>
                      {tw[SECTION_OPTIONS.find(o => o.key === s)?.tLabel] || s}
                    </span>
                  ))}
                </div>
              </div>
              {Object.keys(website.socials || {}).filter(k => website.socials[k]).length > 0 && (
                <div>
                  <span style={S.label}>{tw.socialLinks}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {Object.entries(website.socials || {}).filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#5a5548', width: 60, textTransform: 'capitalize' }}>{k}</span>
                        <span style={{ fontSize: 10, color: '#4a4842', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Live preview */}
          <div style={{ flex: '1 1 380px' }}>
            <div style={{ ...S.card, overflow: 'hidden' }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4a4842' }}>{tw.websitePreview}</span>
              </div>
              <div style={{ padding: 16 }}>
                <WebsitePreview config={website} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
