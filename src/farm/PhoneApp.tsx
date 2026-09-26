import { motion, useTransform, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'
import { ALERT_EXAMPLE, SENSORS } from '../content'
import { FARM_SENSORS, type FarmSensor } from './sensors'
import { STORY } from './story'
import { MAP_METRES } from './terrain'

// Static port of the Wai app (Home and Alert screens). It renders at this
// logical size and Phone scales it to the screen.
export const APP_WIDTH = 320
export const APP_HEIGHT = 693

const FARM = `${(MAP_METRES * MAP_METRES) / 10000} ha farm`
const ALERT_TITLE = 'Turbidity high'
const S3 = FARM_SENSORS.find((s) => s.alertValue != null)!
const GLANCE = FARM_SENSORS.slice(0, 4)

// Example app state for the story. TODO(data): confirm with the team.
const HEALTH = {
  ok: {
    score: 92,
    label: 'Healthy',
    tip: 'All sensors are in their normal range.',
    factors: [
      ['Good', 'Water quality'],
      ['Good', 'Soil'],
      [`${FARM_SENSORS.length} of ${FARM_SENSORS.length}`, 'Sensors live'],
      ['None', 'Alerts'],
    ],
  },
  alert: {
    score: 64,
    label: 'Action needed',
    tip: `${S3.id} turbidity is above normal.`,
    factors: [
      ['Poor', 'Water quality'],
      ['Good', 'Soil'],
      [`${FARM_SENSORS.length} of ${FARM_SENSORS.length}`, 'Sensors live'],
      ['1 open', 'Alerts'],
    ],
  },
}

const TABS = [
  {
    label: 'Home',
    icon: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  },
  {
    label: 'Live',
    icon: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  },
  {
    label: 'Alerts',
    icon: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.3 13a2 2 0 0 0 3.4 0',
  },
  { label: 'Insights', icon: 'M3 3v18h18M7 15l4-4 3 3 5-6' },
]

export function PhoneApp({ progress }: { progress: MotionValue<number> }) {
  const alert = useTransform(progress, [...STORY.alertCard], [0, 1])
  // Fade the old state out, then the new state in, so the text never overlaps.
  const ok = useTransform(alert, [0, 0.5], [1, 0])
  const bad = useTransform(alert, [0.5, 1], [0, 1])
  const shift = useTransform(alert, [0, 1], [-84, 0])
  const detail = useTransform(progress, [...STORY.suggestion], [0, 1])
  const homeX = useTransform(detail, [0, 1], ['0%', '-30%'])
  const detailX = useTransform(detail, [0, 1], ['100%', '0%'])

  return (
    <div className="text-ink relative size-full overflow-hidden bg-white font-[-apple-system,BlinkMacSystemFont,system-ui,sans-serif]">
      <motion.div
        className="absolute inset-0 px-4 pt-[50px]"
        style={{ x: homeX }}
      >
        <div className="relative z-10 flex items-center justify-between bg-white">
          <h1 className="text-[32px] font-bold tracking-tight">Home</h1>
          <span className="text-muted text-[14px]">{FARM}</span>
        </div>

        <motion.div className="mt-3 flex flex-col gap-7" style={{ y: shift }}>
          <motion.div
            className="bg-paper -mb-4 flex h-[72px] items-center gap-3 rounded-[16px] px-4"
            style={{ opacity: alert }}
          >
            <Dot className="bg-alert" />
            <div className="flex-1">
              <div className="font-semibold">{ALERT_TITLE}</div>
              <div className="text-muted text-[13px]">
                {ALERT_EXAMPLE.sensor} · {ALERT_EXAMPLE.time}
              </div>
            </div>
            <Chevron />
          </motion.div>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold">In Focus</h2>
            <div className="grid [&>*]:[grid-area:1/1]">
              <HealthCard state={HEALTH.ok} good opacity={ok} />
              <HealthCard state={HEALTH.alert} good={false} opacity={bad} />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[20px] font-bold">At a Glance</h2>
              <span className="text-muted text-[16px]">See All</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GLANCE.map((s) =>
                s === S3 ? (
                  <div key={s.id} className="grid [&>*]:[grid-area:1/1]">
                    <SensorTile sensor={s} opacity={ok} />
                    <SensorTile sensor={s} alert opacity={bad} />
                  </div>
                ) : (
                  <SensorTile key={s.id} sensor={s} />
                ),
              )}
            </div>
          </section>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex flex-col gap-6 bg-white px-4 pt-[50px] shadow-[-8px_0_24px_rgb(0_0_0/0.08)]"
        style={{ x: detailX }}
      >
        <div>
          <div className="flex h-10 items-center gap-2">
            <svg viewBox="0 0 24 24" className="-ml-1 size-5" {...STROKE}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <h1 className="text-[20px] font-bold">{ALERT_EXAMPLE.sensor}</h1>
          </div>
          <div className="text-[28px] leading-tight font-bold">
            {ALERT_TITLE}
          </div>
          <div className="text-muted mt-1 text-[15px]">
            Started {ALERT_EXAMPLE.time}
          </div>
        </div>

        <div>
          <table className="w-full text-[15px]">
            <thead>
              <tr className="text-muted text-left text-[13px]">
                <th className="pb-1.5 font-normal" />
                <th className="pb-1.5 text-right font-normal">Now</th>
                <th className="pb-1.5 text-right font-normal">Usual</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              <tr className="border-line border-t">
                <td className="py-2.5">
                  {sensorInfo(S3).label}{' '}
                  <span className="text-muted text-[13px]">
                    {sensorInfo(S3).unit}
                  </span>
                </td>
                <td className="text-alert py-2.5 text-right font-semibold">
                  {S3.alertValue}
                </td>
                <td className="py-2.5 text-right">
                  {S3.value.toFixed(S3.decimals)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="text-muted mt-1 text-[13px]">
            {ALERT_EXAMPLE.normal}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <DetailBlock title="Likely cause">{ALERT_EXAMPLE.cause}</DetailBlock>
          <DetailBlock title="What to do">{ALERT_EXAMPLE.action}</DetailBlock>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="text-[20px] font-bold">What next?</div>
          <div className="bg-paper flex items-center gap-3 rounded-[12px] px-4 py-3.5">
            <div className="flex-1">
              <div className="text-[16px] font-semibold">Mark handled</div>
              <div className="text-muted text-[13px]">
                Clears the alert until the next problem
              </div>
            </div>
            <span className="border-ink grid size-6 place-items-center rounded-full border-2">
              <span className="bg-ink size-3 rounded-full" />
            </span>
          </div>
        </div>
      </motion.div>

      <nav className="border-line absolute inset-x-0 bottom-0 flex border-t bg-white pb-5">
        {TABS.map((t, i) => (
          <div
            key={t.label}
            className={`relative flex flex-1 flex-col items-center gap-0.5 pt-2.5 pb-1 text-[11px] ${i === 0 ? 'font-semibold' : 'text-muted'}`}
          >
            <svg viewBox="0 0 24 24" className="size-6" {...STROKE}>
              <path d={t.icon} />
            </svg>
            {t.label}
            {t.label === 'Alerts' && (
              <motion.span
                className="bg-alert absolute top-1.5 left-1/2 ml-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ opacity: alert }}
              >
                1
              </motion.span>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const sensorInfo = (s: FarmSensor) => SENSORS.find((x) => x.id === s.kind)!

function Dot({ className }: { className: string }) {
  return (
    <span
      className={`inline-block size-2.5 shrink-0 rounded-full ${className}`}
    />
  )
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="text-muted/60 size-4" {...STROKE}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function DetailBlock({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="text-[17px] font-semibold">{title}</div>
      <div className="text-ink/80 mt-0.5 text-[15px] leading-relaxed">
        {children}
      </div>
    </div>
  )
}

function HealthCard({
  state,
  good,
  opacity,
}: {
  state: (typeof HEALTH)['ok']
  good: boolean
  opacity: MotionValue<number>
}) {
  const r = 40
  const c = 2 * Math.PI * r
  return (
    <motion.div className="bg-paper rounded-[16px] p-4" style={{ opacity }}>
      <div className="text-[15px] font-medium">Farm health</div>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative grid size-[88px] shrink-0 place-items-center">
          <svg viewBox="0 0 88 88" className="absolute inset-0 -rotate-90">
            <circle
              cx="44"
              cy="44"
              r={r}
              fill="none"
              strokeWidth="8"
              className="stroke-line"
            />
            <circle
              cx="44"
              cy="44"
              r={r}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - state.score / 100)}
              className={good ? 'stroke-healthy' : 'stroke-alert'}
            />
          </svg>
          <div className="relative text-[28px] font-bold tabular-nums">
            {state.score}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[24px] leading-tight font-bold">
            {state.label}
          </div>
          <div className="text-muted text-[14px] leading-snug">{state.tip}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {state.factors.map(([v, k]) => (
          <div key={k}>
            <div className="text-[18px] font-medium">{v}</div>
            <div className="text-muted text-[13px]">{k}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function SensorTile({
  sensor,
  alert = false,
  opacity,
}: {
  sensor: FarmSensor
  alert?: boolean
  opacity?: MotionValue<number>
}) {
  const info = sensorInfo(sensor)
  const value = alert ? sensor.alertValue! : sensor.value
  return (
    <motion.div
      className="bg-paper flex flex-col rounded-[16px] p-4"
      style={{ opacity }}
    >
      <div className="flex items-center gap-2 text-[15px] font-medium">
        <Dot className={alert ? 'bg-alert' : 'bg-healthy'} /> {sensor.id} ·{' '}
        {sensor.place}
      </div>
      <div className="mt-3 text-[26px] leading-none font-bold tabular-nums">
        {alert ? value : value.toFixed(sensor.decimals)}
        {info.unit && (
          <span className="ml-1 text-[15px] font-medium">{info.unit}</span>
        )}
      </div>
      <Spark seed={FARM_SENSORS.indexOf(sensor)} spike={alert} />
      <div
        className={`mt-2 text-[13px] ${alert ? 'text-alert font-medium' : 'text-muted'}`}
      >
        {alert ? 'Above normal' : info.label}
      </div>
    </motion.div>
  )
}

// Hand-made 24 h trend line. The spike version rises at the end.
function Spark({ seed, spike }: { seed: number; spike: boolean }) {
  const points = Array.from({ length: 12 }, (_, i) => {
    const wave = Math.sin(i * 0.9 + seed * 1.7)
    const y = spike ? (i > 8 ? 8 + (i - 8) * 7 : 8 + 2 * wave) : 18 + 6 * wave
    return `${(i / 11) * 100},${30 - y}`
  })
  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className="mt-2 h-10 w-full"
      aria-hidden
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={spike ? 'stroke-alert' : 'stroke-ink'}
      />
    </svg>
  )
}
