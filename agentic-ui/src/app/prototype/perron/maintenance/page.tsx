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
import { MAINTENANCE_COPY } from '@/app/prototype/perron/maintenance/copy'
import { formatDate } from '@/app/prototype/perron/_shared/format'
import { type Maintenance, type MaintenanceStatus } from '@/app/prototype/perron/_shared/types'
import { MAINTENANCE_STATUSES } from '@/app/prototype/perron/maintenance/data'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { InlineCell } from '@/app/prototype/perron/_shared/components/inline-cell'
import { staffOptions } from '@/app/prototype/perron/_shared/components/form-fields'
import { MaintenanceDrawer } from '@/app/prototype/perron/maintenance/_components/maintenance-drawer'
import { NEW, recordHref } from '@/app/prototype/perron/_shared/components/record-drawer'
import { CELL, IdLink, PageHeader, TableFrame, ViewLinks } from '@/app/prototype/perron/_shared/components/list-parts'

// Maintenance — Functional Spec §3.4, §4.4
// Tabs Open · In progress · Done with counts, default Open.
// Actions is a label mapping of Status, shown only on issues assigned to the logged-in user.

const C = COPY.labels.maintenance

export default function MaintenancePage() {
  const router = useRouter()
  const store = usePerron()
  const { maintenance, currentStaffId, updateMaintenance } = store
  const [tab, setTab] = React.useState<MaintenanceStatus>('Open')
  const [query, setQuery] = React.useState('')

  const searched = maintenance.filter((m) => {
    if (!query) return true
    const q = query.toLowerCase()
    return m.issue.toLowerCase().includes(q) || (store.room(m.roomId)?.name.toLowerCase().includes(q) ?? false)
  })
  const views = MAINTENANCE_STATUSES.map((s) => ({ key: s, label: s, count: searched.filter((m) => m.status === s).length }))
  const visible = searched.filter((m) => m.status === tab).sort((a, b) => b.reportedDate.localeCompare(a.reportedDate))

  const save = (m: Maintenance, patch: Partial<Maintenance>) => {
    updateMaintenance(m.id, patch)
    toast.success(COPY.common.saved, { description: m.issue })
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title={MAINTENANCE_COPY.title}
        description={MAINTENANCE_COPY.noBlocking}
        action={
          <Button size="sm" onClick={() => router.push(recordHref('maintenance', NEW))}>
            <Plus />
            {MAINTENANCE_COPY.add}
          </Button>
        }
      />

      <ViewLinks views={views} active={tab} onChange={(k) => setTab(k as MaintenanceStatus)} />

      <div className="flex items-center gap-2">
        <div className="relative w-72">
          <SearchLg className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-icon-muted)]" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={MAINTENANCE_COPY.searchPlaceholder}
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
                <TableHead className="px-3">{C.room}</TableHead>
                <TableHead className="px-3">{C.issue}</TableHead>
                <TableHead className="px-3">{C.reportedDate}</TableHead>
                <TableHead className="px-3">{C.assignedStaff}</TableHead>
                <TableHead className="px-3">{C.status}</TableHead>
                <TableHead className="px-3" title={MAINTENANCE_COPY.actionsHint}>{C.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className={CELL}>
                    <IdLink id={m.id} onOpen={() => router.push(recordHref('maintenance', m.id))} />
                  </TableCell>
                  <TableCell className={CELL}>{store.room(m.roomId)?.name}</TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.issue} kind="text" value={m.issue} onSave={(v) => save(m, { issue: v })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.reportedDate} kind="date" value={m.reportedDate} display={formatDate(m.reportedDate)}
                      onSave={(v) => save(m, { reportedDate: v })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.assignedStaff} kind="select" value={m.assignedStaff} options={staffOptions}
                      display={store.staffName(m.assignedStaff) || undefined}
                      onSave={(v) => save(m, { assignedStaff: v })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.status} kind="select" value={m.status}
                      options={MAINTENANCE_STATUSES.map((s) => ({ value: s, label: s }))}
                      onSave={(v) => save(m, { status: v as MaintenanceStatus })} />
                  </TableCell>
                  <TableCell className={`${CELL} text-[var(--color-text-secondary)]`}>
                    {m.assignedStaff === currentStaffId ? MAINTENANCE_COPY.actions[m.status] ?? '' : ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableFrame>
      )}

      <MaintenanceDrawer />
    </div>
  )
}
