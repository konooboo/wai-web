import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import heroPoster from '../assets/hero-poster.webp'
import heroVideo from '../assets/hero-loop.mp4'
import filmVideo from '../assets/wai-web.mp4'
import { BOOK_DEMO_HREF } from '../content'

// Demo only: ?hero=cursor shows the cursor variant. Remove once we pick one.
const VARIANT =
  new URLSearchParams(window.location.search).get('hero') === 'cursor'
    ? 'cursor'
    : 'button'

const EASE = [0.22, 1, 0.36, 1] as const

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
    </svg>
  )
}

export function Hero() {
  const reducedMotion = useReducedMotion() ?? false
  const [playing, setPlaying] = useState(false)
  const [overLink, setOverLink] = useState(false)
  const [inside, setInside] = useState(false)
  const filmRef = useRef<HTMLVideoElement>(null)
  const progress = useMotionValue(0)
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const springX = useSpring(cursorX, { stiffness: 600, damping: 45 })
  const springY = useSpring(cursorY, { stiffness: 600, damping: 45 })

  const play = () => {
    const film = filmRef.current
    if (!film) return
    film.currentTime = 0
    progress.set(0)
    setPlaying(true)
    void film.play()
  }

  const stop = () => {
    filmRef.current?.pause()
    setPlaying(false)
  }

  useEffect(() => {
    if (!playing) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && stop()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing])

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    cursorX.set(e.clientX - rect.left)
    cursorY.set(e.clientY - rect.top)
    setOverLink((e.target as HTMLElement).closest('a, button') !== null)
  }

  const onSectionClick = (e: MouseEvent<HTMLElement>) => {
    if (VARIANT !== 'cursor' || playing) return
    if ((e.target as HTMLElement).closest('a, button')) return
    play()
  }

  const cursorMode = VARIANT === 'cursor' && !playing

  return (
    <section
      id="top"
      className={`border-line bg-ink relative -mt-[65px] overflow-hidden border-b md:-mt-[77px] ${cursorMode ? 'pointer-fine:cursor-none' : ''}`}
      onPointerMove={cursorMode ? onPointerMove : undefined}
      onPointerEnter={cursorMode ? () => setInside(true) : undefined}
      onPointerLeave={cursorMode ? () => setInside(false) : undefined}
      onClick={onSectionClick}
    >
      <motion.video
        key={String(reducedMotion)}
        className="absolute inset-0 size-full object-cover"
        src={heroVideo}
        poster={heroPoster}
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload={reducedMotion ? 'none' : 'auto'}
        aria-hidden
        animate={{ opacity: playing ? 0 : 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.div
        className="bg-ink/50 absolute inset-0"
        animate={{ opacity: playing ? 0 : 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.video
        ref={filmRef}
        className="absolute inset-x-0 bottom-0 h-[calc(100%-65px)] w-full cursor-pointer object-contain md:h-[calc(100%-77px)]"
        src={filmVideo}
        playsInline
        preload="none"
        initial={false}
        animate={{ opacity: playing ? 1 : 0 }}
        transition={{ duration: 0.6, delay: playing ? 0.3 : 0 }}
        style={{ pointerEvents: playing ? 'auto' : 'none' }}
        onClick={stop}
        onEnded={stop}
        onTimeUpdate={(e) =>
          progress.set(e.currentTarget.currentTime / e.currentTarget.duration)
        }
        aria-label="Wai product film"
      />

      <motion.div
        className="relative mx-auto min-h-svh max-w-6xl px-6 pt-32 pb-20 md:pt-[172px]"
        initial={false}
        animate={
          playing
            ? { opacity: 0, y: -48, filter: 'blur(8px)' }
            : { opacity: 1, y: 0, filter: 'blur(0px)' }
        }
        transition={{ duration: 0.6, ease: EASE }}
        style={{ pointerEvents: playing ? 'none' : 'auto' }}
        inert={playing}
      >
        <div className="text-paper">
          <h1 className="max-w-4xl text-5xl leading-[1.02] font-medium tracking-tighter text-balance md:text-7xl">
            Know your soil and water
            <br className="hidden sm:block" /> without the walk.
          </h1>
          <p className="text-paper/80 mt-6 max-w-md text-lg">
            Wai sensors sit in your paddocks and waterways. Our app tells you
            when something changes, analyses the data with AI and provides
            actionable insights.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={BOOK_DEMO_HREF}
              className="bg-paper text-ink hover:bg-paper/85 rounded-full px-6 py-3"
            >
              Book a demo
            </a>
            <a
              href="#farm-map"
              className="border-paper/30 text-paper hover:bg-paper/10 rounded-full border px-6 py-3"
            >
              See how it works
            </a>
          </div>

          {/* Touch screens and keyboard users have no cursor, so both variants
              need a real button. The cursor variant hides it on fine pointers
              until it gets focus. */}
          <button
            type="button"
            onClick={play}
            className={`text-paper mt-8 inline-flex items-center gap-3 font-mono text-xs tracking-wider uppercase ${
              VARIANT === 'cursor'
                ? 'pointer-fine:sr-only pointer-fine:focus-visible:not-sr-only'
                : 'md:hidden'
            }`}
          >
            <span className="border-paper/40 grid size-11 place-items-center rounded-full border backdrop-blur-sm">
              <PlayIcon className="ml-0.5 size-4" />
            </span>
            Watch the film
          </button>
        </div>
      </motion.div>

      {VARIANT === 'button' && (
        <motion.button
          type="button"
          onClick={play}
          className="group absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 md:flex"
          initial={false}
          animate={
            playing ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.4, ease: EASE }}
          style={{ pointerEvents: playing ? 'none' : 'auto' }}
          inert={playing}
        >
          <span className="border-paper/40 bg-paper/10 text-paper group-hover:bg-paper group-hover:text-ink grid size-24 place-items-center rounded-full border backdrop-blur-md transition-colors duration-300">
            <PlayIcon className="ml-1 size-7" />
          </span>
          <span className="text-paper/80 font-mono text-xs tracking-wider uppercase">
            Watch the film
          </span>
        </motion.button>
      )}

      {VARIANT === 'cursor' && (
        <motion.div
          className="text-paper pointer-events-none absolute top-0 left-0 hidden size-7 -translate-1/2 pointer-fine:block"
          style={{ x: springX, y: springY }}
          initial={false}
          animate={{
            opacity: cursorMode && inside && !overLink ? 1 : 0,
            scale: cursorMode && inside && !overLink ? 1 : 0.4,
          }}
          transition={{ duration: 0.25, ease: EASE }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="size-full">
            <path
              d="M6 3.5v17l14-8.5z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}

      <motion.div
        className="absolute inset-x-0 bottom-0"
        initial={false}
        animate={{ opacity: playing ? 1 : 0 }}
        transition={{ duration: 0.4, delay: playing ? 0.6 : 0 }}
        style={{ pointerEvents: playing ? 'auto' : 'none' }}
        inert={!playing}
      >
        <div className="mx-auto flex max-w-6xl justify-end px-6 pb-6">
          <button
            type="button"
            onClick={stop}
            className="border-paper/30 text-paper hover:bg-paper/10 rounded-full border px-5 py-2 font-mono text-xs tracking-wider uppercase backdrop-blur-sm"
          >
            Close ✕
          </button>
        </div>
        <div className="bg-paper/15 h-0.5">
          <motion.div
            className="bg-paper h-full origin-left"
            style={{ scaleX: progress }}
          />
        </div>
      </motion.div>
    </section>
  )
}
