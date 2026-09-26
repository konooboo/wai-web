import { Koru } from '../components/Koru'
import { BOOK_DEMO_HREF } from '../content'

export function Footer() {
  return (
    <footer className="overflow-hidden bg-white">
      <div className="text-muted mx-auto max-w-6xl px-6 pt-6 text-xs">
        <div className="flex flex-wrap justify-between gap-6">
          <p>© 2026 Wai. Made in Christchurch, NZ.</p>
          <div className="flex gap-6">
            <a href="#farm-map" className="hover:text-ink">
              How it works
            </a>
            <a href="#faq" className="hover:text-ink">
              FAQ
            </a>
            <a href={BOOK_DEMO_HREF} className="hover:text-ink">
              Book a demo
            </a>
          </div>
        </div>
        <div className="mt-4 flex gap-6">
          <a href="#" className="hover:text-ink">
            Legal
          </a>
          <a href="#" className="hover:text-ink">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-ink">
            Cookie Settings
          </a>
        </div>
      </div>
      <div
        aria-hidden
        className="font-logo pointer-events-none -mt-[1.5vw] -mb-[0.22em] flex justify-center text-[29vw] leading-none font-semibold tracking-tight [font-stretch:125%] select-none"
      >
        <span className="from-mint bg-linear-to-b to-white bg-clip-text text-transparent">
          Wai
        </span>
        {/* 1000 units = the 1em line box, so the gradient matches the text. */}
        <Koru
          viewBox="0 0 1000 1000"
          paint="url(#footer-fade)"
          className="h-[1em]"
        >
          <defs>
            <linearGradient
              id="footer-fade"
              gradientUnits="userSpaceOnUse"
              x2="0"
              y2="1000"
            >
              <stop offset="0" stopColor="var(--color-mint)" />
              <stop offset="1" stopColor="#fff" />
            </linearGradient>
          </defs>
        </Koru>
      </div>
    </footer>
  )
}
