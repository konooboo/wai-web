// Procedural farm terrain. Map coordinates are normalised: x east, y south,
// both 0..1. Heights are metres. The 2D map and the later 3D map share this.

export type Point = { x: number; y: number }

export const MAP_METRES = 800
export const HEIGHTMAP_SIZE = 768

export type Heightmap = {
  size: number
  cellMetres: number
  heights: Float32Array
  water: Uint8Array
}

// Fence grid, rotated to follow the farm boundary.
const FENCE_ANGLE = 0.14
const FENCE_A = [0.06, 0.21, 0.37, 0.52, 0.68, 0.83, 0.97]
const FENCE_B = [0.02, 0.19, 0.35, 0.5, 0.66, 0.82, 0.96]
const COS = Math.cos(FENCE_ANGLE)
const SIN = Math.sin(FENCE_ANGLE)

const toGrid = (x: number, y: number) => ({
  a: COS * x + SIN * y,
  b: -SIN * x + COS * y,
})
const fromGrid = (a: number, b: number): Point => ({
  x: COS * a - SIN * b,
  y: SIN * a + COS * b,
})

export const POND = { x: 0.76, y: 0.3, rx: 0.075, ry: 0.045, rot: -0.35 }
const YARD = { x: 0.87, y: 0.1, r: 0.07 }

const STREAM_CONTROL: Point[] = [
  { x: 0.18, y: -0.04 },
  { x: 0.24, y: 0.08 },
  { x: 0.2, y: 0.2 },
  { x: 0.3, y: 0.31 },
  { x: 0.41, y: 0.38 },
  { x: 0.44, y: 0.5 },
  { x: 0.38, y: 0.61 },
  { x: 0.45, y: 0.72 },
  { x: 0.56, y: 0.8 },
  { x: 0.58, y: 0.92 },
  { x: 0.66, y: 1.04 },
]

const TRACK_CONTROL: Point[] = [
  { x: 1.04, y: 0.62 },
  { x: 0.95, y: 0.55 },
  { x: 0.92, y: 0.42 },
  { x: 0.9, y: 0.26 },
  { x: 0.86, y: 0.14 },
  { x: 0.74, y: 0.13 },
  { x: 0.6, y: 0.17 },
  { x: 0.48, y: 0.15 },
  { x: 0.36, y: 0.08 },
]

const DRAINS: Point[][] = [
  [
    { x: 0.95, y: 0.9 },
    { x: 0.62, y: 0.86 },
  ],
  [
    { x: 0.1, y: 0.62 },
    { x: 0.3, y: 0.64 },
    { x: 0.38, y: 0.63 },
  ],
]

// Shelter belts run along fence lines: [axis, line value, from, to].
const BELTS: ['a' | 'b', number, number, number][] = [
  ['b', FENCE_B[1], 0.52, 0.97],
  ['a', FENCE_A[1], 0.5, 0.96],
  ['b', FENCE_B[5], 0.68, 1.02],
  ['a', FENCE_A[5], 0.35, 0.66],
]

// Paddock 7 is the grid cell up-slope of sensor S3 (see sensors.ts).
const P7 = { a0: FENCE_A[3], a1: FENCE_A[4], b0: FENCE_B[2], b1: FENCE_B[3] }
export const PADDOCK_7: Point[] = [
  fromGrid(P7.a0, P7.b0),
  fromGrid(P7.a1, P7.b0),
  fromGrid(P7.a1, P7.b1),
  fromGrid(P7.a0, P7.b1),
]

// ---------- noise ----------

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(7)
const PERM = new Uint8Array(512)
{
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255]
}
const GX = new Float32Array(256)
const GY = new Float32Array(256)
for (let i = 0; i < 256; i++) {
  const angle = (i / 256) * Math.PI * 2
  GX[i] = Math.cos(angle)
  GY[i] = Math.sin(angle)
}

function perlin(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const X = xi & 255
  const Y = yi & 255
  const g00 = PERM[X + PERM[Y]]
  const g10 = PERM[X + 1 + PERM[Y]]
  const g01 = PERM[X + PERM[Y + 1]]
  const g11 = PERM[X + 1 + PERM[Y + 1]]
  const n00 = GX[g00] * xf + GY[g00] * yf
  const n10 = GX[g10] * (xf - 1) + GY[g10] * yf
  const n01 = GX[g01] * xf + GY[g01] * (yf - 1)
  const n11 = GX[g11] * (xf - 1) + GY[g11] * (yf - 1)
  const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10)
  const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10)
  const nx0 = n00 + u * (n10 - n00)
  const nx1 = n01 + u * (n11 - n01)
  return nx0 + v * (nx1 - nx0)
}

function fbm(x: number, y: number, octaves: number) {
  let sum = 0
  let amp = 1
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    sum += amp * perlin(x * freq + i * 17.3, y * freq - i * 9.1)
    amp *= 0.5
    freq *= 2.03
  }
  return sum
}

const smoothstep = (e0: number, e1: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

// ---------- polylines ----------

function catmullRom(points: Point[], samplesPerSegment: number): Point[] {
  const out: Point[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    for (let s = 0; s < samplesPerSegment; s++) {
      const t = s / samplesPerSegment
      const t2 = t * t
      const t3 = t2 * t
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 *
        (2 * b +
          (-a + c) * t +
          (2 * a - 5 * b + 4 * c - d) * t2 +
          (-a + 3 * b - 3 * c + d) * t3)
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) })
    }
  }
  out.push(points[points.length - 1])
  return out
}

function withMeanders(points: Point[], amount: number): Point[] {
  return points.map((p, i) => {
    const prev = points[Math.max(0, i - 1)]
    const next = points[Math.min(points.length - 1, i + 1)]
    const dx = next.x - prev.x
    const dy = next.y - prev.y
    const len = Math.hypot(dx, dy) || 1
    const offset = amount * fbm(i * 0.03, 3.7, 3)
    return { x: p.x - (dy / len) * offset, y: p.y + (dx / len) * offset }
  })
}

export const STREAM = withMeanders(catmullRom(STREAM_CONTROL, 40), 0.035)
const TRACK = catmullRom(TRACK_CONTROL, 24)

// Point on the stream at arc-length fraction t (0 = upstream, 1 = downstream).
export function streamPoint(t: number): Point {
  const lengths = [0]
  for (let i = 1; i < STREAM.length; i++) {
    const d = Math.hypot(
      STREAM[i].x - STREAM[i - 1].x,
      STREAM[i].y - STREAM[i - 1].y,
    )
    lengths.push(lengths[i - 1] + d)
  }
  const target = t * lengths[lengths.length - 1]
  const i = Math.max(
    1,
    lengths.findIndex((l) => l >= target),
  )
  const f = (target - lengths[i - 1]) / (lengths[i] - lengths[i - 1] || 1)
  return {
    x: STREAM[i - 1].x + (STREAM[i].x - STREAM[i - 1].x) * f,
    y: STREAM[i - 1].y + (STREAM[i].y - STREAM[i - 1].y) * f,
  }
}

// Writes the distance (normalised units) to the polyline into `dist`, for
// cells within `radius`. Other cells keep their value.
function stampPolyline(
  points: Point[],
  radius: number,
  size: number,
  dist: Float32Array,
) {
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const x0 = Math.max(0, Math.floor((Math.min(a.x, b.x) - radius) * size))
    const x1 = Math.min(
      size - 1,
      Math.ceil((Math.max(a.x, b.x) + radius) * size),
    )
    const y0 = Math.max(0, Math.floor((Math.min(a.y, b.y) - radius) * size))
    const y1 = Math.min(
      size - 1,
      Math.ceil((Math.max(a.y, b.y) + radius) * size),
    )
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len2 = dx * dx + dy * dy || 1
    for (let cy = y0; cy <= y1; cy++) {
      const py = (cy + 0.5) / size
      for (let cx = x0; cx <= x1; cx++) {
        const px = (cx + 0.5) / size
        const t = Math.min(
          1,
          Math.max(0, ((px - a.x) * dx + (py - a.y) * dy) / len2),
        )
        const d = Math.hypot(px - a.x - dx * t, py - a.y - dy * t)
        const k = cy * size + cx
        if (d < dist[k]) dist[k] = d
      }
    }
  }
}

function pondEllipse(x: number, y: number) {
  const dx = x - POND.x
  const dy = y - POND.y
  const c = Math.cos(POND.rot)
  const s = Math.sin(POND.rot)
  const u = (c * dx + s * dy) / POND.rx
  const v = (-s * dx + c * dy) / POND.ry
  return Math.hypot(u, v)
}

// Distance from the fence grid, and whether a fence may stand here.
function fenceDistance(a: number, b: number) {
  let d = 1
  if (b > FENCE_B[0] - 0.001 && b < FENCE_B[FENCE_B.length - 1] + 0.001)
    for (const u of FENCE_A) d = Math.min(d, Math.abs(a - u))
  if (a > FENCE_A[0] - 0.001 && a < FENCE_A[FENCE_A.length - 1] + 0.001)
    for (const v of FENCE_B) d = Math.min(d, Math.abs(b - v))
  return d
}

function beltHeight(a: number, b: number, x: number, y: number) {
  let h = 0
  for (const [axis, line, from, to] of BELTS) {
    const across = axis === 'a' ? a - line : b - line
    const along = axis === 'a' ? b : a
    if (along < from || along > to) continue
    const w = 0.009
    if (Math.abs(across) > w) continue
    const profile = 1 - (across / w) ** 2
    const crowns = 0.6 + 0.6 * fbm(x * 160, y * 160, 2)
    const ends =
      smoothstep(from, from + 0.01, along) * smoothstep(to, to - 0.01, along)
    h = Math.max(h, 9 * Math.sqrt(profile) * crowns * ends)
  }
  return h
}

// ---------- heightmap ----------

let cached: Heightmap | null = null

export function getHeightmap(size = HEIGHTMAP_SIZE): Heightmap {
  if (cached && cached.size === size) return cached

  const n = size * size
  const heights = new Float32Array(n)
  const water = new Uint8Array(n)
  const dStream = new Float32Array(n).fill(1)
  const dTrack = new Float32Array(n).fill(1)
  const dDrain = new Float32Array(n).fill(1)
  stampPolyline(STREAM, 0.16, size, dStream)
  stampPolyline(TRACK, 0.01, size, dTrack)
  for (const drain of DRAINS) stampPolyline(drain, 0.01, size, dDrain)

  const pondBase = 40 * (0.45 * (1 - POND.x) + 0.55 * (1 - POND.y))
  const pondLevel = pondBase + 18 * fbm(POND.x * 3, POND.y * 3, 2) - 2

  for (let cy = 0; cy < size; cy++) {
    const y = (cy + 0.5) / size
    for (let cx = 0; cx < size; cx++) {
      const x = (cx + 0.5) / size
      const k = cy * size + cx

      // Rolling hills, higher and rougher to the north-west.
      const regional = 40 * (0.45 * (1 - x) + 0.55 * (1 - y))
      const rough = 0.2 + 1.3 * (1 - x) * (1 - y)
      const low = 18 * fbm(x * 3, y * 3, 2)
      const wx = x + 0.04 * fbm(x * 6, y * 6, 2)
      const wy = y + 0.04 * fbm(x * 6 + 5.2, y * 6 - 2.4, 2)
      const detail =
        12 * rough * (fbm(wx * 3, wy * 3, 6) - fbm(wx * 3, wy * 3, 2))
      let h = regional + low + detail + 0.1 * fbm(x * 90, y * 90, 2)

      // Stream valley, flat flood plain and channel.
      const ds = dStream[k]
      h -= 9 * (1 - smoothstep(0, 0.15, ds)) ** 2
      const plainWidth = 0.028 + 0.014 * fbm(x * 7, y * 7, 2)
      const plain = 0.85 * (1 - smoothstep(plainWidth * 0.4, plainWidth, ds))
      h += (regional + low - 9 + 0.3 * fbm(x * 40, y * 40, 2) - h) * plain
      const channel = 0.0055
      if (ds < channel) {
        h -= 2 * Math.sqrt(1 - (ds / channel) ** 2)
        if (ds < channel * 0.55) water[k] = 1
      }
      // Riparian fence.
      if (Math.abs(ds - 0.032) < 0.0014) h += 0.3

      // Pond with an embankment on the down-slope side.
      const e = pondEllipse(x, y)
      if (e < 1.35) {
        const shore = smoothstep(1, 1.35, e)
        h = pondLevel + 0.4 + (h - pondLevel - 0.4) * shore
        const dam = x - POND.x + (y - POND.y) > 0 ? 1 : 0
        if (dam && e > 1.02) h += 2.5 * Math.sin(((e - 1.02) / 0.33) * Math.PI)
        if (e < 1) {
          h = pondLevel
          water[k] = 1
        }
      }

      // Farm yard: a flat pad with sheds.
      const dy = Math.hypot(x - YARD.x, y - YARD.y)
      if (dy < YARD.r * 1.4) {
        const pad = 1 - smoothstep(YARD.r * 0.8, YARD.r * 1.4, dy)
        const padLevel = 40 * (0.45 * (1 - YARD.x) + 0.55 * (1 - YARD.y)) + low
        h += (padLevel - h) * pad * 0.9
      }
      const g = toGrid(x - YARD.x, y - YARD.y)
      if (
        (Math.abs(g.a + 0.012) < 0.018 && Math.abs(g.b - 0.01) < 0.008) ||
        (Math.abs(g.a - 0.03) < 0.009 && Math.abs(g.b + 0.02) < 0.014)
      )
        h += 5

      // Farm track: a shallow cut with low berms.
      const dt = dTrack[k]
      if (dt < 0.0028) h -= 0.35
      else if (dt < 0.0048) h += 0.25

      // Field drains.
      const dd = dDrain[k]
      if (dd < 0.0025) h -= 0.8 * (1 - dd / 0.0025)

      // Fences and shelter belts.
      const grid = toGrid(x, y)
      const fenceOk = ds > 0.034 && e > 1.45 && dy > YARD.r * 1.2 && dt > 0.005
      if (fenceOk && fenceDistance(grid.a, grid.b) < 0.0013) h += 0.3
      if (fenceOk) h += beltHeight(grid.a, grid.b, x, y)

      heights[k] = h
    }
  }

  cached = { size, cellMetres: MAP_METRES / size, heights, water }
  return cached
}
