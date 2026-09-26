import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
} from '@react-three/drei'
import { MathUtils } from 'three'
import type { Group, MeshStandardMaterial } from 'three'
import type { MotionValue } from 'motion/react'

const HEALTHY = '#3a9d5d'
const CASE = '#e4e3df'
const FACE = '#1b1b1a'
const STEEL = '#d8dadb'
const GRAPHITE = '#2a2a29'

const BASE_YAW = -0.7
const BASE_PITCH = 0.12

type Props = { scrollProgress: MotionValue<number>; reducedMotion: boolean }

function Device({ scrollProgress, reducedMotion }: Props) {
  const root = useRef<Group>(null)
  const led = useRef<MeshStandardMaterial>(null)
  const pointer = useRef({ x: 0, y: 0 })

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
      Math.sin(t * 0.25) * 0.12 +
      pointer.current.x * 0.18 +
      scroll * 0.9
    const targetPitch = BASE_PITCH + pointer.current.y * 0.08 + scroll * 0.2
    g.rotation.y = MathUtils.lerp(g.rotation.y, targetYaw, k)
    g.rotation.x = MathUtils.lerp(g.rotation.x, targetPitch, k)
    g.position.y = Math.sin(t * 0.6) * 0.06
    if (led.current)
      led.current.emissiveIntensity = 1.6 + Math.sin(t * 1.6) * 1.2
  })

  return (
    <group ref={root} rotation={[BASE_PITCH, BASE_YAW, 0]}>
      <group position={[0, 0.75, 0]}>
        <RoundedBox args={[1.15, 1.25, 0.6]} radius={0.16} smoothness={6}>
          <meshPhysicalMaterial
            color={CASE}
            roughness={0.55}
            metalness={0.15}
            clearcoat={0.3}
            clearcoatRoughness={0.6}
          />
        </RoundedBox>
        <RoundedBox
          args={[0.8, 0.5, 0.04]}
          radius={0.02}
          smoothness={4}
          position={[0, 0.2, 0.3]}
        >
          <meshPhysicalMaterial
            color={FACE}
            roughness={0.35}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </RoundedBox>
        <mesh position={[-0.27, 0.3, 0.324]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.01, 24]} />
          <meshStandardMaterial
            ref={led}
            color={HEALTHY}
            emissive={HEALTHY}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0.36, 0.66, -0.08]}>
          <cylinderGeometry args={[0.08, 0.09, 0.08, 32]} />
          <meshStandardMaterial color={GRAPHITE} roughness={0.5} />
        </mesh>
        <mesh position={[0.36, 1.02, -0.08]}>
          <capsuleGeometry args={[0.042, 0.62, 8, 24]} />
          <meshStandardMaterial color={GRAPHITE} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.63, 0]}>
          <cylinderGeometry args={[0.2, 0.24, 0.12, 48]} />
          <meshStandardMaterial color={GRAPHITE} roughness={0.5} />
        </mesh>
      </group>

      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 1.5, 32]} />
        <meshStandardMaterial color={STEEL} metalness={0.75} roughness={0.32} />
      </mesh>
      <mesh position={[0, -1.36, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.065, 0.12, 32]} />
        <meshStandardMaterial color={STEEL} metalness={0.75} roughness={0.32} />
      </mesh>
      {[-0.3, -0.65, -1.0].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.072, 0.072, 0.035, 32]} />
          <meshStandardMaterial color={GRAPHITE} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export default function SensorScene(props: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={props.reducedMotion ? 'demand' : 'always'}
      camera={{ position: [0, 1.4, 7.6], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[-3, 5, 4]} intensity={1.2} />
      <group position={[0, -0.15, 0]}>
        <Device {...props} />
      </group>
      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.35}
        scale={5}
        blur={2.8}
        far={2.5}
        resolution={512}
        frames={props.reducedMotion ? 1 : Infinity}
      />
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={3}
          position={[0, 5, 1]}
          rotation-x={Math.PI / 2}
          scale={[8, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[-5, 1, 2]}
          rotation-y={Math.PI / 2}
          scale={[4, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.4}
          position={[5, 0.5, 1]}
          rotation-y={-Math.PI / 2}
          scale={[3, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.6}
          position={[0, 1, 6]}
          scale={[6, 3, 1]}
        />
      </Environment>
    </Canvas>
  )
}
