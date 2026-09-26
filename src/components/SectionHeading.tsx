import type { ReactNode } from 'react'

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-muted font-mono text-xs tracking-wider uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-4xl leading-tight font-medium tracking-tight md:text-5xl">
        {title}
      </h2>
      {children && <p className="text-muted mt-5 text-lg">{children}</p>}
    </div>
  )
}
