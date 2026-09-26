import { motion, useMotionValue, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import heroPoster from '../assets/hero-poster.webp'
import heroVideo from '../assets/hero-loop.mp4'
import filmVideo from '../assets/wai-web.mp4'
import { BOOK_DEMO_HREF } from '../content'

const EASE = [0.22, 1, 0.36, 1] as const

function RoundedPlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M6 3.5v17l14-8.5z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Hero() {
  const reducedMotion = useReducedMotion() ?? false
  const [playing, setPlaying] = useState(false)
  const filmRef = useRef<HTMLVideoElement>(null)
  const progress = useMotionValue(0)

  const play = () => {
    const film = filmRef.current
    if (!film) return
    film.currentTime = 0
    progress.set(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  return (
    <section
      id="top"
      className="border-line bg-ink relative -mt-[65px] cursor-pointer overflow-hidden border-b md:-mt-[77px]"
      onClick={(e) => {
        if (!playing && !(e.target as Element).closest('a, button')) play()
      }}
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
        className="bg-ink absolute inset-0 z-[60] size-full cursor-pointer object-contain md:object-cover"
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
        className="relative min-h-svh px-6 pt-32 pb-20 md:px-10 md:pt-[172px]"
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
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        initial={false}
        animate={{ opacity: playing ? 0 : 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        inert={playing}
      >
        <div className="px-6 pb-8 md:px-10">
          <button
            type="button"
            onClick={play}
            aria-label="Watch the film"
            className="text-paper pointer-events-auto -m-2 block p-2 opacity-90 transition hover:scale-110 hover:opacity-100"
          >
            <RoundedPlayIcon className="-ml-1.5 size-8" />
          </button>
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[60]"
        initial={false}
        animate={{ opacity: playing ? 1 : 0 }}
        transition={{ duration: 0.4, delay: playing ? 0.6 : 0 }}
        inert={!playing}
      >
        <button
          type="button"
          onClick={stop}
          aria-label="Close the film"
          className="text-paper pointer-events-auto absolute top-3 right-4 grid size-10 place-items-center opacity-90 drop-shadow-[0_0_6px_var(--color-ink)] transition hover:scale-110 hover:opacity-100 md:top-[18px] md:right-8"
        >
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
            <path
              d="M5 5l14 14M19 5L5 19"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="bg-paper/15 absolute inset-x-0 bottom-0 h-0.5">
          <motion.div
            className="bg-paper h-full origin-left"
            style={{ scaleX: progress }}
          />
        </div>
      </motion.div>
    </section>
  )
}
