import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Reshaped } from 'reshaped'
import 'reshaped/themes/reshaped/theme.css'
import 'reshaped/themes/reshaped/media.css'
import i18n from './i18n'
import './index.css'
import App from './App.tsx'
import { readStoredColorMode } from './colorModeStorage'
import { PersistColorMode } from './PersistColorMode'

function mount() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Reshaped theme="reshaped" defaultColorMode={readStoredColorMode()}>
        <PersistColorMode />
        <App />
      </Reshaped>
    </StrictMode>,
  )
}

// i18n.init() is synchronous when resources are bundled — but wait for it just in case
if (i18n.isInitialized) {
  mount()
} else {
  i18n.on('initialized', mount)
}
