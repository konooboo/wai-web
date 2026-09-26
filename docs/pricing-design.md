# Pricing section design spec

Source: design agent, based on `docs/pricing-research.md`. Orchestrator changes are marked **[orchestrator]**.

## Layout

Mobile 375 px, one column: heading → one white card (farm type pills, effective hectares number input + range slider with ha · ac readout, 5 ha / 3,000 ha end labels) → divider → result (Total per month, price line, annual line, Book a demo, next-step note) → divider → rate card table (active row marked) → Included list → terms line. Then the FAQ items stacked.

Desktop 1280 px: card `md:grid-cols-2 md:p-10`. Left column: farm type, hectares, slider, divider, total, price line, annual, CTA + note. Right column: rate card table, Included list, terms line. FAQ below in `md:grid-cols-2` (4 items).

## Copy (constants at top of Pricing.tsx)

- Eyebrow "Pricing". Title "One plan, priced per hectare".
- Intro: "Sensors and installation are included. You pay a monthly rate for your effective hectares."
- Farm type legend "Farm type"; options "Dairy, cropping or orchard" / "Sheep, beef or deer".
- Hectares label "Effective hectares"; readout `{ha} ha · {ac} ac`.
- Result: "Total per month"; "`$[rate]`/ha/month average · sensors included · excl. GST"; "Annual prepay: `$[annual]`/year (save `[15]` %)"; "Minimum `$[150]`/month applies" (only when it applies).
- Quote state: "More than {max} ha? We quote larger farms." + CTA.
- Rate card heading "Rate card"; columns "Hectares", "$/ha/month", "$/ac/month"; last row "More than {max} ha" / "Quote". Note: "Each rate applies only to the hectares inside its band."
- Included **[orchestrator: only items already on the current page, plus the sensor allowance placeholder; no new product promises]**:
  - "`[N]` water and `[N]` soil sensors per `[X]` ha"
  - "Installation on your farm"
  - "Mobile app for every user"
  - "AI alerts and suggestions"
  - "Compliance reports"
  - "Support"
- Terms line (mono): "`[24]`-month term · `[90]`-day on-farm trial".
- CTA "Book a demo" → `BOOK_DEMO_HREF`. Note under it: "We reply within `[X]` working days to set a time to visit your farm."
- Every bracket gets a `// TODO(data)` comment.

## Data constants

```ts
type FarmType = 'intensive' | 'extensive'
type Band = { upToHa: number; ratePerHa: number | null }
// TODO(data) confirm band edges and rates. Research suggestions:
// intensive 3.00 / 2.00 / 1.00, extensive 0.80 / 0.40 / 0.15
const RATE_CARDS = {
  intensive: [{ upToHa: 150, ratePerHa: null }, { upToHa: 400, ratePerHa: null }, { upToHa: 1000, ratePerHa: null }],
  extensive: [{ upToHa: 300, ratePerHa: null }, { upToHa: 1000, ratePerHa: null }, { upToHa: 3000, ratePerHa: null }],
} satisfies Record<FarmType, Band[]>
const MIN_PER_MONTH: number | null = null // TODO(data) suggested 150
const ANNUAL_DISCOUNT: number | null = null // TODO(data) suggested 0.15
const HA_TO_AC = 2.471
```

Suggested rates live only in comments, never in values.

## Calculator logic (pure function `quote(ha, bands)`)

1. `ha > last.upToHa` → `{ kind: 'quote' }`.
2. Graduated split: `prev = 0`; per band `haIn = max(0, min(ha, upToHa) - prev)`; `prev = upToHa`.
3. Any band with `haIn > 0` and `ratePerHa === null`, or `MIN_PER_MONTH === null` → `{ kind: 'placeholder' }`. UI shows `$[price]`, `$[rate]`, `$[annual]` as literal text. No fake totals, no counter animation.
4. Confirmed: `sub = Σ haIn × rate`; `monthly = max(sub, MIN)`; `minApplied = sub < MIN`; `avgRate = monthly / ha`; `annual = monthly × 12 × (1 − discount)` (discount null → `$[annual]`, `[15] %`).
5. Format: totals en-NZ NZD 0 dp, rates 2 dp. Acres `round(ha × 2.471)`; per-acre rate `rate / 2.471`. Null rate cell → `$[rate]`.

Hectares, acres, the active band and the quote state work today.

## Interaction and accessibility

- Farm type: `<fieldset><legend>` with two native radios styled as pills (`rounded-full border border-line`), selected `bg-ink text-paper`. Default intensive.
- Slider: native range, 5–3,000, step 5, default 165. `aria-valuetext="165 hectares, 407 acres"`. Keep current thumb styles.
- Number input: `type=number inputMode=numeric`, synced to slider, clamps on blur (needed for small orchards).
- Totals in `aria-live="polite"`.
- Rate card is a real `<table>`; on mobile the acre value sits under the ha value so there is no horizontal scroll.

## Motion

- `<Reveal>` heading, card (delay 0.1), FAQ (0.2).
- Active rate row: 2 px `bg-healthy` left bar, opacity transition.
- Selected farm-type pill slides with `layoutId` (transform only).
- Existing spring counter only when prices are confirmed. Reduced motion via `MotionConfig` + existing `useReducedMotion`.

## FAQ near the price (static `<dl>`, not an accordion; do not repeat Faq.tsx topics)

1. What are effective hectares? "The area you graze or crop. It is the figure in your DairyNZ or B+LNZ reports. Do not count bush, tracks or buildings."
2. How many sensors do I get? "`[N]` water and `[N]` soil sensors per `[X]` ha. Extra sensors cost `$[X]`/sensor/month."
3. What if I stop? **[orchestrator: no refund/removal promise until founders confirm]** "You can try Wai on your farm for `[90]` days. After that the term is `[24]` months."
4. Is GST included? "No. All prices exclude GST. You can pay monthly, or pay yearly and save `[15]` %."

## Skipped

Per-cow translation (needs assumed stocking rate), profit-share and cost-of-problem anchors, competitor prices on the page, single card with cap, lease/finance wording.
