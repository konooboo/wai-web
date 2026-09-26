import { motion, useReducedMotion } from 'motion/react'
import farmlandPhoto from '../assets/farmland-aerial.jpeg'
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

// Each alert with what Wai AI adds: the prediction, how it is worked out and the next step.
// Example values, worded as the app shows them. TODO(data): confirm with the team.
const ALERTS = [
  {
    name: 'Water low',
    value: 'Runs dry in 6 h',
    detail: 'Level trend over the last 6 h · alert below 25\u00a0% full',
    action: 'Check the ball valve and inlet',
  },
  {
    name: 'Soil too dry or too wet',
    value: 'Wait for rain',
    detail: 'Soil moisture plus the 48 h rain forecast',
    action: 'Hold fertiliser until rain is due',
  },
  {
    name: 'Unit moved',
    value: '62 m from home',
    detail: 'Three GPS fixes outside its 50 m boundary',
    action: 'Open the map, then go and check it',
  },
  {
    name: 'Unit offline',
    value: 'Last heard 40 min ago',
    detail: 'Usually reports every 5 min',
    action: 'Check the bridge and the unit has power',
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
        src={farmlandPhoto}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-sm"
      />
      <div className="border-paper/10 bg-ink/95 relative overflow-hidden rounded-2xl border *:-ml-px *:first:-mt-px">
        <div className="grid lg:grid-cols-3">
          <div className={`${cell} lg:col-span-2`}>
            <p className="text-paper/60 flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
              <span className="bg-healthy size-1.5 rounded-full" />
              Hardware
            </p>
            <h2 className="mt-4 text-4xl leading-tight font-medium tracking-tight md:text-5xl">
              Built for the outdoors.
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
                <p className="text-paper/60 font-mono text-xs tracking-wider uppercase">
                  {alert.name}
                </p>
                <p className="mt-4 text-2xl font-medium tracking-tight">
                  {alert.value}
                </p>
                <p className="text-paper/60 mt-2 text-sm">{alert.detail}</p>
                <p className="text-mint mt-4 text-sm drop-shadow-[0_0_8px_var(--color-healthy)]">
                  <span className="font-mono text-xs tracking-wider uppercase">
                    Next
                  </span>{' '}
                  {alert.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
