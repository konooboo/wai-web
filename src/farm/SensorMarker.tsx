import { motion, useTransform, type MotionValue } from 'motion/react'
import { useState } from 'react'
import { ALERT_SENSOR_ID, sensorInfo, type FarmSensor } from './sensors'
import { STORY } from './story'

type Props = {
  sensor: FarmSensor
  index: number
  progress: MotionValue<number>
}

// The lidar pulses in the 3D scene replace a CSS pulse here.
function Dot({ tone }: { tone: 'healthy' | 'alert' }) {
  const fill = tone === 'healthy' ? 'bg-healthy' : 'bg-alert'
  return (
    <span className={`absolute inset-0 rounded-full ${fill} ring-ink ring-2`} />
  )
}

// FarmScene positions this marker on its 3D anchor with `translate`.
export function SensorMarker({ sensor, index, progress }: Props) {
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
  const cardPos = isAlert
    ? 'top-full mt-4 left-1/2 -translate-x-1/2'
    : `${left ? 'right-full mr-3' : 'left-full ml-3'} ${above ? 'bottom-0' : 'top-1/2 -translate-y-1/2'}`

  return (
    <motion.div
      data-anchor={sensor.id}
      className={`invisible absolute top-0 left-0 ${open ? 'z-30' : isAlert ? 'z-20' : 'z-10'}`}
      style={{
        opacity: appear,
        scale,
      }}
    >
      <button
        type="button"
        aria-label={`Sensor ${sensor.id}, ${sensor.place}: ${info.label} ${sensor.value} ${info.unit}`}
        className="focus-visible:outline-ink absolute size-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full outline-offset-2 focus-visible:outline-2"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className="absolute inset-[10px]">
          <motion.span className="absolute inset-0" style={{ opacity: green }}>
            <Dot tone="healthy" />
          </motion.span>
          {isAlert && (
            <motion.span className="absolute inset-0" style={{ opacity: red }}>
              <Dot tone="alert" />
            </motion.span>
          )}
        </span>
      </button>

      <motion.div
        aria-hidden
        className={`border-line pointer-events-none absolute w-36 rounded-lg border bg-white px-2.5 py-1.5 font-mono text-xs md:w-40 md:px-3 md:py-2 ${cardPos}`}
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
