import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { ALERT_EXAMPLE, SENSORS } from '../content'

const SENSOR_NAMES = SENSORS.map((s) => s.label)
  .join(', ')
  .replace(/, ([^,]*)$/, ' and $1')

const STEPS = [
  {
    label: 'Sense',
    body: `Sensors in soil and waterways read ${SENSOR_NAMES} every few minutes.`,
  },
  {
    label: 'Diagnose',
    body: 'The AI compares readings with weather and history and finds the cause.',
  },
  {
    label: 'Act',
    body: 'The app sends an alert with the reason and the action.',
  },
]

function AlertCard() {
  return (
    <div className="border-line mt-4 rounded-2xl border bg-white p-5">
      <p className="text-muted font-mono text-xs tracking-wider uppercase">
        {ALERT_EXAMPLE.sensor} · {ALERT_EXAMPLE.time}
      </p>
      <div className="mt-3 space-y-2 text-sm">
        <p>
          <span className="text-muted font-mono text-xs uppercase">
            Reading{' '}
          </span>
          {ALERT_EXAMPLE.reading} ({ALERT_EXAMPLE.normal})
        </p>
        <p>
          <span className="text-muted font-mono text-xs uppercase">Cause </span>
          {ALERT_EXAMPLE.cause}
        </p>
        <p>
          <span className="text-muted font-mono text-xs uppercase">
            Action{' '}
          </span>
          {ALERT_EXAMPLE.action}
        </p>
      </div>
    </div>
  )
}

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.4'],
  })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <Section id="how-it-works" className="border-line border-b">
      <SectionHeading eyebrow="How it works" title="Sense, diagnose, act.">
        The sensors collect the data. The AI finds the cause. The app tells you
        what to do.
      </SectionHeading>

      <div
        ref={containerRef}
        className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8"
      >
        <motion.div
          aria-hidden
          style={{ scaleX: reduceMotion ? 1 : lineScale }}
          className="border-line absolute top-6 right-0 left-0 hidden h-px origin-left border-t md:block"
        />
        {STEPS.map((step, i) => (
          <Reveal key={step.label} delay={i * 0.15} className="relative">
            <div className="bg-paper border-line relative z-10 flex size-12 items-center justify-center rounded-full border font-mono text-sm">
              0{i + 1}
            </div>
            <h3 className="mt-4 text-xl font-medium">{step.label}</h3>
            <p className="text-muted mt-2">{step.body}</p>
            {i === 2 && <AlertCard />}
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
