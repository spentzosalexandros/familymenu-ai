import '@fontsource-variable/inter/opsz.css'
import './styles/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { applyDeepLink } from './app/deeplinks'
import { nav } from './app/nav'
import { actions, getState } from './store'

// URL → store (tab, screen, sheet, theme, clock …) before the first render.
applyDeepLink()

// Dev/screenshot hook: window.__fm.nav.toast('…'), __fm.actions.setClock({ time: '16:30' }) …
if (import.meta.env.DEV) Object.assign(window, { __fm: { nav, actions, getState } })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
