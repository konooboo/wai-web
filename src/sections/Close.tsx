import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { BOOK_DEMO_HREF } from '../content'

function QrPlaceholderIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="text-muted"
    >
      <rect
        x="4"
        y="4"
        width="14"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="30"
        y="4"
        width="14"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="4"
        y="30"
        width="14"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect x="8" y="8" width="6" height="6" fill="currentColor" />
      <rect x="34" y="8" width="6" height="6" fill="currentColor" />
      <rect x="8" y="34" width="6" height="6" fill="currentColor" />
      <rect x="30" y="30" width="4" height="4" fill="currentColor" />
      <rect x="38" y="30" width="4" height="4" fill="currentColor" />
      <rect x="30" y="38" width="4" height="4" fill="currentColor" />
      <rect x="38" y="38" width="4" height="4" fill="currentColor" />
    </svg>
  )
}

export function Close() {
  return (
    <Section id="close" className="border-line border-b">
      <div className="grid items-center gap-12 md:grid-cols-[1fr_auto]">
        <Reveal>
          <h2 className="text-4xl leading-tight font-medium tracking-tight md:text-5xl">
            Save [X] hours a week. Catch problems early. Keep proof for
            compliance.
          </h2>
          {/* TODO(data): confirm the hours-saved figure with the team. */}
          <a
            href={BOOK_DEMO_HREF}
            className="bg-ink text-paper hover:bg-ink/85 mt-8 inline-block rounded-full px-6 py-3"
          >
            Book a demo
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex flex-col items-center gap-3">
            <div className="border-muted/40 text-muted flex size-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed">
              <QrPlaceholderIcon />
              <span className="font-mono text-xs tracking-wider uppercase">
                QR code
              </span>
            </div>
            {/* TODO(data): confirm what the QR code should link to. */}
            <p className="text-muted font-mono text-xs">[QR target TBC]</p>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
