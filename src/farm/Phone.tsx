import { useId } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { ALERT_EXAMPLE } from '../content'
import { STORY } from './story'

// Path to the real app screenshot. Null shows the grey placeholder screen.
export const APP_SCREENSHOT: string | null = null

export function Phone({ progress }: { progress: MotionValue<number> }) {
  const phone = useTransform(progress, [...STORY.phone], [0, 1])
  const phoneY = useTransform(progress, [...STORY.phone], [32, 0])
  const card = useTransform(progress, [...STORY.alertCard], [0, 1])
  const cardY = useTransform(progress, [...STORY.alertCard], ['-120%', '0%'])
  const tip = useTransform(progress, [...STORY.suggestion], [0, 1])
  const tipY = useTransform(progress, [...STORY.suggestion], [16, 0])

  return (
    <motion.div
      data-phone
      className="@container relative aspect-[433/882] w-full"
      style={{ opacity: phone, y: phoneY }}
    >
      <Frame />
      <div className="bg-line @container absolute top-[2.18%] left-[4.91%] h-[95.63%] w-[89.95%] overflow-hidden rounded-[14.31%/6.61%]">
        {APP_SCREENSHOT ? (
          <img src={APP_SCREENSHOT} alt="" className="size-full object-cover" />
        ) : (
          <div aria-hidden className="flex flex-col gap-2 p-3 pt-8">
            <div className="h-2 w-1/2 rounded-full bg-white/70" />
            <div className="h-16 rounded-lg bg-white/50" />
            <div className="h-10 rounded-lg bg-white/50" />
            <div className="h-10 rounded-lg bg-white/50" />
          </div>
        )}
        <StatusBar />
        <div className="bg-ink/90 absolute bottom-[2cqw] left-1/2 h-[1.3cqw] w-[34cqw] -translate-x-1/2 rounded-full" />

        <div className="absolute inset-x-1.5 top-[15cqw] flex flex-col gap-1.5 md:inset-x-2 md:gap-2">
          <motion.div
            className="border-line rounded-lg border bg-white p-2 md:rounded-xl md:p-2.5"
            style={{ opacity: card, y: cardY }}
          >
            <p className="text-muted flex justify-between gap-1 font-mono text-[7px] tracking-wider whitespace-nowrap uppercase md:text-[9px]">
              <span className="text-alert">● Alert</span>
              <span>{ALERT_EXAMPLE.time}</span>
            </p>
            <p className="mt-1 text-[9px] leading-tight font-medium md:text-[11px]">
              {ALERT_EXAMPLE.sensor}
            </p>
            <p className="text-alert mt-0.5 font-mono text-[9px] md:text-xs">
              {ALERT_EXAMPLE.reading}
            </p>
            <p className="text-muted font-mono text-[7px] md:text-[9px]">
              {ALERT_EXAMPLE.normal}
            </p>
          </motion.div>

          <motion.div
            className="border-line rounded-lg border bg-white p-2 md:rounded-xl md:p-2.5"
            style={{ opacity: tip, y: tipY }}
          >
            <p className="text-muted font-mono text-[7px] tracking-wider uppercase md:text-[9px]">
              Likely cause
            </p>
            <p className="mt-0.5 mb-1.5 text-[8px] leading-snug md:text-[10px]">
              {ALERT_EXAMPLE.cause}
            </p>
            <p className="text-muted font-mono text-[7px] tracking-wider uppercase md:text-[9px]">
              Next step
            </p>
            <p className="mt-0.5 text-[8px] leading-snug font-medium md:text-[10px]">
              {ALERT_EXAMPLE.action}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// iPhone 15 Pro geometry, adapted from Magic UI's Iphone (MIT). Black titanium.
function Frame() {
  const rim = `${useId()}-rim`
  const buttons = [
    [0, 170, 34],
    [0, 233, 67],
    [0, 318, 67],
    [430, 279, 106],
  ]
  const bands = [
    [2, 100],
    [426, 100],
    [2, 777],
    [426, 777],
  ]

  return (
    <svg
      viewBox="0 0 433 882"
      aria-hidden
      className="text-ink absolute inset-0 size-full [filter:drop-shadow(0_1cqw_2cqw_rgb(0_0_0/0.25))_drop-shadow(0_6cqw_12cqw_rgb(0_0_0/0.18))]"
    >
      <defs>
        <linearGradient id={rim} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0.08" />
          <stop offset="0.006" stopColor="white" stopOpacity="0.4" />
          <stop offset="0.02" stopColor="white" stopOpacity="0.1" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.03" />
          <stop offset="0.98" stopColor="white" stopOpacity="0.1" />
          <stop offset="0.994" stopColor="white" stopOpacity="0.4" />
          <stop offset="1" stopColor="white" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {buttons.map(([x, y, h]) => (
        <rect
          key={y}
          x={x}
          y={y}
          width="3"
          height={h}
          rx="1.5"
          fill="currentColor"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="0.75"
        />
      ))}
      <rect x="2" width="428" height="882" rx="73" fill="currentColor" />
      <rect x="2" width="428" height="882" rx="73" fill={`url(#${rim})`} />
      {bands.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="4"
          height="5"
          fill="white"
          fillOpacity="0.15"
        />
      ))}
      <rect
        x="6"
        y="4"
        width="420"
        height="874"
        rx="69"
        fill="black"
        stroke="white"
        strokeOpacity="0.12"
      />
    </svg>
  )
}

function StatusBar() {
  return (
    <div
      aria-hidden
      className="text-ink absolute inset-x-0 top-[2.8cqw] grid h-[9.4cqw] grid-cols-[1fr_32cqw_1fr] items-center"
    >
      <span className="justify-self-center text-[4.4cqw] leading-none font-semibold">
        9:41
      </span>
      <div className="bg-ink relative size-full rounded-full">
        <div className="absolute top-1/2 right-[3.5cqw] size-[3cqw] -translate-y-1/2 rounded-full bg-white/10" />
      </div>
      <div className="flex items-center gap-[1.4cqw] justify-self-center">
        <svg viewBox="0 0 18 12" className="h-[3cqw]" fill="currentColor">
          <rect y="7.5" width="3" height="4.5" rx="0.8" />
          <rect x="5" y="5" width="3" height="7" rx="0.8" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="0.8" />
          <rect x="15" width="3" height="12" rx="0.8" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-[3cqw]" fill="currentColor">
          <path d="M8 11 5.53 8.53a3.5 3.5 0 0 1 4.94 0Z" />
          <path
            d="M3.4 6.4a6.5 6.5 0 0 1 9.2 0M1.28 4.28a9.5 9.5 0 0 1 13.44 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <svg viewBox="0 0 27 12" className="h-[3.1cqw]" fill="currentColor">
          <rect
            x="0.5"
            y="0.5"
            width="23"
            height="11"
            rx="3.5"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect
            x="24.5"
            y="4"
            width="1.5"
            height="4"
            rx="0.75"
            fillOpacity="0.4"
          />
        </svg>
      </div>
    </div>
  )
}
