import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from 'motion/react'
import { useEffect, useRef } from 'react'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'

const PAIN_BLOCKS = [
  {
    title: 'Problems found late',
    body: 'A trough can run dry, or a leak can run for days, before someone walks past it.',
  },
  {
    title: 'Council fines',
    body: 'Councils fine farms for water and nutrient breaches. Manual checks miss slow changes that build up over weeks.',
  },
  {
    title: 'Wasted water and fertiliser',
    body: 'A hidden leak or the wrong feed rate costs money every day it goes unnoticed.',
  },
]

// The stat below counts up to a real value once the team has one (TODO(data)).
// Until then, the bracket placeholder fades and settles in on scroll instead.
function HoursStat() {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()
  const scale = useMotionValue(reduceMotion ? 1 : 0.85)
  const opacity = useMotionValue(reduceMotion ? 1 : 0)

  useEffect(() => {
    if (!inView || reduceMotion) return
    const controls = [
      animate(scale, 1, { duration: 0.6, ease: [0.22, 1, 0.36, 1] }),
      animate(opacity, 1, { duration: 0.6, ease: [0.22, 1, 0.36, 1] }),
    ]
    return () => controls.forEach((c) => c.stop())
  }, [inView, reduceMotion, scale, opacity])

  return (
    <motion.p
      ref={ref}
      style={{ scale, opacity }}
      className="text-6xl font-medium tracking-tight tabular-nums md:text-7xl"
    >
      {/* TODO(data): replace with the measured average */}
      [X]
    </motion.p>
  )
}

export function Problem() {
  return (
    <Section id="problem" className="border-line border-b">
      <SectionHeading
        eyebrow="The problem"
        title="Manual checks miss problems until they cost money."
      >
        Farmers walk paddocks, check troughs by hand, and take water samples.
        Problems build up between checks.
      </SectionHeading>

      <div className="mt-16 grid gap-12 md:grid-cols-2">
        <Reveal>
          <blockquote className="border-muted/40 rounded-2xl border border-dashed p-6">
            <p className="text-ink/85 text-lg">
              &quot;[Farmer story from interview: a specific problem missed by
              manual checks, for example a trough leak or a nitrate spike, and
              what it cost.]&quot;
            </p>
            <p className="text-muted mt-4 font-mono text-xs tracking-wider uppercase">
              [Farmer name, region] — TODO(data): replace with a real interview
              quote
            </p>
          </blockquote>
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            <HoursStat />
            <p className="text-muted mt-2 text-lg">
              hours a week on manual water and soil checks: walking paddocks,
              checking troughs, taking water samples
            </p>
          </div>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {PAIN_BLOCKS.map((block, i) => (
          <Reveal key={block.title} delay={i * 0.1}>
            <div className="border-line rounded-2xl border bg-white p-6">
              <h3 className="font-medium">{block.title}</h3>
              <p className="text-muted mt-2 text-sm">{block.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
