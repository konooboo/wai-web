import { Section } from '../components/Section'

const PROOF_ITEMS = [
  {
    figure: '26%',
    label: (
      <>
        of stock drinking water is lost to leaks (
        <a
          href="https://www.dairynz.co.nz/environment/water-use/water-use-overview/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-ink underline underline-offset-2"
        >
          DairyNZ estimate
        </a>
        )
      </>
    ),
  },
  {
    // TODO(data): confirm the number of farmers interviewed
    figure: '[X]',
    label: 'farmers interviewed',
  },
]

export function ProofStrip() {
  return (
    <Section id="proof" className="border-line border-b !py-10 md:!py-14">
      <div className="flex flex-wrap gap-x-12 gap-y-6">
        {PROOF_ITEMS.map((item, i) => (
          <div
            key={i}
            className={`max-w-xs ${i > 0 ? 'border-line border-l pl-12' : ''}`}
          >
            <p className="text-3xl font-medium tracking-tight tabular-nums md:text-4xl">
              {item.figure}
            </p>
            <p className="text-muted mt-2 font-mono text-sm">{item.label}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
