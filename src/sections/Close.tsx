import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { APP_URL, BOOK_DEMO_HREF } from '../content'
import qrApp from '../assets/qr-app.svg'

export function Close() {
  return (
    <Section id="close" className="border-line border-b">
      <div className="grid items-center gap-12 md:grid-cols-[1fr_auto]">
        <Reveal>
          <h2 className="text-4xl leading-tight font-medium tracking-tight md:text-5xl">
            Save 7+ hours a week. Catch problems early. Keep proof for
            compliance.
          </h2>
          <a
            href={BOOK_DEMO_HREF}
            className="bg-ink text-paper hover:bg-ink/85 mt-8 inline-block rounded-full px-6 py-3"
          >
            Book a demo
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex flex-col items-center gap-3">
            <a
              href={APP_URL}
              className="border-line rounded-2xl border bg-white p-4"
            >
              <img
                src={qrApp}
                width={128}
                height={128}
                loading="lazy"
                decoding="async"
                alt="QR code: open the Wai app"
                className="size-32"
              />
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
