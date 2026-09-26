import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
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
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="border-line bg-paper/95 sticky top-0 z-50 border-b">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:h-[76px]">
        <a
          href="#top"
          aria-label="Wai home"
          className="flex items-center gap-2 text-[28px] leading-none font-bold tracking-tight"
        >
          <Koru className="size-6" />
          wai
        </a>
        <ul className="ml-auto hidden items-center gap-1 text-sm md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`text-ink block rounded-md px-4 py-2.5 transition-colors ${
                  active === link.href ? 'bg-ink/[0.07]' : 'hover:bg-ink/5'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-4 hidden items-center gap-2 text-sm md:flex">
          <button
            type="button"
            className="text-ink hover:bg-ink/5 rounded-md px-4 py-2.5 transition-colors"
          >
            Sign in
          </button>
          <a
            href={BOOK_DEMO_HREF}
            className="bg-ink text-paper hover:bg-ink/85 rounded-full px-5 py-2.5"
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
            animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
            className="bg-ink block h-0.5 w-5"
          />
          <motion.span
            animate={{ opacity: open ? 0 : 1 }}
            className="bg-ink block h-0.5 w-5"
          />
          <motion.span
            animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
            className="bg-ink block h-0.5 w-5"
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
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-ink text-left"
              >
                Sign in
              </button>
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
