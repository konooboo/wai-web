import { motion, useReducedMotion } from 'motion/react'
import productPhoto from '../assets/product-photo.jpeg'
import { Koru } from '../components/Koru'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { READING_INTERVAL_MIN } from '../content'

const INTRO = `Each site gets one low-power unit. It reads every ${READING_INTERVAL_MIN}\u00a0min and sends the data to the Wai app over LoRa radio.`

const SPECS: { label: string; value: string; detail: string }[] = [
  {
    label: 'Water and soil',
    value: 'Level and moisture',
    detail:
      'Tank and trough level as % full · soil moisture as wet\u00a0% · detects an empty trough',
  },
  {
    label: 'Location and radio',
    value: 'GPS and LoRa',
    detail:
      'GPS shows if a unit moves · LoRa reaches across several hectares with no cell coverage',
  },
  {
    label: 'Power',
    value: 'Solar powered',
    detail: 'Runs on renewable, sustainable energy',
  },
]

const AI_TITLE = 'Wai AI watches every reading.'
const AI_COPY =
  'When something needs attention, it tells you what is wrong, the likely cause, what to do now and the risk over the next 24–\u206048\u00a0h.'

const ALERTS = [
  { name: 'Water low', detail: 'Tank or trough' },
  { name: 'Soil too dry or too wet', detail: 'Soil moisture' },
  { name: 'Unit moved', detail: 'Left its GPS boundary' },
  { name: 'Unit offline', detail: 'Stopped reporting' },
]

// Example outputs, worded as the app shows them. TODO(data): confirm with the team.
const PREDICTIONS: { label: string; value: string; detail: string }[] = [
  {
    label: 'Time to empty',
    value: 'Runs dry in 6 h',
    detail: 'Level trend over the last 6 h · low-level alert at 25 % full',
  },
  {
    label: 'Fertiliser timing',
    value: 'Wait for rain',
    detail:
      'Soil moisture plus the 48 h rain forecast · Apply now, Wait for rain, or Too wet',
  },
  {
    label: 'Trough visits',
    value: '14 visits today',
    detail:
      'Counted from the level sensor: an animal at the trough reads closer than the water',
  },
]

const cell = 'border-paper/10 relative border-t border-l p-6 md:p-8'

export function Hardware() {
  const reduceMotion = useReducedMotion()

  return (
    <Section
      id="hardware"
      className="bg-ink text-paper relative overflow-hidden"
    >
      <img
        src={productPhoto}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-15 blur-2xl"
      />
      <div className="border-paper/10 relative border-r border-b">
        <div className="grid lg:grid-cols-3">
          <div className={`${cell} lg:col-span-2`}>
            <p className="text-paper/60 flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
              <span className="bg-healthy size-1.5 rounded-full" />
              Hardware
            </p>
            <h2 className="mt-4 text-4xl leading-tight font-medium tracking-tight md:text-5xl">
              Built for the paddock.
            </h2>
          </div>
          <div className={`${cell} flex items-center`}>
            <p className="text-paper/70 text-lg">{INTRO}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3">
          {SPECS.map((spec, i) => (
            <Reveal key={spec.label} delay={i * 0.05} className={cell}>
              <span className="bg-healthy absolute -top-px left-6 h-0.5 w-6 md:left-8" />
              <p className="text-paper/60 font-mono text-xs tracking-wider uppercase">
                {spec.label}
              </p>
              <p className="mt-6 text-3xl font-medium tracking-tight">
                {spec.value}
              </p>
              <p className="text-paper/60 mt-4">{spec.detail}</p>
            </Reveal>
          ))}
        </div>

        <div className="bg-healthy/[0.06] grid lg:grid-cols-3">
          <div className={`${cell} overflow-hidden`}>
            <span className="bg-healthy absolute -top-px left-6 h-0.5 w-6 md:left-8" />
            <motion.span
              aria-hidden="true"
              className="bg-healthy/30 absolute top-2 left-2 size-32 rounded-full blur-3xl"
              animate={reduceMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative flex items-center gap-3">
              <Koru className="text-mint size-7 drop-shadow-[0_0_10px_var(--color-healthy)]" />
              <p className="text-mint font-mono text-xs tracking-wider uppercase">
                Wai AI
              </p>
            </div>
            <p className="relative mt-6 text-3xl font-medium tracking-tight md:text-4xl">
              {AI_TITLE}
            </p>
            <p className="text-paper/70 relative mt-4">{AI_COPY}</p>
          </div>
          <div className="grid grid-cols-2 lg:col-span-2">
            {ALERTS.map((alert) => (
              <div
                key={alert.name}
                className="border-paper/10 border-t border-l p-6 md:p-8"
              >
                <p className="text-lg">{alert.name}</p>
                <p className="text-paper/50 mt-2 font-mono text-xs tracking-wider uppercase">
                  {alert.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-healthy/[0.06]">
          <p className="text-mint border-paper/10 border-t border-l px-6 pt-6 font-mono text-xs tracking-wider uppercase md:px-8">
            Predictions
          </p>
          <div className="grid sm:grid-cols-3">
            {PREDICTIONS.map((p, i) => (
              <Reveal key={p.label} delay={i * 0.05} className={cell}>
                <span className="bg-healthy absolute -top-px left-6 h-0.5 w-6 md:left-8" />
                <p className="text-paper/60 font-mono text-xs tracking-wider uppercase">
                  {p.label}
                </p>
                <p className="mt-6 text-3xl font-medium tracking-tight">
                  {p.value}
                </p>
                <p className="text-paper/60 mt-4">{p.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
