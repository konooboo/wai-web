// Procedural farm terrain. Map coordinates are normalised: x east, y south,
// both 0..1. Heights are metres. The 2D map and the later 3D map share this.

export type Point = { x: number; y: number }

export const MAP_METRES = 1600
export const HEIGHTMAP_SIZE = 1024
// Normalised units per metre, for widths that must keep their size in metres.
const M = 1 / MAP_METRES

export type Heightmap = {
  size: number
  cellMetres: number
  // Top surface, including tree canopy and roofs.
  heights: Float32Array
  // Bare terrain under the canopy and buildings.
  ground: Float32Array
  water: Uint8Array
  // Per cell: 0 ground, 1 water, 2 tree canopy, 3 building.
  cover: Uint8Array
  // Bottom of the canopy in metres, for cells with cover 2.
  canopyBase: Float32Array
  // Small objects as [kind, x, y, height above ground] per entry:
  // 0 fence post, 1 silage swath, 2 hay bale, 3 water trough.
  props: Float32Array
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
const YARD = { x: 0.834, y: 0.138, r: 80 * M }

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
  ['b', FENCE_B[4], 0.21, 0.37],
  ['a', FENCE_A[2], 0.66, 0.82],
  ['b', FENCE_B[2], 0.7, 0.83],
]

// Tree clumps in paddocks: [x, y, crown radius m, height m].
const CLUMPS: [number, number, number, number][] = [
  [0.3, 0.55, 22, 12],
  [0.72, 0.52, 18, 10],
  [0.56, 0.33, 25, 14],
  [0.8, 0.78, 20, 11],
  [0.2, 0.42, 16, 9],
  [0.4, 0.84, 18, 10],
  [0.71, 0.64, 15, 9],
  [0.3, 0.74, 14, 8],
]

// Farmhouse, hedge and garden trees. Offsets are metres in the grid frame.
const HOUSE = { x: 0.78, y: 0.175, length: 16, width: 10 }
const HEDGE = { length: 44, width: 32, height: 1.8, thick: 1.2 }
const GARDEN_TREES: [number, number, number, number][] = [
  [-16, -10, 4, 9],
  [14, -11, 5, 11],
  [-17, 8, 3.5, 7],
  [16, 10, 4, 8],
  [-6, 12, 3, 6],
  [8, -13, 3, 7],
  [19, 0, 3.5, 8],
  [-19, -1, 3, 6],
  [30, 18, 7, 14],
  [-28, 15, 6, 12],
]

// Pine block on the hill above the upper stream, in grid coordinates.
const PINES = { a0: 0.28, a1: 0.37, b0: 0.05, b1: 0.18 }

// Buildings: [x, y, length m, width m, eave m, ridge m]. The long side
// runs along the fence grid and the roof is a gable.
type Building = [number, number, number, number, number, number]
const inYard = (a: number, b: number): Point => {
  const p = fromGrid(a, b)
  return { x: YARD.x + p.x, y: YARD.y + p.y }
}
const at = (p: Point, ...size: [number, number, number, number]): Building => [
  p.x,
  p.y,
  ...size,
]
const BUILDINGS: Building[] = [
  at(inYard(-0.012, -0.018), 30, 15, 5, 8), // hay barn
  at(inYard(0.014, -0.018), 24, 12, 4, 6), // implement shed
  at(inYard(0.002, 0.004), 40, 14, 4, 6.5), // milking shed
  at(inYard(0.022, 0.004), 8, 6, 3, 4), // vat shed
  at(HOUSE, HOUSE.length, HOUSE.width, 2.8, 5),
  at({ x: 0.22, y: 0.8 }, 18, 9, 3.5, 5.5), // hay shed in the back paddocks
]
// Concrete yard beside the milking shed, flat.
const CONCRETE = { ...inYard(0.002, 0.018), length: 40, width: 26 }

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

const hash01 = (cx: number, cy: number) => {
  let h = (cx * 374761393 + cy * 668265263) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

// Calls fn for each cell whose centre lies in the normalised box.
function forCells(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  size: number,
  fn: (k: number, x: number, y: number, cx: number, cy: number) => void,
) {
  const cx0 = Math.max(0, Math.floor(x0 * size))
  const cx1 = Math.min(size - 1, Math.ceil(x1 * size))
  const cy0 = Math.max(0, Math.floor(y0 * size))
  const cy1 = Math.min(size - 1, Math.ceil(y1 * size))
  for (let cy = cy0; cy <= cy1; cy++)
    for (let cx = cx0; cx <= cx1; cx++)
      fn(cy * size + cx, (cx + 0.5) / size, (cy + 0.5) / size, cx, cy)
}

// Rolling downs, higher to the north-west.
const regionalAt = (x: number, y: number) =>
  60 * (0.45 * (1 - x) + 0.55 * (1 - y))
const lowAt = (x: number, y: number) => 18 * fbm(x * 3, y * 3, 2)

function bilinear(grid: Float32Array, size: number, x: number, y: number) {
  const fx = Math.min(size - 1.001, Math.max(0, x * size - 0.5))
  const fy = Math.min(size - 1.001, Math.max(0, y * size - 0.5))
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const tx = fx - x0
  const ty = fy - y0
  const a = grid[y0 * size + x0]
  const b = grid[y0 * size + x0 + 1]
  const c = grid[(y0 + 1) * size + x0]
  const d = grid[(y0 + 1) * size + x0 + 1]
  return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty
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
    const w = 7 * M
    if (Math.abs(across) > w) continue
    const profile = 1 - (across / w) ** 2
    const crowns = 0.6 + 0.6 * fbm(x * 320, y * 320, 2)
    const ends =
      smoothstep(from, from + 8 * M, along) * smoothstep(to, to - 8 * M, along)
    h = Math.max(h, 9 * Math.sqrt(profile) * crowns * ends)
  }
  return h
}

// ---------- heightmap ----------

let cached: Heightmap | null = null

// `keepClear` are points (the sensors) that trees must not cover.
export function getHeightmap(
  size = HEIGHTMAP_SIZE,
  keepClear: Point[] = [],
): Heightmap {
  if (cached && cached.size === size) return cached

  const n = size * size
  const heights = new Float32Array(n)
  const water = new Uint8Array(n)
  const belt = new Float32Array(n)
  // The wide valley is cheap on a coarse grid; the channel needs the full one.
  const COARSE = 256
  const dValley = new Float32Array(COARSE * COARSE).fill(1)
  const dStream = new Float32Array(n).fill(1)
  const dTrack = new Float32Array(n).fill(1)
  const dDrain = new Float32Array(n).fill(1)
  stampPolyline(STREAM, 0.16, COARSE, dValley)
  stampPolyline(STREAM, 0.04, size, dStream)
  stampPolyline(TRACK, 8 * M, size, dTrack)
  for (const drain of DRAINS) stampPolyline(drain, 8 * M, size, dDrain)

  const pondLevel = regionalAt(POND.x, POND.y) + lowAt(POND.x, POND.y) - 2

  for (let cy = 0; cy < size; cy++) {
    const y = (cy + 0.5) / size
    for (let cx = 0; cx < size; cx++) {
      const x = (cx + 0.5) / size
      const k = cy * size + cx

      // Rolling hills, higher and rougher to the north-west.
      const regional = regionalAt(x, y)
      const rough = 0.2 + 1.3 * (1 - x) * (1 - y)
      const low = lowAt(x, y)
      const wx = x + 0.04 * fbm(x * 6, y * 6, 2)
      const wy = y + 0.04 * fbm(x * 6 + 5.2, y * 6 - 2.4, 2)
      const detail =
        12 * rough * (fbm(wx * 3, wy * 3, 6) - fbm(wx * 3, wy * 3, 2))
      let h = regional + low + detail + 0.1 * fbm(x * 90, y * 90, 2)

      // Stream valley, flat flood plain and channel.
      const ds = dStream[k]
      h -= 9 * (1 - smoothstep(0, 0.15, bilinear(dValley, COARSE, x, y))) ** 2
      const plainWidth = (22 + 11 * fbm(x * 7, y * 7, 2)) * M
      const plain = 0.85 * (1 - smoothstep(plainWidth * 0.4, plainWidth, ds))
      h += (regional + low - 9 + 0.3 * fbm(x * 40, y * 40, 2) - h) * plain
      const channel = 4.4 * M
      if (ds < channel) {
        h -= 2 * Math.sqrt(1 - (ds / channel) ** 2)
        if (ds < channel * 0.55) water[k] = 1
      }
      // Riparian fence.
      if (Math.abs(ds - 26 * M) < 1.1 * M) h += 0.3

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

      // Farm yard: a flat pad. The buildings are stamped later.
      const dy = Math.hypot(x - YARD.x, y - YARD.y)
      if (dy < YARD.r * 1.4) {
        const pad = 1 - smoothstep(YARD.r * 0.8, YARD.r * 1.4, dy)
        const padLevel = regionalAt(YARD.x, YARD.y) + low
        h += (padLevel - h) * pad * 0.9
      }

      // Farm track: a shallow cut with low berms.
      const dt = dTrack[k]
      if (dt < 2.2 * M) h -= 0.35
      else if (dt < 3.8 * M) h += 0.25

      // Field drains.
      const dd = dDrain[k]
      if (dd < 2 * M) h -= 0.8 * (1 - dd / (2 * M))

      // Fences and shelter belts.
      const grid = toGrid(x, y)
      const fenceOk = ds > 27 * M && e > 1.45 && dy > YARD.r * 1.2 && dt > 4 * M
      if (fenceOk && fenceDistance(grid.a, grid.b) < 0.9 * M) h += 0.3
      if (fenceOk) belt[k] = beltHeight(grid.a, grid.b, x, y)

      heights[k] = h
    }
  }

  const ground = heights.slice()
  const cover = water.slice()
  const canopyBase = new Float32Array(n)
  const props = new Float32Array(0)

  // ---------- trees ----------

  const setCanopy = (k: number, crown: number, baseFrac: number) => {
    if (water[k] || cover[k] === 3 || crown <= 0) return
    const top = ground[k] + crown
    if (top <= heights[k]) return
    heights[k] = top
    cover[k] = 2
    canopyBase[k] = ground[k] + baseFrac * crown
  }
  // One tree: a dome crown of radius r metres and height h metres.
  const tree = (x: number, y: number, r: number, h: number) => {
    const rn = r * M
    forCells(x - rn, y - rn, x + rn, y + rn, size, (k, px, py) => {
      const d = Math.hypot(px - x, py - y) / rn
      if (d >= 1) return
      const crowns = 0.8 + 0.4 * fbm(px * 400, py * 400, 2)
      setCanopy(k, h * Math.sqrt(1 - d * d) * crowns, 0.3)
    })
  }

  for (let k = 0; k < n; k++) if (belt[k] > 0) setCanopy(k, belt[k], 0.25)

  const pineCorners = [
    fromGrid(PINES.a0, PINES.b0),
    fromGrid(PINES.a1, PINES.b0),
    fromGrid(PINES.a1, PINES.b1),
    fromGrid(PINES.a0, PINES.b1),
  ]
  forCells(
    Math.min(...pineCorners.map((c) => c.x)),
    Math.min(...pineCorners.map((c) => c.y)),
    Math.max(...pineCorners.map((c) => c.x)),
    Math.max(...pineCorners.map((c) => c.y)),
    size,
    (k, x, y, cx, cy) => {
      const g = toGrid(x, y)
      const edge = Math.min(
        g.a - PINES.a0,
        PINES.a1 - g.a,
        g.b - PINES.b0,
        PINES.b1 - g.b,
      )
      if (edge <= 0 || dStream[k] < 0.03 || hash01(cx, cy) < 0.03) return
      // Individual crowns about 8 m across.
      const crown = 15 + 5 * fbm(x * 500, y * 500, 2)
      setCanopy(k, crown * smoothstep(0, 6 * M, edge), 0.4)
    },
  )

  // Riparian planting in clumps along the stream, clear of the sensors.
  const nearKeepClear = (x: number, y: number, r: number) =>
    keepClear.some((p) => Math.hypot(p.x - x, p.y - y) < r)
  for (let cy = 0; cy < size; cy++)
    for (let cx = 0; cx < size; cx++) {
      const k = cy * size + cx
      const ds = dStream[k]
      if (ds < 5 * M || ds > 20 * M || water[k]) continue
      const x = (cx + 0.5) / size
      const y = (cy + 0.5) / size
      if (fbm(x * 90, y * 90, 2) < 0.05 || nearKeepClear(x, y, 14 * M)) continue
      setCanopy(k, 5 + 2 * fbm(x * 400, y * 400, 2), 0.15)
    }

  const scatter = mulberry32(3)
  for (const [x, y, r, h] of CLUMPS) {
    const count = 3 + Math.floor(scatter() * 3)
    for (let i = 0; i < count; i++) {
      const a = scatter() * Math.PI * 2
      const d = scatter() * r * 0.5 * M
      tree(
        x + Math.cos(a) * d,
        y + Math.sin(a) * d,
        r * (0.45 + 0.3 * scatter()),
        h * (0.8 + 0.3 * scatter()),
      )
    }
  }

  for (const [da, db, r, h] of GARDEN_TREES) {
    const p = fromGrid(da * M, db * M)
    tree(HOUSE.x + p.x, HOUSE.y + p.y, r, h)
  }
  {
    const hl = (HEDGE.length / 2) * M
    const hw = (HEDGE.width / 2) * M
    const diag = Math.hypot(hl, hw)
    forCells(
      HOUSE.x - diag,
      HOUSE.y - diag,
      HOUSE.x + diag,
      HOUSE.y + diag,
      size,
      (k, x, y) => {
        const g = toGrid(x - HOUSE.x, y - HOUSE.y)
        const inset = Math.min(hl - Math.abs(g.a), hw - Math.abs(g.b))
        if (inset >= 0 && inset < HEDGE.thick * M)
          setCanopy(k, HEDGE.height, 0.1)
      },
    )
  }

  // ---------- buildings ----------

  const cellAt = (x: number, y: number) =>
    Math.min(size - 1, Math.floor(y * size)) * size +
    Math.min(size - 1, Math.floor(x * size))
  // Cells inside a grid-aligned box at (bx, by), with the box coordinates.
  const forBox = (
    bx: number,
    by: number,
    length: number,
    width: number,
    fn: (k: number, along: number, across: number) => void,
  ) => {
    const hl = (length / 2) * M
    const hw = (width / 2) * M
    const diag = Math.hypot(hl, hw)
    forCells(bx - diag, by - diag, bx + diag, by + diag, size, (k, x, y) => {
      const g = toGrid(x - bx, y - by)
      if (Math.abs(g.a) <= hl && Math.abs(g.b) <= hw) fn(k, g.a / hl, g.b / hw)
    })
  }

  const padLevel = ground[cellAt(CONCRETE.x, CONCRETE.y)]
  forBox(CONCRETE.x, CONCRETE.y, CONCRETE.length, CONCRETE.width, (k) => {
    ground[k] = heights[k] = padLevel
    cover[k] = 0
  })
  for (const [bx, by, length, width, eave, ridge] of BUILDINGS) {
    const base = ground[cellAt(bx, by)]
    forBox(bx, by, length, width, (k, _along, across) => {
      ground[k] = base
      heights[k] = base + eave + (ridge - eave) * (1 - Math.abs(across))
      cover[k] = 3
      water[k] = 0
    })
  }

  cached = {
    size,
    cellMetres: MAP_METRES / size,
    heights,
    ground,
    water,
    cover,
    canopyBase,
    props,
  }
  return cached
}
