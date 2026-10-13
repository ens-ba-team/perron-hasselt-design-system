'use client'

import type { ReactNode } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { IdLink } from '@/app/prototype/perron/_shared/components/list-parts'

// Related records inside a drawer (e.g. a room's bookings), built on the DS Accordion.
// Collapsed summary: ID · title · chevron on the first row, then status and
// the record's primary date on the second row.
// Expanded: the remaining fields as label/value pairs, two columns.
// Replaces 6-column tables that scrolled sideways in a 560px drawer.
//
// The ID sits outside the trigger: a link cannot live inside the trigger <button>.

export interface RecordAccordionItem {
  id: string
  /** Keep the current module/page mounted when opening a child record from a drawer. */
  onOpen: () => void
  title: string
  status: ReactNode
  secondary: ReactNode
  details: [label: string, value: ReactNode][]
}

export function RecordAccordion({ items }: { items: RecordAccordionItem[] }) {
  return (
    <Accordion type="multiple" className="rounded-[var(--radius-base)] border border-[var(--color-border-default)] px-[var(--spacing-component-md)]">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="last:border-b-0">
          <div className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-[var(--spacing-component-2xl)] gap-y-1 py-[var(--spacing-component-md)]">
            <div className="row-start-1 flex min-h-5 items-center">
              <IdLink id={item.id} onOpen={item.onOpen} />
            </div>
            <div className="col-start-2 row-start-1 min-w-0">
              <AccordionTrigger className="w-full min-w-0 py-0">
                <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
              </AccordionTrigger>
            </div>
            <div className="col-start-1 row-start-2 flex min-h-5 items-center text-xs font-normal text-[var(--color-text-secondary)]">
              {item.status}
            </div>
            <div className="col-start-2 row-start-2 flex min-h-5 min-w-0 items-center text-xs font-normal text-[var(--color-text-secondary)]">
              {item.secondary}
            </div>
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
