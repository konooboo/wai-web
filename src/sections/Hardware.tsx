import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { READING_INTERVAL_MIN, SENSORS } from '../content'
import product640Avif from '../assets/product-640.avif'
import product640Webp from '../assets/product-640.webp'
import product1280Avif from '../assets/product-1280.avif'
import product1280Webp from '../assets/product-1280.webp'

const MEASURES = SENSORS.map((s) =>
  s.unit ? `${s.label} (${s.unit})` : s.label,
).join(' · ')

// Draft spec values. Every value here needs the hardware team to confirm it.
const SPECS: { label: string; value: string }[] = [
  { label: 'Measures', value: MEASURES },
  { label: 'Water unit', value: 'Floating buoy, anchored in the waterway' }, // TODO(data): confirm form factor
  { label: 'Soil unit', value: 'Buried probe, 15 cm depth' }, // TODO(data): confirm depth
  { label: 'Reading interval', value: `Every ${READING_INTERVAL_MIN} min` },
  { label: 'Connectivity', value: 'LoRaWAN, cellular fallback' }, // TODO(data): confirm radios
  { label: 'Battery', value: 'Up to [X] years' }, // TODO(data): confirm battery life
  { label: 'Power', value: 'Solar-assisted battery' }, // TODO(data): confirm power source
  { label: 'Enclosure rating', value: 'IP68' }, // TODO(data): confirm rating after certification
  { label: 'Install time', value: 'Under 30 min per unit' }, // TODO(data): confirm install time
  { label: 'Operating temperature', value: '−10 to 50 °C' }, // TODO(data): confirm range
  {
    label: 'Data',
    value: 'Uploaded each reading interval, stored for [X] years',
  }, // TODO(data): confirm retention
]

export function Hardware() {
  return (
    <Section id="hardware" className="border-line border-b">
      <div className="grid gap-12 md:grid-cols-2 md:items-start">
        <div>
          <SectionHeading eyebrow="Hardware" title="The hardware">
            One unit for water, one for soil. Both report to the same app.
          </SectionHeading>
          <Reveal className="mt-10">
            {/* TODO(data): replace the 3D render with a real product photo. */}
            <picture>
              <source
                type="image/avif"
                srcSet={`${product640Avif} 640w, ${product1280Avif} 1280w`}
                sizes="(min-width: 768px) 560px, 100vw"
              />
              <img
                src={product1280Webp}
                srcSet={`${product640Webp} 640w, ${product1280Webp} 1280w`}
                sizes="(min-width: 768px) 560px, 100vw"
                width={1467}
                height={1100}
                loading="lazy"
                decoding="async"
                alt="Wai sensor unit with an antenna and a soil probe"
                className="border-line aspect-[4/3] w-full rounded-3xl border object-cover"
              />
            </picture>
          </Reveal>
        </div>
        <div className="divide-line border-line divide-y border-t">
          {SPECS.map((spec, i) => (
            <Reveal key={spec.label} delay={i * 0.05}>
              <div className="flex items-baseline justify-between gap-6 py-3">
                <span className="text-sm">{spec.label}</span>
                <span className="text-right font-mono text-sm">
                  {spec.value}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
