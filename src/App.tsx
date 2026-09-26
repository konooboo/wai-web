import { MotionConfig } from 'motion/react'
import { About } from './sections/About'
import { Close } from './sections/Close'
import { Contact } from './sections/Contact'
import { Faq } from './sections/Faq'
import { FarmMap } from './sections/FarmMap'
import { Footer } from './sections/Footer'
import { Hardware } from './sections/Hardware'
import { Hero } from './sections/Hero'
import { HowItWorks } from './sections/HowItWorks'
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
        <HowItWorks />
        <Hardware />
        <Pricing />
        <About />
        <Faq />
        <Contact />
        <Close />
      </main>
      <Footer />
    </MotionConfig>
  )
}
