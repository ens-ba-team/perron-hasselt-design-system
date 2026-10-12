'use client'

import * as React from 'react'
import { ChevronDown, ChevronSelectorVertical, ChevronUp, Edit05, Eye } from '@untitledui/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableHead } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { COPY } from '@/app/prototype/perron/_shared/copy'

// ─── Dev note (⚙️) ────────────────────────────────────────────────────────────
// Marks anything that probably needs custom code in WordPress (Functional Spec §9).

export function DevNote({ q, text, className }: { q: string; text: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="dashed" className={cn('cursor-help whitespace-nowrap', className)} tabIndex={0}>
          {COPY.dev.label(q)}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 leading-snug">{text}</TooltipContent>
    </Tooltip>
  )
}

// ─── View links ───────────────────────────────────────────────────────────────
// WordPress "subsubsub" pattern: All (41) | Available (6) | ...
// Saved views are tabs inside the list, never a separate dashboard.

export interface ViewLink {
  key: string
  label: string
  count: number
  note?: React.ReactNode
}

export function ViewLinks({ views, active, onChange }: { views: ViewLink[]; active: string; onChange: (key: string) => void }) {
  return (
    <nav aria-label="Views" className="flex flex-wrap items-center gap-y-1 text-sm">
      {views.map((v, i) => (
        <React.Fragment key={v.key}>
          {i > 0 && <span aria-hidden className="px-2 text-[var(--color-border-strong)]">|</span>}
          <span className="inline-flex items-center gap-1.5">
            <Button
              variant="link"
              size="sm"
              aria-current={active === v.key ? 'true' : undefined}
              onClick={() => onChange(v.key)}
              className={cn(
                'h-auto px-0 text-sm',
                active === v.key && 'font-semibold text-[var(--color-background-default-foreground)] hover:no-underline',
              )}
            >
              {v.label}
              <span className="font-normal text-[var(--color-text-secondary)]">({v.count})</span>
            </Button>
            {v.note}
          </span>
        </React.Fragment>
      ))}
    </nav>
  )
}

// ─── Sortable header ──────────────────────────────────────────────────────────

export type SortDir = 'asc' | 'desc'
export interface SortState<K extends string> {
  key: K
  dir: SortDir
}

export function SortHead<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  className,
  children,
}: {
  label: string
  sortKey: K
  sort: SortState<K>
  onSort: (s: SortState<K>) => void
  className?: string
  children?: React.ReactNode
}) {
  const active = sort.key === sortKey
  const Icon = !active ? ChevronSelectorVertical : sort.dir === 'asc' ? ChevronUp : ChevronDown
  return (
    <TableHead
      className={cn(HEAD, className)}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      <span className="inline-flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 px-2 text-xs"
          onClick={() => onSort({ key: sortKey, dir: active && sort.dir === 'asc' ? 'desc' : 'asc' })}
        >
          {label}
          <Icon className={cn(!active && 'text-[var(--color-icon-muted)]')} />
        </Button>
        {children}
      </span>
    </TableHead>
  )
}

export function compareValues(a: string | number, b: string | number, dir: SortDir): number {
  const res = typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'en', { numeric: true })
  return dir === 'asc' ? res : -res
}

// ─── Page header ──────────────────────────────────────────────────────────────
// WordPress style: title with the "Add new" button right next to it.

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  back?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-2">
      {back}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-[var(--color-background-default-foreground)]">{title}</h1>
        {action}
      </div>
      {description && <p className="max-w-3xl text-sm text-[var(--color-text-secondary)]">{description}</p>}
    </header>
  )
}

// Bounded box for the table. The DS Table's own wrapper does the scrolling (pass
// wrapperClassName="h-full"), because sticky headers and columns position against it.
// Never drop columns to fit (FR-G1).
export function TableFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden rounded-[var(--radius-base)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]">
      {children}
    </div>
  )
}

// ─── Table header classes ─────────────────────────────────────────────────────
// The header row stays pinned while the body scrolls; the ID and Actions headers also
// stay pinned sideways, so they sit above their sticky columns.

// First column: stays visible while the table scrolls sideways, and casts shadow/md
// sideways so it reads as sitting above the columns sliding underneath it.
const STICKY_SHADOW = 'shadow-[4px_0_6px_-1px_rgb(0_0_0/0.1),2px_0_4px_-2px_rgb(0_0_0/0.1)]'

export const HEAD = 'sticky top-0 z-20 whitespace-nowrap px-3 bg-[var(--color-surface-raised)]'
export const HEAD_ID = cn(HEAD, 'left-0 z-30', STICKY_SHADOW)
// Not pinned sideways (designer, 2026-10-12): the label scrolls away with the other headers,
// only the action buttons themselves stay docked to the right edge.
export const HEAD_ACTIONS = cn(HEAD, 'text-right')

// ─── Table row and cell classes ───────────────────────────────────────────────
// Row: 48px, zebra striping, `group/row` so the sticky Actions cell can react to hover.
// Sticky cells use bg-inherit so they pick up the row's zebra or hover colour.

export const ROW = cn(
  'group/row h-16',
  'bg-[var(--color-surface-default)] even:bg-[var(--color-background-subtle)]',
  'hover:bg-[var(--color-background-accent)]',
)

// Values read as supporting text; the ID and the record name carry the emphasis.
// py-0 cancels the DS TableCell's p-4 so the row is exactly 64px (designer, 2026-10-12).
export const CELL = 'px-3 py-0 h-16 whitespace-nowrap text-[var(--color-text-secondary)]'
export const CELL_STRONG = 'px-3 py-0 h-16 whitespace-nowrap font-medium text-[var(--color-surface-default-foreground)]'

export const CELL_ID = cn(CELL, 'sticky left-0 z-20 bg-inherit', STICKY_SHADOW)

// ─── Row actions ──────────────────────────────────────────────────────────────
// Last column, sticky right, revealed on row hover or keyboard focus. It floats over
// the row's content so no horizontal space is reserved for it.
// Read-only records (Ended / Cancelled bookings) only get "View".

export function RowActions({ onView, onEdit }: { onView: () => void; onEdit?: () => void }) {
  return (
    <div
      className={cn(
        // Elevated pill: shadow/md plus its own surface, so the buttons never blend into the row.
        'flex items-center gap-1 rounded-[var(--radius-md)] p-1',
        'border border-[var(--color-border-default)] bg-[var(--color-surface-default)]',
        'shadow-[var(--shadow-md)]',
        'opacity-0 transition-opacity',
        'group-hover/row:opacity-100 focus-within:opacity-100',
      )}
    >
      {onEdit && (
        <Button size="icon-sm" variant="ghost" aria-label={COPY.common.edit} onClick={onEdit}>
          <Edit05 />
        </Button>
      )}
      <Button size="icon-sm" variant="ghost" aria-label={COPY.common.view} onClick={onView}>
        <Eye />
      </Button>
    </div>
  )
}

export const CELL_ACTIONS = cn(CELL, 'sticky right-0 z-20 bg-inherit')

// ─── Record ID link ───────────────────────────────────────────────────────────
// The ONE way to open a record: its ID, in the first column. Names are plain text,
// so a link always opens the record of the row it sits in.

export function IdLink({ id, onOpen }: { id: string; onOpen: () => void }) {
  return (
    <Button variant="link" className="h-auto px-0 font-mono text-xs" onClick={onOpen}>
      {id}
    </Button>
  )
}
