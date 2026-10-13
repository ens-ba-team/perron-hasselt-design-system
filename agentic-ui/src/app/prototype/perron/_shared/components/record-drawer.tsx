'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ─── Record drawer: the shared CRUD pattern ───────────────────────────────────
//
// Every create / view / edit opens in a right-side Sheet (wide, 560px) over its list, so the admin
// never loses the list context. Lists are read-only: this panel is the only place to edit.
//
// The open record lives in the URL, so any ID can be a real link:
//   /prototype/perron/bookings?record=PH-463502   view / edit one record
//   /prototype/perron/bookings?record=new         create
//   /prototype/perron/bookings?record=new&room=p19-1.01   create with a preset
//
// Product rule note: the client brief asks for inline editing in lists. Decided 2026-10-12 by
// the designer: lists are read-only and every edit happens here. Needs client confirmation.

export const NEW = 'new'

type PerronList = 'rooms' | 'bookings' | 'tenants' | 'maintenance'

const noop = () => () => {}

export function listHref(list: PerronList, filters?: Record<string, string>) {
  const query = filters ? `?${new URLSearchParams(filters).toString()}` : ''
  return `/prototype/perron/${list}${query}`
}

export function recordHref(list: PerronList, id: string, extra?: Record<string, string>) {
  const params = new URLSearchParams({ record: id, ...extra })
  return listHref(list, Object.fromEntries(params))
}

// Reads and writes ?record= on the current list page.
export function useRecordParam() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  // Open drawers only after mount. A drawer rendered open on the server does not match the
  // client (Radix portals), which left the whole page un-hydrated on a direct ?record= link.
  const mounted = React.useSyncExternalStore(noop, () => true, () => false)
  const record = mounted ? params.get('record') : null
  return {
    record,
    isNew: record === NEW,
    param: (key: string) => params.get(key),
    open: (id: string, extra?: Record<string, string>) => {
      const next = new URLSearchParams({ record: id, ...extra })
      router.push(`${pathname}?${next.toString()}`, { scroll: false })
    },
    close: () => router.push(pathname, { scroll: false }),
  }
}

interface RecordDrawerProps {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  description?: React.ReactNode
  /** Footer actions. Put the submit button with form={formId}. */
  footer?: React.ReactNode
  children: React.ReactNode
}

// DS Sheet, Figma variant "Side=Horizontal, Size=560px" (Perron DS 2070:6175): anchored right,
// 560px, 24px close button, footer with two equal buttons side by side (Cancel, then the primary
// action). Sheet is the DS component for a desktop side panel; Drawer is for mobile bottom panels.

export function RecordDrawer({ open, onClose, title, description, footer, children }: RecordDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" size="wide">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-[var(--spacing-component-lg)]">{children}</div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}

export function RecordMetaCard({ label, description, value }: {
  label: React.ReactNode
  description?: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <Card className="mb-[var(--spacing-component-lg)] gap-[var(--spacing-component-sm)] bg-[var(--color-background-muted)] p-[var(--spacing-component-md)]">
      <div className="flex items-center justify-between gap-[var(--spacing-component-lg)]">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--color-surface-default-foreground)]">{label}</p>
          {description && <p className="text-xs text-[var(--color-text-secondary)]">{description}</p>}
        </div>
        <p className="shrink-0 font-mono text-xs text-[var(--color-text-secondary)]">{value}</p>
      </div>
    </Card>
  )
}

// Permanent visual group inside a drawer. Booking optional/later disclosures use FormSection.
export function DrawerSection({ title, description, children, className }: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className="flex flex-col gap-3 border-b border-[var(--color-border-default)] pb-5 pt-1 last:border-b-0 [&+&]:pt-5">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-[var(--color-surface-overlay-foreground)]">{title}</h3>
        {description && <p className="text-xs text-[var(--color-text-secondary)]">{description}</p>}
      </div>
      <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>{children}</div>
    </section>
  )
}
