import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Path,
  PlaneGeometry,
  RepeatWrapping,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector2,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Soil and water level monitor, modelled on the product reference render.
// 1 scene unit = 100 mm.

const HALF_PI = Math.PI / 2
const TAU = Math.PI * 2

function canvasTex(
  size: number,
  draw: (g: CanvasRenderingContext2D, s: number) => void,
) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!, size)
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.anisotropy = 4
  return t
}

// Fine grain plus soft blotches: matte textured plastic
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

export function buildSensorModel() {
  const root = new Group()
  const grain = grainTexture()

  // One material per bucket, one draw call per bucket
  const mats = {
    // Smooth moulded plastic, with only a faint grain.
    plastic: new MeshStandardMaterial({
      color: 0x0a1020,
      roughness: 0.62,
      bumpMap: grain,
      bumpScale: 0.003,
      envMapIntensity: 0.9,
    }),
    dark: new MeshStandardMaterial({ color: 0x05070c, roughness: 0.9 }),
    metal: new MeshStandardMaterial({
      color: 0xd4d6d9,
      metalness: 1,
      roughness: 0.3,
    }),
    alloy: new MeshStandardMaterial({
      color: 0xa4a6aa,
      metalness: 0.8,
      roughness: 0.5,
    }),
    rubber: new MeshStandardMaterial({
      color: 0x121314,
      roughness: 0.82,
      envMapIntensity: 0.7,
    }),
    whip: new MeshStandardMaterial({ color: 0xecebe8, roughness: 0.55 }),
    pcb: new MeshStandardMaterial({ color: 0x0b2e5c, roughness: 0.45 }),
    gold: new MeshStandardMaterial({
      color: 0xc4a468,
      metalness: 1,
      roughness: 0.4,
    }),
  }
  type Bucket = keyof typeof mats
  const buckets = Object.fromEntries(
    Object.keys(mats).map((k) => [k, [] as BufferGeometry[]]),
  ) as Record<Bucket, BufferGeometry[]>

  // Lower the whole unit so it is centred on the origin.
  const Y0 = -0.55
  const o = new Object3D()
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
    o.position.set(x, y + Y0, z)
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
  // Rounded rectangle in the XZ plane, extruded up from y = 0. Only the
  // vertical edges are round, as on a moulded box. A notch sets the flat
  // front back by that depth, to take a separate front plate.
  const EXT = (
    w: number,
    d: number,
    r: number,
    h: number,
    bevel = 0,
    notch = 0,
  ) => {
    const s = new Shape()
    const x = w / 2 - r
    const z = d / 2 - r
    s.absarc(x, z, r, 0, HALF_PI)
    s.absarc(-x, z, r, HALF_PI, Math.PI)
    s.absarc(-x, -z, r, Math.PI, Math.PI * 1.5)
    if (notch) {
      s.lineTo(-x, -d / 2 + notch)
      s.lineTo(x, -d / 2 + notch)
    }
    s.absarc(x, -z, r, Math.PI * 1.5, TAU)
    const g = new ExtrudeGeometry(s, {
      depth: h - bevel * 2,
      curveSegments: 8,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
    })
    g.translate(0, 0, bevel)
    g.rotateX(-HALF_PI)
    return g
  }
  // Flat polygon in the XY plane, extruded to thickness t about z = 0.
  const PLATE = (pts: [number, number][], t: number) => {
    const g = new ExtrudeGeometry(
      new Shape(pts.map(([x, y]) => new Vector2(x, y))),
      { depth: t, bevelEnabled: false },
    )
    g.translate(0, 0, -t / 2)
    return g
  }

  // Enclosure: tall body, and a flat lid plate that overhangs it
  const W = 1.5
  const D = 1.25
  const H = 2.3
  const R = 0.08
  const LID = 0.13
  // Front plate with a round hole for the recessed logo
  const PLATE_T = 0.18
  const RING_R = 0.47
  const LOGO_Y = H / 2 + 0.12
  put('plastic', EXT(W, D, R, H, 0, PLATE_T))
  {
    const s = new Shape()
    s.moveTo(-(W / 2 - R), 0)
    s.lineTo(W / 2 - R, 0)
    s.lineTo(W / 2 - R, H)
    s.lineTo(-(W / 2 - R), H)
    const hole = new Path()
    hole.absarc(0, LOGO_Y, RING_R, 0, TAU, true)
    s.holes.push(hole)
    put(
      'plastic',
      new ExtrudeGeometry(s, {
        depth: PLATE_T,
        bevelEnabled: false,
        curveSegments: 96,
      }),
      0,
      0,
      D / 2 - PLATE_T,
    )
  }
  // Logo floor in the hole: one flat terrace that winds down to the centre,
  // with a step wall between turns. 2.5 turns; the wall starts at the ring
  // at 2 o'clock and winds clockwise to the centre.
  {
    const TURNS = 2.5
    const rz = Math.PI / 3 - TAU * TURNS
    const BASE = 0.04
    const STEP = 0.03
    const N = 280
    const g = new PlaneGeometry(2 * RING_R, 2 * RING_R, N, N)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const r = Math.hypot(x, y)
      // Outside the ring the grid hides behind the front plate.
      let depth = PLATE_T + 0.01
      if (r < RING_R) {
        // s is a whole number on the spiral wall; f is the fraction of a
        // turn past the wall.
        const rho = (r / RING_R) * TURNS
        const s = rho - (Math.atan2(y, x) - rz) / TAU
        const f = s - Math.floor(s)
        depth = BASE + STEP * (TURNS - rho + f)
      }
      pos.setZ(i, -depth)
    }
    g.computeVertexNormals()
    put('plastic', g, 0, LOGO_Y, D / 2)
  }
  put('plastic', EXT(W + 0.03, D + 0.03, R + 0.015, LID, 0.03), 0, H, 0)
  // Cable notch in the left rim, under the lid
  put(
    'dark',
    new BoxGeometry(0.06, 0.12, 0.14),
    -(W / 2 - 0.027),
    H - 0.06,
    -0.12,
  )

  // Antenna on the left side: dark recess, O-ring, threaded barrel,
  // right-angle elbow and a white whip with a round tip.
  const SX = -W / 2
  const CY = H - 0.3
  const CZ = -0.3
  const WX = SX - 0.38
  put('dark', CYL(0.18, 0.18, 0.02, 40), SX, CY, CZ, 0, 0, HALF_PI)
  put(
    'rubber',
    new TorusGeometry(0.095, 0.03, 10, 32),
    SX - 0.03,
    CY,
    CZ,
    0,
    HALF_PI,
  )
  put('metal', CYL(0.06, 0.06, 0.26, 24), SX - 0.13, CY, CZ, 0, 0, HALF_PI)
  for (let i = 0; i < 6; i++)
    put(
      'metal',
      new TorusGeometry(0.06, 0.01, 6, 24),
      SX - 0.07 - i * 0.028,
      CY,
      CZ,
      0,
      HALF_PI,
    )
  put('alloy', RB(0.28, 0.2, 0.22, 0.025, 2), WX + 0.02, CY, CZ)
  const WHIP = 2.06
  put('whip', CYL(0.1, 0.1, WHIP, 32), WX, CY + 0.1 + WHIP / 2, CZ)
  put(
    'whip',
    new SphereGeometry(0.1, 24, 8, 0, TAU, 0, HALF_PI),
    WX,
    CY + 0.1 + WHIP,
    CZ,
  )

  // Soil moisture probe: a blue PCB with two pointed prongs and gold pads.
  // The top 150 mm of board is inside the enclosure.
  {
    const PX = -0.55
    const PZ = -0.2
    const T = 0.035
    put(
      'pcb',
      PLATE(
        [
          [-0.17, 0.15],
          [0.17, 0.15],
          [0.17, -0.92],
          [0.1, -1.05],
          [0.03, -0.92],
          [0.03, -0.25],
          [-0.03, -0.25],
          [-0.03, -0.92],
          [-0.1, -1.05],
          [-0.17, -0.92],
        ],
        T,
      ),
      PX,
      0,
      PZ,
    )
    for (const c of [-0.1, 0.1])
      put(
        'gold',
        PLATE(
          [
            [c - 0.035, -0.33],
            [c + 0.035, -0.33],
            [c + 0.035, -0.985],
            [c, -1.05],
            [c - 0.035, -0.985],
          ],
          T + 0.008,
        ),
        PX,
        0,
        PZ,
      )
  }

  // Ultrasonic water level module under the front: blue board, a 4-pin
  // header at the front edge, and two aluminium transducers facing down.
  {
    const UX = -0.15
    const UZ = 0.42
    const BT = 0.045
    put('pcb', new BoxGeometry(1.0, BT, 0.5), UX, -BT / 2, UZ)
    for (let i = 0; i < 4; i++)
      put(
        'gold',
        new BoxGeometry(0.02, 0.03, 0.05),
        -0.26 + i * 0.04,
        0.015,
        0.645,
      )
    for (const dx of [-0.24, 0.24]) {
      put('metal', CYL(0.15, 0.15, 0.23, 40), UX + dx, -BT - 0.115, UZ - 0.02)
      put('dark', CYL(0.12, 0.12, 0.01, 32), UX + dx, -BT - 0.23, UZ - 0.02)
    }
  }

  // Merge each bucket into one mesh
  for (const k of Object.keys(buckets) as Bucket[]) {
    const merged = mergeGeometries(buckets[k], false)
    buckets[k].forEach((g) => g.dispose())
    root.add(new Mesh(merged, mats[k]))
  }

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
