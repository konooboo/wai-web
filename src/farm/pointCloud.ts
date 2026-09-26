import { MAP_METRES, PADDOCK_7, type Heightmap, type Point } from './terrain'

export const SCAN_RADIUS = 0.54
export const ALERT_RADIUS = 0.17

// The map is WORLD units wide in the 3D scene. Heights are exaggerated.
export const WORLD = 2
const HEIGHT_SCALE = (WORLD / MAP_METRES) * 4
// Normalised distance between rings, and between returns along a ring.
const STEP = 0.0024
// Metres between points in a vertical wall (tree belt, shed, bank).
const WALL_STEP = 0.7
const WALL_MIN = 1.4

export type Vec3 = [number, number, number]

export type PointCloud = {
  count: number
  // x, y, z per point.
  position: Float32Array
  // Per point: distance to own sensor, distance to the alert sensor,
  // pulse phase of own sensor, 1 inside Paddock 7.
  data: Float32Array
  // Screen anchors for the DOM markers, keyed by sensor id and 'paddock'.
  anchors: Record<string, Vec3>
  // Paddock 7 outline on the ground, x, y, z per vertex.
  paddockLine: Float32Array
}

function insidePolygon(x: number, y: number, poly: Point[]) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]
    const b = poly[j]
    if (
      a.y > y !== b.y > y &&
      x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
    )
      inside = !inside
  }
  return inside
}

// Lidar-style rings around each sensor, draped on the terrain. Each sensor
// keeps only the points that are nearer to it than to any other sensor.
// Water returns no points. Steep steps become vertical walls of points.
export function buildPointCloud(
  sensors: (Point & { id: string })[],
  alertSensor: number,
  map: Heightmap,
): PointCloud {
  const cell = (v: number) =>
    Math.min(map.size - 1, Math.max(0, Math.floor(v * map.size)))
  const index = (x: number, y: number) => cell(y) * map.size + cell(x)
  let floor = Infinity
  for (const h of map.ground) floor = Math.min(floor, h)
  const heightAt = (x: number, y: number) => map.heights[index(x, y)]
  const groundAt = (x: number, y: number) => map.ground[index(x, y)]
  const toWorld = (x: number, y: number, h: number): Vec3 => [
    (x - 0.5) * WORLD,
    (h - floor) * HEIGHT_SCALE,
    (y - 0.5) * WORLD,
  ]
  const r3 = 3 / map.size
  const lowest = (x: number, y: number) => {
    let h = heightAt(x, y)
    for (let dx = -r3; dx <= r3; dx += r3)
      for (let dy = -r3; dy <= r3; dy += r3)
        h = Math.min(h, heightAt(x + dx, y + dy))
    return h
  }

  const pos: number[] = []
  const data: number[] = []
  const alert = sensors[alertSensor]
  let seed = 11
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const push = (x: number, y: number, h: number, r: number, si: number) => {
    pos.push(...toWorld(x, y, h))
    data.push(
      r,
      Math.hypot(x - alert.x, y - alert.y),
      si * 0.37,
      insidePolygon(x, y, PADDOCK_7) ? 1 : 0,
    )
  }

  sensors.forEach((s, si) => {
    const h0 = groundAt(s.x, s.y)
    let r = 0.005
    while (r < SCAN_RADIUS) {
      const step = STEP / r
      const start = rand() * step
      for (let a = start; a < Math.PI * 2; a += step) {
        if (rand() < 0.12) continue
        let x = s.x + Math.cos(a) * r
        let y = s.y + Math.sin(a) * r
        // Rings bend with the terrain, as in a real scan.
        const bend = 1 - (groundAt(x, y) - h0) * 0.0012
        x = s.x + Math.cos(a) * r * bend
        y = s.y + Math.sin(a) * r * bend
        if (x < 0 || x > 1 || y < 0 || y > 1) continue
        const k = index(x, y)
        if (map.water[k]) continue
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
        const h = map.heights[k]
        push(x, y, h, r, si)
        if (map.cover[k] === 2) {
          // Canopy: a few returns inside the crown, most near the top.
          const base = map.canopyBase[k]
          const hits = rand() < 0.5 ? 2 : 3
          for (let i = 0; i < hits; i++)
            push(x, y, base + (h - base) * (0.3 + 0.7 * rand()), r, si)
        } else {
          const low = lowest(x, y)
          if (h - low > WALL_MIN)
            for (let z = h - WALL_STEP; z > low; z -= WALL_STEP)
              push(x, y, z, r, si)
        }
      }
      r += STEP
    }
  })

  // Fence posts, swaths, bales and troughs belong to the nearest sensor.
  for (let i = 0; i < map.props.length; i += 4) {
    const x = map.props[i + 1]
    const y = map.props[i + 2]
    let si = 0
    let best = Infinity
    sensors.forEach((s, j) => {
      const d = Math.hypot(x - s.x, y - s.y)
      if (d < best) {
        best = d
        si = j
      }
    })
    push(x, y, groundAt(x, y) + map.props[i + 3], best, si)
  }

  const anchors: Record<string, Vec3> = {}
  for (const s of sensors) anchors[s.id] = toWorld(s.x, s.y, heightAt(s.x, s.y))
  const corner = PADDOCK_7[1]
  anchors.paddock = toWorld(corner.x, corner.y, heightAt(corner.x, corner.y))

  const line: number[] = []
  const SAMPLES = 32
  for (let i = 0; i <= PADDOCK_7.length * SAMPLES; i++) {
    const edge = Math.floor(i / SAMPLES)
    const a = PADDOCK_7[edge % PADDOCK_7.length]
    const b = PADDOCK_7[(edge + 1) % PADDOCK_7.length]
    const t = (i % SAMPLES) / SAMPLES
    const x = a.x + (b.x - a.x) * t
    const y = a.y + (b.y - a.y) * t
    line.push(...toWorld(x, y, heightAt(x, y) + 1))
  }

  return {
    count: pos.length / 3,
    position: Float32Array.from(pos),
    data: Float32Array.from(data),
    anchors,
    paddockLine: Float32Array.from(line),
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
