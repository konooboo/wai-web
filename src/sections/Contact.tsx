import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { CONTACT_EMAIL } from '../content'

export function Contact() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // No backend yet. We do not store or send this data anywhere.
    setSubmitted(true)
  }

  return (
    <Section id="contact" className="border-line border-b">
      <SectionHeading eyebrow="Contact" title="Book a demo">
        Tell us about your farm. We will get back to you to set up a demo.
      </SectionHeading>
      <div className="mt-10 grid gap-12 md:grid-cols-[1fr_16rem]">
        <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="border-line bg-mint rounded-2xl border p-6 text-lg"
            >
              Thanks, we&apos;ll be in touch.
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 sm:grid-cols-2"
            >
              <label className="grid gap-2">
                <span className="text-muted font-mono text-xs tracking-wider uppercase">
                  Name *
                </span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  className="border-line focus:border-ink rounded-xl border bg-white px-4 py-3 outline-none"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-muted font-mono text-xs tracking-wider uppercase">
                  Email *
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  className="border-line focus:border-ink rounded-xl border bg-white px-4 py-3 outline-none"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-muted font-mono text-xs tracking-wider uppercase">
                  Farm size (ha) *
                </span>
                <input
                  type="number"
                  name="farmSize"
                  min={0}
                  step="0.1"
                  required
                  className="border-line focus:border-ink rounded-xl border bg-white px-4 py-3 outline-none"
                />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-muted font-mono text-xs tracking-wider uppercase">
                  Message
                </span>
                <textarea
                  name="message"
                  rows={4}
                  className="border-line focus:border-ink rounded-xl border bg-white px-4 py-3 outline-none"
                />
              </label>
              <button
                type="submit"
                className="bg-ink text-paper hover:bg-ink/85 rounded-full px-6 py-3 sm:col-span-2 sm:w-fit"
              >
                Book a demo
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        <div className="border-line border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
          <p className="text-muted font-mono text-xs tracking-wider uppercase">
            Or email us
          </p>
          <p className="mt-2 text-lg">{CONTACT_EMAIL}</p>
        </div>
      </div>
    </Section>
  )
}
