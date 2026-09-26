import type { Heightmap, Point } from './terrain'

export const SCAN_RADIUS = 0.42
export const ALERT_RADIUS = 0.17

export type PointCloud = {
  count: number
  // x, y, distance to own sensor. Sorted by distance.
  x: Float32Array
  y: Float32Array
  d: Float32Array
  // Point indices near the alert sensor, sorted by distance to it.
  alertIndex: Uint32Array
  alertD: Float32Array
}

// Lidar-style rings around each sensor. Each sensor keeps only the points
// that are nearer to it than to any other sensor.
export function buildPointCloud(
  sensors: Point[],
  alertSensor: number,
  map: Heightmap,
): PointCloud {
  const xs: number[] = []
  const ys: number[] = []
  const ds: number[] = []
  let seed = 11
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const heightAt = (x: number, y: number) => {
    const cx = Math.min(map.size - 1, Math.max(0, Math.floor(x * map.size)))
    const cy = Math.min(map.size - 1, Math.max(0, Math.floor(y * map.size)))
    return map.heights[cy * map.size + cx]
  }

  sensors.forEach((s, si) => {
    const h0 = heightAt(s.x, s.y)
    let r = 0.01
    while (r < SCAN_RADIUS) {
      const step = 0.0048 / r
      const start = rand() * step
      for (let a = start; a < Math.PI * 2; a += step) {
        if (rand() < 0.12) continue
        let x = s.x + Math.cos(a) * r
        let y = s.y + Math.sin(a) * r
        // Rings bend with the terrain, as in a real scan.
        const bend = 1 - (heightAt(x, y) - h0) * 0.0012
        x = s.x + Math.cos(a) * r * bend
        y = s.y + Math.sin(a) * r * bend
        if (x < 0 || x > 1 || y < 0 || y > 1) continue
        const own = Math.hypot(x - s.x, y - s.y)
        let nearest = true
        for (let j = 0; j < sensors.length; j++) {
          if (
            j !== si &&
            Math.hypot(x - sensors[j].x, y - sensors[j].y) < own
          ) {
            nearest = false
            break
          }
        }
        if (!nearest) continue
        xs.push(x)
        ys.push(y)
        ds.push(r)
      }
      r += 0.0045 + 0.018 * r
    }
  })

  const order = ds.map((_, i) => i).sort((a, b) => ds[a] - ds[b])
  const count = order.length
  const x = new Float32Array(count)
  const y = new Float32Array(count)
  const d = new Float32Array(count)
  order.forEach((src, i) => {
    x[i] = xs[src]
    y[i] = ys[src]
    d[i] = ds[src]
  })

  const a = sensors[alertSensor]
  const near: [number, number][] = []
  for (let i = 0; i < count; i++) {
    const dist = Math.hypot(x[i] - a.x, y[i] - a.y)
    if (dist < ALERT_RADIUS) near.push([i, dist])
  }
  near.sort((p, q) => p[1] - q[1])
  return {
    count,
    x,
    y,
    d,
    alertIndex: Uint32Array.from(near, (p) => p[0]),
    alertD: Float32Array.from(near, (p) => p[1]),
  }
}

// Turbo colour map (Google, 2019), polynomial fit. t = 0 blue, 1 red.
export function turbo(t: number) {
  const r =
    0.13572138 +
    t *
      (4.6153926 +
        t *
          (-42.66032258 +
            t * (132.13108234 + t * (-152.94239396 + t * 59.28637943))))
  const g =
    0.09140261 +
    t *
      (2.19418839 +
        t *
          (4.84296658 + t * (-14.18503333 + t * (4.27729857 + t * 2.82956604))))
  const b =
    0.1066733 +
    t *
      (12.64194608 +
        t *
          (-60.58204836 +
            t * (110.36276771 + t * (-89.90310912 + t * 27.34824973))))
  const c = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255)
  return `rgb(${c(r)} ${c(g)} ${c(b)})`
}

const BUCKETS = 48
// Near the sensor: red. Far: blue.
const PALETTE = Array.from({ length: BUCKETS }, (_, i) =>
  turbo(0.86 - (i / (BUCKETS - 1)) * 0.76),
)
const ALERT_COLOUR = '#d9482b'

// Draws the revealed points. `scan` 0..1 moves the ring out. `alert` 0..1
// turns the points near the alert sensor red.
export function drawPointCloud(
  ctx: CanvasRenderingContext2D,
  cloud: PointCloud,
  size: number,
  pointSize: number,
  scan: number,
  alert: number,
  stride: number,
) {
  const radius = scan * SCAN_RADIUS
  const front = 0.035
  let bucket = -1
  const half = pointSize / 2
  for (let i = 0; i < cloud.count; i += stride) {
    const d = cloud.d[i]
    if (d > radius) break
    const b = Math.min(BUCKETS - 1, Math.floor((d / SCAN_RADIUS) * BUCKETS))
    // Points fade in behind the moving ring.
    const behind = radius - d
    const rest = 0.7 - 0.3 * alert
    const alpha =
      behind < front && scan < 1 ? 1 - (behind / front) * (1 - rest) : rest
    if (b !== bucket || ctx.globalAlpha !== alpha) {
      bucket = b
      ctx.fillStyle = PALETTE[b]
      ctx.globalAlpha = alpha
    }
    ctx.fillRect(
      cloud.x[i] * size - half,
      cloud.y[i] * size - half,
      pointSize,
      pointSize,
    )
  }

  if (alert > 0) {
    const reach = alert * ALERT_RADIUS
    ctx.fillStyle = ALERT_COLOUR
    for (let j = 0; j < cloud.alertIndex.length; j += stride) {
      const dist = cloud.alertD[j]
      if (dist > reach) break
      const i = cloud.alertIndex[j]
      if (cloud.d[i] > radius) continue
      ctx.globalAlpha = (1 - dist / ALERT_RADIUS) ** 0.6
      ctx.fillRect(
        cloud.x[i] * size - half,
        cloud.y[i] * size - half,
        pointSize,
        pointSize,
      )
    }
  }
  ctx.globalAlpha = 1
}
