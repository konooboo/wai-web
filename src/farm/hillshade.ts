import type { Heightmap } from './terrain'

const SUN_AZIMUTH = (315 * Math.PI) / 180
const SUN_ALTITUDE = (45 * Math.PI) / 180
const Z_FACTOR = 2.2

// Grey hillshade as RGBA pixels, one pixel per heightmap cell.
export function hillshadePixels({
  size,
  cellMetres,
  heights,
  water,
}: Heightmap) {
  const out = new Uint8ClampedArray(size * size * 4)
  // Unit vector toward the sun: x east, y north, z up.
  const lx = Math.sin(SUN_AZIMUTH) * Math.cos(SUN_ALTITUDE)
  const ly = Math.cos(SUN_AZIMUTH) * Math.cos(SUN_ALTITUDE)
  const lz = Math.sin(SUN_ALTITUDE)
  const at = (x: number, y: number) =>
    heights[
      Math.min(size - 1, Math.max(0, y)) * size +
        Math.min(size - 1, Math.max(0, x))
    ]

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Horn's method. Rows grow to the south, so north is -y.
      const a = at(x - 1, y - 1)
      const b = at(x, y - 1)
      const c = at(x + 1, y - 1)
      const d = at(x - 1, y)
      const f = at(x + 1, y)
      const g = at(x - 1, y + 1)
      const h = at(x, y + 1)
      const i = at(x + 1, y + 1)
      const dzdx =
        ((c + 2 * f + i - (a + 2 * d + g)) / (8 * cellMetres)) * Z_FACTOR
      const dzdn =
        ((a + 2 * b + c - (g + 2 * h + i)) / (8 * cellMetres)) * Z_FACTOR
      const len = Math.hypot(dzdx, dzdn, 1)
      const shade = Math.max(0, (-dzdx * lx - dzdn * ly + lz) / len)

      const k = y * size + x
      const t = (shade - lz) * 230
      let grey = 226 + (t > 0 ? t * 0.45 : t)
      if (water[k]) grey = grey * 0.25 + 212 * 0.75
      const p = k * 4
      out[p] = grey
      out[p + 1] = grey - 1
      out[p + 2] = grey - 4
      out[p + 3] = 255
    }
  }
  return out
}
