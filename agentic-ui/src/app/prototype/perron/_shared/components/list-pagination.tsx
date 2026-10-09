'use client'

import * as React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COPY } from '@/app/prototype/perron/_shared/copy'

// Shared pagination for every list screen. DS pattern "With Total" + "With Changer":
// Total N items · Prev · pages · Next · rows per page.
//
// Default 50 rows per page so the 41 rooms still fit on one page ("the list is the product").
// WordPress equivalent: the per-page value in Screen Options.

export const PAGE_SIZES = [10, 20, 50] as const
export const DEFAULT_PAGE_SIZE = 50

// Paginates `items`. Goes back to page 1 whenever `resetKey` changes (tab, filter, search, sort).
export function usePaged<T>(items: T[], resetKey: string) {
  const [pageSize, setPageSize] = React.useState<number>(DEFAULT_PAGE_SIZE)
  const [state, setState] = React.useState({ key: resetKey, page: 1 })
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const page = state.key === resetKey ? Math.min(state.page, pageCount) : 1
  const start = (page - 1) * pageSize
  return {
    pageItems: items.slice(start, start + pageSize),
    page,
    pageCount,
    pageSize,
    total: items.length,
    setPage: (p: number) => setState({ key: resetKey, page: p }),
    setPageSize: (size: number) => {
      setPageSize(size)
      setState({ key: resetKey, page: 1 })
    },
  }
}

// Page numbers with ellipsis: always first and last, plus current ±1.
function pageList(page: number, count: number): (number | 'gap')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const pages = new Set([1, count, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap')
    out.push(p)
  })
  return out
}

interface ListPaginationProps {
  page: number
  pageCount: number
  pageSize: number
  total: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
}

export function ListPagination({ page, pageCount, pageSize, total, setPage, setPageSize }: ListPaginationProps) {
  const go = (p: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (p >= 1 && p <= pageCount && p !== page) setPage(p)
  }
  const atStart = page <= 1
  const atEnd = page >= pageCount

  return (
    <Pagination className="justify-end">
      <div className="flex flex-wrap items-center gap-[var(--spacing-component-lg)]">
        <span className="text-sm text-[var(--color-background-muted-foreground)]">{COPY.pagination.total(total)}</span>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={go(page - 1)} aria-disabled={atStart || undefined} tabIndex={atStart ? -1 : undefined} />
          </PaginationItem>
          {pageList(page, pageCount).map((p, i) =>
            p === 'gap' ? (
              <PaginationItem key={`gap-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink href="#" isActive={p === page} onClick={go(p)} aria-label={COPY.pagination.page(p)}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext href="#" onClick={go(page + 1)} aria-disabled={atEnd || undefined} tabIndex={atEnd ? -1 : undefined} />
          </PaginationItem>
        </PaginationContent>
        <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
          <SelectTrigger className="h-8 w-32" aria-label={COPY.pagination.perPageLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {COPY.pagination.perPage(n)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Pagination>
  )
}
