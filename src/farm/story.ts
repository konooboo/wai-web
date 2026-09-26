// Scroll progress windows (0..1 of the farm map section) for each story step.
export const STORY = {
  // Measured at 1280x800 with 150svh steps: the map panel pins at 0.024 and
  // each step's title reaches the middle of the screen at about 0.21 * step.
  // Each window starts when its text is on screen and runs while it is read.
  zoom: [0.03, 0.14],
  sensors: [0.14, 0.2],
  phone: [0.21, 0.27],
  scan: [0.23, 0.38],
  alert: [0.44, 0.54],
  alertCard: [0.47, 0.54],
  suggestion: [0.78, 0.85],
  paddock: [0.78, 0.85],
} as const

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export const stage = (p: number, [from, to]: readonly [number, number]) =>
  clamp01((p - from) / (to - from))
