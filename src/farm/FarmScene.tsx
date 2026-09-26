import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useInView, type MotionValue } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  MathUtils,
  ShaderMaterial,
  Vector3,
  type LineBasicMaterial,
} from 'three'
import type { Line2 } from 'three-stdlib'
import type { NzDots } from './nzDots'
import {
  ALERT_RADIUS,
  SCAN_RADIUS,
  type PointCloud,
  type Vec3,
} from './pointCloud'
import { ALERT_SENSOR_ID, FARM_SENSORS } from './sensors'
import { STORY, stage } from './story'

const HEALTHY = new Color('#3a9d5d')
const ALERT = new Color('#d9482b')
const FOV = 30

type Farm = { cloud: PointCloud; nz: NzDots }

let farmPromise: Promise<Farm> | null = null

// Builds the point clouds in a worker once, then keeps them for the page
// lifetime.
function loadFarm() {
  farmPromise ??= new Promise((resolve) => {
    const worker = new Worker(new URL('./farm.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event) => {
      resolve(event.data)
      worker.terminate()
    }
    worker.postMessage(null)
  })
  return farmPromise
}

const TURBO = /* glsl */ `
  vec3 turbo(float t) {
    const vec4 kr = vec4(0.13572138, 4.61539260, -42.66032258, 132.13108234);
    const vec4 kg = vec4(0.09140261, 2.19418839, 4.84296658, -14.18503333);
    const vec4 kb = vec4(0.10667330, 12.64194608, -60.58204836, 110.36276771);
    const vec2 kr2 = vec2(-152.94239396, 59.28637943);
    const vec2 kg2 = vec2(4.27729857, 2.82956604);
    const vec2 kb2 = vec2(-89.90310912, 27.34824973);
    t = clamp(t, 0.0, 1.0);
    vec4 v4 = vec4(1.0, t, t * t, t * t * t);
    vec2 v2 = v4.zw * v4.z;
    return vec3(
      dot(v4, kr) + dot(v2, kr2),
      dot(v4, kg) + dot(v2, kg2),
      dot(v4, kb) + dot(v2, kb2)
    );
  }
`

const vertexShader = /* glsl */ `
  attribute vec4 data;
  uniform float uTime;
  uniform float uScan;
  uniform float uAlert;
  uniform float uPaddock;
  uniform float uScale;
  uniform float uPulse;
  varying vec3 vColour;
  varying float vAlpha;

  ${TURBO}
  // Bright band at distance w from the sensor.
  float band(float d, float w, float width) {
    float x = (d - w) / width;
    return exp(-x * x);
  }

  void main() {
    float d = data.x;
    float radius = uScan * ${SCAN_RADIUS.toFixed(3)};
    // Colour runs red to blue over one sensor's area, not the full radius.
    float k = clamp(d / 0.24, 0.0, 1.0);
    vec3 colour = turbo(0.93 - k * 0.72);
    float alpha = 0.95 - 0.35 * k;

    // First scan: a bright front moves out and leaves the points behind it.
    if (uScan < 1.0) alpha += 0.6 * band(d, radius, 0.012);

    // Repeating pulses: each sensor sends a front out along its rings.
    float w = fract(uTime * 0.14 + data.z) * ${(SCAN_RADIUS * 1.3).toFixed(3)};
    float pulse = band(d, w, 0.01) * uScan * uPulse;
    alpha += 0.5 * pulse;
    colour = mix(colour, vec3(1.0), 0.45 * pulse);

    // Alert: the points near the alert sensor turn red and pulse faster.
    float reach = uAlert * ${ALERT_RADIUS.toFixed(3)};
    float near = (1.0 - smoothstep(reach * 0.5, reach + 0.001, data.y)) * step(0.001, uAlert);
    float wa = fract(uTime * 0.4) * ${(ALERT_RADIUS * 1.2).toFixed(3)};
    float alertPulse = band(data.y, wa, 0.008) * near * uPulse;
    vec3 red = vec3(${ALERT.r.toFixed(3)}, ${ALERT.g.toFixed(3)}, ${ALERT.b.toFixed(3)});
    colour = mix(colour, red, max(near, uPaddock * data.w * 0.9));
    colour = mix(colour, vec3(1.0, 0.75, 0.65), 0.5 * alertPulse);
    alpha += 0.3 * near + 0.5 * alertPulse + 0.3 * uPaddock * data.w;

    // Points the scan has not reached yet show as a faint grey cloud.
    float scanned = step(d, radius);
    colour = mix(vec3(0.55), colour, scanned);
    alpha = mix(0.22, alpha, scanned);

    // Fade out at the edge of the farm.
    float edge = max(abs(position.x), abs(position.z));
    alpha *= 1.0 - smoothstep(0.7, 1.0, edge);

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = max(1.0, uScale * (0.0036 + 0.0016 * (pulse + alertPulse)) / -mv.z);
    vColour = colour;
    vAlpha = clamp(alpha, 0.0, 1.0);
  }
`

// Dots on the land of New Zealand. A slow pulse spreads out from the farm.
const landShader = /* glsl */ `
  attribute vec2 data;
  uniform float uTime;
  uniform float uPulse;
  uniform float uLand;
  uniform float uFine;
  uniform float uLocal;
  uniform float uDpr;
  varying vec3 vColour;
  varying float vAlpha;
  ${TURBO}

  void main() {
    float coast = step(0.5, data.y) * step(data.y, 1.5);
    float fine = step(1.5, data.y) * step(data.y, 2.5);
    float local = step(2.5, data.y);
    float ld = log(data.x + 1.0) / log(1200.0);
    float fade = 1.0 - smoothstep(20.0, 45.0, data.x);
    float x = (ld - fract(uTime * 0.12) * 1.3) / 0.035;
    float pulse = exp(-x * x) * uPulse * mix(1.0, fade, fine) * (1.0 - local);
    vColour = mix(vec3(0.62), turbo(0.93 - ld * 0.8), pulse);
    float alpha = mix(mix(0.26, 0.6, coast), 0.32 * uFine * fade, fine) * (1.0 - local);
    alpha += local * 0.3 * uLocal * (1.0 - smoothstep(1.5, 5.0, data.x));
    vAlpha = (alpha + 0.6 * pulse) * uLand;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (1.4 + 0.4 * coast) * uDpr;
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColour;
  varying float vAlpha;
  void main() {
    if (vAlpha <= 0.0) discard;
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    gl_FragColor = vec4(vColour, vAlpha);
  }
`

type Props = {
  progress: MotionValue<number>
  reduced: boolean
  overlay: RefObject<HTMLDivElement | null>
}

// Camera stops over the story:
// [progress, azimuth, elevation, distance, alert focus, country focus].
// Focus 0 looks at the farm, 1 at the alert sensor or the middle of NZ.
// The camera starts over the whole country and zooms in to the farm.
const SHOTS = [
  [0, 0, 80, 9000, 0, 1],
  [0.07, 0, 72, 620, 0, 0],
  [0.15, 0.3, 58, 4.3, 0, 0],
  [0.38, -0.05, 46, 3.8, 0, 0],
  [0.5, -0.3, 42, 3.3, 0.5, 0],
  [0.9, -0.45, 44, 3.6, 0.3, 0],
].map(([p, az, el, d, ...focus]) => [p, az, el, Math.log(d), ...focus])

function shotAt(p: number) {
  let i = 0
  while (i < SHOTS.length - 2 && p > SHOTS[i + 1][0]) i++
  const a = SHOTS[i]
  const b = SHOTS[i + 1]
  const t = MathUtils.smootherstep(p, a[0], b[0])
  return a.slice(1).map((v, j) => v + (b[j + 1] - v) * t)
}

function Cloud({ cloud, nz, progress, reduced, overlay }: Props & Farm) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(cloud.position, 3))
    g.setAttribute('data', new BufferAttribute(cloud.data, 4))
    return g
  }, [cloud])
  const material = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScan: { value: 0 },
      uAlert: { value: 0 },
      uPaddock: { value: 0 },
      uScale: { value: 1 },
      uPulse: { value: reduced ? 0 : 1 },
    }),
    [reduced],
  )
  const land = useRef<ShaderMaterial>(null)
  const landGeometry = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(nz.position, 3))
    g.setAttribute('data', new BufferAttribute(nz.data, 2))
    return g
  }, [nz])
  const landUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: reduced ? 0 : 1 },
      uLand: { value: 1 },
      uFine: { value: 0 },
      uLocal: { value: 0 },
      uDpr: { value: 1 },
    }),
    [reduced],
  )
  const boxGeometry = useMemo(
    () => new EdgesGeometry(new BoxGeometry(0.045, 0.04, 0.045)),
    [],
  )
  const boxMaterials = useRef<(LineBasicMaterial | null)[]>([])
  const paddock = useRef<Line2>(null)
  const anchors = useRef<[HTMLElement, Vector3][]>([])
  const view = useRef<number[] | null>(null)
  const alertAnchor = cloud.anchors[ALERT_SENSOR_ID]
  const anchorAt = (id: string): Vec3 =>
    id === 'site' ? [0, 0, 0] : cloud.anchors[id]

  useFrame((state, delta) => {
    const { camera, size, viewport } = state
    const p = progress.get()
    const u = material.current?.uniforms
    if (!u) return
    if (!reduced) u.uTime.value = state.clock.elapsedTime
    u.uScan.value = stage(p, STORY.scan)
    u.uAlert.value = stage(p, STORY.alert)
    u.uPaddock.value = stage(p, STORY.paddock)
    u.uScale.value =
      (size.height * viewport.dpr) / (2 * Math.tan((FOV * Math.PI) / 360))

    const sensors = stage(p, STORY.sensors)
    const alert = stage(p, [STORY.alert[0], STORY.alert[0] + 0.03])
    boxMaterials.current.forEach((m, i) => {
      if (!m) return
      m.opacity = sensors * 0.9
      m.color.copy(HEALTHY)
      if (FARM_SENSORS[i].id === ALERT_SENSOR_ID) m.color.lerp(ALERT, alert)
    })
    if (paddock.current) paddock.current.material.opacity = u.uPaddock.value

    const target = shotAt(p)
    if (!reduced) target[0] += Math.sin(state.clock.elapsedTime * 0.08) * 0.06
    const k = reduced || !view.current ? 1 : 1 - Math.exp(-3 * delta)
    view.current ??= target
    const v = view.current.map((c, i) => c + (target[i] - c) * k)
    view.current = v
    const [azimuth, elevation, logDistance, focus, country] = v
    const distance = Math.exp(logDistance)
    const fx = alertAnchor[0] * focus + nz.centre[0] * country
    const fz = alertAnchor[2] * focus + nz.centre[2] * country
    const el = (elevation * Math.PI) / 180
    camera.position.set(
      fx + Math.sin(azimuth) * Math.cos(el) * distance,
      0.12 + Math.sin(el) * distance,
      fz + Math.cos(azimuth) * Math.cos(el) * distance,
    )
    camera.lookAt(fx, 0.12, fz)
    camera.near = distance * 0.02
    camera.far = distance * 10
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    const l = land.current?.uniforms
    if (l) {
      l.uTime.value = u.uTime.value
      l.uLand.value = MathUtils.smoothstep(distance, 4.5, 14)
      l.uLocal.value = 1 - MathUtils.smoothstep(distance, 60, 200)
      l.uFine.value = 1 - MathUtils.smoothstep(distance, 900, 3000)
      l.uDpr.value = viewport.dpr
    }

    if (!anchors.current.length && overlay.current)
      anchors.current = [
        ...overlay.current.querySelectorAll<HTMLElement>('[data-anchor]'),
      ].map((el) => [el, new Vector3(...anchorAt(el.dataset.anchor!))])
    const point = new Vector3()
    for (const [node, anchor] of anchors.current) {
      point.copy(anchor).project(camera)
      node.style.translate = `${((point.x + 1) / 2) * size.width}px ${((1 - point.y) / 2) * size.height}px`
      node.style.visibility = 'visible'
    }
  })

  return (
    <>
      <points geometry={landGeometry}>
        <shaderMaterial
          ref={land}
          vertexShader={landShader}
          fragmentShader={fragmentShader}
          uniforms={landUniforms}
          transparent
          depthWrite={false}
        />
      </points>
      <points geometry={geometry}>
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
      {FARM_SENSORS.map((s, i) => {
        const [x, y, z] = cloud.anchors[s.id]
        return (
          <lineSegments
            key={s.id}
            geometry={boxGeometry}
            position={[x, y + 0.02, z]}
          >
            <lineBasicMaterial
              ref={(m) => {
                boxMaterials.current[i] = m
              }}
              transparent
              opacity={0}
            />
          </lineSegments>
        )
      })}
      <Line
        ref={paddock}
        points={Array.from({ length: cloud.paddockLine.length / 3 }, (_, i) => [
          cloud.paddockLine[i * 3],
          cloud.paddockLine[i * 3 + 1],
          cloud.paddockLine[i * 3 + 2],
        ])}
        color={ALERT}
        lineWidth={1.5}
        dashed
        dashSize={0.03}
        gapSize={0.02}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </>
  )
}

export default function FarmScene(props: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const near = useInView(wrapRef, { margin: '100% 0px', once: true })
  const inView = useInView(wrapRef)
  const [farm, setFarm] = useState<Farm | null>(null)

  useEffect(() => {
    if (near) loadFarm().then(setFarm)
  }, [near])

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="absolute inset-0 transition-opacity duration-700"
      style={{ opacity: farm ? 1 : 0 }}
    >
      {farm && (
        <Canvas
          dpr={[1, 2]}
          frameloop={inView ? 'always' : 'never'}
          camera={{ fov: FOV }}
          gl={{ antialias: false, alpha: true }}
        >
          <Cloud {...farm} {...props} />
        </Canvas>
      )}
    </div>
  )
}
