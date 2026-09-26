import { useReducedMotion } from 'motion/react'
import type { PointerEvent } from 'react'
import farmlandPhoto from '../assets/farmland-aerial.jpeg'
import { Koru } from '../components/Koru'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'

const TITLE = 'Hardware built for NZ.'

const INTRO =
  'Our units monitor your water and soil. Wai AI knows what to do next.'

type Spec = { label: string; value: string; detail?: string }

const SENSOR_SPECS: Spec[] = [
  { label: 'Ultrasonic sensor', value: 'Water level' },
  { label: 'Moisture probe', value: 'Soil moisture' },
  { label: 'Solar, LoRa and GPS', value: 'Works off-grid' },
]

const AI_SPECS: Spec[] = [
  {
    label: 'On every alert',
    value: 'Alert diagnosis',
    detail:
      'The likely cause, two or three steps to fix it and the cost if you wait',
  },
  {
    label: 'On the home screen',
    value: 'Today on the farm',
    detail:
      'Checks every sensor and picks the one job to do today, or tells you all is well',
  },
  {
    label: 'For soil sensors',
    value: 'Fertiliser timing',
    detail:
      'Soil moisture plus the 48\u00a0h rain forecast: Apply now, Wait for rain or Too wet',
  },
]

const ALERT_KINDS = ['Level', 'Soil', 'Water quality', 'Moved', 'Offline']

const cell = 'border-paper/10 relative border-t border-l p-6 md:p-8'

const glow =
  'border-healthy pointer-events-none absolute opacity-0 transition-opacity duration-300 group-data-[glow]:opacity-100'
const glowMask = {
  maskImage:
    'radial-gradient(220px circle at var(--x) var(--y), black 25%, transparent)',
}

function Glow() {
  return (
    <span
      data-glow
      aria-hidden
      className={`${glow} -top-px right-0 bottom-0 -left-px border-t border-l`}
      style={glowMask}
    />
  )
}

function SpecCell({
  spec,
  ai,
  delay,
}: {
  spec: Spec
  ai?: boolean
  delay: number
}) {
  return (
    <Reveal delay={delay} className={cell}>
      <Glow />
      <span className="bg-healthy absolute -top-px left-6 h-0.5 w-6 md:left-8" />
      <p
        className={`flex items-center gap-2 font-mono text-xs tracking-wider uppercase ${ai ? 'text-mint' : 'text-paper/60'}`}
      >
        {ai && <Koru className="size-4" />}
        {spec.label}
      </p>
      <p className="mt-6 text-3xl font-medium tracking-tight">{spec.value}</p>
      {spec.detail && <p className="text-paper/60 mt-4">{spec.detail}</p>}
    </Reveal>
  )
}

export function Hardware() {
  const reduceMotion = useReducedMotion()

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || e.pointerType !== 'mouse') return
    const root = e.currentTarget
    root.dataset.glow = ''
    const els = [...root.querySelectorAll<HTMLElement>('[data-glow]')]
    const rects = els.map((el) => el.getBoundingClientRect())
    els.forEach((el, i) => {
      el.style.setProperty('--x', `${e.clientX - rects[i].left}px`)
      el.style.setProperty('--y', `${e.clientY - rects[i].top}px`)
    })
  }

  return (
    <Section
      id="hardware"
      className="bg-ink text-paper relative overflow-hidden pt-48 md:pt-64"
    >
      <img
        src={farmlandPhoto}
        alt=""
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-sm"
      />
      <div
        className="group relative"
        onPointerMove={onPointerMove}
        onPointerLeave={(e) => delete e.currentTarget.dataset.glow}
      >
        <div className="border-paper/10 bg-ink/95 relative overflow-hidden rounded-2xl border *:-ml-px *:first:-mt-px">
          <div className="grid lg:grid-cols-3">
            <div className={`${cell} lg:col-span-2`}>
              <Glow />
              <p className="text-paper/60 flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
                <span className="bg-healthy size-1.5 rounded-full" />
                Hardware
              </p>
              <h2 className="mt-4 text-4xl leading-tight font-medium tracking-tight md:text-5xl">
                {TITLE}
              </h2>
            </div>
            <div className={`${cell} flex items-center`}>
              <Glow />
              <p className="text-paper/70 text-lg">{INTRO}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3">
            {SENSOR_SPECS.map((spec, i) => (
              <SpecCell key={spec.label} spec={spec} delay={i * 0.05} />
            ))}
          </div>

          <div className="bg-healthy/[0.06] grid lg:grid-cols-3">
            {AI_SPECS.map((spec, i) => (
              <SpecCell key={spec.label} spec={spec} ai delay={i * 0.05} />
            ))}
          </div>

          <div className="bg-paper/[0.03] grid lg:grid-cols-3">
            <div className={cell}>
              <Glow />
              <p className="text-mint font-mono text-xs tracking-wider uppercase">
                Alerts
              </p>
              <p className="text-paper/60 mt-2">
                Wai AI diagnoses all five kinds:
              </p>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-5 lg:col-span-2">
              {ALERT_KINDS.map((kind) => (
                <li
                  key={kind}
                  className={`${cell} flex items-center font-medium max-sm:last:col-span-2`}
                >
                  <Glow />
                  {kind}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <span
          data-glow
          aria-hidden
          className={`${glow} inset-0 rounded-2xl border`}
          style={glowMask}
        />
      </div>
    </Section>
  )
}
