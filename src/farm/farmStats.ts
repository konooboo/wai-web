// Dev check for the farm generator: `bun src/farm/farmStats.ts`.
// Prints timings and counts, and exits 1 if a budget or placement rule fails.
import { buildPointCloud, SCAN_RADIUS } from './pointCloud'
import { ALERT_SENSOR_ID, FARM_SENSORS } from './sensors'
import { getHeightmap, HEIGHTMAP_SIZE, MAP_METRES, PADDOCK_7 } from './terrain'

let t = performance.now()
const map = getHeightmap(HEIGHTMAP_SIZE, FARM_SENSORS)
const heightmapMs = performance.now() - t
t = performance.now()
const cloud = buildPointCloud(
  FARM_SENSORS,
  FARM_SENSORS.findIndex((s) => s.id === ALERT_SENSOR_ID),
  map,
)
const cloudMs = performance.now() - t

const cell = (v: number) =>
  Math.min(map.size - 1, Math.max(0, Math.floor(v * map.size)))
const coverAt = (x: number, y: number) =>
  map.cover[cell(y) * map.size + cell(x)]
let lo = Infinity
let hi = -Infinity
for (const h of map.ground) {
  lo = Math.min(lo, h)
  hi = Math.max(hi, h)
}
const coverCount = [0, 0, 0, 0]
for (const c of map.cover) coverCount[c]++

console.log({
  heightmapMs: Math.round(heightmapMs),
  cloudMs: Math.round(cloudMs),
  points: cloud.count,
  props: map.props.length / 4,
  transferMB: +(
    (cloud.position.byteLength + cloud.data.byteLength) /
    1e6
  ).toFixed(1),
  reliefM: +(hi - lo).toFixed(1),
  coverHa: coverCount.map(
    (n) => +(((n / map.cover.length) * MAP_METRES ** 2) / 1e4).toFixed(1),
  ),
})

const failures: string[] = []
const check = (ok: boolean, msg: string) => ok || failures.push(msg)

const r = 12 / MAP_METRES
for (const s of FARM_SENSORS) {
  check(coverAt(s.x, s.y) <= 1, `${s.id} sits on cover ${coverAt(s.x, s.y)}`)
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8)
    check(
      coverAt(s.x + Math.cos(a) * r, s.y + Math.sin(a) * r) <= 1,
      `${s.id} has a tree or building within 12 m`,
    )
}
for (const p of PADDOCK_7)
  check(
    coverAt(p.x, p.y) === 0,
    `Paddock 7 corner on cover ${coverAt(p.x, p.y)}`,
  )
for (const [x, y] of [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
]) {
  const d = Math.min(...FARM_SENSORS.map((s) => Math.hypot(s.x - x, s.y - y)))
  check(
    d < SCAN_RADIUS * 0.95,
    `corner ${x},${y} is ${d.toFixed(2)} from a sensor`,
  )
}
check(heightmapMs < 500, 'heightmap over 500 ms')
check(cloudMs < 300, 'cloud over 300 ms')
check(
  cloud.count >= 150_000 && cloud.count <= 300_000,
  'point count out of budget',
)

if (failures.length) throw new Error(failures.join('\n'))
