'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export type FormSectionRequirement = 'required-now' | 'required-later' | 'optional'

const REQUIREMENT_LABEL: Record<FormSectionRequirement, string> = {
  'required-now': 'Required now',
  'required-later': 'Required later',
  optional: 'Optional',
}

function RequirementLabel({ value }: { value: FormSectionRequirement }) {
  if (value === 'optional') {
    return <span className="font-normal text-[var(--color-text-secondary)]">({REQUIREMENT_LABEL[value]})</span>
  }

  return (
    <Badge variant="blue" shape="pill" size="sm">
      {REQUIREMENT_LABEL[value]}
    </Badge>
  )
}

function SectionHeading({
  icon,
  title,
  requirement,
  description,
}: {
  icon: React.ReactNode
  title: string
  requirement?: FormSectionRequirement
  description?: string
}) {
  return (
    <span className="flex min-w-0 flex-1 flex-col items-start gap-[var(--spacing-component-xs)] text-left">
      <span className="flex min-w-0 flex-wrap items-center gap-[var(--spacing-component-sm)]">
        <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center text-[var(--color-icon-default)] [&_svg]:size-4">
          {icon}
        </span>
        <span className="text-base font-semibold text-[var(--color-surface-default-foreground)]">{title}</span>
        {requirement && <RequirementLabel value={requirement} />}
      </span>
      {description && (
        <span className="text-xs font-normal text-[var(--color-text-secondary)]">
          {description}
        </span>
      )}
    </span>
  )
}

export function FormSection({
  id,
  icon,
  title,
  requirement,
  description,
  collapsible = false,
  open = false,
  onOpenChange,
  action,
  children,
  className,
}: {
  id: string
  icon: React.ReactNode
  title: string
  requirement?: FormSectionRequirement
  description?: string
  collapsible?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Optional trailing action for an always-open section header. */
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const content = (
    <div className={cn('grid grid-cols-1 gap-[var(--spacing-component-lg)] sm:grid-cols-2', className)}>
      {children}
    </div>
  )

  if (!collapsible) {
    return (
      <section className="border-t border-[var(--color-border-default)] py-[var(--spacing-component-lg)]">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-background-subtle)] p-[var(--spacing-component-lg)]">
          <div className="mb-[var(--spacing-component-lg)] flex items-start justify-between gap-[var(--spacing-component-md)]">
            <SectionHeading icon={icon} title={title} requirement={requirement} description={description} />
            {action && <div className="shrink-0">{action}</div>}
          </div>
          {content}
        </div>
      </section>
    )
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={open ? id : ''}
      onValueChange={(value) => onOpenChange?.(value === id)}
      className="border-t border-[var(--color-border-default)]"
    >
      <AccordionItem
        value={id}
        className="border-b-0 border-[var(--color-border-default)] transition-colors data-[state=open]:my-[var(--spacing-component-lg)] data-[state=open]:rounded-[var(--radius-lg)] data-[state=open]:border data-[state=open]:bg-[var(--color-background-subtle)] data-[state=open]:px-[var(--spacing-component-lg)]"
      >
        <AccordionTrigger>
          <SectionHeading icon={icon} title={title} requirement={requirement} description={description} />
        </AccordionTrigger>
        <AccordionContent className="text-[var(--color-surface-default-foreground)]">
          {content}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children} <span aria-hidden="true" className="text-[var(--color-text-link)]">*</span>
    </>
  )
}
