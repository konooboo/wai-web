import { useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, type RefObject } from 'react'
import { turbo } from '../farm/pointCloud'

const RING_GAP = 14
const DOT_GAP = 6
const SWEEP_MS = 7000
const BAND = 140
const BUCKETS = 32
const PALETTE = Array.from({ length: BUCKETS }, (_, i) =>
  turbo(0.86 - (i / (BUCKETS - 1)) * 0.76),
)

// Dotted lidar rings around a target element, with a scan ring that sweeps
// out and colours the dots it passes. Sits behind the hero content.
export function LidarRings({
  centre,
}: {
  centre: RefObject<HTMLElement | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inView = useInView(canvasRef)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const target = centre.current
    if (!canvas || !target) return
    const ctx = canvas.getContext('2d')!
    const base = document.createElement('canvas')
    let xs = new Float32Array(0)
    let ys = new Float32Array(0)
    let rs = new Float32Array(0)
    let maxR = 1
    let frame = 0

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const box = canvas.getBoundingClientRect()
      const t = target.getBoundingClientRect()
      const cx = t.left + t.width / 2 - box.left
      const cy = t.top + t.height / 2 - box.top
      for (const c of [canvas, base]) {
        c.width = box.width * dpr
        c.height = box.height * dpr
        c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      maxR = Math.hypot(
        Math.max(cx, box.width - cx),
        Math.max(cy, box.height - cy),
      )

      const px: number[] = []
      const py: number[] = []
      const pr: number[] = []
      let seed = 7
      const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
      for (let r = RING_GAP * 2; r < maxR; r += RING_GAP) {
        const step = DOT_GAP / r
        for (let a = rand() * step; a < Math.PI * 2; a += step) {
          if (rand() < 0.12) continue
          // Bend the rings a little, as terrain does in a real scan.
          const bend =
            1 +
            0.025 * Math.sin(3 * a + r * 0.012) +
            0.015 * Math.sin(5 * a - r * 0.02)
          const x = cx + Math.cos(a) * r * bend
          const y = cy + Math.sin(a) * r * bend
          if (x < 0 || y < 0 || x > box.width || y > box.height) continue
          px.push(x)
          py.push(y)
          pr.push(r)
        }
      }
      xs = Float32Array.from(px)
      ys = Float32Array.from(py)
      rs = Float32Array.from(pr)

      const b = base.getContext('2d')!
      b.clearRect(0, 0, box.width, box.height)
      for (let i = 0; i < xs.length; i++) {
        b.fillStyle = `rgb(20 20 18 / ${0.22 * (1 - (rs[i] / maxR) * 0.7)})`
        b.fillRect(xs[i] - 0.75, ys[i] - 0.75, 1.5, 1.5)
      }
      draw(performance.now())
    }

    const draw = (now: number) => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(base, 0, 0, width, height)
      if (reducedMotion) return
      const sweep = ((now % SWEEP_MS) / SWEEP_MS) * (maxR + BAND)
      // Points are in ring order, so skip to the first ring in the band.
      let i = 0
      while (i < rs.length && rs[i] < sweep - BAND) i += 64
      i = Math.max(0, i - 64)
      for (; i < rs.length && rs[i] <= sweep; i++) {
        const k = 1 - (sweep - rs[i]) / BAND
        if (k <= 0) continue
        ctx.globalAlpha = k * 0.55 * (1 - (rs[i] / maxR) * 0.6)
        ctx.fillStyle =
          PALETTE[Math.min(BUCKETS - 1, Math.floor((rs[i] / maxR) * BUCKETS))]
        ctx.fillRect(xs[i] - 1, ys[i] - 1, 2, 2)
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      draw(now)
      frame = requestAnimationFrame(loop)
    }

    build()
    const observer = new ResizeObserver(build)
    observer.observe(canvas)
    if (inView && !reducedMotion) frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [centre, inView, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    />
  )
}
