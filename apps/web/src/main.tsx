import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configureApi } from '@emour/core'
import './index.css'
import App from './App'

configureApi(import.meta.env.VITE_API_URL ?? '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
