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
  Vector2,
  Vector3,
  type LineBasicMaterial,
} from 'three'
import type { Line2 } from 'three-stdlib'
import type { NzDots } from './nzDots'
import {
  ALERT_RADIUS,
  SCAN_RADIUS,
  WORLD,
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
  uniform vec2 uSensors[${FARM_SENSORS.length}];
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
    // A healthy sensor runs green near the sensor to blue at the edge of
    // its area, not the full radius.
    float k = clamp(d / 0.24, 0.0, 1.0);
    vec3 colour = turbo(0.52 - k * 0.32);
    float alpha = 0.95 - 0.35 * k;

    // First scan: a bright front moves out and leaves the points behind it.
    if (uScan < 1.0) alpha += 0.6 * band(d, radius, 0.012);

    // Repeating pulses: each sensor sends a ring out. The ring is measured
    // from the sensor itself, so it carries on across the neighbouring
    // sensors' areas instead of stopping at the border, and fades with
    // distance.
    vec2 map = position.xz / ${WORLD.toFixed(1)} + 0.5;
    float pulse = 0.0;
    for (int i = 0; i < ${FARM_SENSORS.length}; i++) {
      float di = distance(map, uSensors[i]);
      float w = fract(uTime * 0.14 + float(i) * 0.37) * 0.32;
      pulse = max(pulse, band(di, w, 0.01) * (1.0 - smoothstep(0.12, 0.25, di)));
    }
    pulse *= uScan * uPulse;
    alpha += 0.3 * pulse;
    colour = mix(colour, vec3(1.0), 0.3 * pulse);

    // Alert: red to orange spreads out from the alert sensor over every
    // point in reach, whichever sensor owns it, and fades at the edge so
    // there is no hard border. Paddock 7 turns red too.
    float reach = uAlert * 0.3;
    float ka = clamp(data.y / 0.3, 0.0, 1.0);
    float alerting = (1.0 - smoothstep(reach * 0.6, reach + 0.001, data.y)) * step(0.001, uAlert);
    colour = mix(colour, turbo(0.93 - ka * 0.25), alerting);
    float wa = fract(uTime * 0.4) * ${(ALERT_RADIUS * 1.2).toFixed(3)};
    float alertPulse = band(data.y, wa, 0.008) * alerting * uPulse
      * (1.0 - smoothstep(0.06, 0.16, data.y));
    vec3 red = vec3(${ALERT.r.toFixed(3)}, ${ALERT.g.toFixed(3)}, ${ALERT.b.toFixed(3)});
    colour = mix(colour, red, uPaddock * data.w * 0.9);
    colour = mix(colour, vec3(1.0, 0.75, 0.65), 0.5 * alertPulse);
    alpha += 0.3 * alerting + 0.5 * alertPulse + 0.3 * uPaddock * data.w;

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
    float strength = min(1.0, pulse * 3.0);
    vec3 bright = min(vec3(1.0), turbo(0.93 - ld * 0.8) * 1.25);
    vColour = mix(vec3(0.62), bright, strength);
    float alpha = mix(mix(0.26, 0.6, coast), 0.32 * uFine * fade, fine) * (1.0 - local);
    alpha += local * 0.3 * uLocal * (1.0 - smoothstep(1.5, 5.0, data.x));
    vAlpha = min(1.0, (alpha + 0.9 * strength) * uLand);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (1.4 + 0.4 * coast + 0.8 * strength) * uDpr;
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
// The camera holds over the whole country until the map panel pins, then
// zooms in to the farm over STORY.zoom: the first half pans to Canterbury
// from high up, the second half drops to the farm.
const SHOTS = [
  [0, 0, 80, 4200, 0, 1],
  [STORY.zoom[0], 0, 80, 4200, 0, 1],
  [(STORY.zoom[0] + STORY.zoom[1]) / 2, 0, 72, 620, 0, 0],
  [STORY.zoom[1], 0.3, 58, 4.3, 0, 0],
  [0.38, -0.05, 46, 3.8, 0, 0],
  [0.5, -0.3, 42, 3.3, 0.5, 0],
  [0.9, -0.45, 44, 3.6, 0.3, 0],
].map(([p, az, el, d, ...focus]) => [p, az, el, Math.log(d), ...focus])

// Monotone cubic through the shots (Fritsch–Butland tangents), so the camera
// keeps moving through each keyframe instead of easing to a stop at every one.
const P = SHOTS.map((s) => s[0])
const TANGENTS = SHOTS[0].slice(1).map((_, j) => {
  const y = SHOTS.map((s) => s[j + 1])
  const d = y.slice(1).map((v, i) => (v - y[i]) / (P[i + 1] - P[i]))
  return y.map((_, i) => {
    if (i === 0) return d[0]
    if (i === d.length) return d[d.length - 1]
    const [a, b] = [d[i - 1], d[i]]
    return a * b <= 0 ? 0 : 2 / (1 / a + 1 / b)
  })
})

function shotAt(p: number) {
  let i = 0
  while (i < P.length - 2 && p > P[i + 1]) i++
  const h = P[i + 1] - P[i]
  const t = MathUtils.clamp((p - P[i]) / h, 0, 1)
  const t2 = t * t
  const t3 = t2 * t
  const h00 = 2 * t3 - 3 * t2 + 1
  const h10 = (t3 - 2 * t2 + t) * h
  const h01 = -2 * t3 + 3 * t2
  const h11 = (t3 - t2) * h
  return TANGENTS.map(
    (m, j) =>
      h00 * SHOTS[i][j + 1] +
      h10 * m[i] +
      h01 * SHOTS[i + 1][j + 1] +
      h11 * m[i + 1],
  )
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
      uSensors: { value: FARM_SENSORS.map((s) => new Vector2(s.x, s.y)) },
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
    () => new EdgesGeometry(new BoxGeometry(0.03, 0.028, 0.03)),
    [],
  )
  const boxMaterials = useRef<(LineBasicMaterial | null)[]>([])
  const paddock = useRef<Line2>(null)
  const anchors = useRef<[HTMLElement, Vector3][]>([])
  const alertAnchor = cloud.anchors[ALERT_SENSOR_ID]
  const anchorAt = (id: string): Vec3 =>
    id === 'site' ? [0, 0, 0] : cloud.anchors[id]

  useFrame((state) => {
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

    const [azimuth, elevation, logDistance, focus, country] = shotAt(p)
    const drift = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.08) * 0.06
    const distance = Math.exp(logDistance)
    const fx = alertAnchor[0] * focus + nz.centre[0] * country
    const fz = alertAnchor[2] * focus + nz.centre[2] * country
    const el = (elevation * Math.PI) / 180
    camera.position.set(
      fx + Math.sin(azimuth + drift) * Math.cos(el) * distance,
      0.12 + Math.sin(el) * distance,
      fz + Math.cos(azimuth + drift) * Math.cos(el) * distance,
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
  const inView = useInView(wrapRef)
  const [farm, setFarm] = useState<Farm | null>(null)

  useEffect(() => {
    loadFarm().then(setFarm)
  }, [])

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
          // The loading screen in index.html waits for this.
          onCreated={() => dispatchEvent(new Event('wai:farm-ready'))}
>
          <Cloud {...farm} {...props} />
        </Canvas>
      )}
    </div>
  )
}
