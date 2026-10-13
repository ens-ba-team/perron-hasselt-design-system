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
import { BOOKINGS_COPY } from '@/app/prototype/perron/bookings/copy'
import { TODAY, formatDate, formatMoney, weekRange } from '@/app/prototype/perron/_shared/format'
import { type Booking, type BookingStatus } from '@/app/prototype/perron/_shared/types'
import { BOOKING_STATUSES, contractTotal, myTask, taskDue } from '@/app/prototype/perron/bookings/data'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { BookingDrawer } from '@/app/prototype/perron/bookings/_components/booking-drawer'
import { NEW, recordHref } from '@/app/prototype/perron/_shared/components/record-drawer'
import { CELL, CELL_ACTIONS, CELL_ID, CELL_STRONG, HEAD, HEAD_ACTIONS, HEAD_ID, IdLink, PageHeader, ROW, RowActions, SortHead, TABLE, TableFrame, ViewLinks, compareValues, type SortState } from '@/app/prototype/perron/_shared/components/list-parts'

// Bookings — Functional Spec §3.2
// Contract end sits directly next to Check-out date so early move-out and overstay are visible.
// "This week", "this month" and "My task" are filters evaluated on load. They never change data.

type BookingSortKey =
  | 'id' | 'tenant' | 'room' | 'contractStart' | 'contractEnd' | 'checkoutDate' | 'status'
  | 'checkinDate' | 'checkinStaff' | 'checkoutStaff' | 'monthlyRent' | 'depositStatus'

type TabKey = 'all' | BookingStatus | 'myTask' | 'thisWeek'

const C = COPY.labels.booking
const T = BOOKINGS_COPY.tabs

const DEFAULT_SORT: Record<TabKey, SortState<BookingSortKey>> = {
  all: { key: 'contractStart', dir: 'desc' },
  Upcoming: { key: 'contractStart', dir: 'asc' },
  Active: { key: 'contractEnd', dir: 'asc' },
  Ended: { key: 'contractEnd', dir: 'desc' },
  Cancelled: { key: 'contractStart', dir: 'desc' },
  myTask: { key: 'checkinDate', dir: 'asc' },
  thisWeek: { key: 'checkinDate', dir: 'asc' },
}


export default function BookingsPage() {
  const router = useRouter()
  const store = usePerron()
  const { bookings, currentStaffId } = store
  const [tab, setTab] = React.useState<TabKey>('all')
  const [sort, setSort] = React.useState(DEFAULT_SORT.all)
  const [query, setQuery] = React.useState('')

  const [weekFrom, weekTo] = weekRange(TODAY)

  const matchesQuery = (b: Booking) => {
    if (!query) return true
    const q = query.toLowerCase()
    return b.id.toLowerCase().includes(q) || (store.tenant(b.tenantId)?.name.toLowerCase().includes(q) ?? false) || (store.room(b.roomId)?.name.toLowerCase().includes(q) ?? false)
  }

  const inTab = (b: Booking, key: TabKey): boolean => {
    switch (key) {
      case 'all': return b.status !== 'Cancelled'
      case 'myTask': return myTask(b, currentStaffId, weekTo) !== ''
      case 'thisWeek': return taskDue(b, weekTo) !== ''
      default: return b.status === key
    }
  }

  const searched = bookings.filter(matchesQuery)
  const count = (key: TabKey) => searched.filter((b) => inTab(b, key)).length

  const views = [
    { key: 'all', label: T.all, count: count('all') },
    ...BOOKING_STATUSES.map((s) => ({ key: s, label: s, count: count(s) })),
    { key: 'myTask', label: T.myTask, count: count('myTask') },
    { key: 'thisWeek', label: T.thisWeek, count: count('thisWeek') },
  ]

  const tabHint: Record<TabKey, string> = {
    all: BOOKINGS_COPY.tabHints.all,
    Upcoming: '', Active: '', Ended: '', Cancelled: '',
    myTask: BOOKINGS_COPY.tabHints.myTask(formatDate(weekFrom), formatDate(weekTo)),
    thisWeek: BOOKINGS_COPY.tabHints.thisWeek(formatDate(weekFrom), formatDate(weekTo)),
  }

  const sortValue = (b: Booking, key: BookingSortKey): string | number => {
    switch (key) {
      case 'tenant': return store.tenant(b.tenantId)?.name ?? ''
      case 'room': return store.room(b.roomId)?.name ?? ''
      case 'checkinStaff': return store.staffName(b.checkinStaff)
      case 'checkoutStaff': return store.staffName(b.checkoutStaff)
      // Empty dates sort last in ascending order
      case 'checkinDate': case 'checkoutDate': return b[key] || '9999'
      default: return b[key]
    }
  }

  const visible = searched
    .filter((b) => inTab(b, tab))
    .sort((a, b) => compareValues(sortValue(a, sort.key), sortValue(b, sort.key), sort.dir))
  const paged = usePaged(visible, `${tab}|${query}|${sort.key}-${sort.dir}`)

  const changeTab = (key: string) => {
    setTab(key as TabKey)
    setSort(DEFAULT_SORT[key as TabKey])
  }



  const head = { sort, onSort: setSort }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6">
      <PageHeader
        title={BOOKINGS_COPY.title}
        action={
          <Button size="sm" onClick={() => router.push(recordHref('bookings', NEW))}>
            <Plus />
            {BOOKINGS_COPY.add}
          </Button>
        }
      />

      <div className="flex flex-col gap-1">
        <ViewLinks views={views} active={tab} onChange={changeTab} />
        {tabHint[tab] && <p className="text-xs text-[var(--color-text-secondary)]">{tabHint[tab]}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-72">
          <SearchLg className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-icon-muted)]" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={BOOKINGS_COPY.searchPlaceholder}
            aria-label={COPY.common.search} className="pl-9" />
        </div>
      </div>

      {visible.length === 0 ? (
        <Empty
          title={COPY.common.noResults}
          description={COPY.common.noResultsHint}
          primaryAction={<Button onClick={() => { setQuery(''); changeTab('all') }}>{COPY.common.clearFilters}</Button>}
        />
      ) : (
        <TableFrame>
          <Table wrapperClassName="h-full" className={TABLE}>
            <TableHeader>
              <TableRow>
                <SortHead label={C.id} sortKey="id" {...head} className={HEAD_ID} />
                <SortHead label={C.tenant} sortKey="tenant" {...head} />
                <SortHead label={C.room} sortKey="room" {...head} />
                <SortHead label={C.contractStart} sortKey="contractStart" {...head} />
                <SortHead label={C.contractEnd} sortKey="contractEnd" {...head} />
                <SortHead label={C.checkoutDate} sortKey="checkoutDate" {...head} />
                <SortHead label={C.status} sortKey="status" {...head} />
                <SortHead label={C.checkinDate} sortKey="checkinDate" {...head} />
                <SortHead label={C.checkinStaff} sortKey="checkinStaff" {...head} />
                <SortHead label={C.checkoutStaff} sortKey="checkoutStaff" {...head} />
                <SortHead label={C.monthlyRent} sortKey="monthlyRent" {...head} />
                <TableHead className={HEAD}>{C.total}</TableHead>
                <SortHead label={C.depositStatus} sortKey="depositStatus" {...head} />
                <TableHead className={HEAD}>{C.myTask}</TableHead>
                <TableHead className={HEAD_ACTIONS}>{COPY.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.pageItems.map((b) => {
                const tenant = store.tenant(b.tenantId)
                const room = store.room(b.roomId)
                return (
                  <TableRow key={b.id} className={ROW}>
                    <TableCell className={CELL_ID}>
                      <IdLink id={b.id} onOpen={() => router.push(recordHref('bookings', b.id))} />
                    </TableCell>
                    <TableCell className={CELL_STRONG}>{tenant?.name}</TableCell>
                    <TableCell className={CELL}>{room?.name}</TableCell>
                    <TableCell className={CELL}>{formatDate(b.contractStart)}</TableCell>
                    <TableCell className={CELL}>{formatDate(b.contractEnd)}</TableCell>
                    <TableCell className={CELL}>{formatDate(b.checkoutDate) || COPY.common.none}</TableCell>
                    <TableCell className={CELL}>{b.status}</TableCell>
                    <TableCell className={CELL}>{formatDate(b.checkinDate) || COPY.common.none}</TableCell>
                    <TableCell className={CELL}>{store.staffName(b.checkinStaff) || COPY.common.none}</TableCell>
                    <TableCell className={CELL}>{store.staffName(b.checkoutStaff) || COPY.common.none}</TableCell>
                    <TableCell className={CELL}>{formatMoney(b.monthlyRent)}</TableCell>
                    <TableCell className={CELL}>{formatMoney(contractTotal(b))}</TableCell>
                    <TableCell className={CELL}>{b.depositStatus}</TableCell>
                    <TableCell className={CELL}>{myTask(b, currentStaffId, weekTo)}</TableCell>
                    <TableCell className={CELL_ACTIONS}>
                      <RowActions onView={() => router.push(recordHref('bookings', b.id))} onEdit={b.status === 'Ended' || b.status === 'Cancelled' ? undefined : () => router.push(recordHref('bookings', b.id))} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableFrame>
      )}

      {visible.length > 0 && <ListPagination {...paged} />}

      <BookingDrawer />
    </div>
  )
}

