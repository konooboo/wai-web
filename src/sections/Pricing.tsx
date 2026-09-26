import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { BOOK_DEMO_HREF } from '../content'

// Software fee only. The farmer does not buy hardware. NZD per station per month, excl. GST.
const BASE_PRICE = 99

const SOFTWARE = [
  'Mobile app for every user',
  'AI alerts and suggestions',
  'Compliance reports',
  'Support',
]

const HARDWARE = ['Water and soil sensor stations', 'Installation on your farm']

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="text-muted flex gap-3 text-sm">
            <span className="bg-healthy mt-2 size-1.5 shrink-0 rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Pricing() {
  return (
    <Section id="pricing" className="border-line border-b">
      <SectionHeading
        eyebrow="Pricing"
        title="Pay for the software, not the hardware"
      >
        You pay for the software. We supply and install the hardware.
      </SectionHeading>
      <Reveal className="mt-12">
        <div className="border-line grid gap-10 rounded-2xl border bg-white p-6 md:grid-cols-2 md:p-10">
          <div>
            <p className="text-muted font-mono text-xs tracking-wider uppercase">
              Wai software
            </p>
            <p className="mt-2 text-5xl font-medium tracking-tight tabular-nums">
              ${BASE_PRICE}
            </p>
            <p className="text-muted mt-2 font-mono text-sm">
              per station per month · excl. GST
            </p>
            <p className="text-muted border-line mt-8 border-t pt-8 font-mono text-sm">
              Larger farms pay less per station. We quote.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <List title="Included in the software fee" items={SOFTWARE} />
            <List title="Hardware at no cost" items={HARDWARE} />
            <a
              href={BOOK_DEMO_HREF}
              className="bg-ink text-paper hover:bg-ink/85 inline-block self-start rounded-full px-6 py-3"
            >
              Book a demo
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
