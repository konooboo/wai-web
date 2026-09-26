import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  ClampToEdgeWrapping,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  RepeatWrapping,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Pondside soil and water level monitor, ported from
// prototypes/sensor-model.html. 1 scene unit = 100 mm.

const HALF_PI = Math.PI / 2
const TAU = Math.PI * 2

function canvasTex(
  size: number,
  draw: (g: CanvasRenderingContext2D, s: number) => void,
  srgb = false,
) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!, size)
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.anisotropy = 4
  if (srgb) t.colorSpace = SRGBColorSpace
  return t
}

// Fine grain plus soft blotches: matte textured plastic and turf
function grainTexture() {
  const t = canvasTex(256, (g, s) => {
    const img = g.createImageData(s, s)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 150 + (Math.random() - 0.5) * 70
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    g.putImageData(img, 0, 0)
    const small = document.createElement('canvas')
    small.width = small.height = 16
    const sg = small.getContext('2d')!
    for (let x = 0; x < 16; x++)
      for (let y = 0; y < 16; y++) {
        const v = (110 + Math.random() * 90) | 0
        sg.fillStyle = `rgb(${v},${v},${v})`
        sg.fillRect(x, y, 1, 1)
      }
    g.globalAlpha = 0.45
    g.imageSmoothingEnabled = true
    g.drawImage(small, 0, 0, s, s)
  })
  t.repeat.set(3, 3)
  return t
}

// NZ Brown Soil under pasture. Canvas top = ground surface; 1024 px = 380 mm.
// Root mat 0-40 mm, A horizon (dark silt loam) to ~200 mm with a wavy, worm-mixed
// boundary, yellowish-brown B horizon below with blocky peds and angular greywacke.
function soilTexture() {
  const t = canvasTex(
    1024,
    (g, s) => {
      const mm = s / 380
      const rnd = Math.random
      // A/B boundary: integer periods so the texture tiles around the wall
      const boundary = (x: number) =>
        205 * mm +
        Math.sin((x / s) * TAU * 3 + 1.3) * 9 * mm +
        Math.sin((x / s) * TAU * 7) * 5 * mm

      const bw = g.createLinearGradient(0, 180 * mm, 0, s)
      bw.addColorStop(0, '#523d2a')
      bw.addColorStop(0.35, '#634a31')
      bw.addColorStop(1, '#6a5035')
      g.fillStyle = bw
      g.fillRect(0, 0, s, s)

      // B horizon: subangular blocky peds, shown as a net of fine darker cracks
      g.strokeStyle = 'rgba(52,36,20,0.55)'
      for (let i = 0; i < 520; i++) {
        let x = rnd() * s
        let y = 220 * mm + rnd() * (s - 220 * mm)
        g.lineWidth = 0.6 + rnd() * 1.2
        g.beginPath()
        g.moveTo(x, y)
        for (let k = 0; k < 3; k++) {
          x += (rnd() - 0.5) * 36
          y += (rnd() - 0.5) * 36
          g.lineTo(x, y)
        }
        g.stroke()
      }
      // ped faces: patchy lighter and darker blocks
      for (let i = 0; i < 260; i++) {
        const x = rnd() * s
        const y = 220 * mm + rnd() * (s - 220 * mm)
        g.fillStyle =
          rnd() < 0.5 ? 'rgba(130,100,62,0.14)' : 'rgba(60,42,24,0.16)'
        g.fillRect(x, y, 10 + rnd() * 26, 8 + rnd() * 22)
      }

      // A horizon, drawn over the B horizon down to the wavy boundary, with tongues
      const aPath = new Path2D()
      aPath.moveTo(0, 0)
      for (let x = 0; x <= s; x += 4) aPath.lineTo(x, boundary(x))
      aPath.lineTo(s, 0)
      aPath.closePath()
      for (let i = 0; i < 9; i++) {
        const x = rnd() * s
        const w = 6 + rnd() * 14
        const d = boundary(x) + (15 + rnd() * 40) * mm
        aPath.moveTo(x - w, boundary(x) - 4)
        aPath.quadraticCurveTo(
          x + (rnd() - 0.5) * 20,
          d,
          x + w,
          boundary(x) - 4,
        )
      }
      const ap = g.createLinearGradient(0, 0, 0, 220 * mm)
      ap.addColorStop(0, '#2c241c')
      ap.addColorStop(0.7, '#3a2f24')
      ap.addColorStop(1, '#4a3a28')
      g.fillStyle = ap
      g.fill(aPath)

      // crumb structure in the A horizon: small granules and worm casts
      g.save()
      g.clip(aPath)
      for (let i = 0; i < 5200; i++) {
        const x = rnd() * s
        const y = rnd() * 215 * mm
        const r = 1 + rnd() * 3.5
        g.fillStyle =
          rnd() < 0.5
            ? `rgba(20,15,10,${0.3 + rnd() * 0.4})`
            : `rgba(95,78,58,${0.2 + rnd() * 0.3})`
        g.beginPath()
        g.ellipse(x, y, r, r * (0.6 + rnd() * 0.5), rnd() * 3, 0, TAU)
        g.fill()
      }
      g.restore()

      // earthworm channels: dark-lined burrows running down from the topsoil
      g.lineCap = 'round'
      for (let i = 0; i < 6; i++) {
        let x = rnd() * s
        let y = (20 + rnd() * 80) * mm
        const len = (80 + rnd() * 180) * mm
        const w = 2 + rnd() * 1.5
        const pts: [number, number][] = [[x, y]]
        for (let d = 0; d < len; d += 10) {
          x += (rnd() - 0.5) * 12
          y += 10
          pts.push([x, y])
        }
        for (const [col, lw] of [
          ['rgba(28,20,12,0.5)', w + 2.5],
          ['rgba(14,10,6,0.85)', w],
        ] as const) {
          g.strokeStyle = col
          g.lineWidth = lw
          g.beginPath()
          pts.forEach(([px, py], k) =>
            k ? g.lineTo(px, py) : g.moveTo(px, py),
          )
          g.stroke()
        }
      }

      // angular greywacke fragments, few, mostly in the B horizon
      for (let i = 0; i < 34; i++) {
        const y = s * (0.35 + rnd() * 0.65)
        const x = rnd() * s
        const r = 2 + rnd() * 7
        const v = (88 + rnd() * 40) | 0
        g.fillStyle = `rgb(${v - 8},${v},${v + 8})`
        g.beginPath()
        const n = 4 + ((rnd() * 3) | 0)
        const a0 = rnd() * TAU
        for (let k = 0; k < n; k++) {
          const a = a0 + (k / n) * TAU
          const rr = r * (0.6 + rnd() * 0.6)
          const px = x + Math.cos(a) * rr * 1.4
          const py = y + Math.sin(a) * rr
          if (k) g.lineTo(px, py)
          else g.moveTo(px, py)
        }
        g.closePath()
        g.fill()
      }

      // roots: dense fine mat near the surface, fewer and deeper below
      for (let i = 0; i < 800; i++) {
        let x = rnd() * s
        let y = rnd() * 6 * mm
        const len = (10 + Math.pow(rnd(), 6) * 260) * mm
        g.strokeStyle = `rgba(196,176,132,${0.12 + rnd() * 0.25})`
        g.lineWidth = 0.5 + rnd() * (len > 150 * mm ? 1.6 : 0.8)
        g.beginPath()
        g.moveTo(x, y)
        for (let d = 0; d < len; d += 5) {
          x += (rnd() - 0.5) * 4
          y += 5
          g.lineTo(x, y)
        }
        g.stroke()
      }

      // thatch at the surface
      const th = g.createLinearGradient(0, 0, 0, 10 * mm)
      th.addColorStop(0, 'rgba(62,72,34,0.95)')
      th.addColorStop(1, 'rgba(62,72,34,0)')
      g.fillStyle = th
      g.fillRect(0, 0, s, 10 * mm)

      // fine speckle
      const img = g.getImageData(0, 0, s, s)
      for (let i = 0; i < img.data.length; i += 4) {
        const n = (rnd() - 0.5) * 26
        img.data[i] += n
        img.data[i + 1] += n
        img.data[i + 2] += n
      }
      g.putImageData(img, 0, 0)
    },
    true,
  )
  t.wrapT = ClampToEdgeWrapping
  return t
}

export function buildSensorModel() {
  const root = new Group()
  const grain = grainTexture()
  const soil = soilTexture()

  // One material per bucket, one draw call per bucket
  const mats = {
    plastic: new MeshStandardMaterial({
      color: 0x17191b,
      roughness: 0.62,
      roughnessMap: grain,
      bumpMap: grain,
      bumpScale: 0.012,
      envMapIntensity: 0.9,
    }),
    badge: new MeshStandardMaterial({
      color: 0x5a5e60,
      roughness: 0.55,
      roughnessMap: grain,
      bumpMap: grain,
      bumpScale: 0.006,
    }),
    dark: new MeshStandardMaterial({ color: 0x0f1011, roughness: 0.7 }),
    metal: new MeshStandardMaterial({
      color: 0xd4d6d9,
      metalness: 1,
      roughness: 0.28,
    }),
    rubber: new MeshStandardMaterial({
      color: 0x121314,
      roughness: 0.82,
      envMapIntensity: 0.7,
    }),
    soil: new MeshStandardMaterial({
      map: soil,
      bumpMap: soil,
      bumpScale: 0.03,
      roughness: 0.96,
      envMapIntensity: 0.4,
    }),
    turf: new MeshStandardMaterial({
      color: 0x33461f,
      roughness: 0.95,
      roughnessMap: grain,
      bumpMap: grain,
      bumpScale: 0.03,
      envMapIntensity: 0.5,
    }),
    mud: new MeshStandardMaterial({
      color: 0x3d3c33,
      roughness: 0.8,
      roughnessMap: grain,
      bumpMap: grain,
      bumpScale: 0.02,
      envMapIntensity: 0.6,
    }),
    water: new MeshStandardMaterial({
      color: 0x2f5a52,
      roughness: 0.05,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      envMapIntensity: 1.3,
    }),
  }
  type Bucket = keyof typeof mats
  const buckets = Object.fromEntries(
    Object.keys(mats).map((k) => [k, [] as BufferGeometry[]]),
  ) as Record<Bucket, BufferGeometry[]>

  const o = new Object3D()
  let yOff = 0
  function put(
    bucket: Bucket,
    geo: BufferGeometry,
    x = 0,
    y = 0,
    z = 0,
    rx = 0,
    ry = 0,
    rz = 0,
  ) {
    o.position.set(x, y + yOff, z)
    o.rotation.set(rx, ry, rz)
    o.updateMatrix()
    const g = geo.index ? geo.toNonIndexed() : geo
    if (g !== geo) geo.dispose()
    g.applyMatrix4(o.matrix)
    for (const k of Object.keys(g.attributes))
      if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k)
    g.clearGroups()
    buckets[bucket].push(g)
  }
  const RB = (w: number, h: number, d: number, r: number, seg = 4) =>
    new RoundedBoxGeometry(w, h, d, seg, r)
  const CYL = (rt: number, rb: number, h: number, seg = 24) =>
    new CylinderGeometry(rt, rb, h, seg)

  // Enclosure assembly sits 20 mm below the water surface (55 mm into the soil)
  const BOX_DROP = -0.55
  yOff = BOX_DROP

  // Enclosure: body, lid with slight overhang, seam groove
  put('plastic', RB(1.8, 2.0, 1.1, 0.12), 0, 1.0, 0)
  put('plastic', RB(1.84, 0.3, 1.14, 0.13), 0, 2.12, 0)
  put('dark', RB(1.79, 0.035, 1.09, 0.1, 3), 0, 1.975, 0)
  // Side latch lugs
  for (const sx of [-1, 1])
    for (const y of [1.86, 0.3])
      put('plastic', RB(0.07, 0.16, 0.24, 0.025, 2), sx * 0.92, y, 0.12)
  // Lid screws with slots
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      put('badge', CYL(0.055, 0.055, 0.022, 20), sx * 0.72, 2.278, sz * 0.42)
      put(
        'dark',
        new BoxGeometry(0.075, 0.012, 0.014),
        sx * 0.72,
        2.289,
        sz * 0.42,
        0,
        sx * sz * 0.6,
        0,
      )
    }

  const BADGE_Y = 1.1
  const FACE_Z = 0.55

  // Antenna: washer, hex nut, SMA barrel, rubber knuckle, tapered whip
  const AX = 0.05
  const AZ = 0.15
  const AY = 2.27
  put('metal', CYL(0.12, 0.12, 0.012, 24), AX, AY + 0.006, AZ)
  put('metal', CYL(0.1, 0.1, 0.05, 6), AX, AY + 0.037, AZ)
  put('metal', CYL(0.066, 0.068, 0.24, 24), AX, AY + 0.182, AZ)
  put('rubber', CYL(0.078, 0.078, 0.14, 24), AX, AY + 0.37, AZ)
  for (let i = 0; i < 4; i++)
    put(
      'rubber',
      new TorusGeometry(0.074, 0.009, 6, 24),
      AX,
      AY + 0.46 + i * 0.045,
      AZ,
      HALF_PI,
    )
  put('rubber', CYL(0.054, 0.072, 1.85, 24), AX, AY + 0.44 + 0.925, AZ)
  put(
    'rubber',
    new SphereGeometry(0.054, 20, 8, 0, TAU, 0, HALF_PI),
    AX,
    AY + 2.29,
    AZ,
  )

  // Probe head moulded into the enclosure base, partly buried
  const PX = 0.3
  const PZ = 0.02
  const ROD = 3.0
  put('plastic', RB(0.95, 0.22, 0.34, 0.05, 2), 0, -0.09, 0)
  yOff = 0
  // Two stainless rods, 300 mm, with ferrules and pointed tips
  for (const sx of [-1, 1]) {
    put('metal', CYL(0.06, 0.06, 0.05, 20), sx * PX, -0.225 + BOX_DROP, PZ)
    put(
      'metal',
      CYL(0.035, 0.035, ROD - 0.12, 16),
      sx * PX,
      -(ROD - 0.12) / 2,
      PZ,
    )
    put(
      'metal',
      new ConeGeometry(0.035, 0.12, 16),
      sx * PX,
      -ROD + 0.06,
      PZ,
      Math.PI,
    )
  }

  // Cut-away bank section: back half of a cylinder, open cut face at z = 0.
  // x < 0 is the bank (soil), x > 0 is the pond. The bank face is at x = 0, between the rods.
  const SR = 2.1
  const SD = 3.8
  const WATER_Y = -0.35
  const BED_Y = -3.3
  const MUD = SD + BED_Y
  const wall = new CylinderGeometry(SR, SR, SD, 32, 1, true, Math.PI, HALF_PI)
  const wuv = wall.attributes.uv
  for (let i = 0; i < wuv.count; i++) wuv.setX(i, wuv.getX(i) * 0.8)
  put('soil', wall, 0, -SD / 2, 0)
  put('soil', new PlaneGeometry(SR, SD), -SR / 2, -SD / 2, 0)
  put('soil', new PlaneGeometry(SR, SD), 0, -SD / 2, -SR / 2, 0, HALF_PI)
  put('soil', new CircleGeometry(SR, 24, Math.PI, HALF_PI), 0, -SD, 0, HALF_PI)
  put(
    'turf',
    new CircleGeometry(SR, 24, HALF_PI, HALF_PI),
    0,
    -0.002,
    0,
    -HALF_PI,
  )
  // pond bed: soft grey sediment
  put(
    'mud',
    new CylinderGeometry(SR, SR, MUD, 32, 1, true, HALF_PI, HALF_PI),
    0,
    BED_Y - MUD / 2,
    0,
  )
  put('mud', new PlaneGeometry(SR, MUD), SR / 2, BED_Y - MUD / 2, 0)
  put('mud', new CircleGeometry(SR, 24, 0, HALF_PI), 0, BED_Y, 0, -HALF_PI)
  put(
    'mud',
    new CircleGeometry(SR, 24, Math.PI * 1.5, HALF_PI),
    0,
    -SD,
    0,
    HALF_PI,
  )
  // pond water column
  const WH = WATER_Y - BED_Y
  put(
    'water',
    new CylinderGeometry(SR, SR, WH, 32, 1, true, HALF_PI, HALF_PI),
    0,
    BED_Y + WH / 2,
    0,
  )
  put('water', new PlaneGeometry(SR, WH), SR / 2, BED_Y + WH / 2, 0)
  put('water', new CircleGeometry(SR, 24, 0, HALF_PI), 0, WATER_Y, 0, -HALF_PI)

  // Merge each bucket into one mesh
  for (const k of Object.keys(buckets) as Bucket[]) {
    const merged = mergeGeometries(buckets[k], false)
    buckets[k].forEach((g) => g.dispose())
    root.add(new Mesh(merged, mats[k]))
  }

  // Etched spiral logo: bump and roughness maps on a panel over the flat front face.
  // The logo disc is recessed with a rougher finish; the spiral line stays at surface level.
  {
    const PW = 1.56
    const PH = 1.76
    const CW = 1024
    const CH = 1152
    const px = CW / PW
    const LOGO_R = 0.42
    const cx = CW / 2
    const cy = CH / 2 - (BADGE_Y - 1.0) * px
    // Groove: 2 turns inside a solid black ring. It starts as a point at 1 o'clock,
    // widens as it winds clockwise inwards, and ends in a round hook around the centre dot.
    const tMax = TAU * 2
    const r0 = 0.07
    const rz = Math.PI / 3 - tMax
    const grooveR = (k: number) => r0 + 0.265 * Math.pow(k, 1.1)
    const grooveW = (k: number) =>
      0.07 * Math.pow(Math.min(1, (1 - k) / 0.4), 0.8) * (0.75 + 0.25 * k)
    const spiralPath = (g: CanvasRenderingContext2D) => {
      const outer: [number, number][] = []
      const inner: [number, number][] = []
      for (let i = 0; i <= 400; i++) {
        const k = i / 400
        const t = k * tMax + rz
        const r = grooveR(k)
        const w = grooveW(k)
        outer.push([Math.cos(t) * (r + w / 2), Math.sin(t) * (r + w / 2)])
        inner.push([Math.cos(t) * (r - w / 2), Math.sin(t) * (r - w / 2)])
      }
      g.beginPath()
      outer.concat(inner.reverse()).forEach(([x, y], i) => {
        if (i) g.lineTo(cx + x * px, cy - y * px)
        else g.moveTo(cx + x * px, cy - y * px)
      })
      g.closePath()
      const capR = grooveW(0) / 2
      const ex = cx + Math.cos(rz) * r0 * px
      const ey = cy - Math.sin(rz) * r0 * px
      g.moveTo(ex + capR * px, ey)
      g.arc(ex, ey, capR * px, 0, TAU)
    }
    const logoCanvas = (base: string, recess: string, line: string) => {
      const c = document.createElement('canvas')
      c.width = CW
      c.height = CH
      const g = c.getContext('2d')!
      const pat = g.createPattern(grain.image as HTMLCanvasElement, 'repeat')!
      pat.setTransform(new DOMMatrix().scale(1.54))
      g.fillStyle = base
      g.fillRect(0, 0, CW, CH)
      g.globalCompositeOperation = 'overlay'
      g.fillStyle = pat
      g.fillRect(0, 0, CW, CH)
      g.globalCompositeOperation = 'source-over'
      g.filter = 'blur(1.5px)'
      g.fillStyle = recess
      g.beginPath()
      g.arc(cx, cy, LOGO_R * px, 0, TAU)
      g.fill()
      g.fillStyle = line
      spiralPath(g)
      g.fill()
      g.filter = 'none'
      const t = new CanvasTexture(c)
      t.anisotropy = 4
      return t
    }
    const face = new Mesh(
      new PlaneGeometry(PW, PH),
      new MeshStandardMaterial({
        color: mats.plastic.color,
        roughness: 1,
        envMapIntensity: 0.9,
        bumpMap: logoCanvas('#969696', '#5a5a5a', '#969696'),
        bumpScale: 0.012,
        roughnessMap: logoCanvas('#5e5e5e', '#a0a0a0', '#5e5e5e'),
      }),
    )
    face.position.set(0, 1.0 + BOX_DROP, FACE_Z + 0.0006)
    root.add(face)
  }

  // Pasture: ryegrass blades and white clover, one instanced draw call each,
  // kept clear of the enclosure footprint
  const pastureSpot = () => {
    for (;;) {
      const r = Math.sqrt(Math.random()) * (SR - 0.05)
      const a = Math.PI + Math.random() * HALF_PI
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      if (!(Math.abs(x) < 1.0 && z > -0.62)) return [x, z]
    }
  }
  const bladeGeo = new BufferGeometry()
  {
    const pos: number[] = []
    const idx: number[] = []
    const SEG = 4
    for (let i = 0; i <= SEG; i++) {
      const y = i / SEG
      const w = 0.026 * (1 - y * 0.92)
      const z = 0.22 * y * y
      pos.push(-w, y, z, w, y, z)
      if (i < SEG) {
        const k = i * 2
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
      }
    }
    bladeGeo.setAttribute('position', new Float32BufferAttribute(pos, 3))
    bladeGeo.setIndex(idx)
    bladeGeo.computeVertexNormals()
  }
  const BLADES = 1600
  const grass = new InstancedMesh(
    bladeGeo,
    new MeshStandardMaterial({ roughness: 0.75, side: DoubleSide }),
    BLADES,
  )
  const col = new Color()
  for (let n = 0; n < BLADES; n++) {
    const [x, z] = pastureSpot()
    o.position.set(x, 0, z)
    o.rotation.set(
      (Math.random() - 0.5) * 0.3,
      Math.random() * TAU,
      (Math.random() - 0.5) * 0.3,
    )
    o.scale.set(0.8 + Math.random() * 0.5, 0.3 + Math.random() * 0.45, 1)
    o.updateMatrix()
    grass.setMatrixAt(n, o.matrix)
    grass.setColorAt(
      n,
      col.setHSL(
        0.25 + Math.random() * 0.04,
        0.55 + Math.random() * 0.2,
        0.06 + Math.random() * 0.07,
      ),
    )
  }
  root.add(grass)

  const cloverParts: BufferGeometry[] = [
    new CylinderGeometry(0.004, 0.004, 1, 4).translate(0, 0.5, 0),
  ]
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * TAU
    cloverParts.push(
      new CircleGeometry(0.042, 10)
        .rotateX(-HALF_PI)
        .translate(Math.cos(a) * 0.04, 1, Math.sin(a) * 0.04),
    )
  }
  const cloverGeo = mergeGeometries(
    cloverParts.map((p) => (p.index ? p.toNonIndexed() : p)),
  )
  const CLOVER = 160
  const clover = new InstancedMesh(
    cloverGeo,
    new MeshStandardMaterial({ roughness: 0.6, side: DoubleSide }),
    CLOVER,
  )
  for (let n = 0; n < CLOVER; n++) {
    const [x, z] = pastureSpot()
    const leaf = 0.8 + Math.random() * 0.6
    o.position.set(x, 0, z)
    o.rotation.set(
      (Math.random() - 0.5) * 0.4,
      Math.random() * TAU,
      (Math.random() - 0.5) * 0.4,
    )
    o.scale.set(leaf, 0.12 + Math.random() * 0.2, leaf)
    o.updateMatrix()
    clover.setMatrixAt(n, o.matrix)
    clover.setColorAt(
      n,
      col.setHSL(
        0.31 + Math.random() * 0.03,
        0.45 + Math.random() * 0.15,
        0.07 + Math.random() * 0.04,
      ),
    )
  }
  root.add(clover)

  return root
}

export function disposeSensorModel(root: Group) {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return
    obj.geometry.dispose()
    const m = obj.material as MeshStandardMaterial
    for (const t of [m.map, m.bumpMap, m.roughnessMap]) t?.dispose()
    m.dispose()
  })
}
