import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import BonushuntOverlay  from '../overlays/BonushuntOverlay'
import TournamentOverlay from '../overlays/TournamentOverlay'
import BossfightOverlay  from '../overlays/BossfightOverlay'
import ChatOverlay           from '../overlays/ChatOverlay'
import BotOverlay            from '../overlays/BotOverlay'
import PersonalBestsOverlay  from '../overlays/PersonalBestsOverlay'
import WagerBarOverlay       from '../overlays/WagerBarOverlay'
import SlotRequestsOverlay   from '../overlays/SlotRequestsOverlay'
import HotwordsOverlay       from '../overlays/HotwordsOverlay'
import PredictionsOverlay    from '../overlays/PredictionsOverlay'
import JoinOverlay           from '../overlays/JoinOverlay'

const OVERLAYS = {
  bonushunt:     BonushuntOverlay,
  tournament:    TournamentOverlay,
  bossfight:     BossfightOverlay,
  chat:          ChatOverlay,
  bot:           BotOverlay,
  personalbests: PersonalBestsOverlay,
  wager:         WagerBarOverlay,
  slotrequests:  SlotRequestsOverlay,
  hotwords:      HotwordsOverlay,
  predictions:   PredictionsOverlay,
  join:          JoinOverlay,
}

export default function OverlayPage() {
  const { type } = useParams()
  const [params] = useSearchParams()
  const scale = parseFloat(params.get('scale')) || 1

  useEffect(() => {
    // Transparent background for OBS
    document.body.style.background = 'transparent'
    document.body.style.backgroundImage = 'none'
    document.documentElement.style.background = 'transparent'
    document.body.classList.add('overlay-mode')
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'

    // High-quality rendering
    const style = document.createElement('style')
    style.id = 'overlay-hq'
    style.textContent = `
      * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
      body.overlay-mode { image-rendering: -webkit-optimize-contrast; }
    `
    if (!document.getElementById('overlay-hq')) document.head.appendChild(style)
  }, [])

  const Component = OVERLAYS[type]

  if (!Component) {
    return (
      <div style={{ fontFamily: 'monospace', color: '#555', padding: 16, fontSize: 12 }}>
        Unknown overlay: <b>{type}</b>. Available: {Object.keys(OVERLAYS).join(', ')}
      </div>
    )
  }

  return (
    <div style={{
      display: 'inline-block', padding: 0, width: '100%',
      transform: scale !== 1 ? `scale(${scale})` : 'none',
      transformOrigin: 'top left',
    }}>
      <Component />
    </div>
  )
}
