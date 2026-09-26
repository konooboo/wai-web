import { NZ_COAST } from './nzCoast'
import { WORLD, type Vec3 } from './pointCloud'
import { MAP_METRES } from './terrain'

// World units per km. The farm map and the country share one scale.
const KM = WORLD / (MAP_METRES / 1000)
const COARSE_KM = 5
const FINE_KM = 0.8
const FINE_RADIUS_KM = 45
const LOCAL_KM = 0.1
const LOCAL_RADIUS_KM = 5
const COAST_STEP_KM = 1

export type NzDots = {
  count: number
  // x, y, z per dot.
  position: Float32Array
  // Per dot: distance to the farm in km, kind (0 land, 1 coast, 2 near farm,
  // 3 next to the farm).
  data: Float32Array
  // Middle of the country, to frame the first view.
  centre: Vec3
}

const RINGS = NZ_COAST.map((ring) => ring.map((v) => v / 10))

function onLand(x: number, y: number) {
  let inside = false
  for (const r of RINGS)
    for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
      const yi = r[i + 1]
      const yj = r[j + 1]
      if (
        yi > y !== yj > y &&
        x < ((r[j] - r[i]) * (y - yi)) / (yj - yi) + r[i]
      )
        inside = !inside
    }
  return inside
}

// Dots on the land of New Zealand, in km from the farm site.
export function buildNzDots(): NzDots {
  const pos: number[] = []
  const data: number[] = []
  const push = (x: number, y: number, kind: number) => {
    pos.push(x * KM, 0, y * KM)
    data.push(Math.hypot(x, y), kind)
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const r of RINGS)
    for (let i = 0; i < r.length; i += 2) {
      minX = Math.min(minX, r[i])
      maxX = Math.max(maxX, r[i])
      minY = Math.min(minY, r[i + 1])
      maxY = Math.max(maxY, r[i + 1])
    }

  for (let y = minY; y < maxY; y += COARSE_KM)
    for (let x = minX; x < maxX; x += COARSE_KM) if (onLand(x, y)) push(x, y, 0)

  // Leave a hole for the farm point cloud.
  for (let y = -FINE_RADIUS_KM; y < FINE_RADIUS_KM; y += FINE_KM)
    for (let x = -FINE_RADIUS_KM; x < FINE_RADIUS_KM; x += FINE_KM) {
      const d = Math.hypot(x, y)
      if (d < FINE_RADIUS_KM && Math.max(Math.abs(x), Math.abs(y)) > 0.6)
        if (onLand(x, y)) push(x, y, 2)
    }
  for (let y = -LOCAL_RADIUS_KM; y < LOCAL_RADIUS_KM; y += LOCAL_KM)
    for (let x = -LOCAL_RADIUS_KM; x < LOCAL_RADIUS_KM; x += LOCAL_KM)
      if (
        Math.hypot(x, y) < LOCAL_RADIUS_KM &&
        Math.max(Math.abs(x), Math.abs(y)) > 0.45
      )
        push(x, y, 3)

  for (const r of RINGS)
    for (let i = 0; i < r.length; i += 2) {
      const j = (i + 2) % r.length
      const len = Math.hypot(r[j] - r[i], r[j + 1] - r[i + 1])
      for (let t = 0; t < len; t += COAST_STEP_KM)
        push(
          r[i] + ((r[j] - r[i]) * t) / len,
          r[i + 1] + ((r[j + 1] - r[i + 1]) * t) / len,
          1,
        )
    }

  return {
    count: pos.length / 3,
    position: Float32Array.from(pos),
    data: Float32Array.from(data),
    centre: [((minX + maxX) / 2) * KM, 0, ((minY + maxY) / 2) * KM],
  }
}
