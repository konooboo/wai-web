import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'

const FAQS = [
  {
    question: 'How are sensors installed?',
    // TODO(data): confirm install process and time.
    answer:
      'A Wai technician installs one unit at each site. Installation takes about [X] hours per site.',
  },
  {
    question: 'How is each unit powered?',
    answer: 'Each unit runs on solar power.',
  },
  {
    question: 'What coverage or connectivity do I need?',
    answer:
      'Each unit sends readings over LoRa radio. LoRa reaches across several hectares with no cell coverage.',
  },
  {
    question: 'Who owns my data?',
    // TODO(data): confirm data ownership, retention and export terms.
    answer:
      'You own the data your sensors collect. We use it to run alerts and improve the app. TODO(data): confirm retention period and export options.',
  },
  {
    question: 'Can Wai help with council compliance reporting?',
    // TODO(data): confirm which council schemes are supported.
    answer:
      'Yes. Wai can export sensor readings as a report for council compliance checks. TODO(data): confirm which regional council schemes this covers.',
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
