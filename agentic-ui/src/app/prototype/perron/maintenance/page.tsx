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
import { MAINTENANCE_COPY } from '@/app/prototype/perron/maintenance/copy'
import { formatDate } from '@/app/prototype/perron/_shared/format'
import { type MaintenanceStatus } from '@/app/prototype/perron/_shared/types'
import { MAINTENANCE_STATUSES } from '@/app/prototype/perron/maintenance/data'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { MaintenanceDrawer } from '@/app/prototype/perron/maintenance/_components/maintenance-drawer'
import { NEW, recordHref } from '@/app/prototype/perron/_shared/components/record-drawer'
import { CELL, CELL_ACTIONS, CELL_ID, CELL_STRONG, HEAD, HEAD_ACTIONS, HEAD_ID, IdLink, PageHeader, ROW, RowActions, TABLE, TableFrame, ViewLinks } from '@/app/prototype/perron/_shared/components/list-parts'

// Maintenance — Functional Spec §3.4, §4.4
// Tabs Open · In progress · Done with counts, default Open.
// Actions is a label mapping of Status, shown only on issues assigned to the logged-in user.

const C = COPY.labels.maintenance

export default function MaintenancePage() {
  const router = useRouter()
  const store = usePerron()
  const { maintenance, currentStaffId } = store
  const [tab, setTab] = React.useState<MaintenanceStatus>('Open')
  const [query, setQuery] = React.useState('')

  const searched = maintenance.filter((m) => {
    if (!query) return true
    const q = query.toLowerCase()
    return m.issue.toLowerCase().includes(q) || (store.room(m.roomId)?.name.toLowerCase().includes(q) ?? false)
  })
  const views = MAINTENANCE_STATUSES.map((s) => ({ key: s, label: s, count: searched.filter((m) => m.status === s).length }))
  const visible = searched.filter((m) => m.status === tab).sort((a, b) => b.reportedDate.localeCompare(a.reportedDate))
  const paged = usePaged(visible, `${tab}|${query}`)


  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6">
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
      </div>

      {visible.length === 0 ? (
        <Empty title={COPY.common.noResults} description={COPY.common.noResultsHint}
          primaryAction={<Button onClick={() => setQuery('')}>{COPY.common.clearFilters}</Button>} />
      ) : (
        <TableFrame>
          <Table wrapperClassName="h-full" className={TABLE}>
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD_ID}>{C.id}</TableHead>
                <TableHead className={HEAD}>{C.room}</TableHead>
                <TableHead className={HEAD}>{C.issue}</TableHead>
                <TableHead className={HEAD}>{C.reportedDate}</TableHead>
                <TableHead className={HEAD}>{C.assignedStaff}</TableHead>
                <TableHead className={HEAD}>{C.status}</TableHead>
                <TableHead className={HEAD} title={MAINTENANCE_COPY.actionsHint}>{C.actions}</TableHead>
              <TableHead className={HEAD_ACTIONS}>{COPY.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.pageItems.map((m) => (
                <TableRow key={m.id} className={ROW}>
                  <TableCell className={CELL_ID}>
                    <IdLink id={m.id} onOpen={() => router.push(recordHref('maintenance', m.id))} />
                  </TableCell>
                  <TableCell className={CELL}>{store.room(m.roomId)?.name}</TableCell>
                  <TableCell className={CELL_STRONG}>{m.issue}</TableCell>
                  <TableCell className={CELL}>{formatDate(m.reportedDate)}</TableCell>
                  <TableCell className={CELL}>{store.staffName(m.assignedStaff) || COPY.common.none}</TableCell>
                  <TableCell className={CELL}>{m.status}</TableCell>
                  <TableCell className={CELL}>{m.assignedStaff === currentStaffId ? MAINTENANCE_COPY.actions[m.status] ?? '' : ''}</TableCell>
                <TableCell className={CELL_ACTIONS}>
                      <RowActions onView={() => router.push(recordHref('maintenance', m.id))} onEdit={() => router.push(recordHref('maintenance', m.id))} />
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableFrame>
      )}

      {visible.length > 0 && <ListPagination {...paged} />}

      <MaintenanceDrawer />
    </div>
  )
}
