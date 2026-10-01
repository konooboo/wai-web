import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Koru } from '../components/Koru'
import { BOOK_DEMO_HREF } from '../content'

const links = [
  { href: '#farm-map', label: 'How it works' },
  { href: '#hardware', label: 'Hardware' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [overHero, setOverHero] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const clear = overHero && !open

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActive(`#${visible.target.id}`)
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const hero = document.getElementById('top')
    const header = headerRef.current
    if (!hero || !header) return
    const observer = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` },
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let last = false
    const onScroll = () => {
      const next = window.scrollY > 0
      if (next === last) return
      last = next
      setScrolled(next)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,color,backdrop-filter] duration-300 ${
        clear
          ? `text-paper border-transparent ${scrolled ? 'bg-ink/40 backdrop-blur-2xl' : 'bg-transparent'}`
          : 'border-line bg-paper/95 text-ink'
      }`}
    >
      <nav className="flex h-16 items-center justify-between px-6 md:h-[76px] md:px-10">
        <a
          href="#top"
          aria-label="Wai home"
          className="font-logo flex items-center gap-2 text-[28px] leading-none font-semibold tracking-tight [font-stretch:125%]"
        >
          <Koru className="size-6" />
          wai
        </a>
        <ul className="ml-auto hidden items-center gap-2 text-sm md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`block rounded-full border px-4 py-2 transition-colors ${
                  clear
                    ? 'border-paper/15 hover:bg-paper/10'
                    : active === link.href
                      ? 'border-line bg-ink/[0.07]'
                      : 'border-line hover:bg-ink/5'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-4 hidden items-center gap-2 text-sm md:flex">
          <a
            href="/login"
            className={`rounded-full border px-4 py-2 transition-colors ${
              clear
                ? 'border-paper/15 hover:bg-paper/10'
                : 'border-line hover:bg-ink/5'
            }`}
          >
            Sign in
          </a>
          <a
            href={BOOK_DEMO_HREF}
            className={`rounded-full border border-transparent px-5 py-2 transition-colors ${
              clear
                ? 'bg-paper text-ink hover:bg-paper/85'
                : 'bg-ink text-paper hover:bg-ink/85'
            }`}
          >
            Book a demo
          </a>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0, y: open ? 8 : 0 }}
            className="block h-0.5 w-5 bg-current"
          />
          <motion.span
            animate={{ opacity: open ? 0 : 1 }}
            className="block h-0.5 w-5 bg-current"
          />
          <motion.span
            animate={{ rotate: open ? -45 : 0, y: open ? -8 : 0 }}
            className="block h-0.5 w-5 bg-current"
          />
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-line bg-paper overflow-hidden border-t md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={
                      active === link.href
                        ? 'text-ink block py-2'
                        : 'text-muted hover:text-ink block py-2'
                    }
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-line flex flex-col gap-3 border-t px-6 py-4 text-sm">
              <a
                href="/login"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-ink text-left"
              >
                Sign in
              </a>
              <a
                href={BOOK_DEMO_HREF}
                onClick={() => setOpen(false)}
                className="bg-ink text-paper hover:bg-ink/85 rounded-full px-4 py-3 text-center"
              >
                Book a demo
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
