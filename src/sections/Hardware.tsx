import productPhoto from '../assets/product-photo.jpeg'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { READING_INTERVAL_MIN } from '../content'

const INTRO = `One low-power unit per site. It takes a reading every ${READING_INTERVAL_MIN} min and sends it to the app by LoRa radio.`

// Battery life is not measured yet.
const SPECS: { label: string; value: string; detail: string }[] = [
  {
    label: 'Water level',
    value: 'Level and % full',
    detail:
      'Ultrasonic distance, median of 5 pings per reading · % full from the tank depth',
  },
  {
    label: 'Soil moisture',
    value: 'Wet %',
    detail:
      'Calibrated from 0 % in air to 100 % in water · in a trough, it shows if the probe is in water',
  },
  {
    label: 'Location',
    value: 'GPS position',
    detail:
      'Latitude, longitude and altitude · UTC time on each reading · shows if a unit moves',
  },
  {
    label: 'Radio',
    value: 'LoRa',
    detail:
      'Long range, no cell coverage needed · signal strength (RSSI) and SNR on each packet',
  },
  {
    label: 'Unit health',
    value: 'Self-check',
    detail:
      'Uptime, chip temperature, free memory and firmware version on each reading',
  },
  {
    label: 'Battery',
    value: 'Up to [X] months',
    detail: 'Low-power ESP32 board · rechargeable battery',
  }, // TODO(data): measure battery life in the field
]

const ALERTS = [
  'Tank low',
  'Soil dry',
  'Trough empty',
  'Unit moved',
  'Unit offline',
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

        <div className="bg-paper/[0.03] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8">
          <div className={`${cell} col-span-2 sm:col-span-3`}>
            <p className="text-healthy font-mono text-xs tracking-wider uppercase">
              Alerts
            </p>
            <p className="text-paper/60 mt-2">The app tells you when:</p>
          </div>
          {ALERTS.map((alert) => (
            <div
              key={alert}
              className="border-paper/10 border-t border-l px-5 py-6"
            >
              {alert}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
