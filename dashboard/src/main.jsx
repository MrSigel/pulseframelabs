import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import './index.css'

// ── Console Copyright ────────────────────────────────────────────────────
console.log(
  '%c© Pulseframelabs 2026 %c— All rights reserved.',
  'color:#d4af37;font-size:14px;font-weight:700;',
  'color:#8a8478;font-size:12px;'
)
console.log(
  '%chttps://pulseframelabs.com',
  'color:#5a5548;font-size:11px;'
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <App />
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)
