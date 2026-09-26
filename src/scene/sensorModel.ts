import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  RepeatWrapping,
  Shape,
  SphereGeometry,
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
      color: 0x001a5b,
      roughness: 0.78,
      bumpMap: grain,
      bumpScale: 0.003,
      envMapIntensity: 0.9,
    }),
    dark: new MeshStandardMaterial({ color: 0x00020f, roughness: 0.9 }),
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
  // Rounded rectangle in the XZ plane, extruded up from y = 0. Only the
  // vertical edges are round, as on a moulded box.
  const EXT = (w: number, d: number, r: number, h: number, bevel = 0) => {
    const s = new Shape()
    const x = w / 2 - r
    const z = d / 2 - r
    s.absarc(x, z, r, 0, HALF_PI)
    s.absarc(-x, z, r, HALF_PI, Math.PI)
    s.absarc(-x, -z, r, Math.PI, Math.PI * 1.5)
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

  // Enclosure assembly sits 20 mm below the water surface (55 mm into the soil)
  const BOX_DROP = -0.55
  yOff = BOX_DROP

  // Enclosure: tall body, and a flat lid plate that overhangs it
  const W = 1.5
  const D = 1.25
  const H = 2.3
  const R = 0.08
  const LID = 0.13
  put('plastic', EXT(W, D, R, H))
  put('plastic', EXT(W + 0.02, D + 0.02, R + 0.01, LID, 0.025), 0, H, 0)
  // Cable notches in the top rim, under the lid
  const NOTCH = 0.1
  for (const sx of [-1, 1])
    put(
      'dark',
      new BoxGeometry(0.06, NOTCH, 0.2),
      sx * (W / 2 - 0.027),
      H - NOTCH / 2,
      -0.1,
    )
  put(
    'dark',
    new BoxGeometry(0.2, NOTCH, 0.06),
    0.25,
    H - NOTCH / 2,
    -(D / 2 - 0.027),
  )
  // Cable hole in the right side
  put(
    'dark',
    CYL(0.13, 0.13, 0.04, 32),
    W / 2 - 0.017,
    H - 0.55,
    0.25,
    0,
    0,
    HALF_PI,
  )

  const FACE_Z = D / 2

  // Antenna: washer, hex nut, SMA barrel, rubber knuckle, tapered whip
  const AX = 0.05
  const AZ = 0.15
  const AY = H + LID
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
  const ROD = 2.0
  put('plastic', RB(0.95, 0.22, 0.34, 0.05, 2), 0, -0.09, 0)
  yOff = 0
  // Two stainless rods, 200 mm, with ferrules and pointed tips
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

  // Merge each bucket into one mesh
  for (const k of Object.keys(buckets) as Bucket[]) {
    const merged = mergeGeometries(buckets[k], false)
    buckets[k].forEach((g) => g.dispose())
    root.add(new Mesh(merged, mats[k]))
  }

  // Raised spiral logo: bump and roughness maps on a panel over the flat front face.
  // A thin outer ring and a spiral line stand up from the face, a little smoother than it.
  {
    const PW = W - 2 * R - 0.04
    const PH = H - 0.3
    const CW = 1024
    const CH = Math.round((CW * PH) / PW)
    const px = CW / PW
    const RING_R = 0.4
    const LOGO_DY = -0.15
    const cx = CW / 2
    const cy = CH / 2 - LOGO_DY * px
    // Spiral: 2 turns. It starts as a point at 1 o'clock, widens as it winds
    // clockwise inwards, and ends in a round hook around the centre dot.
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
    const logoCanvas = (base: string, line: string) => {
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
      g.fillStyle = line
      spiralPath(g)
      g.fill()
      g.strokeStyle = line
      g.lineWidth = 0.028 * px
      g.beginPath()
      g.arc(cx, cy, RING_R * px, -Math.PI / 3 + 0.35, -Math.PI / 3 - 0.35 + TAU)
      g.stroke()
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
        bumpMap: logoCanvas('#808080', '#c8c8c8'),
        bumpScale: 0.02,
        roughnessMap: logoCanvas('#c7c7c7', '#a8a8a8'),
      }),
    )
    face.position.set(0, H / 2 + BOX_DROP, FACE_Z + 0.0006)
    root.add(face)
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
