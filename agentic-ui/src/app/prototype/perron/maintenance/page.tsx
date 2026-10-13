'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { NEW, listHref, recordHref } from '@/app/prototype/perron/_shared/components/record-drawer'
import { CELL, CELL_ACTIONS, CELL_ID, CELL_STRONG, HEAD, HEAD_ACTIONS, HEAD_ID, IdLink, PageHeader, ROW, RowActions, TABLE, TableFrame, ViewLinks } from '@/app/prototype/perron/_shared/components/list-parts'
import { StatusBadge } from '@/app/prototype/perron/_shared/components/status-badge'

// Maintenance — Functional Spec §3.4, §4.4
// Tabs Open · In progress · Done · My task with counts, default Open.
// My task contains the logged-in user's assigned Open and In progress issues.

const C = COPY.labels.maintenance
type MaintenanceTab = 'all' | 'myTask' | MaintenanceStatus

export default function MaintenancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const store = usePerron()
  const { maintenance, currentStaffId } = store
  const roomFilter = searchParams.get('room') ?? ''
  const filteredRoom = store.room(roomFilter)
  const historyQuery = filteredRoom?.name ?? roomFilter
  const [tabSelection, setTabSelection] = React.useState<{ room: string; tab: MaintenanceTab }>({
    room: roomFilter,
    tab: roomFilter ? 'all' : 'Open',
  })
  const tab = tabSelection.room === roomFilter ? tabSelection.tab : roomFilter ? 'all' : 'Open'
  const [querySelection, setQuerySelection] = React.useState({ room: roomFilter, value: historyQuery })
  const query = querySelection.room === roomFilter ? querySelection.value : historyQuery
  const setQuery = (value: string) => setQuerySelection({ room: roomFilter, value })

  const searched = maintenance.filter((item) => {
      if (!query) return true
      const q = query.trim().toLowerCase()
      const room = store.room(item.roomId)
      return (
        item.id.toLowerCase().includes(q) ||
        item.issue.toLowerCase().includes(q) ||
        item.roomId.toLowerCase().includes(q) ||
        (room?.name.toLowerCase().includes(q) ?? false)
      )
    })
  const isMyTask = (item: (typeof maintenance)[number]) => item.assignedStaff === currentStaffId && item.status !== 'Done'
  const statusViews = MAINTENANCE_STATUSES.map((status) => ({ key: status, label: status, count: searched.filter((item) => item.status === status).length }))
  const myTaskView = { key: 'myTask', label: C.myTask, count: searched.filter(isMyTask).length }
  const views = roomFilter
    ? [{ key: 'all', label: COPY.common.all, count: searched.length }, ...statusViews, myTaskView]
    : [...statusViews, myTaskView]
  const visible = searched
    .filter((item) => tab === 'all' || (tab === 'myTask' ? isMyTask(item) : item.status === tab))
    .sort((a, b) => b.reportedDate.localeCompare(a.reportedDate))
  const paged = usePaged(visible, `${roomFilter}|${tab}|${query}`)


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

      <ViewLinks
        views={views}
        active={tab}
        onChange={(key) => setTabSelection({ room: roomFilter, tab: key as MaintenanceTab })}
      />

      <div className="flex items-center gap-2">
        <div className="relative w-72">
          <SearchLg className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-icon-muted)]" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={MAINTENANCE_COPY.searchPlaceholder}
            aria-label={COPY.common.search} className="pl-9" />
        </div>
      </div>

      {visible.length === 0 ? (
        <Empty title={COPY.common.noResults} description={COPY.common.noResultsHint}
          primaryAction={<Button onClick={() => {
            setQuery('')
            if (roomFilter) router.push(listHref('maintenance'))
          }}>{COPY.common.clearFilters}</Button>} />
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
                <TableHead className={HEAD} title={MAINTENANCE_COPY.myTaskHint}>{C.myTask}</TableHead>
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
                  <TableCell className={CELL}><StatusBadge value={m.status} /></TableCell>
                  <TableCell className={CELL}>{m.assignedStaff === currentStaffId ? MAINTENANCE_COPY.myTask[m.status] ?? '' : ''}</TableCell>
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
