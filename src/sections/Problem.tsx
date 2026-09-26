import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from 'motion/react'
import { useEffect, useRef } from 'react'

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  shown: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, delay: 0.3, ease: 'easeInOut' },
  },
}

const PROBLEMS = {
  compliance: {
    label: 'Compliance',
    icon: (
      <>
        <motion.path variants={draw} d="M6 3h9l4 4v14H6z" />
        <motion.path variants={draw} d="M15 3v4h4" />
        <motion.path variants={draw} d="m9 14 2 2 4-4" />
      </>
    ),
    figure: { value: 88, prefix: '', suffix: '%' },
    caption: 'of farmers say resource consent is getting harder to get',
    panel: 'bg-alert/10 text-alert',
    body: 'Nitrogen is capped at 190 kg/ha a year. A breach can cost a company $10M.',
    source: {
      label: 'Farmers Weekly poll, 09/10/2025',
      href: 'https://www.farmersweekly.co.nz/news/consenting-woes-shared-with-visiting-mps/',
    },
  },
  time: {
    label: 'Time',
    icon: (
      <>
        <motion.circle variants={draw} cx="12" cy="12" r="9" />
        <motion.path variants={draw} d="M12 7v5l3 2" />
      </>
    ),
    figure: { value: 1, prefix: '', suffix: ' h/day' },
    caption: 'on office work and data entry, for the average dairy farmer',
    panel: 'bg-ink/5 text-ink',
    body: 'Someone still drives to every trough, probe and pond to read the numbers.',
    source: {
      label: 'DairyNZ, 21/10/2025',
      href: 'https://www.dairynz.co.nz/news/farm-focus-and-dairynz-partner-to-help-deliver-smarter-faster-benchmarking/',
    },
  },
  fertiliser: {
    label: 'Water and fertiliser',
    icon: (
      <>
        <motion.path
          variants={draw}
          d="M12 3s-6 6.5-6 11a6 6 0 0 0 12 0c0-4.5-6-11-6-11z"
        />
        <motion.path
          variants={draw}
          d="M12 19v-5m0 0c0-2 1.5-3 3-3 0 2-1.5 3-3 3z"
        />
      </>
    ),
    figure: { value: 43, prefix: '+', suffix: '%' },
    caption: 'nitrogen fertiliser cost for an average dairy farm this spring',
    panel: 'bg-mint text-healthy',
    body: 'Without soil data, farms irrigate wet soil and fertilise before rain.',
    source: {
      label: 'Ravensdown via NZ Herald, 20/07/2026',
      href: 'https://www.nzherald.co.nz/business/companies/agribusiness/fertiliser-prices-surge-for-nz-farmers-as-middle-east-conflict-escalates/TXCTPPZPBRHXZEEHLJI5563UEE/',
    },
  },
}

const monoLabel = 'font-mono text-xs tracking-wider uppercase'

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!inView || reduceMotion) return
    const controls = animate(0, value, {
      duration: 1.4,
      delay: 0.2,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [inView, reduceMotion, value])

  return <span ref={ref}>{reduceMotion ? value : 0}</span>
}

// A problem stat card for one step of the farm map story.
export function ProblemCard({ id }: { id: keyof typeof PROBLEMS }) {
  const reduceMotion = useReducedMotion()
  const problem = PROBLEMS[id]

  return (
    <article className="mt-8 w-full max-w-xs">
      <div
        className={`flex aspect-[4/3] flex-col justify-between rounded-2xl p-6 ${problem.panel}`}
      >
        <div className="flex items-start justify-between">
          <p className={monoLabel}>{problem.label}</p>
          <a
            href={problem.source.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Source: ${problem.source.label}`}
            title={`Source: ${problem.source.label}`}
            className="-m-2 rounded-full p-2 transition-opacity hover:opacity-60"
          >
            <motion.svg
              initial={reduceMotion ? 'shown' : 'hidden'}
              whileInView="shown"
              viewport={{ once: true, margin: '-10% 0px' }}
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {problem.icon}
            </motion.svg>
          </a>
        </div>
        <div>
          <p className="text-4xl font-medium tracking-tight tabular-nums">
            {problem.figure.prefix}
            <CountUp value={problem.figure.value} />
            {problem.figure.suffix}
          </p>
          <p className="text-ink/70 mt-2 max-w-[16rem] text-sm">
            {problem.caption}
          </p>
        </div>
      </div>
      <p className="text-muted mt-4 text-sm leading-relaxed">{problem.body}</p>
    </article>
  )
}
