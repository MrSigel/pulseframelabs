import { useEffect, useState, useRef } from 'react'
import { getAll, insert, update, remove, getOne, setOne } from '../lib/store'
import { Plus, Trash2, Save, ToggleLeft, ToggleRight, Bot, ChevronRight, ChevronLeft, Check, ExternalLink, Info, LogIn } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const TWITCH_CLIENT_ID = 'nmme6edyptxv453swqfx76nju93ruo'
const TWITCH_REDIRECT_URI = `${window.location.origin}/auth/twitch/callback`

const getFeatures = (tb) => [
  { key: 'chat_relay',    label: tb.chatRelay,           desc: tb.chatRelayDesc },
  { key: 'slot_requests', label: tb.slotRequestsToggle,  desc: tb.slotRequestsDesc },
  { key: 'quick_guesses', label: tb.quickGuesses,        desc: tb.quickGuessesDesc },
  { key: 'points_battle', label: tb.pointsBattleToggle,  desc: tb.pointsBattleDesc },
  { key: 'loyalty',       label: tb.loyaltyGiveaways,    desc: tb.loyaltyGiveawaysDesc },
]

const fmtTime = (iso) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
const COLORS  = ['text-indigo-400','text-violet-400','text-sky-400','text-emerald-400','text-amber-400','text-rose-400']
const colorFor = (name) => COLORS[(name||'').charCodeAt(0) % COLORS.length]

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 6 },
}

// ── Twitch OAuth ────────────────────────────────────────────────────────────
function startTwitchOAuth() {
  const scopes = 'chat:read+chat:edit+channel:moderate'
  const url = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}&response_type=token&scope=${scopes}`
  window.location.href = url
}

// ── Setup Wizard ────────────────────────────────────────────────────────────
function SetupWizard({ onDone, onCancel, tb, tc, autoToken }) {
  const [form, setForm] = useState({ channel_name: '', bot_username: '' })

  const finish = async () => {
    if (!form.channel_name) return
    const conn = {
      channel_name: form.channel_name.toLowerCase().trim(),
      bot_username: (form.bot_username || form.channel_name).toLowerCase().trim(),
      feature_toggles: {},
    }
    await setOne('twitch_connection', conn)
    onDone(conn, autoToken || '')
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', animation: 'fade-up 0.2s ease-out' }}>

      <div style={{ ...S.card, padding: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={16} style={{ color: '#d4af37' }} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--input-text)', margin: 0 }}>{tb.twitchChannel}</p>
                <p style={{ fontSize: 11, color: '#4a4842', margin: 0 }}>{tb.enterChannel}</p>
              </div>
            </div>
          </div>

          {autoToken && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)' }}>
              <Check size={14} style={{ color:'#34d399' }} />
              <span style={{ fontSize:12, fontWeight:600, color:'#34d399' }}>{tb.twitchConnected}</span>
            </div>
          )}

          <div>
            <label style={S.label}>{tb.channelName}</label>
            <input className="input" placeholder={tb.channelPlaceholder}
              value={form.channel_name} onChange={e => setForm(p => ({ ...p, channel_name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && form.channel_name && finish()} />
          </div>

          <div>
            <label style={S.label}>{tb.botUsername}</label>
            <input className="input" placeholder={tb.botPlaceholder}
              value={form.bot_username} onChange={e => setForm(p => ({ ...p, bot_username: e.target.value }))} />
            <p style={{ fontSize: 10, color: '#4a4842', marginTop: 5 }}>{tb.botHint}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <button onClick={onCancel} style={{
              fontSize: 12, fontWeight: 600, color: '#f87171', background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '6px 14px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(248,113,113,0.15)'; e.currentTarget.style.borderColor='rgba(248,113,113,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(248,113,113,0.08)'; e.currentTarget.style.borderColor='rgba(248,113,113,0.3)' }}>
              {tc.cancel}
            </button>
            <button onClick={finish} disabled={!form.channel_name || !autoToken} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: (form.channel_name && autoToken) ? 'linear-gradient(135deg,#d4af37,#b8962e)' : 'rgba(50,50,80,0.5)',
              border: `1px solid ${(form.channel_name && autoToken) ? 'rgba(212,175,55,0.4)' : 'rgba(50,50,80,0.3)'}`,
              borderRadius: 10, padding: '9px 18px', color: (form.channel_name && autoToken) ? '#fff' : '#3a3a6a',
              fontSize: 13, fontWeight: 600, cursor: (form.channel_name && autoToken) ? 'pointer' : 'not-allowed',
              boxShadow: (form.channel_name && autoToken) ? '0 0 14px rgba(212,175,55,0.25)' : 'none',
              transition: 'all 0.15s',
            }}>
              <Check size={14} /> {tb.completeSetup}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function TwitchChatbot() {
  const { t } = useLang()
  const tc = t.common
  const tb = t.twitchBot
  const [connection, setConnection] = useState(null)
  const [commands, setCommands]     = useState([])
  const [features, setFeatures]     = useState({})
  const [loading, setLoading]       = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [showInfo, setShowInfo]     = useState(false)
  const [cmdForm, setCmdForm]       = useState({ command: '', response: '' })
  const [wsStatus, setWsStatus]     = useState('disconnected')
  const [chatFeed, setChatFeed]     = useState([])
  const [oauthToken, setOauthToken] = useState('')
  const wsRef    = useRef(null)
  const bottomRef = useRef(null)

  // Check for Twitch OAuth callback token in URL hash
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.slice(1))
      const token = params.get('access_token')
      if (token) {
        setOauthToken(token)
        setShowWizard(true)
        // Clean URL
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [])

  useEffect(() => {
    Promise.all([getOne('twitch_connection'), getAll('bot_commands')]).then(([conn, cmds]) => {
      setConnection(conn)
      setCommands(cmds)
      if (conn?.feature_toggles) setFeatures(conn.feature_toggles)
      setLoading(false)
    })
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatFeed])

  const logFeed = (type, text) => setChatFeed(prev => [...prev.slice(-99), { id: Date.now() + Math.random(), system: true, type, text, ts: new Date().toISOString() }])

  const connectIRC = (conn = connection, token = oauthToken) => {
    if (!conn?.channel_name || !token) return
    wsRef.current?.close()
    const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443')
    wsRef.current = ws
    setWsStatus('connecting')
    ws.onopen = () => {
      ws.send(`PASS ${token.startsWith('oauth:') ? token : 'oauth:' + token}`)
      ws.send(`NICK ${conn.bot_username.toLowerCase()}`)
      ws.send(`JOIN #${conn.channel_name.toLowerCase()}`)
      ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands')
      setWsStatus('connected')
      logFeed('system', `Connected to #${conn.channel_name}`)
    }
    ws.onmessage = async (e) => {
      if (e.data.includes('PING')) { ws.send('PONG :tmi.twitch.tv'); return }
      // Parse tags from the raw IRC message
      const tagMatch = e.data.match(/^@([^ ]+) :(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)$/)
      const fallbackMatch = !tagMatch ? e.data.match(/^:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)$/) : null
      let username, message, role = 'viewer'
      if (tagMatch) {
        const [, tagsRaw, user, msg] = tagMatch
        username = user
        message = msg
        const tags = {}
        tagsRaw.split(';').forEach(t => { const [k, v] = t.split('='); tags[k] = v })
        role = tags['mod'] === '1' ? 'moderator' : tags['subscriber'] === '1' ? 'subscriber' : 'viewer'
      } else if (fallbackMatch) {
        const [, user, msg] = fallbackMatch
        username = user
        message = msg
      }
      if (username && message) {
        const ts  = new Date().toISOString()
        const msg = { id: Date.now(), username, message: message.trim(), ts, role }
        setChatFeed(prev => [...prev.slice(-499), msg])
        await insert('chat_messages', { username, message: msg.message, sent_at: ts, user_role: role })
        // Hotword tracking
        const words = msg.message.toLowerCase().split(/\s+/).filter(w => w.length > 1)
        const uniqueWords = [...new Set(words)]
        const hwSettings = await getOne('hotword_settings')
        const excluded = (hwSettings?.excluded_words || []).map(w => w.toLowerCase())
        const hwEntries = await getAll('hotword_entries')

        for (const word of uniqueWords) {
          if (excluded.includes(word)) continue
          const existing = hwEntries.find(e => e.word === word)
          if (existing) {
            await update('hotword_entries', existing.id, { count: (existing.count || 0) + 1 })
          } else {
            await insert('hotword_entries', { word, count: 1 })
          }
        }
        // !join handler (bossfight first, then tournament)
        if (msg.message.toLowerCase().startsWith('!join ')) {
          const gameName = msg.message.slice(6).trim()
          if (gameName) {
            // Check bossfight sessions first
            const bossfights = await getAll('bossfights')
            const activeBf = bossfights.find(b => b.status === 'join_open')
            if (activeBf) {
              const participants = activeBf.participants || []
              if (!participants.find(p => p.username.toLowerCase() === username.toLowerCase())) {
                const updated = [...participants, { username, game: gameName, is_eliminated: false }]
                await update('bossfights', activeBf.id, { participants: updated })
                logFeed('bot', `Bossfight Join: ${username} → ${gameName}`)
              }
            } else {
              // Tournament join (only if no active bossfight)
              const tournaments = await getAll('tournaments')
              const active = tournaments.find(t => t.status === 'join_open')
              if (active) {
                const participants = active.participants || []
                const maxP = active.max_participants || 8
                if (!participants.find(p => p.username.toLowerCase() === username.toLowerCase())) {
                  if (participants.length < maxP) {
                    const updated = [...participants, { username, game: gameName }]
                    await update('tournaments', active.id, { participants: updated })
                    logFeed('bot', `Tournament Join: ${username} → ${gameName}`)
                  }
                }
              }
            }
          }
        }
        // Standalone !join (no arguments = join session)
        if (msg.message.trim().toLowerCase() === '!join') {
          const joinSessions = await getAll('join_sessions')
          const activeJoin = joinSessions.find(s => s.status === 'open')
          if (activeJoin) {
            const participants = await getAll('join_participants')
            const already = participants.find(p => p.session_id === activeJoin.id && p.username.toLowerCase() === username.toLowerCase())
            if (!already) {
              await insert('join_participants', { session_id: activeJoin.id, username })
              logFeed('bot', `Join: ${username}`)
            }
          }
        }
        // !sr slot request handler
        if (msg.message.toLowerCase().trim() === '!sr cancel') {
          const allSR = await getAll('slot_requests')
          const entry = allSR.find(r => r.username.toLowerCase() === username.toLowerCase() && r.status !== 'raffled')
          if (entry) {
            await remove('slot_requests', entry.id)
            logFeed('bot', `Slot Request cancelled: ${username}`)
          }
        } else if (msg.message.toLowerCase().startsWith('!sr ')) {
          const gameName = msg.message.slice(4).trim()
          if (gameName) {
            const cfg = await getOne('slot_request_config')
            if (!cfg || cfg.open !== false) {
              await insert('slot_requests', { username, game: gameName })
              logFeed('bot', `Slot Request: ${username} → ${gameName}`)
            }
          }
        }
        // Number guess handler (any pure number in chat during open session)
        const numMatch = msg.message.trim().match(/^-?\d+(\.\d+)?$/)
        if (numMatch) {
          const sessions = await getAll('guess_sessions')
          const active = sessions.find(s => s.status === 'open')
          if (active) {
            const guess = parseFloat(msg.message.trim())
            const entries = await getAll('guess_entries')
            const existing = entries.find(e => e.session_id === active.id && e.username === username)
            if (existing) {
              await update('guess_entries', existing.id, { guess })
            } else {
              await insert('guess_entries', { session_id: active.id, username, guess })
            }
            logFeed('bot', `Guess: ${username} → ${guess}`)
          }
        }
        // Prediction vote handler (!vote a or !vote b)
        if (msg.message.toLowerCase().startsWith('!vote ')) {
          const choice = msg.message.slice(6).trim().toLowerCase()
          if (choice === 'a' || choice === 'b') {
            const rounds = await getAll('prediction_rounds')
            const active = rounds.find(r => r.status === 'open')
            if (active) {
              const votes = await getAll('prediction_votes')
              const existing = votes.find(v => v.round_id === active.id && v.username === username)
              if (existing) {
                await update('prediction_votes', existing.id, { vote: choice })
              } else {
                await insert('prediction_votes', { round_id: active.id, username, vote: choice })
              }
              logFeed('bot', `Vote: ${username} → Option ${choice.toUpperCase()}`)
            }
          }
        }
        // !bet handler for Points Battle
        if (msg.message.toLowerCase().startsWith('!bet ')) {
          const parts = msg.message.slice(5).trim().split(/\s+/)
          if (parts.length >= 2) {
            const keyword = parts[0].toLowerCase()
            const amount = parseInt(parts[1])
            if (!isNaN(amount) && amount > 0) {
              const sessions = await getAll('points_battle_sessions')
              const active = sessions.find(s => s.status === 'active')
              if (active) {
                const optIdx = (active.options || []).findIndex(o => o.keyword.toLowerCase() === keyword)
                if (optIdx >= 0 && amount >= (active.min_points || 0) && amount <= (active.max_points || 99999)) {
                  const existing = (await getAll('points_battle_bets')).find(b => b.session_id === active.id && b.viewer_username === username)
                  if (!existing) {
                    await insert('points_battle_bets', { session_id: active.id, viewer_username: username, option_index: optIdx, amount })
                    logFeed('bot', `Bet: ${username} → ${amount} pts on ${keyword}`)
                  }
                }
              }
            }
          }
        }
        // !points handler
        if (msg.message.trim().toLowerCase() === '!points') {
          const viewers = await getAll('stream_viewers')
          let viewer = viewers.find(v => v.username?.toLowerCase() === username.toLowerCase())
          if (!viewer) {
            viewer = await insert('stream_viewers', { username, total_points: 0, watch_time_minutes: 0 })
          }
          logFeed('bot', `Points: ${username} → ${viewer.total_points || 0} pts`)
        }
        commands.forEach(cmd => {
          if (cmd.enabled !== false && msg.message.toLowerCase().startsWith(cmd.command.toLowerCase())) {
            ws.send(`PRIVMSG #${conn.channel_name.toLowerCase()} :${cmd.response}`)
            logFeed('bot', `${cmd.command} → ${cmd.response}`)
          }
        })
      }
    }
    ws.onerror = () => { setWsStatus('error'); logFeed('system', 'WebSocket error.') }
    ws.onclose = () => { setWsStatus('disconnected'); logFeed('system', 'Disconnected.') }
  }

  const disconnectIRC = () => { wsRef.current?.close(); wsRef.current = null }

  const addCommand = async () => {
    if (!cmdForm.command || !cmdForm.response) return
    const data = await insert('bot_commands', { command: cmdForm.command, response: cmdForm.response, enabled: true })
    setCommands(prev => [...prev, data])
    setCmdForm({ command: '', response: '' })
  }
  const deleteCommand = async (id) => { await remove('bot_commands', id); setCommands(prev => prev.filter(c => c.id !== id)) }
  const toggleCommand = async (id, enabled) => {
    await update('bot_commands', id, { enabled: !enabled })
    setCommands(prev => prev.map(c => c.id === id ? { ...c, enabled: !enabled } : c))
  }
  const toggleFeature = async (key) => {
    const updated = { ...features, [key]: !features[key] }
    setFeatures(updated)
    const conn = await getOne('twitch_connection')
    if (conn) await setOne('twitch_connection', { ...conn, feature_toggles: updated })
  }

  const statusConfig = { connected: '#34d399', connecting: '#f59e0b', disconnected: '#4a4842', error: '#f87171' }

  if (loading) return null

  // ── Empty state: first visit ─────────────────────────────────────────────
  if (!connection && !showWizard) {
    return (
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <button onClick={startTwitchOAuth} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #9146FF, #772CE8)',
            border: '1px solid rgba(145,70,255,0.4)', borderRadius: 10,
            padding: '10px 18px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 0 14px rgba(212,175,55,0.25)', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 22px rgba(145,70,255,0.45)'; e.currentTarget.style.transform='translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none' }}>
            <LogIn size={14} /> {tb.connectTwitch}
          </button>
        </div>
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>
          {tb.empty}
        </div>
      </div>
    )
  }

  // ── Wizard ───────────────────────────────────────────────────────────────
  if (showWizard) {
    return (
      <SetupWizard
        tb={tb} tc={tc} autoToken={oauthToken}
        onCancel={() => setShowWizard(false)}
        onDone={(conn, token) => {
          setConnection(conn)
          setOauthToken(token)
          setShowWizard(false)
          if (token) connectIRC(conn, token)
        }}
      />
    )
  }

  // ── Dashboard ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Action bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={() => setShowInfo(!showInfo)}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(212,175,55,0.18)'; e.currentTarget.style.borderColor='rgba(212,175,55,0.3)'; e.currentTarget.style.color='#d4af37'; e.currentTarget.style.transform='translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background= showInfo ? 'rgba(212,175,55,0.12)':'rgba(212,175,55,0.08)'; e.currentTarget.style.borderColor= showInfo ? 'rgba(212,175,55,0.35)':'rgba(212,175,55,0.25)'; e.currentTarget.style.color= showInfo ? '#d4af37':'#5a5548'; e.currentTarget.style.transform='none' }}
          style={{ display:'flex', alignItems:'center', gap:6, borderRadius:10, padding:'8px 14px', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s', background: showInfo ? 'rgba(212,175,55,0.12)':'rgba(212,175,55,0.08)', border: `1px solid ${showInfo ? 'rgba(212,175,55,0.35)':'rgba(212,175,55,0.25)'}`, color: showInfo ? '#d4af37':'#5a5548', boxShadow: showInfo ? '0 0 12px rgba(212,175,55,0.12)':'none' }}>
          <Info size={14} /> {tc.info}
        </button>
      </div>

      {showInfo && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:12,
          background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.25)',
          borderRadius:12, padding:'14px 18px',
          animation:'fade-up 0.18s ease-out',
        }}>
          <Bot size={16} style={{ color:'#d4af37', flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#d4af37' }}>{tb.title}</span>
            <span style={{ fontSize:12, color:'#7070a0', lineHeight:1.6 }}>
              {tb.infoText}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

        {/* Connection */}
        <div style={{ ...S.card, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={S.label}>{tb.connection}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusConfig[wsStatus], boxShadow: `0 0 6px ${statusConfig[wsStatus]}`, transition: 'all 0.3s' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: statusConfig[wsStatus] }}>{wsStatus}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
            <p style={{ fontSize: 10, color: '#4a4842', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{tb.channel}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#c8cde8' }}>#{connection.channel_name}</p>
          </div>

          {/* Twitch auth status */}
          {oauthToken ? (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', marginBottom:12, borderRadius:10, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)' }}>
              <Check size={14} style={{ color:'#34d399' }} />
              <span style={{ fontSize:12, fontWeight:600, color:'#34d399', flex:1 }}>{tb.twitchConnected}</span>
            </div>
          ) : (
            <button onClick={startTwitchOAuth} style={{
              display:'flex', alignItems:'center', gap:8, width:'100%', justifyContent:'center',
              padding:'11px 18px', marginBottom:12, borderRadius:10, fontSize:13, fontWeight:700,
              background:'linear-gradient(135deg, #9146FF, #772CE8)', border:'1px solid rgba(145,70,255,0.4)',
              color:'#fff', cursor:'pointer', transition:'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 20px rgba(145,70,255,0.4)'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none' }}>
              <LogIn size={14} /> {tb.connectTwitch}
            </button>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => connectIRC()} disabled={wsStatus === 'connected' || !oauthToken} className="btn-primary">{tb.connect}</button>
            <button onClick={disconnectIRC} disabled={wsStatus === 'disconnected'} className="btn-ghost">{tb.disconnect}</button>
            <button onClick={async () => { await setOne('twitch_connection', null); setConnection(null); setOauthToken(''); wsRef.current?.close() }} className="btn-ghost" style={{ color: '#4a4842' }}>{tc.reset}</button>
          </div>
        </div>

        {/* Feature Toggles */}
        <div style={{ ...S.card, padding: 20 }}>
          <span style={S.label}>{tb.featureToggles}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            {getFeatures(tb).map(f => (
              <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#c8cde8', marginBottom: 2 }}>{f.label}</p>
                  <p style={{ fontSize: 11, color: '#4a4842' }}>{f.desc}</p>
                </div>
                <button onClick={() => toggleFeature(f.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, color: features[f.key] ? '#d4af37' : 'var(--card-border)' }}>
                  {features[f.key] ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commands */}
      <div style={{ ...S.card, padding: 20 }}>
        <span style={S.label}>{tb.customCommands}</span>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, marginTop: 8, flexWrap: 'wrap' }}>
          <input className="input" style={{ width: 130 }} placeholder={tb.commandPlaceholder} value={cmdForm.command} onChange={e => setCmdForm(p => ({ ...p, command: e.target.value }))} />
          <input className="input" style={{ flex: '1 1 200px' }} placeholder={tb.responsePlaceholder} value={cmdForm.response} onChange={e => setCmdForm(p => ({ ...p, response: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addCommand()} />
          <button onClick={addCommand} disabled={!cmdForm.command || !cmdForm.response} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={13} /> {tc.add}
          </button>
        </div>
        {commands.length === 0
          ? <p style={{ fontSize: 12, color: '#4a4842' }}>{tb.noCommands}</p>
          : (
            <div style={{ borderTop: '1px solid #1e1e42' }}>
              {commands.map(cmd => (
                <div key={cmd.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1a1a38' }}>
                  <span style={{ fontSize: 13, fontFamily: 'monospace', width: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: cmd.enabled !== false ? '#fbbf24' : '#4a4842', flexShrink: 0 }}>{cmd.command}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#7a7468', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cmd.response}</span>
                  <button onClick={() => toggleCommand(cmd.id, cmd.enabled !== false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: cmd.enabled !== false ? '#d4af37' : 'var(--card-border)', flexShrink: 0 }}>
                    {cmd.enabled !== false ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => deleteCommand(cmd.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#3a3a6a', transition: 'color 0.15s', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color='#f87171'} onMouseLeave={e => e.currentTarget.style.color='#3a3a6a'}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Live Feed */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #1e1e42' }}>
          <span style={{ ...S.label, marginBottom: 0 }}>{tb.liveFeed}</span>
          <button onClick={() => setChatFeed([])} style={{ fontSize: 11, color: '#4a4842', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color='#6060a0'} onMouseLeave={e => e.currentTarget.style.color='#4a4842'}>
            {tb.clear}
          </button>
        </div>
        <div style={{ height: 176, overflowY: 'auto', padding: '12px 20px' }}>
          {chatFeed.length === 0
            ? <p style={{ fontSize: 12, color: '#4a4842', textAlign: 'center', padding: '16px 0' }}>{tb.connectToSee}</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {chatFeed.map(m => m.system
                  ? <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
                      <span style={{ fontSize: 10, color: '#2e2e5a', fontVariantNumeric: 'tabular-nums', width: 36, flexShrink: 0 }}>{fmtTime(m.ts)}</span>
                      <span style={{ fontSize: 11, color: '#3a3a6a', fontStyle: 'italic' }}>[{m.type}] {m.text}</span>
                    </div>
                  : <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '2px 0' }}>
                      <span style={{ fontSize: 10, color: '#2e2e5a', fontVariantNumeric: 'tabular-nums', width: 36, flexShrink: 0, marginTop: 2 }}>{fmtTime(m.ts)}</span>
                      <span className={`text-[13px] font-semibold shrink-0 ${colorFor(m.username)}`}>{m.username}</span>
                      <span style={{ fontSize: 13, color: '#9090c0', wordBreak: 'break-word', minWidth: 0 }}>{m.message}</span>
                    </div>
                )}
                <div ref={bottomRef} />
              </div>
            )
          }
        </div>
      </div>

    </div>
  )
}
