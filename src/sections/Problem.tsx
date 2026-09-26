import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'

const TITLE = 'Farming now means proving it, by hand.'
const INTRO =
  'Farms must follow strict water and nutrient rules. Most still check water and soil on foot or by bike. That costs time, water and fertiliser.'

const PROBLEMS = [
  {
    label: 'Compliance',
    icon: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v4h4" />
        <path d="m9 14 2 2 4-4" />
      </>
    ),
    figure: '88%',
    caption: 'of farmers say resource consent is getting harder to get',
    panel: 'bg-alert/10 text-alert',
    title: 'The rules are strict, and a mistake is expensive.',
    body: 'Farms can apply at most 190 kg of synthetic nitrogen per hectare each year, and must report fertiliser use to the council. A breach can cost a person $1M or 18 months in prison, and a company $10M.',
    source: {
      label: 'Farmers Weekly poll, 09/10/2025',
      href: 'https://www.farmersweekly.co.nz/news/consenting-woes-shared-with-visiting-mps/',
    },
  },
  {
    label: 'Time',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    figure: '1 h/day',
    caption: 'on office work and data entry, for the average dairy farmer',
    panel: 'bg-ink/5 text-ink',
    title: 'Checks and records take hours every day.',
    body: 'Before the office work starts, someone drives to each trough, probe and effluent pond to read the numbers. Each check shows one moment. A problem that starts after it runs until the next check.',
    source: {
      label: 'DairyNZ, 21/10/2025',
      href: 'https://www.dairynz.co.nz/news/farm-focus-and-dairynz-partner-to-help-deliver-smarter-faster-benchmarking/',
    },
  },
  {
    label: 'Water and fertiliser',
    icon: (
      <>
        <path d="M12 3s-6 6.5-6 11a6 6 0 0 0 12 0c0-4.5-6-11-6-11z" />
        <path d="M12 19v-5m0 0c0-2 1.5-3 3-3 0 2-1.5 3-3 3z" />
      </>
    ),
    figure: '+43%',
    caption: 'nitrogen fertiliser cost for an average dairy farm this spring',
    panel: 'bg-mint text-healthy',
    title: 'Water and fertiliser go to waste.',
    body: 'Without soil data, farms irrigate soil that is already wet and spread fertiliser before rain. The water is lost, and the nitrogen washes into streams.',
    source: {
      label: 'Ravensdown via NZ Herald, 20/07/2026',
      href: 'https://www.nzherald.co.nz/business/companies/agribusiness/fertiliser-prices-surge-for-nz-farmers-as-middle-east-conflict-escalates/TXCTPPZPBRHXZEEHLJI5563UEE/',
    },
  },
]

const monoLabel = 'font-mono text-xs tracking-wider uppercase'

export function Problem() {
  return (
    <Section id="problem" className="border-line border-b">
      <div className="max-w-2xl">
        <h2 className="text-4xl leading-tight font-medium tracking-tight md:text-5xl">
          {TITLE}
        </h2>
        <p className="text-muted mt-5 text-lg">{INTRO}</p>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
        {PROBLEMS.map((problem, i) => (
          <Reveal key={problem.label} delay={i * 0.1} className="h-full">
            <article className="flex h-full flex-col">
              <div
                className={`flex aspect-[4/3] flex-col justify-between rounded-2xl p-6 ${problem.panel}`}
              >
                <div className="flex items-start justify-between">
                  <p className={monoLabel}>{problem.label}</p>
                  <a
                    href={problem.source.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Source: ${problem.source.label}`}
                    title={`Source: ${problem.source.label}`}
                    className="-m-2 rounded-full p-2 transition-opacity hover:opacity-60"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      {problem.icon}
                    </svg>
                  </a>
                </div>
                <div>
                  <p className="text-5xl font-medium tracking-tight tabular-nums lg:text-6xl">
                    {problem.figure}
                  </p>
                  <p className="text-ink/70 mt-3 max-w-[16rem] text-sm">
                    {problem.caption}
                  </p>
                </div>
              </div>
              <h3 className="mt-6 text-xl font-medium tracking-tight">
                {problem.title}
              </h3>
              <p className="text-muted mt-3 text-sm leading-relaxed">
                {problem.body}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
