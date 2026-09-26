import { MotionConfig } from 'motion/react'
import { Close } from './sections/Close'
import { Faq } from './sections/Faq'
import { FarmMap } from './sections/FarmMap'
import { Footer } from './sections/Footer'
import { Hardware } from './sections/Hardware'
import { Hero } from './sections/Hero'
import { Nav } from './sections/Nav'
import { Pricing } from './sections/Pricing'
import { Problem } from './sections/Problem'
import { SensorBridge } from './sections/SensorBridge'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <FarmMap />
        <SensorBridge />
        <Hardware />
        <Pricing />
        <Faq />
        <Close />
      </main>
      <Footer />
    </MotionConfig>
  )
}
