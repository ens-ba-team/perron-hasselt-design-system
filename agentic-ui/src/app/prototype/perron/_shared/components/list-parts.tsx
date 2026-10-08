'use client'

import * as React from 'react'
import { ChevronDown, ChevronSelectorVertical, ChevronUp } from '@untitledui/icons'
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
      className={cn('whitespace-nowrap px-3', className)}
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

// Bordered, horizontally scrollable wrapper. Never drop columns to fit (FR-G1).
export function TableFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-base)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]">
      {children}
    </div>
  )
}

// Compact cell padding so 41 rooms nearly fit one screen.
export const CELL = 'px-3 py-1.5 whitespace-nowrap'

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
