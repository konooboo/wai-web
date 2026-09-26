import { motion, useTransform, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'
import { Koru } from '../components/Koru'
import { ALERT_EXAMPLE, SENSORS } from '../content'
import { FARM_SENSORS, type FarmSensor } from './sensors'
import { STORY } from './story'
import { MAP_METRES } from './terrain'

// Static port of the Wai app (Home and Alert screens), styled as wai-carwho
// ac11e47. It renders at this logical size and Phone scales it to the screen.
export const APP_WIDTH = 320
export const APP_HEIGHT = 693

const FARM = `${(MAP_METRES * MAP_METRES) / 10000} ha farm`
const ALERT_TITLE = 'Turbidity high'
const S3 = FARM_SENSORS.find((s) => s.alertValue != null)!
const GLANCE = FARM_SENSORS.slice(0, 4)
const S3_LIMIT = 10 // NTU, the app's turbidity limit

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
    score: 46,
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

// What the Wai AI card on Home says in each state. TODO(data): confirm.
const TIP = {
  ok: {
    title: 'All looks good',
    body: 'Water quality is in range and soil moisture is steady, so no checks are needed today.',
  },
  alert: {
    title: 'Hold fertiliser on Paddock 7',
    body: `${S3.id} is at ${S3.alertValue} NTU after 22 mm of rain. Hold fertiliser for 48 h and check the Paddock 7 fence.`,
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

const CHOICES = [
  ['Mark handled', 'Clears the alert until the next problem'],
  [
    'Snooze 1 hour',
    'Hides the alert, then shows it again if still out of limits',
  ],
]

export function PhoneApp({ progress }: { progress: MotionValue<number> }) {
  const alert = useTransform(progress, [...STORY.alertCard], [0, 1])
  // Fade the old state out, then the new state in, so the text never overlaps.
  const ok = useTransform(alert, [0, 0.5], [1, 0])
  const bad = useTransform(alert, [0.5, 1], [0, 1])
  const shift = useTransform(alert, [0, 1], [-96, 0])
  const detail = useTransform(progress, [...STORY.suggestion], [0, 1])
  const homeX = useTransform(detail, [0, 1], ['0%', '-30%'])
  const detailX = useTransform(detail, [0, 1], ['100%', '0%'])
  const s3 = sensorInfo(S3)

  return (
    <div className="text-ink bg-paper relative size-full overflow-hidden font-sans">
      <motion.div
        className="absolute inset-0 px-4 pt-[34px]"
        style={{ x: homeX }}
      >
        <div className="bg-paper relative z-10 flex min-h-[64px] items-center justify-between gap-3 pt-4">
          <h1 className="font-logo flex items-center gap-2 text-[28px] leading-none font-semibold tracking-tight [font-stretch:125%]">
            <Koru className="size-6" />
            wai
          </h1>
          <div className="flex items-center gap-3">
            <Label>{FARM}</Label>
            <span className="border-line grid size-10 place-items-center rounded-full border bg-white">
              <svg viewBox="0 0 24 24" className="size-5" {...STROKE}>
                <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
              </svg>
            </span>
          </div>
        </div>

        <motion.div className="mt-4 flex flex-col gap-7" style={{ y: shift }}>
          <motion.div
            className="border-line -mb-4 flex h-[82px] items-center gap-3 rounded-2xl border bg-white px-4"
            style={{ opacity: alert }}
          >
            <div className="flex-1">
              <Label className="flex justify-between">
                <span className="text-alert">● Alert</span>
                <span>{ALERT_EXAMPLE.time}</span>
              </Label>
              <div className="mt-1 font-medium">{ALERT_EXAMPLE.sensor}</div>
              <div className="text-alert font-mono text-[13px]">
                {ALERT_TITLE} · {S3.alertValue} {s3.unit}
              </div>
            </div>
            <Chevron />
          </motion.div>

          <div className="grid [&>*]:[grid-area:1/1]">
            <AICard note="From your sensors now" opacity={ok}>
              <Tip {...TIP.ok} />
            </AICard>
            <AICard note="From your sensors now" bad opacity={bad}>
              <Tip {...TIP.alert} />
            </AICard>
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-medium tracking-tight">In Focus</h2>
            <div className="grid [&>*]:[grid-area:1/1]">
              <HealthCard state={HEALTH.ok} good opacity={ok} />
              <HealthCard state={HEALTH.alert} good={false} opacity={bad} />
            </div>
            <div className="-mt-1 flex justify-center">
              {[0, 1, 2].map((i) => (
                <span key={i} className="grid h-6 w-4 place-items-center">
                  <span
                    className={`size-1.5 rounded-full ${i === 0 ? 'bg-ink' : 'bg-line'}`}
                  />
                </span>
              ))}
            </div>
          </section>

          <section className="-mt-4 flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[20px] font-medium tracking-tight">
                At a Glance
              </h2>
              <span className="text-muted text-[14px] underline underline-offset-4">
                See all
              </span>
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
        className="bg-paper absolute inset-0 flex flex-col gap-6 px-4 pt-[34px] shadow-[-8px_0_24px_rgb(0_0_0/0.08)]"
        style={{ x: detailX }}
      >
        <div>
          <div className="flex min-h-[64px] items-center gap-2 pt-4">
            <svg viewBox="0 0 24 24" className="-ml-1 size-5" {...STROKE}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <h1 className="text-[20px] font-medium">{ALERT_EXAMPLE.sensor}</h1>
          </div>
          <Label>
            <span className="text-alert">● Alert</span> · started{' '}
            {ALERT_EXAMPLE.time}
          </Label>
          <div className="mt-1 text-[28px] leading-tight font-medium tracking-tight">
            {ALERT_TITLE}
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-muted text-left font-mono text-[11px] tracking-wider uppercase">
              <th className="pb-1.5 font-normal" />
              <th className="pb-1.5 text-right font-normal">Now</th>
              <th className="pb-1.5 text-right font-normal">Usual</th>
              <th className="pb-1.5 text-right font-normal">Limit</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[14px]">
            <tr className="border-line border-t">
              <td className="py-2.5 font-sans text-[15px]">
                {s3.label}
                <span className="text-muted font-mono text-xs"> {s3.unit}</span>
              </td>
              <td className="text-alert py-2.5 text-right">
                {S3.alertValue!.toFixed(S3.decimals)}
              </td>
              <td className="py-2.5 text-right">
                {S3.value.toFixed(S3.decimals)}
              </td>
              <td className="text-muted py-2.5 text-right">≤ {S3_LIMIT}</td>
            </tr>
          </tbody>
        </table>

        <AICard note="From this sensor" bad>
          <div className="flex flex-col gap-4">
            <DetailBlock title="What's happening">
              {ALERT_EXAMPLE.cause}
            </DetailBlock>
            <div className="text-alert text-[15px] leading-relaxed font-medium whitespace-pre-line">
              <span className="font-mono text-xs tracking-wider uppercase">
                Next
              </span>{' '}
              {'\n' + ALERT_EXAMPLE.action}
            </div>
            <DetailBlock title="If nothing changes">
              {ALERT_EXAMPLE.risk}
            </DetailBlock>
          </div>
        </AICard>

        <div className="flex flex-col gap-2.5">
          <div className="text-[20px] font-medium tracking-tight">
            What next?
          </div>
          {CHOICES.map(([name, sub], i) => (
            <div
              key={name}
              className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 ${i === 0 ? 'border-ink' : 'border-line'}`}
            >
              <div className="flex-1">
                <div className="text-[16px] font-medium">{name}</div>
                <div className="text-muted text-[13px]">{sub}</div>
              </div>
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${i === 0 ? 'border-ink' : 'border-line'}`}
              >
                {i === 0 && <span className="bg-ink size-3 rounded-full" />}
              </span>
            </div>
          ))}
          <div className="mt-2 flex items-center gap-4">
            <span className="text-muted flex-1 text-center text-[16px] underline underline-offset-4">
              Cancel
            </span>
            <span className="bg-ink text-paper flex-1 rounded-full py-3 text-center text-[16px]">
              Confirm
            </span>
          </div>
        </div>
      </motion.div>

      <nav className="border-line bg-paper absolute inset-x-0 bottom-0 flex border-t pb-5">
        {TABS.map((t, i) => (
          <div
            key={t.label}
            className={`relative flex flex-1 flex-col items-center gap-1 pt-2.5 pb-2 font-mono text-[10px] tracking-wider uppercase ${i === 0 ? 'text-ink' : 'text-muted'}`}
          >
            <svg viewBox="0 0 24 24" className="size-6" {...STROKE}>
              <path d={t.icon} />
            </svg>
            {t.label}
            {t.label === 'Alerts' && (
              <motion.span
                className="bg-alert text-paper absolute top-1.5 left-1/2 ml-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px]"
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
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const sensorInfo = (s: FarmSensor) => SENSORS.find((x) => x.id === s.kind)!

function Label({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`text-muted font-mono text-xs tracking-wider uppercase ${className}`}
    >
      {children}
    </div>
  )
}

function Dot({ className }: { className: string }) {
  return (
    <span
      className={`inline-block size-2 shrink-0 rounded-full ${className}`}
    />
  )
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="text-muted size-4" {...STROKE}>
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
      <Label>{title}</Label>
      <div className="mt-1 text-[15px] leading-relaxed">{children}</div>
    </div>
  )
}

// The app's AICard: a status-coloured bar, a soft pulsing glow and the koru.
function AICard({
  note,
  bad = false,
  opacity,
  children,
}: {
  note: string
  bad?: boolean
  opacity?: MotionValue<number>
  children: ReactNode
}) {
  const tone = bad ? 'text-alert' : 'text-healthy'
  return (
    <motion.div
      className="border-line relative shrink-0 overflow-hidden rounded-2xl border bg-white p-4"
      style={{ opacity }}
    >
      <span
        className={`absolute top-0 left-4 h-0.5 w-6 ${bad ? 'bg-alert' : 'bg-healthy'}`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute -top-6 -left-6 size-32 rounded-full blur-3xl motion-safe:animate-[ai-glow_4s_ease-in-out_infinite] ${bad ? 'bg-alert/15' : 'bg-healthy/15'}`}
      />
      <div className={`relative flex items-center gap-2 ${tone}`}>
        <Koru className="size-5" />
        <span className="font-mono text-xs tracking-wider whitespace-nowrap uppercase">
          Wai AI
        </span>
        <span className="text-muted ml-auto font-mono text-[11px] whitespace-nowrap">
          {note}
        </span>
      </div>
      <div className="relative mt-3">{children}</div>
    </motion.div>
  )
}

function Tip({ title, body }: { title: string; body: string }) {
  return (
    <>
      <div className="text-[22px] leading-tight font-medium tracking-tight">
        {title}
      </div>
      <div className="text-muted mt-1 text-[15px] leading-relaxed">{body}</div>
    </>
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
    <motion.div
      className="border-line rounded-2xl border bg-white p-4"
      style={{ opacity }}
    >
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
          <div className="relative text-[28px] font-medium tracking-tight tabular-nums">
            {state.score}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[24px] leading-tight font-medium tracking-tight">
            {state.label}
          </div>
          <div className="text-muted mt-0.5 text-[14px] leading-snug">
            {state.tip}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {state.factors.map(([v, k]) => (
          <div key={k}>
            <div className="text-[18px] font-medium">{v}</div>
            <Label>{k}</Label>
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
      className="border-line flex flex-col rounded-2xl border bg-white p-4"
      style={{ opacity }}
    >
      <div className="flex items-center gap-2 text-[15px] font-medium">
        <Dot className={alert ? 'bg-alert' : 'bg-healthy'} /> {sensor.id} ·{' '}
        {sensor.place}
      </div>
      <div className="mt-3 text-[26px] leading-none font-medium tracking-tight tabular-nums">
        {value.toFixed(alert ? 0 : sensor.decimals)}
        {info.unit && (
          <span className="text-muted ml-1 font-mono text-[13px]">
            {info.unit}
          </span>
        )}
      </div>
      <Spark seed={FARM_SENSORS.indexOf(sensor)} spike={alert} />
      <div
        className={`mt-2 font-mono text-[14px] ${alert ? 'text-alert' : ''}`}
      >
        {alert ? ALERT_TITLE : info.label}
      </div>
      <div className="text-muted font-mono text-xs">
        {alert ? 'Out of limits' : 'Normal'} · live
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
        strokeWidth="1.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={spike ? 'stroke-alert' : 'stroke-ink'}
      />
    </svg>
  )
}
