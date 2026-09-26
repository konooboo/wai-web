import { motion, useReducedMotion } from 'motion/react'
import productPhoto from '../assets/product-photo.jpeg'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { READING_INTERVAL_MIN } from '../content'

const INTRO = `One low-power unit per site. It takes a reading every ${READING_INTERVAL_MIN} min and sends it to the app by LoRa radio.`

const SPECS: { label: string; value: string; detail: string }[] = [
  {
    label: 'Water level',
    value: 'Level and % full',
    detail:
      'Ultrasonic distance, median of 5 pings per reading · % full from the tank depth',
  },
  {
    label: 'Soil moisture',
    value: 'Wet %',
    detail:
      'Calibrated from 0 % in air to 100 % in water · in a trough, it shows if the probe is in water',
  },
  {
    label: 'Location',
    value: 'GPS position',
    detail:
      'Latitude, longitude and altitude · UTC time on each reading · shows if a unit moves',
  },
  {
    label: 'Radio',
    value: 'LoRa',
    detail:
      'Covers several hectares, no cell coverage needed · signal strength (RSSI) and SNR on each packet',
  },
  {
    label: 'Unit health',
    value: 'Self-check',
    detail:
      'Uptime, chip temperature, free memory and firmware version on each reading',
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

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 0C12.6 6.4 17.6 11.4 24 12C17.6 12.6 12.6 17.6 12 24C11.4 17.6 6.4 12.6 0 12C6.4 11.4 11.4 6.4 12 0Z"
      />
    </svg>
  )
}

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
        <div className="grid md:grid-cols-12">
          <div className={`${cell} md:col-span-7`}>
            <p className="text-paper/60 flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
              <span className="bg-healthy size-1.5 rounded-full" />
              Hardware
            </p>
            <h2 className="mt-4 text-4xl leading-tight font-medium tracking-tight md:text-5xl">
              The hardware.
            </h2>
          </div>
          <div className={`${cell} flex items-center md:col-span-5`}>
            <p className="text-paper/70 text-lg">{INTRO}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {SPECS.map((spec, i) => (
            <Reveal key={spec.label} delay={(i % 3) * 0.05} className={cell}>
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

        <div className="bg-healthy/[0.06] grid lg:grid-cols-12">
          <div className={`${cell} overflow-hidden lg:col-span-5`}>
            <span className="bg-healthy absolute -top-px left-6 h-0.5 w-6 md:left-8" />
            <motion.span
              aria-hidden="true"
              className="bg-healthy/30 absolute top-2 left-2 size-32 rounded-full blur-3xl"
              animate={reduceMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative flex items-center gap-3">
              <span className="relative size-7">
                <Sparkle className="text-mint absolute inset-0 drop-shadow-[0_0_10px_var(--color-healthy)]" />
                <Sparkle className="text-mint absolute -top-1.5 -right-2 size-2.5 drop-shadow-[0_0_6px_var(--color-healthy)]" />
              </span>
              <p className="text-mint font-mono text-xs tracking-wider uppercase">
                Wai AI
              </p>
            </div>
            <p className="relative mt-6 text-3xl font-medium tracking-tight md:text-4xl">
              {AI_TITLE}
            </p>
            <p className="text-paper/70 relative mt-4">{AI_COPY}</p>
          </div>
          <div className="grid grid-cols-2 lg:col-span-7">
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
