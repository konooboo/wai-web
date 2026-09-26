const links = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#hardware', label: 'Hardware' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

export function Nav() {
  return (
    <header className="border-line bg-paper/80 sticky top-0 z-50 border-b backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="text-2xl font-medium tracking-tight">
          Wai
        </a>
        <ul className="hidden gap-8 text-sm md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-muted hover:text-ink">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 text-sm">
          <button type="button" className="text-muted hover:text-ink px-3 py-2">
            Sign in
          </button>
          <a
            href="#contact"
            className="bg-ink text-paper hover:bg-ink/85 rounded-full px-4 py-2"
          >
            Book a demo
          </a>
        </div>
      </nav>
    </header>
  )
}
