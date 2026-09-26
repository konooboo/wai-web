import { useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { BOOK_DEMO_HREF } from '../content'

// TODO(data): confirm bands, rates and minimum. Draft values from docs/pricing-research.md.
// Each rate applies only to the hectares inside its band. NZD per ha per month.
// The slider moves in fixed monthly price steps. Each step shows the hectares that price covers.
const BANDS = [
  { upToHa: 150, ratePerHa: 3 },
  { upToHa: 400, ratePerHa: 2 },
  { upToHa: 1000, ratePerHa: 1 },
]
const MIN_PER_MONTH = 150
const PRICE_STEP = 120
const HA_TO_AC = 2.471

const MAX_HA = BANDS[BANDS.length - 1].upToHa
const DEFAULT_STEP = 3

const INCLUDED = [
  'Water and soil sensors',
  'Installation on your farm',
  'Mobile app for every user',
  'AI alerts and suggestions',
  'Compliance reports',
  'Support',
]

const currency = new Intl.NumberFormat('en-NZ', {
  style: 'currency',
  currency: 'NZD',
  maximumFractionDigits: 0,
})

const rate = new Intl.NumberFormat('en-NZ', {
  style: 'currency',
  currency: 'NZD',
  minimumFractionDigits: 2,
})

function hectaresCovered(price: number) {
  let prev = 0
  let left = price
  for (const { upToHa, ratePerHa } of BANDS) {
    const bandCost = (upToHa - prev) * ratePerHa
    if (left <= bandCost) return Math.floor(prev + left / ratePerHa)
    left -= bandCost
    prev = upToHa
  }
  return MAX_HA
}

const STEPS: { price: number; ha: number }[] = []
for (let price = MIN_PER_MONTH; ; price += PRICE_STEP) {
  const ha = hectaresCovered(price)
  STEPS.push({ price, ha })
  if (ha >= MAX_HA) break
}

function TotalPerMonth({ value }: { value: number }) {
  const prefersReducedMotion = useReducedMotion()
  const spring = useSpring(value, {
    stiffness: 120,
    damping: 20,
    ...(prefersReducedMotion ? { duration: 0 } : {}),
  })
  const display = useTransform(spring, (v) => currency.format(v))
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useEffect(() => {
    ref.current!.textContent = display.get()
    return display.on('change', (v) => {
      if (ref.current) ref.current.textContent = v
    })
  }, [display])

  return <span ref={ref} />
}

export function Pricing() {
  const [step, setStep] = useState(DEFAULT_STEP)
  const { price: monthly, ha: hectares } = STEPS[step]
  const acres = Math.round(hectares * HA_TO_AC)

  return (
    <Section id="pricing" className="border-line border-b">
      <SectionHeading eyebrow="Pricing" title="One plan, priced per hectare">
        Hardware is included. No separate install fee, no per-sensor cost.
      </SectionHeading>
      <Reveal className="mt-12">
        <div className="border-line grid gap-10 rounded-2xl border bg-white p-6 md:grid-cols-2 md:p-10">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="farm-size" className="text-sm">
                Farm size
              </label>
              <span className="font-mono text-sm">
                Up to {hectares} ha{' '}
                <span className="text-muted">· {acres} ac</span>
              </span>
            </div>
            <input
              id="farm-size"
              type="range"
              min={0}
              max={STEPS.length - 1}
              step={1}
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              aria-valuetext={`${currency.format(monthly)} per month, up to ${hectares} hectares`}
              className="bg-line accent-ink [&::-moz-range-thumb]:bg-ink [&::-webkit-slider-thumb]:bg-ink mt-4 h-1 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
            />
            <div className="text-muted mt-2 flex justify-between font-mono text-xs">
              <span>{STEPS[0].ha} ha</span>
              <span>{MAX_HA.toLocaleString('en-NZ')} ha</span>
            </div>

            <div className="border-line mt-8 border-t pt-8">
              <p className="text-muted font-mono text-xs tracking-wider uppercase">
                Total per month
              </p>
              <p className="mt-2 text-4xl font-medium tracking-tight tabular-nums">
                <TotalPerMonth value={monthly} />
              </p>
              <p className="text-muted mt-2 font-mono text-sm">
                {rate.format(monthly / hectares)}/ha/month average · excl. GST
              </p>
              <p className="text-muted mt-1 font-mono text-sm">
                Larger farms pay less per hectare. Over{' '}
                {MAX_HA.toLocaleString('en-NZ')} ha? We quote.
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-medium">Included</p>
            <ul className="mt-4 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="text-muted flex gap-3 text-sm">
                  <span className="bg-healthy mt-2 size-1.5 shrink-0 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={BOOK_DEMO_HREF}
              className="bg-ink text-paper hover:bg-ink/85 mt-8 inline-block self-start rounded-full px-6 py-3"
            >
              Book a demo
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
