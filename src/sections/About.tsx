import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'

// Draft copy. TODO(data): confirm this reasoning with the team before launch.
const ABOUT_TEXT =
  'A soil or water problem is often invisible until it shows up in the paddock, and by then it costs more to fix. Manual checks with test kits and farm walks take hours, so most farms test only now and then. We built Wai to watch the paddock and the stream all the time, so a problem shows up in minutes, not weeks.'

export function About() {
  return (
    <Section id="about" className="border-line border-b">
      <SectionHeading eyebrow="About" title="Why we build Wai">
        {ABOUT_TEXT}
      </SectionHeading>
      <p className="text-muted mt-8 font-mono text-xs tracking-wider uppercase">
        Team based in Christchurch, NZ
      </p>
    </Section>
  )
}
