import { motion, useTransform, type MotionValue } from 'motion/react'
import { useState } from 'react'
import { ALERT_SENSOR_ID, sensorInfo, type FarmSensor } from './sensors'
import { STORY } from './story'

type Props = {
  sensor: FarmSensor
  index: number
  progress: MotionValue<number>
  reduced: boolean
}

function Pulse({ colour, delay }: { colour: string; delay: number }) {
  return (
    <motion.span
      className={`absolute inset-0 rounded-full border ${colour}`}
      initial={{ scale: 1, opacity: 0.7 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay }}
    />
  )
}

function Dot({
  tone,
  pulse,
  delay,
}: {
  tone: 'healthy' | 'alert'
  pulse: boolean
  delay: number
}) {
  const fill = tone === 'healthy' ? 'bg-healthy' : 'bg-alert'
  const ring = tone === 'healthy' ? 'border-healthy' : 'border-alert'
  return (
    <span className="absolute inset-0">
      {pulse ? (
        <Pulse colour={ring} delay={delay} />
      ) : (
        <span
          className={`absolute -inset-1 rounded-full border ${ring} opacity-60`}
        />
      )}
      <span
        className={`absolute inset-0 rounded-full ${fill} ring-2 ring-white`}
      />
    </span>
  )
}

export function SensorMarker({ sensor, index, progress, reduced }: Props) {
  const [open, setOpen] = useState(false)
  const info = sensorInfo(sensor.kind)
  const isAlert = sensor.id === ALERT_SENSOR_ID
  const start = STORY.sensors[0] + index * 0.012
  const appear = useTransform(progress, [start, start + 0.04], [0, 1])
  const scale = useTransform(appear, [0, 1], [0.3, 1])
  const alertStart = STORY.alert[0]
  const red = useTransform(progress, [alertStart, alertStart + 0.03], [0, 1])
  const green = useTransform(red, (v) => 1 - (isAlert ? v : 0))
  const value = useTransform(
    progress,
    [...STORY.alert],
    [sensor.value, sensor.alertValue ?? sensor.value],
  )
  const reading = useTransform(value, (v) =>
    v >= 10 && isAlert ? v.toFixed(0) : v.toFixed(sensor.decimals),
  )
  const autoCard = useTransform(
    progress,
    [alertStart, alertStart + 0.04],
    [0, 1],
  )

  const left = sensor.x > 0.5
  const above = sensor.y > 0.75
  const cardPos = `${left ? 'right-full mr-3' : 'left-full ml-3'} ${above ? 'bottom-0' : 'top-1/2 -translate-y-1/2'}`
  const delay = index * 0.37

  return (
    <motion.div
      className={`absolute ${open ? 'z-30' : isAlert ? 'z-20' : 'z-10'}`}
      style={{
        left: `${sensor.x * 100}%`,
        top: `${sensor.y * 100}%`,
        opacity: appear,
        scale,
      }}
    >
      <button
        type="button"
        aria-label={`Sensor ${sensor.id}, ${sensor.place}: ${info.label} ${sensor.value} ${info.unit}`}
        className="absolute size-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full outline-offset-2"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className="absolute inset-[9px]">
          <motion.span className="absolute inset-0" style={{ opacity: green }}>
            <Dot tone="healthy" pulse={!reduced} delay={delay} />
          </motion.span>
          {isAlert && (
            <motion.span className="absolute inset-0" style={{ opacity: red }}>
              <Dot tone="alert" pulse={!reduced} delay={0} />
            </motion.span>
          )}
        </span>
      </button>

      <motion.div
        aria-hidden
        className={`border-line pointer-events-none absolute w-40 rounded-lg border bg-white px-3 py-2 font-mono text-xs ${cardPos}`}
        style={{ opacity: open ? 1 : isAlert ? autoCard : 0 }}
      >
        <p className="text-muted text-[10px] tracking-wider uppercase">
          {sensor.id} · {sensor.place}
        </p>
        <p className="text-ink mt-1 font-sans text-sm">{info.label}</p>
        <p className="mt-0.5 text-base">
          <motion.span className={isAlert ? 'text-alert' : undefined}>
            {isAlert ? reading : sensor.value.toFixed(sensor.decimals)}
          </motion.span>
          {info.unit && (
            <span className="text-muted ml-1 text-xs">{info.unit}</span>
          )}
        </p>
        <p className="relative mt-1 h-4 text-[10px] tracking-wider uppercase">
          <motion.span
            className="text-healthy absolute inset-0"
            style={{ opacity: green }}
          >
            ● Normal
          </motion.span>
          {isAlert && (
            <motion.span
              className="text-alert absolute inset-0"
              style={{ opacity: red }}
            >
              ● Above normal
            </motion.span>
          )}
        </p>
      </motion.div>
    </motion.div>
  )
}
