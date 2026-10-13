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

// Bounded box for the table. It keeps its intrinsic height when the current page has
// only a few rows, then flex-shrinks to the remaining viewport height when the rows no
// longer fit. The DS Table's own wrapper does the scrolling (pass wrapperClassName="h-full"),
// because sticky headers and columns position against it. Never drop columns to fit (FR-G1).
// It also marks the scroll container with data-scrolled-x once the table has been scrolled
// sideways, so the sticky ID column shows its edge only when columns are sliding under it.
export function TableFrame({ children }: { children: React.ReactNode }) {
  const frame = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const scroller = frame.current?.querySelector<HTMLElement>('.overflow-auto')
    if (!scroller) return
    const sync = () => {
      const max = scroller.scrollWidth - scroller.clientWidth
      scroller.toggleAttribute('data-scrolled-x', scroller.scrollLeft > 0)
      // At the end of the row there is nothing left to overlap, so the Actions column is
      // fully in view and its buttons stop being a hover-only overlay.
      scroller.toggleAttribute('data-scrolled-end', max <= 0 || scroller.scrollLeft >= max - 1)
    }
    sync()
    scroller.addEventListener('scroll', sync, { passive: true })
    const resize = new ResizeObserver(sync)
    resize.observe(scroller)
    return () => {
      scroller.removeEventListener('scroll', sync)
      resize.disconnect()
    }
  }, [])

  return (
    <div
      ref={frame}
      className="min-h-0 shrink overflow-hidden rounded-[var(--radius-base)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]"
    >
      {children}
    </div>
  )
}

// ─── Table header classes ─────────────────────────────────────────────────────
// The header row stays pinned while the body scrolls; the ID and Actions headers also
// stay pinned sideways, so they sit above their sticky columns.

// First column: stays visible while the table scrolls sideways. Once it does, the
// .sticky-col-edge rule in globals.css draws its edge — a 1px rule plus shadow/md — so
// the column reads as sitting above the ones sliding underneath it. At scrollLeft 0
// nothing is hidden yet, so the edge stays off and it is just the first column.
const STICKY_SHADOW = 'sticky-col-edge'

// Every table here opts out of collapsed borders. In a collapsed table the browser ignores
// z-index on cells, so a sticky header is painted over by the text of the rows passing
// under it and a sticky column cannot cast an edge. Separated borders cost us the row
// border — a border on <tr> is only drawn when borders collapse — so the cells carry it.
export const TABLE = 'border-separate border-spacing-0'

const ROW_RULE = 'border-b border-[var(--color-border-default)]'

// Layering: the header (z-20, z-30 for its sticky ID cell) sits above the body's sticky
// cells (z-10). On a tie the later element in the DOM wins, which is the body — so the
// pinned ID and Actions cells would ride over the header as rows scroll under it.
export const HEAD = cn(
  'sticky top-0 z-20 whitespace-nowrap px-3 bg-[var(--color-surface-raised)]',
  ROW_RULE,
)
export const HEAD_ID = cn(HEAD, 'left-0 z-30', STICKY_SHADOW)
// Not pinned sideways (designer, 2026-10-12): the label scrolls away with the other headers,
// only the action buttons themselves stay docked to the right edge.
const ACTIONS_COLUMN = 'w-[6.5rem] min-w-[6.5rem] max-w-[6.5rem]'
export const HEAD_ACTIONS = cn(HEAD, ACTIONS_COLUMN, 'text-right')

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
// The last row drops its rule: TableFrame's own border already closes the table.
const CELL_BASE = cn('px-3 py-0 h-16 whitespace-nowrap', ROW_RULE, '[tr:last-child>&]:border-b-0')

export const CELL = cn(CELL_BASE, 'text-[var(--color-text-secondary)]')
export const CELL_STRONG = cn(CELL_BASE, 'font-medium text-[var(--color-surface-default-foreground)]')

export const CELL_ID = cn(CELL, 'sticky left-0 z-10 bg-inherit', STICKY_SHADOW)

// ─── Row actions ──────────────────────────────────────────────────────────────
// Last column, sticky right. Two states, by how far the table is scrolled:
//
//   mid-scroll  — the column sits over cells that are still sliding past, so the buttons
//                 appear on hover or keyboard focus only, as an elevated pill that reads
//                 clearly against whatever is underneath it.
//   at the end  — the column is fully in view and covers nothing, so every row shows its
//                 buttons, flat: no pill, since there is nothing to lift them off.
//
// Read-only records (Ended / Cancelled bookings) only get "View".

export function RowActions({ onView, onEdit }: { onView: () => void; onEdit?: () => void }) {
  return (
    <div
      className={cn(
        'ml-auto flex w-fit items-center gap-1 rounded-[var(--radius-md)] p-1',
        // Elevated pill: shadow/md plus its own surface, so the buttons never blend into the row.
        'border border-[var(--color-border-default)] bg-[var(--color-surface-default)]',
        'shadow-[var(--shadow-md)]',
        'opacity-0 transition-opacity',
        'group-hover/row:opacity-100 focus-within:opacity-100',
        // At the end of the row: always visible, and flat — it is its own column now.
        '[[data-scrolled-end]_&]:opacity-100',
        '[[data-scrolled-end]_&]:border-transparent',
        '[[data-scrolled-end]_&]:bg-transparent',
        '[[data-scrolled-end]_&]:shadow-none',
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

// Transparent while idle: the cell keeps its place in the column order, so at full right
// scroll the buttons land at the end of the row, but it never paints over the cells
// sliding underneath it until the row is actually hovered or focused.
export const CELL_ACTIONS = cn(
  CELL,
  ACTIONS_COLUMN,
  'sticky right-0 z-10 bg-transparent',
  'group-hover/row:bg-inherit [&:has(:focus-visible)]:bg-inherit',
)

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
