import { useInView, useReducedMotion, useScroll } from 'motion/react'
import { lazy, Suspense, useRef, useState } from 'react'
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
  // Load the 3D chunk, build the model and compile its shaders while the
  // reader is still in the farm story, then animate only while visible.
  const near = useInView(ref, { margin: '250% 0px', once: true })
  const inView = useInView(modelRef)
  const [ready, setReady] = useState(false)

  return (
    <div className="relative h-0">
      {/* The rings sit below the farm map's sticky phone (z-20); the model
          sits above it. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[56rem] -translate-y-1/2 overflow-hidden">
        <div className="absolute top-0 left-1/2 size-[56rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,black_45%,transparent)] md:right-[-12rem] md:left-auto md:w-[76rem] md:translate-x-0 md:[mask-image:radial-gradient(ellipse_48%_46%_at_42%_42%,black_55%,transparent)]">
          <LidarRings centre={modelRef} />
        </div>
      </div>
      <div
        ref={ref}
        className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[56rem] -translate-y-1/2 overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 size-[26rem] -translate-1/2 md:right-[26rem] md:left-auto md:size-[42rem] md:translate-x-1/2">
          <div
            ref={modelRef}
            className="size-full transition-opacity duration-500"
            style={{ opacity: ready ? 1 : 0 }}
            role="img"
            aria-label="Wai sensor unit with a whip antenna and two probe rods"
          >
            {near && (
              <Suspense>
                <SensorScene
                  scrollProgress={scrollYProgress}
                  reducedMotion={reducedMotion}
                  active={inView}
                  tilt={TILT}
                  onReady={() => setReady(true)}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
