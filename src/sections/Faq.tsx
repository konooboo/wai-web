import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'

const FAQS = [
  {
    question: 'How are sensors installed?',
    answer:
      'A Wai technician places sensors in the paddock soil and mounts a unit at the water point. Installation takes about 5 minutes per site.',
  },
  {
    question: 'How are the sensors powered?',
    answer: 'Each sensor is solar powered.',
  },
  {
    question: 'What coverage or connectivity do I need?',
    answer:
      'Sensors send readings over LoRaWAN. Most farms in range of the nearest gateway do not need extra equipment.',
  },
  {
    question: 'Who owns my data?',
    // TODO(data): confirm data ownership, retention and export terms.
    answer:
      'You own the data your sensors collect. We use it to run alerts and improve the app.',
  },
  {
    question: 'Can Wai help with council compliance reporting?',
    // TODO(data): confirm which council schemes are supported.
    answer:
      'Yes. Wai can export sensor readings as a report for council compliance checks.',
  },
]

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <Section id="faq" className="border-line border-b">
      <SectionHeading eyebrow="FAQ" title="Common questions">
        Short answers. Ask us if you need more detail.
      </SectionHeading>
      <div className="border-line divide-line mt-10 max-w-3xl divide-y border-t border-b">
        {FAQS.map((item, index) => {
          const isOpen = openIndex === index
          const buttonId = `faq-button-${index}`
          const panelId = `faq-panel-${index}`
          return (
            <div key={item.question}>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-medium"
              >
                <span>{item.question}</span>
                <span className="text-muted shrink-0 font-mono text-base">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="text-muted max-w-2xl pb-5">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
