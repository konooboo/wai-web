import { motion, useReducedMotion } from 'motion/react'
import { Koru } from '../components/Koru'
import { ALERT_EXAMPLE } from '../content'
import { ALERT_SENSOR_ID } from './sensors'

// Matches the step copy: the alert comes at 2 am. TODO(data): confirm.
const SENT = '02:04'

// The push notification the farmer finds on the lock screen.
export function AlertNotification() {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className="border-line mt-8 w-full max-w-xs rounded-2xl border bg-white p-4"
      initial={reduced ? false : { opacity: 0, y: -16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20% 0px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-2">
        <span className="bg-ink text-paper flex size-5 items-center justify-center rounded-md">
          <Koru className="size-3.5" />
        </span>
        <span className="text-xs font-medium">Wai</span>
        <span className="text-muted ml-auto font-mono text-xs">{SENT}</span>
      </div>
      <p className="mt-2 text-sm font-medium">
        {ALERT_EXAMPLE.title} at {ALERT_SENSOR_ID}
      </p>
      <p className="text-ink/70 mt-0.5 text-sm">{ALERT_EXAMPLE.cause}</p>
    </motion.div>
  )
}
