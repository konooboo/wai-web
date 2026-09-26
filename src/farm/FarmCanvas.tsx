import { useInView, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { drawPointCloud, type PointCloud } from './pointCloud'
import { STORY, stage } from './story'

type Farm = { hillshade: HTMLCanvasElement; cloud: PointCloud }

let farmPromise: Promise<Farm> | null = null

// Builds the terrain in a worker once, then keeps it for the page lifetime.
function loadFarm() {
  farmPromise ??= new Promise((resolve) => {
    const worker = new Worker(new URL('./farm.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event) => {
      const { size, pixels, cloud } = event.data
      const hillshade = document.createElement('canvas')
      hillshade.width = size
      hillshade.height = size
      hillshade
        .getContext('2d')!
        .putImageData(new ImageData(pixels, size, size), 0, 0)
      resolve({ hillshade, cloud })
      worker.terminate()
    }
    worker.postMessage(null)
  })
  return farmPromise
}

// Point size as a fraction of the map width.
const POINT_SIZE = 0.0029

export function FarmCanvas({ progress }: { progress: MotionValue<number> }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const baseRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<HTMLCanvasElement>(null)
  const near = useInView(wrapRef, { margin: '100% 0px', once: true })
  const inView = useInView(wrapRef)
  const [farm, setFarm] = useState<Farm | null>(null)

  useEffect(() => {
    if (near) loadFarm().then(setFarm)
  }, [near])

  useEffect(() => {
    const base = baseRef.current
    const points = pointsRef.current
    if (!farm || !inView || !base || !points) return
    const baseCtx = base.getContext('2d')!
    const ctx = points.getContext('2d')!
    let frame = 0
    let last = ''

    const draw = () => {
      frame = 0
      const p = progress.get()
      const scan = stage(p, STORY.scan)
      const alert = stage(p, STORY.alert)
      const key = `${points.width}:${scan}:${alert}`
      if (key === last) return
      last = key
      ctx.clearRect(0, 0, points.width, points.height)
      drawPointCloud(
        ctx,
        farm.cloud,
        points.width,
        Math.max(1, POINT_SIZE * points.width),
        scan,
        alert,
        points.clientWidth < 450 ? 2 : 1,
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const width = Math.round(base.clientWidth * dpr)
      if (base.width !== width) {
        for (const canvas of [base, points])
          canvas.width = canvas.height = width
        baseCtx.imageSmoothingQuality = 'high'
        baseCtx.drawImage(farm.hillshade, 0, 0, width, width)
      }
      schedule()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(base)
    const unsubscribe = progress.on('change', schedule)
    resize()
    return () => {
      observer.disconnect()
      unsubscribe()
      cancelAnimationFrame(frame)
    }
  }, [farm, inView, progress])

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="absolute inset-0 transition-opacity duration-700"
      style={{ opacity: farm ? 1 : 0 }}
    >
      <canvas ref={baseRef} className="absolute inset-0 size-full" />
      <canvas ref={pointsRef} className="absolute inset-0 size-full" />
    </div>
  )
}
