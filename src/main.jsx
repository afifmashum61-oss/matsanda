import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Auto-refresh when new version is deployed to Vercel
registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
