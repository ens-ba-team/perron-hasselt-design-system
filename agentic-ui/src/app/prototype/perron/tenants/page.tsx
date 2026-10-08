'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, SearchLg } from '@untitledui/icons'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { TENANTS_COPY } from '@/app/prototype/perron/tenants/copy'
import type { Tenant } from '@/app/prototype/perron/_shared/types'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { InlineCell } from '@/app/prototype/perron/_shared/components/inline-cell'
import { NEW, recordHref } from '@/app/prototype/perron/_shared/components/record-drawer'
import { TenantDrawer } from '@/app/prototype/perron/tenants/_components/tenant-drawer'
import { CELL, IdLink, PageHeader, TableFrame } from '@/app/prototype/perron/_shared/components/list-parts'

// Tenants — Functional Spec §3.3. Bookings column is read-only, counted from the bookings.

const C = COPY.labels.tenant
const yesNo = [{ value: 'Yes', label: TENANTS_COPY.yes }, { value: 'No', label: TENANTS_COPY.no }]

export default function TenantsPage() {
  const router = useRouter()
  const { tenants, bookings, updateTenant } = usePerron()
  const [query, setQuery] = React.useState('')

  const bookingCount = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const b of bookings) m.set(b.tenantId, (m.get(b.tenantId) ?? 0) + 1)
    return m
  }, [bookings])

  const visible = tenants
    .filter((t) => !query || `${t.name} ${t.email} ${t.university}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const save = (t: Tenant, patch: Partial<Tenant>) => {
    updateTenant(t.id, patch)
    toast.success(COPY.common.saved, { description: t.name })
  }

  return (
    <div className="flex flex-col gap-4 p-6">
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
        <span className="ml-auto text-sm text-[var(--color-text-secondary)]">{COPY.common.items(visible.length)}</span>
      </div>

      {visible.length === 0 ? (
        <Empty title={COPY.common.noResults} description={COPY.common.noResultsHint}
          primaryAction={<Button onClick={() => setQuery('')}>{COPY.common.clearFilters}</Button>} />
      ) : (
        <TableFrame>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-3">{C.id}</TableHead>
                <TableHead className="px-3">{C.name}</TableHead>
                <TableHead className="px-3">{C.phone}</TableHead>
                <TableHead className="px-3">{C.email}</TableHead>
                <TableHead className="px-3">{C.university}</TableHead>
                <TableHead className="px-3">{C.erasmus}</TableHead>
                <TableHead className="px-3">{C.bookings}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className={CELL}>
                    <IdLink id={t.id} onOpen={() => router.push(recordHref('tenants', t.id))} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.name} kind="text" value={t.name} onSave={(v) => save(t, { name: v })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.phone} kind="text" value={t.phone} onSave={(v) => save(t, { phone: v })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.email} kind="text" value={t.email} onSave={(v) => save(t, { email: v })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.university} kind="text" value={t.university} onSave={(v) => save(t, { university: v })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.erasmus} kind="select" value={t.erasmus ? 'Yes' : 'No'} options={yesNo}
                      onSave={(v) => save(t, { erasmus: v === 'Yes' })} />
                  </TableCell>
                  <TableCell className={`${CELL} text-[var(--color-text-secondary)]`}>{bookingCount.get(t.id) ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableFrame>
      )}

      <TenantDrawer />
    </div>
  )
}
