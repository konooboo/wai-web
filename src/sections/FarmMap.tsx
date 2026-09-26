import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { useRef } from 'react'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { ALERT_EXAMPLE } from '../content'
import { FarmCanvas } from '../farm/FarmCanvas'
import { Phone } from '../farm/Phone'
import { SensorMarker } from '../farm/SensorMarker'
import { FARM_SENSORS } from '../farm/sensors'
import { STORY } from '../farm/story'
import { MAP_METRES, PADDOCK_7 } from '../farm/terrain'

const STEPS = [
  {
    eyebrow: '01 · Sensors',
    title: 'Sensors in your water and soil.',
    body: 'Wai sensors go in streams, ponds and paddocks. Water sensors measure pH, turbidity, nitrate and temperature. Soil sensors measure moisture and temperature.',
  },
  {
    eyebrow: '02 · Always on',
    title: 'Readings every [X] minutes, day and night.', // TODO(data): reading interval
    body: 'Each sensor sends its readings to the app. Green means the reading is in its normal range.',
  },
  {
    eyebrow: '03 · Problem',
    title: `${ALERT_EXAMPLE.sensor} detects a change.`,
    body: `After heavy rain, the reading goes up to ${ALERT_EXAMPLE.reading.charAt(0).toLowerCase()}${ALERT_EXAMPLE.reading.slice(1)}. ${ALERT_EXAMPLE.normal}.`,
  },
  {
    eyebrow: '04 · Alert',
    title: 'You get an alert on your phone.',
    body: 'The alert shows the sensor, the reading, the normal range and the time. You do not have to walk the farm to find the problem.',
  },
  {
    eyebrow: '05 · Next step',
    title: 'Wai tells you why, and what to do.',
    body: 'The app compares the reading with rainfall and the nearby sensors. It gives a likely cause and a clear next step.',
  },
]

const HECTARES = (MAP_METRES * MAP_METRES) / 10000
const SCALE_METRES = 200

export function FarmMap() {
  const stepsRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ['start 0.7', 'end 0.7'],
  })
  const reduced = useReducedMotion() ?? false
  const finalState = useMotionValue(1)
  const progress = reduced ? finalState : scrollYProgress
  const paddock = useTransform(progress, [...STORY.paddock], [0, 1])

  return (
    <Section id="farm-map" className="border-line border-b">
      <div className="grid md:grid-cols-[1.15fr_1fr] md:gap-16">
        <div className="bg-paper sticky top-16 z-20 -mx-6 px-6 py-4 md:mx-0 md:flex md:h-[calc(100svh-4rem)] md:items-center md:self-start md:bg-transparent md:px-0 md:py-0">
          <div className="relative mx-auto aspect-square w-full max-w-[min(100%,50svh)] md:max-w-[calc(100svh-9rem)]">
            <div className="border-line absolute inset-0 overflow-hidden rounded-2xl border bg-white">
              <FarmCanvas progress={progress} />
              <svg
                aria-hidden
                viewBox="0 0 1 1"
                className="absolute inset-0 size-full"
              >
                <motion.polygon
                  points={PADDOCK_7.map((p) => `${p.x},${p.y}`).join(' ')}
                  className="fill-alert/10 stroke-alert"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                  style={{ opacity: paddock }}
                />
              </svg>
              <motion.p
                aria-hidden
                className="text-alert absolute font-mono text-[10px] tracking-wider uppercase"
                style={{
                  left: `${PADDOCK_7[1].x * 100}%`,
                  top: `${PADDOCK_7[1].y * 100 - 0.5}%`,
                  translateX: '-100%',
                  translateY: '-100%',
                  opacity: paddock,
                }}
              >
                Paddock 7
              </motion.p>
              <p className="text-muted absolute top-3 left-3 rounded bg-white/80 px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                Lidar · {HECTARES} ha
              </p>
              <div
                aria-hidden
                className="text-muted absolute bottom-3 left-3 rounded bg-white/80 px-1.5 pt-1 pb-0.5 font-mono text-[10px]"
                style={{ width: `${(SCALE_METRES / MAP_METRES) * 100}%` }}
              >
                <div className="border-muted h-1.5 border-x border-b" />
                <span className="mt-0.5 block">{SCALE_METRES} m</span>
              </div>
            </div>

            {FARM_SENSORS.map((sensor, i) => (
              <SensorMarker
                key={sensor.id}
                sensor={sensor}
                index={i}
                progress={progress}
                reduced={reduced}
              />
            ))}

            <div className="absolute -right-2 -bottom-3 z-20 w-[42%] md:-right-8 md:-bottom-6 md:w-[28%]">
              <Phone progress={progress} />
            </div>
          </div>
        </div>

        <div>
          <div ref={stepsRef}>
            {STEPS.map((step, i) => (
              <div
                key={step.eyebrow}
                className="flex min-h-[55svh] items-start pt-6 md:min-h-[80svh] md:items-center md:pt-0"
              >
                {i === 0 ? (
                  <SectionHeading eyebrow={step.eyebrow} title={step.title}>
                    {step.body}
                  </SectionHeading>
                ) : (
                  <div className="max-w-md">
                    <p className="text-muted font-mono text-xs tracking-wider uppercase">
                      {step.eyebrow}
                    </p>
                    <h3 className="mt-4 text-3xl leading-tight font-medium tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-muted mt-4 text-lg">{step.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="md:h-[25svh]" />
        </div>
      </div>
    </Section>
  )
}
