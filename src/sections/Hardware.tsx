import productPhoto from '../assets/product-photo.jpeg'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { READING_INTERVAL_MIN, SENSORS } from '../content'

const INTRO = 'One unit for water, one for soil. Both report to the same app.'

// Draft spec values. Every value here needs the hardware team to confirm it.
const SPECS: { label: string; value: string; detail: string }[] = [
  {
    label: 'Water unit',
    value: 'Floating buoy',
    detail: 'Anchored in the waterway',
  }, // TODO(data): confirm form factor
  {
    label: 'Soil unit',
    value: 'Buried probe',
    detail: '15 cm depth',
  }, // TODO(data): confirm depth
  {
    label: 'Reading interval',
    value: `Every ${READING_INTERVAL_MIN} min`,
    detail: 'Uploaded each reading interval · stored for [X] years',
  }, // TODO(data): confirm retention
  {
    label: 'Connectivity',
    value: 'LoRaWAN',
    detail: 'Cellular fallback',
  }, // TODO(data): confirm radios
  {
    label: 'Battery',
    value: 'Up to [X] years',
    detail: 'Solar-assisted battery',
  }, // TODO(data): confirm battery life and power source
  {
    label: 'Enclosure',
    value: 'IP68',
    detail: 'Operates from −10 to 50 °C · under 30 min to install per unit',
  }, // TODO(data): confirm rating after certification, range and install time
]

const cell = 'border-paper/10 relative border-t border-l p-6 md:p-8'

export function Hardware() {
  return (
    <Section
      id="hardware"
      className="bg-ink text-paper relative overflow-hidden"
    >
      <img
        src={productPhoto}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-15 blur-2xl"
      />
      <div className="border-paper/10 relative border-r border-b">
        <div className="grid md:grid-cols-12">
          <div className={`${cell} md:col-span-7`}>
            <p className="text-paper/60 flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
              <span className="bg-healthy size-1.5 rounded-full" />
              Hardware
            </p>
            <h2 className="mt-4 text-4xl leading-tight font-medium tracking-tight md:text-5xl">
              The hardware.
            </h2>
          </div>
          <div className={`${cell} flex items-center md:col-span-5`}>
            <p className="text-paper/70 text-lg">{INTRO}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {SPECS.map((spec, i) => (
            <Reveal key={spec.label} delay={(i % 3) * 0.05} className={cell}>
              <span className="bg-healthy absolute -top-px left-6 h-0.5 w-6 md:left-8" />
              <p className="text-paper/60 font-mono text-xs tracking-wider uppercase">
                {spec.label}
              </p>
              <p className="mt-6 text-3xl font-medium tracking-tight">
                {spec.value}
              </p>
              <p className="text-paper/60 mt-4">{spec.detail}</p>
            </Reveal>
          ))}
        </div>

        <div className="bg-paper/[0.03] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9">
          <div className={`${cell} col-span-2 sm:col-span-3`}>
            <p className="text-healthy font-mono text-xs tracking-wider uppercase">
              Measures
            </p>
            <p className="text-paper/60 mt-2">
              Every {READING_INTERVAL_MIN} min:
            </p>
          </div>
          {SENSORS.map((s) => (
            <div
              key={s.id}
              className="border-paper/10 border-t border-l px-5 py-6"
            >
              <p>{s.label}</p>
              <p className="text-paper/50 mt-1 font-mono text-xs">{s.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
