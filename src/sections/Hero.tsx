import { lazy, Suspense, useRef } from 'react'
import { useReducedMotion, useScroll } from 'motion/react'
import { LidarRings } from '../components/LidarRings'
import { BOOK_DEMO_HREF } from '../content'

const SensorScene = lazy(() => import('../scene/SensorScene'))

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const modelRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  return (
    <section
      ref={ref}
      id="top"
      className="border-line relative overflow-hidden border-b"
    >
      <LidarRings centre={modelRef} />
      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <h1 className="text-5xl leading-[1.05] font-medium tracking-tight md:text-6xl">
            Know your soil and water without the walk.
          </h1>
          <p className="text-muted mt-6 max-w-md text-lg">
            Wai sensors sit in your paddocks and waterways. The app tells you
            when something changes, why, and what to do next.
          </p>
          <a
            href={BOOK_DEMO_HREF}
            className="bg-ink text-paper hover:bg-ink/85 mt-8 inline-block rounded-full px-6 py-3"
          >
            Book a demo
          </a>
        </div>
        <div
          ref={modelRef}
          className="relative aspect-[15/22] max-h-[calc(100svh-10rem)] w-full"
          role="img"
          aria-label="Wai sensor unit with a whip antenna and two probe rods"
        >
          <Suspense
            fallback={
              <div className="text-muted absolute inset-0 flex items-center justify-center font-mono text-xs tracking-wider uppercase">
                Loading model
              </div>
            }
          >
            <SensorScene
              scrollProgress={scrollYProgress}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </div>
      </div>
    </section>
  )
}
