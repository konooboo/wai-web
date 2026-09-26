import { BOOK_DEMO_HREF } from '../content'

export function Footer() {
  return (
    <footer className="overflow-hidden bg-white">
      <div className="text-muted mx-auto max-w-6xl px-6 pt-10 text-xs">
        <div className="flex flex-wrap justify-between gap-6">
          <p>© 2026 Wai. Made in Christchurch, NZ.</p>
          <div className="flex gap-6">
            <a href="#how-it-works" className="hover:text-ink">
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
        <div className="mt-6 flex gap-6">
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
      <p
        aria-hidden
        className="from-mint -mb-[0.22em] bg-linear-to-b to-white bg-clip-text text-center text-[38vw] leading-none font-semibold tracking-tighter text-transparent select-none"
      >
        Wai
      </p>
    </footer>
  )
}
