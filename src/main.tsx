import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Hide the loading screen when the fonts and the hero model are ready, or
// after 4 s. The mark and its ping start 200 ms after the first paint (see
// index.html). If the mark is visible, wait for the end of the current ping.
const PING_MS = 1400
const loader = document.getElementById('loader')!
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const finish = () => {
  loader.remove()
  try {
    sessionStorage.setItem('wai:loaded', '1')
  } catch {
    // Storage is blocked. The loader shows again on the next load.
  }
  window.dispatchEvent(new Event('wai:loader-done'))
}

if (document.documentElement.classList.contains('no-loader')) {
  finish()
} else {
  const sceneReady = new Promise((resolve) =>
    window.addEventListener('wai:scene-ready', resolve, { once: true }),
  )
  const ready = Promise.all([document.fonts.ready, sceneReady]).then(() => {
    if (!loader.dataset.shown) return
    const shown = performance.now() - Number(loader.dataset.shown)
    return wait(PING_MS - (shown % PING_MS))
  })
  Promise.race([ready, wait(4000 - performance.now())]).then(() => {
    loader.classList.add('done')
    const onEnd = (e: TransitionEvent) => {
      if (e.target === loader) finish()
    }
    loader.addEventListener('transitionend', onEnd)
    setTimeout(() => loader.isConnected && finish(), 700)
  })
}
