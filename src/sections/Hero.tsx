import { useReducedMotion } from 'motion/react'
import heroPoster from '../assets/hero-poster.webp'
import heroVideo from '../assets/hero-loop.mp4'
import { BOOK_DEMO_HREF } from '../content'

export function Hero() {
  const reducedMotion = useReducedMotion() ?? false

  return (
    <section
      id="top"
      className="border-line bg-ink relative overflow-hidden border-b"
    >
      <video
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
      />
      <div className="bg-ink/50 absolute inset-0" />
      <div className="relative mx-auto min-h-[calc(100svh-4rem)] max-w-6xl px-6 pt-16 pb-20 md:pt-24">
        <div className="text-paper">
          <h1 className="max-w-4xl text-5xl leading-[1.02] font-medium tracking-tighter text-balance md:text-7xl">
            Know your soil and water
            <br className="hidden sm:block" /> without the walk.
          </h1>
          <p className="text-paper/80 mt-6 max-w-md text-lg">
            Wai sensors sit in your paddocks and waterways. The app tells you
            when something changes, why, and what to do next.
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
      </div>
    </section>
  )
}
