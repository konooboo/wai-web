import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MathUtils, PMREMGenerator } from 'three'
import type { Group } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { MotionValue } from 'motion/react'
import { buildSensorModel, disposeSensorModel } from './sensorModel'

const BASE_YAW = -0.6

type Props = { scrollProgress: MotionValue<number>; reducedMotion: boolean }

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
    const scroll = scrollProgress.get()
    const k = 1 - Math.exp(-3 * delta)
    const targetYaw =
      BASE_YAW +
      Math.sin(t * 0.25) * 0.15 +
      pointer.current.x * 0.2 +
      scroll * 0.9
    const targetPitch = pointer.current.y * 0.06 + scroll * 0.15
    g.rotation.y = MathUtils.lerp(g.rotation.y, targetYaw, k)
    g.rotation.x = MathUtils.lerp(g.rotation.x, targetPitch, k)
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
      camera={{ position: [0, 4.2, 17.1], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl, camera }) => {
        gl.toneMappingExposure = 1.1
        camera.lookAt(0, 0, 0)
        window.dispatchEvent(new Event('wai:scene-ready'))
      }}
    >
      <Room />
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
      <group position={[0, -0.5, 0]}>
        <Device {...props} />
      </group>
    </Canvas>
  )
}
