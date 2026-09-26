import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { BOOK_DEMO_HREF } from '../content'

// Software fee only. The farmer does not buy hardware. NZD per station per month, excl. GST.
const COLUMNS = [
  {
    label: 'Wai software',
    price: '$99',
    unit: 'per station per month · excl. GST',
    items: [
      'Mobile app for every user',
      'AI alerts and suggestions',
      'Compliance reports',
      'Support',
    ],
  },
  {
    label: 'Hardware',
    price: '$0',
    unit: 'zero upfront costs',
    items: ['Water and soil sensor stations', 'Installation on your farm'],
  },
]

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
        <div className="border-line rounded-2xl border bg-white">
          <div className="divide-line grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
            {COLUMNS.map((col) => (
              <div key={col.label} className="p-6 md:p-10">
                <p className="text-muted font-mono text-xs tracking-wider uppercase">
                  {col.label}
                </p>
                <p className="mt-2 text-5xl font-medium tracking-tight tabular-nums">
                  {col.price}
                </p>
                <p className="text-muted mt-2 font-mono text-sm">{col.unit}</p>
                <ul className="border-line mt-8 space-y-3 border-t pt-8">
                  {col.items.map((item) => (
                    <li key={item} className="text-muted flex gap-3 text-sm">
                      <span className="bg-healthy mt-2 size-1.5 shrink-0 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-line flex flex-col gap-4 border-t p-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
            <p className="text-muted font-mono text-sm">
              Larger farms pay less per station. We quote.
            </p>
            <a
              href={BOOK_DEMO_HREF}
              className="bg-ink text-paper hover:bg-ink/85 self-start rounded-full px-6 py-3 sm:self-auto"
            >
              Book a demo
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
