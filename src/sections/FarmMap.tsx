import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { lazy, Suspense, useRef } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { ALERT_EXAMPLE, READING_INTERVAL_MIN } from '../content'
import { Phone } from '../farm/Phone'
import { SensorMarker } from '../farm/SensorMarker'
import { FARM_SENSORS } from '../farm/sensors'
import { STORY } from '../farm/story'
import { MAP_METRES } from '../farm/terrain'

const FarmScene = lazy(() => import('../farm/FarmScene'))

const STEPS = [
  {
    eyebrow: '01 · Sensors',
    title: 'Sensors in your water and soil.',
    body: 'Wai sensors go in streams, ponds and paddocks. Water sensors measure pH, turbidity, nitrate and temperature. Soil sensors measure moisture and temperature.',
  },
  {
    eyebrow: '02 · Always on',
    title: `Readings every ${READING_INTERVAL_MIN} minutes, day and night.`,
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

export function FarmMap() {
  const stepsRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: stepsRef,
    // Progress starts when the map panel sticks, so the NZ zoom is in view.
    offset: ['start 0.25', 'end 0.7'],
  })
  // One smoothed progress for the camera, shaders and overlays, so a fast
  // scroll cannot put the popups ahead of the map.
  const smooth = useSpring(scrollYProgress, {
    visualDuration: 0.3,
    bounce: 0,
    restDelta: 0.0005,
  })
  const reduced = useReducedMotion() ?? false
  const finalState = useMotionValue(1)
  const progress = reduced ? finalState : smooth
  const paddock = useTransform(progress, [...STORY.paddock], [0, 1])
  const site = useTransform(progress, [...STORY.zoom], [1, 0])
  const farmLabel = useTransform(
    progress,
    [STORY.zoom[1], STORY.zoom[1] + 0.02],
    [0, 1],
  )

  return (
    <section
      id="farm-map"
      className="border-line scroll-mt-16 border-b py-24 md:py-32"
    >
      <div className="mx-auto grid max-w-[88rem] px-6 md:grid-cols-[1.5fr_1fr] md:gap-16">
        <div className="bg-paper sticky top-16 z-20 -mx-6 px-6 py-4 md:mx-0 md:flex md:h-[calc(100svh-4rem)] md:items-center md:self-start md:bg-transparent md:px-0 md:py-0">
          <div
            ref={overlayRef}
            className="relative mx-auto aspect-square w-full max-w-[min(100%,50svh)] md:max-w-[calc(100svh-8rem)]"
          >
            <div className="bg-ink absolute inset-0 overflow-hidden rounded-2xl">
              <Suspense>
                <FarmScene
                  progress={progress}
                  reduced={reduced}
                  overlay={overlayRef}
                />
              </Suspense>
              <p className="text-paper/60 absolute top-3 left-3 font-mono text-[10px] tracking-wider uppercase">
                <motion.span className="absolute" style={{ opacity: site }}>
                  New Zealand
                </motion.span>
                <motion.span
                  className="whitespace-nowrap"
                  style={{ opacity: farmLabel }}
                >
                  Lidar · {HECTARES} ha
                </motion.span>
              </p>
            </div>

            <motion.p
              aria-hidden
              data-anchor="site"
              className="text-paper invisible absolute top-0 left-0 z-10 font-mono text-[10px] tracking-wider uppercase"
              style={{ opacity: site }}
            >
              <span className="bg-alert ring-ink absolute -top-1 -left-1 size-2 rounded-full ring-2" />
              <span className="bg-ink/80 absolute top-2 left-2 rounded px-1 py-0.5 whitespace-nowrap">
                Canterbury, NZ
              </span>
            </motion.p>

            <motion.p
              aria-hidden
              data-anchor="paddock"
              className="text-alert invisible absolute top-0 left-0 z-10 font-mono text-[10px] tracking-wider uppercase"
              style={{ opacity: paddock }}
            >
              <span className="bg-ink/80 absolute bottom-1 left-1 rounded px-1 py-0.5 whitespace-nowrap">
                Paddock 7
              </span>
            </motion.p>

            {FARM_SENSORS.map((sensor, i) => (
              <SensorMarker
                key={sensor.id}
                sensor={sensor}
                index={i}
                progress={progress}
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
                  <div>
                    <p className="text-healthy mb-8 font-mono text-xs tracking-wider uppercase">
                      How it works: Sense → Diagnose → Act
                    </p>
                    <SectionHeading eyebrow={step.eyebrow} title={step.title}>
                      {step.body}
                    </SectionHeading>
                  </div>
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
    </section>
  )
}
