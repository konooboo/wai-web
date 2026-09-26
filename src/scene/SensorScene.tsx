import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MathUtils, PMREMGenerator } from 'three'
import type { Group } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { MotionValue } from 'motion/react'
import { buildSensorModel, disposeSensorModel } from './sensorModel'

const BASE_YAW = 0.55

type Props = {
  scrollProgress: MotionValue<number>
  reducedMotion: boolean
  // Roll in radians. Tilt in the scene, not with CSS: R3F sizes the canvas
  // from the bounding box, so a CSS rotation makes the canvas too big.
  tilt?: number
}

function Room() {
  const gl = useThree((s) => s.gl)
  const env = useMemo(() => {
    const pmrem = new PMREMGenerator(gl)
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    return texture
  }, [gl])
  useEffect(() => () => env.dispose(), [env])
  return <primitive object={env} attach="environment" />
}

function Device({ scrollProgress, reducedMotion }: Props) {
  const root = useRef<Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const spin = useRef(0)
  const lastScroll = useRef<number | null>(null)
  const model = useMemo(() => buildSensorModel(), [])

  useEffect(() => () => disposeSensorModel(model), [model])

  useEffect(() => {
    if (reducedMotion) return
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [reducedMotion])

  useFrame((state, delta) => {
    const g = root.current
    if (!g || reducedMotion) return
    const t = state.clock.elapsedTime
    // -0.5 to 0.5 while the scene passes through the viewport.
    const scroll = scrollProgress.get() - 0.5
    // A fast scroll adds extra spin, which then decays.
    spin.current += (scroll - (lastScroll.current ?? scroll)) * 3
    spin.current *= Math.exp(-2.5 * delta)
    lastScroll.current = scroll
    const k = 1 - Math.exp(-3 * delta)
    const targetYaw =
      BASE_YAW +
      Math.sin(t * 0.25) * 0.15 +
      pointer.current.x * 0.5 +
      scroll * 0.9 +
      spin.current
    const targetPitch = 0.08 + pointer.current.y * 0.25 + scroll * 0.3
    const targetRoll = -pointer.current.x * 0.08
    const targetY = -scroll * 1.2 + Math.sin(t * 0.9) * 0.08
    g.rotation.y = MathUtils.lerp(g.rotation.y, targetYaw, k)
    g.rotation.x = MathUtils.lerp(g.rotation.x, targetPitch, k)
    g.rotation.z = MathUtils.lerp(g.rotation.z, targetRoll, k)
    g.position.y = MathUtils.lerp(g.position.y, targetY, k)
  })

  return (
    <group ref={root} rotation={[0, BASE_YAW, 0]}>
      <primitive object={model} />
    </group>
  )
}

export default function SensorScene(props: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={props.reducedMotion ? 'demand' : 'always'}
      camera={{ position: [0, 3.4, 13.8], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl, camera, scene }) => {
        gl.toneMappingExposure = 1.1
        // Turn the reflections with the tilt, so the model looks lit as when upright.
        scene.environmentRotation.z = props.tilt ?? 0
        camera.lookAt(0, 0, 0)
        window.dispatchEvent(new Event('wai:scene-ready'))
      }}
    >
      <Room />
      {/* The lights are in the tilted group, so they turn with the model. */}
      <group position={[0, -0.5, 0]} rotation={[0, 0, props.tilt ?? 0]}>
        <directionalLight
          position={[5, 9, 7]}
          intensity={1.3 * Math.PI}
          color="#fff4e6"
        />
        <directionalLight
          position={[-7, 4, -6]}
          intensity={0.7 * Math.PI}
          color="#cfe3ff"
        />
        {/* Rim light from behind, so the dark case edges show on a dark background. */}
        <directionalLight
          position={[1, 4, -10]}
          intensity={0.7 * Math.PI}
          color="#e3ecff"
        />
        <Device {...props} />
      </group>
    </Canvas>
  )
}
