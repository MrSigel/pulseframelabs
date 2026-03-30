import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
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

  useEffect(() => {
    document.body.style.background = 'transparent'
    document.body.style.backgroundImage = 'none'
    document.documentElement.style.background = 'transparent'
    document.body.classList.add('overlay-mode')
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
    <div style={{ display: 'inline-block', padding: 0, width: '100%' }}>
      <Component />
    </div>
  )
}
