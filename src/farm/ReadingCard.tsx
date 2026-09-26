import { motion, useTransform, type MotionValue } from 'motion/react'
import { ALERT_SENSOR_ID, FARM_SENSORS, sensorInfo } from './sensors'
import { STORY } from './story'

const S3 = FARM_SENSORS.find((s) => s.id === ALERT_SENSOR_ID)!
const INFO = sensorInfo(S3.kind)
const LIMIT = 10 // NTU, same limit as the map popup and the app
const PEAK = S3.alertValue ?? S3.value

// Last 12 readings: 7 flat at the normal value, then 5 steps up after rain.
// The rise is linear, so the drawn line tip and the number match the popup.
// TODO(data): replace with a real series from the team.
const HISTORY = [4.2, 4.0, 4.4, 4.1, 4.3, 4.2, S3.value]
const RISE = [1, 2, 3, 4, 5].map((i) => S3.value + ((PEAK - S3.value) * i) / 5)
const W = 240
const H = 64
const MAX = 52
const x = (i: number) => (i / (HISTORY.length + RISE.length - 1)) * W
const y = (v: number) => H - (v / MAX) * H
const line = (values: number[], from: number) =>
  values
    .map(
      (v, i) => `${i ? 'L' : 'M'}${x(from + i).toFixed(1)} ${y(v).toFixed(1)}`,
    )
    .join(' ')
const HISTORY_PATH = line(HISTORY, 0)
const RISE_PATH = line([S3.value, ...RISE], HISTORY.length - 1)

// A bigger version of the S3 popup on the map. The number, line and status
// follow the same scroll window as the popup.
export function ReadingCard({ progress }: { progress: MotionValue<number> }) {
  const draw = useTransform(progress, [...STORY.alert], [0, 1])
  const value = useTransform(draw, [0, 1], [S3.value, PEAK])
  const reading = useTransform(value, (v) =>
    v >= LIMIT ? v.toFixed(0) : v.toFixed(S3.decimals),
  )
  const red = useTransform(value, [LIMIT - 1, LIMIT + 1], [0, 1])

  return (
    <article className="border-line mt-8 w-full max-w-xs rounded-2xl border bg-white p-6">
      <p className="text-muted font-mono text-xs tracking-wider uppercase">
        {S3.id} · {S3.place}
      </p>

      <p className="mt-4 text-5xl font-medium tracking-tight tabular-nums">
        <motion.span>{reading}</motion.span>
        <span className="text-muted ml-2 font-mono text-base">{INFO.unit}</span>
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 h-16 w-full overflow-visible"
        fill="none"
        aria-hidden
      >
        <line
          x1="0"
          x2={W}
          y1={y(LIMIT)}
          y2={y(LIMIT)}
          className="stroke-muted"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <path
          d={HISTORY_PATH}
          className="stroke-ink"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.path
          d={RISE_PATH}
          className="stroke-ink"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: draw }}
        />
      </svg>

      <p className="mt-4 h-7 font-mono text-xs tracking-wider uppercase">
        <motion.span
          className="bg-alert/10 text-alert inline-block rounded-full px-3 py-1.5"
          style={{ opacity: red }}
        >
          ● Above normal
        </motion.span>
      </p>
    </article>
  )
}
