import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'

// Draft copy. TODO(data): confirm this reasoning with the team before launch.
const ABOUT_TEXT =
  'A soil or water problem is often invisible until it shows up in the paddock, and by then it costs more to fix. Manual checks with test kits and farm walks take hours, so most farms test only now and then. We built Wai to watch the paddock and the stream all the time, so a problem shows up in minutes, not weeks.'

// TODO(data): replace with real team names, roles and photos.
const TEAM = [
  { name: '[Name]', role: '[Role]' },
  { name: '[Name]', role: '[Role]' },
  { name: '[Name]', role: '[Role]' },
  { name: '[Name]', role: '[Role]' },
]

export function About() {
  return (
    <Section id="about" className="border-line border-b">
      <SectionHeading eyebrow="About" title="Why we build Wai">
        {ABOUT_TEXT}
      </SectionHeading>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        {TEAM.map((member, index) => (
          <Reveal key={member.name + index} delay={index * 0.05}>
            <div className="border-line rounded-2xl border bg-white p-6 text-center">
              <div className="bg-line text-muted mx-auto flex size-16 items-center justify-center rounded-full font-mono text-sm">
                ??
              </div>
              <p className="mt-4 font-medium">{member.name}</p>
              <p className="text-muted text-sm">{member.role}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="text-muted mt-8 font-mono text-xs tracking-wider uppercase">
        Team based in Christchurch, NZ
      </p>
    </Section>
  )
}
