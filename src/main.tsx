import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import i18n from './i18n'
import './index.css'
import App from './App.tsx'

function mount() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// i18n.init() is synchronous when resources are bundled — but wait for it just in case
if (i18n.isInitialized) {
  mount()
} else {
  i18n.on('initialized', mount)
}
