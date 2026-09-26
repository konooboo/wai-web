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
      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center px-6 py-20">
        <div className="text-paper">
          <h1 className="max-w-3xl text-5xl leading-[1.05] font-medium tracking-tight md:text-6xl">
            Know your soil and water
            <br />
            without the walk.
          </h1>
          <p className="text-paper/80 mt-6 max-w-md text-lg">
            Wai sensors sit in your paddocks and waterways. The app tells you
            when something changes, why, and what to do next.
          </p>
          <a
            href={BOOK_DEMO_HREF}
            className="bg-paper text-ink hover:bg-paper/85 mt-8 inline-block rounded-full px-6 py-3"
          >
            Book a demo
          </a>
        </div>
      </div>
    </section>
  )
}
