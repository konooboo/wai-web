import { useReducedMotion, useScroll } from 'motion/react'
import { lazy, Suspense, useRef } from 'react'
import { LidarRings } from '../components/LidarRings'

const SensorScene = lazy(() => import('../scene/SensorScene'))

const TILT = (25 * Math.PI) / 180

// The sensor render and lidar rings, centred on the line between How it works
// and Hardware. Zero height, so it adds no space between the two sections.
export function SensorBridge() {
  const ref = useRef<HTMLDivElement>(null)
  const modelRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  return (
    <div className="relative z-30 h-0">
      <div
        ref={ref}
        className="pointer-events-none absolute inset-x-0 top-0 h-[56rem] -translate-y-1/2 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 size-[56rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,black_45%,transparent)] md:right-[-2rem] md:left-auto md:translate-x-0">
          <LidarRings centre={modelRef} />
        </div>
        <div className="absolute top-1/2 left-1/2 size-[26rem] -translate-1/2 md:right-[26rem] md:left-auto md:size-[42rem] md:translate-x-1/2">
          <div
            ref={modelRef}
            className="size-full"
            role="img"
            aria-label="Wai sensor unit with a whip antenna and two probe rods"
          >
            <Suspense>
              <SensorScene
                scrollProgress={scrollYProgress}
                reducedMotion={reducedMotion}
                tilt={TILT}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
