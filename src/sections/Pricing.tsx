import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { BOOK_DEMO_HREF } from '../content'

type FarmType = 'intensive' | 'extensive'
type Band = { upToHa: number; ratePerHa: number | null }

// TODO(data) confirm band edges and rates. Research suggestions:
// intensive 3.00 / 2.00 / 1.00, extensive 0.80 / 0.40 / 0.15
const RATE_CARDS = {
  intensive: [
    { upToHa: 150, ratePerHa: null },
    { upToHa: 400, ratePerHa: null },
    { upToHa: 1000, ratePerHa: null },
  ],
  extensive: [
    { upToHa: 300, ratePerHa: null },
    { upToHa: 1000, ratePerHa: null },
    { upToHa: 3000, ratePerHa: null },
  ],
} satisfies Record<FarmType, Band[]>
const MIN_PER_MONTH: number | null = null // TODO(data) suggested 150
const ANNUAL_DISCOUNT: number | null = null // TODO(data) suggested 0.15
const HA_TO_AC = 2.471

const MIN_HA = 5
const MAX_HA = 3000
const DEFAULT_HA = 165

const INTRO =
  'Sensors and installation are included. You pay a monthly rate for your effective hectares.'

const FARM_TYPES: { id: FarmType; label: string }[] = [
  { id: 'intensive', label: 'Dairy, cropping or orchard' },
  { id: 'extensive', label: 'Sheep, beef or deer' },
]

// TODO(data) confirm sensor allowance per hectare.
const SENSOR_ALLOWANCE = '[N] water and [N] soil sensors per [X] ha'

const INCLUDED = [
  SENSOR_ALLOWANCE,
  'Installation on your farm',
  'Mobile app for every user',
  'AI alerts and suggestions',
  'Compliance reports',
  'Support',
]

// TODO(data) confirm contract term and trial length.
const TERMS = '[24]-month term · [90]-day on-farm trial'

// TODO(data) confirm reply time.
const CTA_NOTE =
  'We reply within [X] working days to set a time to visit your farm.'

const FAQS = [
  {
    question: 'What are effective hectares?',
    answer:
      'The area you graze or crop. It is the figure in your DairyNZ or B+LNZ reports. Do not count bush, tracks or buildings.',
  },
  {
    question: 'How many sensors do I get?',
    // TODO(data) confirm sensor allowance and extra sensor price.
    answer: `${SENSOR_ALLOWANCE}. Extra sensors cost $[X]/sensor/month.`,
  },
  {
    question: 'What if I stop?',
    // TODO(data) confirm trial length and term. No refund or removal promise until founders confirm.
    answer:
      'You can try Wai on your farm for [90] days. After that the term is [24] months.',
  },
  {
    question: 'Is GST included?',
    // TODO(data) confirm annual discount.
    answer:
      'No. All prices exclude GST. You can pay monthly, or pay yearly and save [15] %.',
  },
]

type Quote =
  | { kind: 'quote' }
  | { kind: 'placeholder' }
  | { kind: 'price'; monthly: number; avgRate: number; minApplied: boolean }

function quote(ha: number, bands: Band[]): Quote {
  if (ha > bands[bands.length - 1].upToHa) return { kind: 'quote' }

  let prev = 0
  let sub = 0
  for (const { upToHa, ratePerHa } of bands) {
    const haIn = Math.max(0, Math.min(ha, upToHa) - prev)
    prev = upToHa
    if (haIn === 0) continue
    if (ratePerHa === null) return { kind: 'placeholder' }
    sub += haIn * ratePerHa
  }
  if (MIN_PER_MONTH === null) return { kind: 'placeholder' }

  const monthly = Math.max(sub, MIN_PER_MONTH)
  return {
    kind: 'price',
    monthly,
    avgRate: monthly / ha,
    minApplied: sub < MIN_PER_MONTH,
  }
}

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

const number = new Intl.NumberFormat('en-NZ')

const toAcres = (ha: number) => Math.round(ha * HA_TO_AC)
const clampHa = (ha: number) => Math.min(MAX_HA, Math.max(MIN_HA, ha))

const formatRate = (value: number | null, perAcre = false) =>
  value === null ? '$[rate]' : rate.format(perAcre ? value / HA_TO_AC : value)

const labelClass = 'text-muted font-mono text-xs tracking-wider uppercase'

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
  const [farmType, setFarmType] = useState<FarmType>('intensive')
  const [hectares, setHectares] = useState(DEFAULT_HA)
  const [draft, setDraft] = useState<string | null>(null)

  const bands = RATE_CARDS[farmType]
  const maxBandHa = bands[bands.length - 1].upToHa
  const result = quote(hectares, bands)
  const activeBand = bands.findIndex((band) => hectares <= band.upToHa)

  const annual =
    result.kind === 'price' && ANNUAL_DISCOUNT !== null
      ? currency.format(result.monthly * 12 * (1 - ANNUAL_DISCOUNT))
      : '$[annual]'
  // TODO(data) confirm annual discount.
  const saving =
    ANNUAL_DISCOUNT === null ? '[15]' : Math.round(ANNUAL_DISCOUNT * 100)

  return (
    <Section id="pricing" className="border-line border-b">
      <Reveal>
        <SectionHeading eyebrow="Pricing" title="One plan, priced per hectare">
          {INTRO}
        </SectionHeading>
      </Reveal>

      <Reveal delay={0.1} className="mt-12">
        <div className="border-line grid gap-10 rounded-2xl border bg-white p-6 md:grid-cols-2 md:p-10">
          <div>
            <fieldset>
              <legend className={labelClass}>Farm type</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {FARM_TYPES.map(({ id, label }) => {
                  const selected = farmType === id
                  return (
                    <label
                      key={id}
                      className="border-line has-focus-visible:outline-ink relative cursor-pointer rounded-full border px-4 py-2 text-sm outline-offset-2 has-focus-visible:outline-2"
                    >
                      <input
                        type="radio"
                        name="farm-type"
                        value={id}
                        checked={selected}
                        onChange={() => setFarmType(id)}
                        className="sr-only"
                      />
                      {selected && (
                        <motion.span
                          layoutId="farm-type-pill"
                          className="bg-ink absolute -inset-px"
                          style={{ borderRadius: 9999 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 35,
                          }}
                        />
                      )}
                      <span
                        className={`relative ${selected ? 'text-paper' : ''}`}
                      >
                        {label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="farm-hectares" className="text-sm">
                Effective hectares
              </label>
              <div className="flex items-center gap-2 font-mono text-sm">
                <input
                  id="farm-hectares"
                  type="number"
                  inputMode="numeric"
                  min={MIN_HA}
                  max={MAX_HA}
                  value={draft ?? hectares}
                  onChange={(e) => {
                    setDraft(e.target.value)
                    const ha = Math.round(Number(e.target.value))
                    if (ha >= MIN_HA && ha <= MAX_HA) setHectares(ha)
                  }}
                  onBlur={() => {
                    if (draft) setHectares(clampHa(Math.round(Number(draft))))
                    setDraft(null)
                  }}
                  className="border-line focus:border-ink w-20 rounded-lg border px-2 py-1 text-right tabular-nums outline-none"
                />
                <span className="text-muted">
                  ha · {number.format(toAcres(hectares))} ac
                </span>
              </div>
            </div>
            <input
              type="range"
              aria-label="Effective hectares"
              min={MIN_HA}
              max={MAX_HA}
              step={5}
              value={hectares}
              onChange={(e) => {
                setHectares(Number(e.target.value))
                setDraft(null)
              }}
              aria-valuetext={`${hectares} hectares, ${toAcres(hectares)} acres`}
              className="bg-line accent-ink [&::-moz-range-thumb]:bg-ink [&::-webkit-slider-thumb]:bg-ink mt-5 h-1 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
            />
            <div className="text-muted mt-2 flex justify-between font-mono text-xs">
              <span>{MIN_HA} ha</span>
              <span>{number.format(MAX_HA)} ha</span>
            </div>

            <div className="border-line mt-8 border-t pt-8">
              <div aria-live="polite">
                {result.kind === 'quote' ? (
                  <p className="text-2xl font-medium tracking-tight">
                    More than {number.format(maxBandHa)} ha? We quote larger
                    farms.
                  </p>
                ) : (
                  <>
                    <p className={labelClass}>Total per month</p>
                    <p className="mt-2 text-4xl font-medium tracking-tight tabular-nums">
                      {result.kind === 'price' ? (
                        <TotalPerMonth value={result.monthly} />
                      ) : (
                        // TODO(data) shows the total when rates are confirmed.
                        '$[price]'
                      )}
                    </p>
                    <p className="text-muted mt-3 font-mono text-sm">
                      {result.kind === 'price'
                        ? rate.format(result.avgRate)
                        : '$[rate]'}
                      /ha/month average · sensors included · excl. GST
                    </p>
                    <p className="text-muted mt-1 font-mono text-sm">
                      Annual prepay: {annual}/year (save {saving}&nbsp;%)
                    </p>
                    {result.kind === 'price' && result.minApplied && (
                      <p className="text-muted mt-1 font-mono text-sm">
                        Minimum {currency.format(MIN_PER_MONTH!)}/month applies
                      </p>
                    )}
                  </>
                )}
              </div>
              <a
                href={BOOK_DEMO_HREF}
                className="bg-ink text-paper hover:bg-ink/85 mt-8 inline-block rounded-full px-6 py-3"
              >
                Book a demo
              </a>
              <p className="text-muted mt-3 text-sm">{CTA_NOTE}</p>
            </div>
          </div>

          <div className="border-line border-t pt-10 md:border-t-0 md:pt-0">
            <p className="text-sm font-medium">Rate card</p>
            <table className="mt-4 w-full text-left text-sm">
              <thead className={labelClass}>
                <tr className="border-line border-b">
                  <th scope="col" className="py-2 pl-3 font-normal">
                    Hectares
                  </th>
                  <th scope="col" className="py-2 text-right font-normal">
                    $/ha/month
                  </th>
                  <th
                    scope="col"
                    className="hidden py-2 text-right font-normal md:table-cell"
                  >
                    $/ac/month
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {[...bands, null].map((band, i) => {
                  const prevHa = i === 0 ? 0 : bands[i - 1].upToHa
                  const active =
                    i === activeBand || (band === null && activeBand === -1)
                  return (
                    <tr
                      key={band?.upToHa ?? 'quote'}
                      aria-current={active || undefined}
                      className="border-line border-b"
                    >
                      <td className="relative py-3 pl-3">
                        <span
                          className={`bg-healthy absolute inset-y-2 left-0 w-0.5 transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {band === null
                          ? `More than ${number.format(prevHa)} ha`
                          : i === 0
                            ? `Up to ${number.format(band.upToHa)}`
                            : `${number.format(prevHa + 1)}–${number.format(band.upToHa)}`}
                      </td>
                      <td className="py-3 text-right">
                        {band === null ? 'Quote' : formatRate(band.ratePerHa)}
                        {band && (
                          <span className="text-muted block text-xs md:hidden">
                            {formatRate(band.ratePerHa, true)}/ac
                          </span>
                        )}
                      </td>
                      <td className="text-muted hidden py-3 text-right md:table-cell">
                        {band === null
                          ? 'Quote'
                          : formatRate(band.ratePerHa, true)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="text-muted mt-3 text-sm">
              Each rate applies only to the hectares inside its band.
            </p>

            <p className="mt-10 text-sm font-medium">Included</p>
            <ul className="mt-4 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="text-muted flex gap-3 text-sm">
                  <span className="bg-healthy mt-2 size-1.5 shrink-0 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-muted mt-8 font-mono text-xs">{TERMS}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2} className="mt-16">
        <dl className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          {FAQS.map((item) => (
            <div key={item.question} className="border-line border-t pt-6">
              <dt className="font-medium">{item.question}</dt>
              <dd className="text-muted mt-2 text-sm">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  )
}
