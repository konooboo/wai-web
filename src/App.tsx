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
import { ProofStrip } from './sections/ProofStrip'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Hero />
        <ProofStrip />
        <Problem />
        <FarmMap />
        <Hardware />
        <Pricing />
        <Faq />
        <Close />
      </main>
      <Footer />
    </MotionConfig>
  )
}
