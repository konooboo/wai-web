export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[linear-gradient(rgb(0_0_0/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.035)_1px,transparent_1px)] bg-size-[48px_48px]"
    >
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <h1 className="text-5xl leading-[1.05] font-medium tracking-tight md:text-6xl">
            Know your soil and water without the walk.
          </h1>
          <p className="text-muted mt-6 max-w-md text-lg">
            Wai sensors sit in your paddocks and waterways. The app tells you
            when something changes, why, and what to do next.
          </p>
          <a
            href="#contact"
            className="bg-ink text-paper hover:bg-ink/85 mt-8 inline-block rounded-full px-6 py-3"
          >
            Book a demo
          </a>
        </div>
        {/* Placeholder: Three.js hardware model */}
        <div className="border-muted/40 text-muted flex aspect-square items-center justify-center rounded-3xl border border-dashed font-mono text-sm">
          3D hardware model
        </div>
      </div>
      <div className="border-line text-muted mx-auto flex max-w-6xl items-center gap-3 border-t px-6 py-4 font-mono text-xs tracking-wider uppercase">
        <span className="bg-healthy size-2 animate-pulse rounded-full" />
        WAI_01 · Online
      </div>
    </section>
  )
}
