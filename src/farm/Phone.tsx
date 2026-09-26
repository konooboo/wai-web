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
      className="bg-ink aspect-[9/19] w-full rounded-[1.4rem] p-1 shadow-[0_12px_40px_rgb(0_0_0/0.18)] md:rounded-[1.9rem] md:p-1.5"
      style={{ opacity: phone, y: phoneY }}
    >
      <div className="bg-line relative size-full overflow-hidden rounded-[1.1rem] md:rounded-[1.5rem]">
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
        <div className="bg-ink absolute top-1.5 left-1/2 h-1.5 w-1/4 -translate-x-1/2 rounded-full md:top-2 md:h-2" />

        <div className="absolute inset-x-1.5 top-5 flex flex-col gap-1.5 md:inset-x-2 md:top-7 md:gap-2">
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
