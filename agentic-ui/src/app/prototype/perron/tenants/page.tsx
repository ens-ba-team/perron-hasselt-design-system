'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, SearchLg } from '@untitledui/icons'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { ListPagination, usePaged } from '@/app/prototype/perron/_shared/components/list-pagination'
import { TENANTS_COPY } from '@/app/prototype/perron/tenants/copy'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { NEW, recordHref } from '@/app/prototype/perron/_shared/components/record-drawer'
import { TenantDrawer } from '@/app/prototype/perron/tenants/_components/tenant-drawer'
import { CELL, CELL_ACTIONS, CELL_ID, CELL_STRONG, HEAD, HEAD_ACTIONS, HEAD_ID, IdLink, PageHeader, ROW, RowActions, TableFrame } from '@/app/prototype/perron/_shared/components/list-parts'

// Tenants — Functional Spec §3.3. Bookings column is read-only, counted from the bookings.

const C = COPY.labels.tenant

export default function TenantsPage() {
  const router = useRouter()
  const { tenants, bookings } = usePerron()
  const [query, setQuery] = React.useState('')

  const bookingCount = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const b of bookings) m.set(b.tenantId, (m.get(b.tenantId) ?? 0) + 1)
    return m
  }, [bookings])

  const visible = tenants
    .filter((t) => !query || `${t.name} ${t.email} ${t.university}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
  const paged = usePaged(visible, query)


  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6">
      <PageHeader
        title={TENANTS_COPY.title}
        action={
          <Button size="sm" onClick={() => router.push(recordHref('tenants', NEW))}>
            <Plus />
            {TENANTS_COPY.add}
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <div className="relative w-72">
          <SearchLg className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-icon-muted)]" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={TENANTS_COPY.searchPlaceholder}
            aria-label={COPY.common.search} className="pl-9" />
        </div>
      </div>

      {visible.length === 0 ? (
        <Empty title={COPY.common.noResults} description={COPY.common.noResultsHint}
          primaryAction={<Button onClick={() => setQuery('')}>{COPY.common.clearFilters}</Button>} />
      ) : (
        <TableFrame>
          <Table wrapperClassName="h-full">
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD_ID}>{C.id}</TableHead>
                <TableHead className={HEAD}>{C.name}</TableHead>
                <TableHead className={HEAD}>{C.phone}</TableHead>
                <TableHead className={HEAD}>{C.email}</TableHead>
                <TableHead className={HEAD}>{C.university}</TableHead>
                <TableHead className={HEAD}>{C.erasmus}</TableHead>
                <TableHead className={HEAD}>{C.bookings}</TableHead>
              <TableHead className={HEAD_ACTIONS}>{COPY.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.pageItems.map((t) => (
                <TableRow key={t.id} className={ROW}>
                  <TableCell className={CELL_ID}>
                    <IdLink id={t.id} onOpen={() => router.push(recordHref('tenants', t.id))} />
                  </TableCell>
                  <TableCell className={CELL_STRONG}>{t.name}</TableCell>
                  <TableCell className={CELL}>{t.phone}</TableCell>
                  <TableCell className={CELL}>{t.email}</TableCell>
                  <TableCell className={CELL}>{t.university}</TableCell>
                  <TableCell className={CELL}>{t.erasmus ? 'Yes' : 'No'}</TableCell>
                  <TableCell className={CELL}>{bookingCount.get(t.id) ?? 0}</TableCell>
                <TableCell className={CELL_ACTIONS}>
                      <RowActions onView={() => router.push(recordHref('tenants', t.id))} onEdit={() => router.push(recordHref('tenants', t.id))} />
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableFrame>
      )}

      {visible.length > 0 && <ListPagination {...paged} />}

      <TenantDrawer />
    </div>
  )
}
