# Wai

Wai is a landing page for a farm sensor product. Sensors sit in paddocks and
waterways on NZ farms. They monitor water and soil. A mobile app uses AI to
tell the farmer when something changes, why, and what to do next.

## Run it

This project uses Bun. Do not use npm or yarn.

```sh
bun install
bun run dev
bun run build
```

`bun run dev` starts a local dev server. `bun run build` type-checks the
project and builds it for production.

## Stack

- Bun, Vite, TypeScript
- React 19.3, Tailwind v4
- Motion (`motion/react`) for animation
- React Three Fiber 9.8 + drei + three, for the 3D hardware model

React is pinned to `~19.3.0`. React Three Fiber 9.8.1 needs `react <19.4`, so
do not bump React past that until R3F supports it.

## Rules for agents

See `CLAUDE.md`. It sets the design tokens, layout rules, file ownership and
the definition of done for anyone (human or agent) working on this page.
