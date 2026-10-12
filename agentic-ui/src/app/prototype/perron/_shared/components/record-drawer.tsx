'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// ─── Record drawer: the shared CRUD pattern ───────────────────────────────────
//
// Every create / view / edit opens in a right-side Sheet over its list, so the admin
// never loses the list context. Inline editing in list cells stays for quick changes.
//
// The open record lives in the URL, so any ID can be a real link:
//   /prototype/perron/bookings?record=PH-463502   view / edit one record
//   /prototype/perron/bookings?record=new         create
//   /prototype/perron/bookings?record=new&room=p19-1.01   create with a preset
//
// Product rule note: README says "edit in place, no modals". Decided 2026-10-08 by the
// designer: inline edit stays on lists, full records use this drawer.

export const NEW = 'new'

const noop = () => () => {}

export function recordHref(list: 'rooms' | 'bookings' | 'tenants' | 'maintenance', id: string, extra?: Record<string, string>) {
  const params = new URLSearchParams({ record: id, ...extra })
  return `/prototype/perron/${list}?${params.toString()}`
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

// Width: 560px for every record drawer (designer, 2026-10-12). DS Sheet default is 380px,
// too narrow for the 2-column Booking and Room forms. Not in Figma yet: add a Sheet
// "Wide 560" variant there, then move this value into the DS component.
const DRAWER_WIDTH = 'sm:w-[560px]'

export function RecordDrawer({ open, onClose, title, description, footer, children }: RecordDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className={cn('max-w-none', DRAWER_WIDTH)}>
        <SheetHeader className="border-b border-[var(--color-border-default)]">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-[var(--spacing-component-lg)]">{children}</div>
        {footer && <SheetFooter className="mt-0 flex-row flex-wrap items-center justify-end">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}

// Visual group inside a drawer. Groups are never collapsible: nothing hidden (FR-G1).
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
