import { motion, useReducedMotion } from 'motion/react'
import productPhoto from '../assets/product-photo.jpeg'
import { Koru } from '../components/Koru'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { READING_INTERVAL_MIN } from '../content'

const INTRO = `One low-power unit per site. It takes a reading every ${READING_INTERVAL_MIN} min and sends it to the app by LoRa radio.`

const SPECS: { label: string; value: string; detail: string }[] = [
  {
    label: 'Water and soil',
    value: 'Level and moisture',
    detail:
      'Tank and trough level as % full · soil wet\u00a0% · in a trough, it shows if the probe is in water',
  },
  {
    label: 'Location and radio',
    value: 'GPS and LoRa',
    detail:
      'GPS position on each reading shows if a unit moves · LoRa covers several hectares with no cell coverage',
  },
  {
    label: 'Power',
    value: 'Solar powered',
    detail: 'Renewable · sustainable',
  },
]

const AI_TITLE = 'Wai AI checks every reading.'
const AI_COPY =
  'For each alert, it writes what is wrong, the likely cause, what to do now and the risk over the next 24–\u206048\u00a0h.'

const ALERTS = [
  { name: 'Water low', detail: 'Tank or trough level' },
  { name: 'Soil too dry or too wet', detail: 'Soil moisture' },
  { name: 'Unit moved', detail: 'Outside its GPS boundary' },
  { name: 'Unit offline', detail: 'No packet received' },
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
              The hardware.
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
      </div>
    </Section>
  )
}
