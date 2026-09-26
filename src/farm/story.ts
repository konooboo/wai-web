// Scroll progress windows (0..1 of the farm map section) for each story step.
export const STORY = {
  // Camera zooms from the whole country to the farm (see FarmScene SHOTS).
  // Starts once the map panel has pinned and ends before the first step
  // text scrolls out of view.
  zoom: [0.04, 0.09],
  sensors: [0.18, 0.26],
  scan: [0.2, 0.38],
  alert: [0.42, 0.55],
  phone: [0.39, 0.47],
  alertCard: [0.66, 0.74],
  suggestion: [0.8, 0.88],
  paddock: [0.82, 0.9],
} as const

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export const stage = (p: number, [from, to]: readonly [number, number]) =>
  clamp01((p - from) / (to - from))
