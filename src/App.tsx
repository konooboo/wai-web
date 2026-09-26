import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Nav } from './sections/Nav'

// Placeholder sections, in page order. Replace each with a real component.
const sections = [
  { id: 'proof', title: 'Proof strip' },
  { id: 'problem', title: 'Problem' },
  { id: 'farm-map', title: 'Farm map (hillshade + point cloud + sensors)' },
  { id: 'how-it-works', title: 'How it works' },
  { id: 'hardware', title: 'Hardware + spec table' },
  { id: 'pricing', title: 'Pricing' },
  { id: 'about', title: 'About' },
  { id: 'faq', title: 'FAQ' },
  { id: 'contact', title: 'Contact' },
  { id: 'close', title: 'Close + QR code' },
]

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="border-line text-muted mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center border-b px-6 font-mono text-sm"
          >
            {section.title}
          </section>
        ))}
      </main>
      <Footer />
    </>
  )
}
