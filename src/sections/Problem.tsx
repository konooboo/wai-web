import { motion } from 'motion/react'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { READING_INTERVAL_MIN } from '../content'

const TITLE = 'A problem can start the day after you check.'
const INTRO =
  'Most farms check troughs, streams and paddocks on foot or by bike. A leak or run-off that starts after one check runs until the next.'

// Position of "Leak starts" on the timeline, as a percentage of its width.
const LEAK_AT = 25

const EFFECTS = [
  {
    label: 'Water',
    // TODO(data): typical number of days a leak runs before someone finds it, from interviews
    figure: '[X] days',
    body: 'Slow leaks are often not found for a long time. A trough or pipe loses water every hour until the next check.',
    source: {
      label: 'DairyNZ',
      href: 'https://www.dairynz.co.nz/environment/water-use/water-use-overview/',
    },
  },
  {
    label: 'Fertiliser cost',
    figure: '+43%',
    body: 'Nitrogen fertiliser costs an average dairy farm 43% more this spring. Fertiliser that washes off in rain is money lost.',
    source: {
      label: 'Ravensdown via NZ Herald, 20/07/2026',
      href: 'https://www.nzherald.co.nz/business/companies/agribusiness/fertiliser-prices-surge-for-nz-farmers-as-middle-east-conflict-escalates/TXCTPPZPBRHXZEEHLJI5563UEE/',
    },
  },
  {
    label: 'Nitrogen rules',
    // TODO(data): confirm the 190 kg cap is still in force before launch
    figure: '190 kg N/ha',
    body: 'Pastoral farms can apply at most 190 kg of synthetic nitrogen per hectare each year. After the cap, Canterbury farms used 30% less and Southland farms 41% less.',
    source: {
      label: 'Our Land and Water, 19/06/2024',
      href: 'https://ourlandandwater.nz/news/new-rules-reduce-nitrogen-on-dairy-farms/',
    },
  },
]

const monoLabel = 'font-mono text-xs tracking-wider uppercase'

function GapTimeline() {
  return (
    <div className="border-line space-y-10 rounded-2xl border bg-white p-6 md:p-8">
      <div>
        <p className={`${monoLabel} text-muted`}>Manual checks</p>
        <div className="relative mt-4 h-4">
          <div className="bg-line absolute inset-x-0 top-1/2 h-px" />
          <div className="bg-ink absolute top-0 left-0 h-4 w-px" />
          <div className="bg-ink absolute top-0 right-0 h-4 w-px" />
          <motion.div
            className="bg-alert absolute top-1/2 right-0 h-1 origin-left -translate-y-1/2 rounded-full"
            style={{ left: `${LEAK_AT}%` }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1.4, delay: 0.3, ease: 'linear' }}
          />
        </div>
        <div className="relative mt-3 h-4">
          <span className={`${monoLabel} text-muted absolute left-0`}>
            Check
          </span>
          <span
            className={`${monoLabel} text-alert absolute`}
            style={{ left: `${LEAK_AT}%` }}
          >
            Leak starts
          </span>
          {/* TODO(data): usual days between checks, from interviews */}
          <span className={`${monoLabel} text-muted absolute right-0`}>
            Found day [X]
          </span>
        </div>
      </div>

      <div>
        <p className={`${monoLabel} text-muted`}>
          Wai · every {READING_INTERVAL_MIN} min
        </p>
        <div className="relative mt-4 h-4">
          <div className="absolute inset-0 flex justify-between">
            {Array.from({ length: 49 }, (_, i) => (
              <div key={i} className="bg-healthy/60 h-4 w-px" />
            ))}
          </div>
          <motion.div
            className="bg-alert absolute top-1/2 h-1 w-[3%] origin-left -translate-y-1/2 rounded-full"
            style={{ left: `${LEAK_AT}%` }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.2, delay: 0.3 }}
          />
        </div>
        <div className="relative mt-3 h-4">
          <span
            className={`${monoLabel} text-alert absolute`}
            style={{ left: `${LEAK_AT}%` }}
          >
            Alert in {READING_INTERVAL_MIN} min
          </span>
        </div>
      </div>
    </div>
  )
}

export function Problem() {
  return (
    <Section id="problem" className="border-line border-b">
      <SectionHeading eyebrow="The problem" title={TITLE}>
        {INTRO}
      </SectionHeading>

      <Reveal className="mt-12">
        <GapTimeline />
      </Reveal>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {EFFECTS.map((effect, i) => (
          <Reveal key={effect.label} delay={i * 0.1} className="h-full">
            <div className="border-line flex h-full flex-col rounded-2xl border bg-white p-6">
              <p className={`${monoLabel} text-muted`}>{effect.label}</p>
              <p className="mt-4 text-3xl font-medium tracking-tight tabular-nums">
                {effect.figure}
              </p>
              <p className="text-muted mt-3 text-sm">{effect.body}</p>
              <a
                href={effect.source.href}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-ink mt-auto pt-6 font-mono text-xs underline underline-offset-2"
              >
                {effect.source.label}
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      {/* TODO(data): measured average from interviews. Add a real farmer quote here when one exists. */}
      <p className="text-muted mt-10 text-lg">
        <span className="text-ink font-mono">[X] h</span> a week go on manual
        water and soil checks.
      </p>

      <a
        href="#farm-map"
        className={`${monoLabel} text-healthy hover:text-ink mt-6 inline-block`}
      >
        Wai checks every {READING_INTERVAL_MIN} min. See it on one farm ↓
      </a>
    </Section>
  )
}
