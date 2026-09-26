# Wai landing page: rules for agents

One-page scrolling landing page for Wai: water and soil sensors for NZ farms, with a mobile app that uses AI to give alerts and suggestions. Several agents build sections in parallel. Follow these rules so the sections look like one page.

## Stack
Bun, Vite 8, React 19.3, TypeScript, Tailwind v4, Motion (`motion/react`), React Three Fiber 9.8 + drei, three.
- Use `bun` only. Never use npm or yarn.
- Do not add dependencies. Everything you need is installed. If you think you need a package, stop and report it.
- Do not change React versions. R3F 9.8.1 needs `react <19.4`.
- No Astryx or other component libraries. Tailwind + Motion only.

## File ownership
Edit only the files your task names. Never edit `App.tsx`, `src/components/*`, `src/content.ts`, `src/index.css`, `package.json`, `bun.lock` or another agent's section. If you need a change there, report it.
You may create new files inside a folder that your task names, for example `src/farm/`.

## Design tokens (defined in `src/index.css`)
- Colours: `paper` (page background #f6f5f1), `ink` (text), `muted` (secondary text), `line` (borders), `healthy` (green, sensor OK), `alert` (red, problem), `mint` (very light green). Use white for cards.
- Fonts: `font-sans` (Geist) for text. `font-mono` (JetBrains Mono) for labels, sensor data, units and spec values.
- Do not invent other colours. Tints like `ink/85`, `healthy/15` are OK.

## Layout and style
- Wrap each section in `<Section id="...">` from `src/components/Section.tsx`. It sets padding and max width (`max-w-6xl px-6`).
- Start each section with `<SectionHeading eyebrow="..." title="...">` from `src/components/SectionHeading.tsx`, unless the design needs something else.
- Cards: `rounded-2xl border border-line bg-white p-6`.
- Primary button: `rounded-full bg-ink px-6 py-3 text-paper hover:bg-ink/85`. Secondary: `rounded-full border border-line px-6 py-3 hover:bg-white`.
- Mono labels: `font-mono text-xs tracking-wider text-muted uppercase`.
- Style reference: hilstart.io (clean, technical, lots of space, fine lines). Calm, precise, no gradients except the footer.
- The primary CTA text is "Book a demo". It links to `BOOK_DEMO_HREF` from `src/content.ts` (a mailto link). The page has no contact form.
- Mobile first. Check 375 px and 1280 px widths. No horizontal scroll.

## Motion
- For simple fade-up on scroll, use `<Reveal>` from `src/components/Reveal.tsx`. Use `delay` to stagger.
- Animate only `transform`, `opacity`, `filter`, `clipPath`.
- `App.tsx` wraps the page in `<MotionConfig reducedMotion="user">`. For scroll-linked or looping animation, also check `useReducedMotion()` and show the final state.
- Scroll-linked animation: `useScroll({ target, offset })` + `useTransform`. Never call `setState` on each scroll or frame.
- R3F: read MotionValues with `.get()` inside `useFrame`, mutate refs. Lazy-load any `<Canvas>` with `React.lazy`.

## Content
- Shared facts are in `src/content.ts` (sensor list, alert example, reading interval, contact email, demo link). Import them. Do not copy them.
- Put section copy in constants at the top of the section file.
- Units: metric (ha, mm, °C, mg/L, NTU). Dates: dd/mm/yyyy. Currency: NZD.
- Missing team data: use a visible bracket placeholder, e.g. `[X] hours/week`, `$[price]/ha/month`, and add a `// TODO(data)` comment.
- Never invent testimonials, customer logos, customer counts or results.
- Copy style: short, plain sentences. No marketing words such as "revolutionary", "seamless", "powerful", "cutting-edge".

## Done means
1. `bun run build` passes.
2. `bun run lint` passes with no new warnings.
3. `bunx prettier --write` on the files you changed.
4. You checked the section in a browser at desktop and mobile width, and the console has no errors.
5. You committed on your branch with a clear message. Do not add attribution or co-author lines.
Commit after each working step, not only at the end. Do not push. Do not merge. The orchestrator merges and pushes.
