'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { IdLink } from '@/app/prototype/perron/_shared/components/list-parts'

// Related records inside a drawer (e.g. a room's bookings), built on the DS Accordion.
// Collapsed row: ID (link to the record) · title · one meta line · chevron.
// Expanded: the remaining fields as label/value pairs, two columns.
// Replaces 6-column tables that scrolled sideways in a 560px drawer.
//
// The ID sits outside the trigger: a link cannot live inside the trigger <button>.

export interface RecordAccordionItem {
  id: string
  href: string
  title: string
  meta: ReactNode
  details: [label: string, value: ReactNode][]
}

export function RecordAccordion({ items }: { items: RecordAccordionItem[] }) {
  const router = useRouter()
  return (
    <Accordion type="multiple" className="rounded-[var(--radius-base)] border border-[var(--color-border-default)] px-[var(--spacing-component-md)]">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="last:border-b-0">
          <div className="flex items-center gap-[var(--spacing-component-md)]">
            <IdLink id={item.id} onOpen={() => router.push(item.href)} />
            <AccordionTrigger className="min-w-0 flex-1 py-[var(--spacing-component-md)]">
              <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
                <span className="truncate">{item.title}</span>
                <span className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-normal text-[var(--color-text-secondary)]">{item.meta}</span>
              </span>
            </AccordionTrigger>
          </div>
          <AccordionContent>
            <dl className="grid grid-cols-2 gap-x-[var(--spacing-component-lg)] gap-y-[var(--spacing-component-sm)]">
              {item.details.map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="text-xs text-[var(--color-text-secondary)]">{label}</dt>
                  <dd className="flex min-h-5 items-center text-sm text-[var(--color-surface-default-foreground)]">{value}</dd>
                </div>
              ))}
            </dl>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
