import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Hide the loading screen when the fonts and the hero model are ready.
// Show it for at least 600 ms so it does not flash, and at most 5 s.
const sceneReady = new Promise((resolve) =>
  window.addEventListener('wai:scene-ready', resolve, { once: true }),
)
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
Promise.race([
  Promise.all([document.fonts.ready, sceneReady, wait(600)]),
  wait(5000),
]).then(() => {
  const loader = document.getElementById('loader')!
  loader.classList.add('done')
  loader.addEventListener('transitionend', () => loader.remove(), {
    once: true,
  })
})
