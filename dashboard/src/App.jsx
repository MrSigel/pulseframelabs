import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import WagerBar from './pages/WagerBar'
import PersonalBests from './pages/PersonalBests'
import SlotRequests from './pages/SlotRequests'
import Bonushunts from './pages/Bonushunts'
import Tournaments from './pages/Tournaments'
import Bossfight from './pages/Bossfight'
import Hotwords from './pages/Hotwords'
import Predictions from './pages/Predictions'
import Join from './pages/Join'
import Chat from './pages/Chat'
import TwitchChatbot from './pages/TwitchChatbot'
import Website from './pages/Website'
import PointsBattle from './pages/PointsBattle'
import StreamPoints from './pages/StreamPoints'
import Shop from './pages/Shop'
import Settings from './pages/Settings'
import Support from './pages/Support'
import ResetPassword from './pages/ResetPassword'
import StreamerPage from './pages/StreamerPage'
import LandingPage from './pages/LandingPage'
import OverlayPage from './pages/OverlayPage'
import PageTransition from './components/PageTransition'

function ProtectedLayout() {
  const { theme: th } = useTheme()
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: th.bg, transition: 'background 0.4s' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-7" style={{ color: th.text }}>
        <PageTransition>
          <Routes>
            <Route path="/"                element={<Dashboard />} />
            <Route path="/wager"             element={<WagerBar />} />
            <Route path="/personal-bests"   element={<PersonalBests />} />
            <Route path="/slot-requests"    element={<SlotRequests />} />
            <Route path="/bonushunts"      element={<Bonushunts />} />
            <Route path="/tournaments"     element={<Tournaments />} />
            <Route path="/bossfight"       element={<Bossfight />} />
            <Route path="/hotwords"         element={<Hotwords />} />
            <Route path="/predictions"     element={<Predictions />} />
            <Route path="/join"            element={<Join />} />
            <Route path="/chat"            element={<Chat />} />
            <Route path="/twitch-chatbot"  element={<TwitchChatbot />} />
            <Route path="/website"          element={<Website />} />
            <Route path="/points-battle"   element={<PointsBattle />} />
            <Route path="/stream-points"   element={<StreamPoints />} />
            <Route path="/shop"            element={<Shop />} />
            <Route path="/settings"        element={<Settings />} />
            <Route path="/support"         element={<Support />} />
            <Route path="/reset-password"  element={<ResetPassword />} />
            <Route path="*"                element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </main>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  // Twitch OAuth callback — redirect to chatbot page with hash
  if (window.location.pathname === '/auth/twitch/callback' && window.location.hash.includes('access_token')) {
    window.location.replace('/twitch-chatbot' + window.location.hash)
    return null
  }

  // Public routes — no auth required
  const isOverlay = window.location.pathname.startsWith('/overlay/')
  const isStreamerPage = window.location.pathname.startsWith('/s/')

  if (isOverlay || isStreamerPage) {
    return (
      <Routes>
        <Route path="/overlay/:type" element={<OverlayPage />} />
        <Route path="/s/:name" element={<StreamerPage />} />
      </Routes>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08081a] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    )
  }

  return <ProtectedLayout />
}
