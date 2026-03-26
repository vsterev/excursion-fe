import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Reshaped } from 'reshaped'
import 'reshaped/themes/reshaped/theme.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Reshaped theme="reshaped">
      <App />
    </Reshaped>
  </StrictMode>,
)
