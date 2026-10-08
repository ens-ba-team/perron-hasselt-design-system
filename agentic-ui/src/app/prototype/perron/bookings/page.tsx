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
import { BOOKINGS_COPY } from '@/app/prototype/perron/bookings/copy'
import { TODAY, formatDate, formatMoney, weekRange } from '@/app/prototype/perron/_shared/format'
import { type Booking, type BookingStatus } from '@/app/prototype/perron/_shared/types'
import { BOOKING_STATUSES, DEPOSIT_STATUSES, contractTotal, myTask } from '@/app/prototype/perron/bookings/data'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { InlineCell } from '@/app/prototype/perron/_shared/components/inline-cell'
import { staffOptions } from '@/app/prototype/perron/_shared/components/form-fields'
import { CancelBookingDialog } from '@/app/prototype/perron/bookings/_components/cancel-booking-dialog'
import { BookingDrawer } from '@/app/prototype/perron/bookings/_components/booking-drawer'
import { NEW, recordHref } from '@/app/prototype/perron/_shared/components/record-drawer'
import { CELL, DevNote, IdLink, PageHeader, SortHead, TableFrame, ViewLinks, compareValues, type SortState } from '@/app/prototype/perron/_shared/components/list-parts'

// Bookings — Functional Spec §3.2
// Contract end sits directly next to Check-out date so early move-out and overstay are visible.
// "This week", "this month" and "My task" are filters evaluated on load. They never change data.

type BookingSortKey =
  | 'id' | 'tenant' | 'room' | 'contractStart' | 'contractEnd' | 'checkoutDate' | 'status'
  | 'checkinDate' | 'checkinStaff' | 'checkoutStaff' | 'monthlyRent' | 'depositStatus'

type TabKey = 'all' | BookingStatus | 'checkinsWeek' | 'checkoutsMonth' | 'myTask' | 'depositsHeld'

const C = COPY.labels.booking
const T = BOOKINGS_COPY.tabs
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const DEFAULT_SORT: Record<TabKey, SortState<BookingSortKey>> = {
  all: { key: 'contractStart', dir: 'desc' },
  Upcoming: { key: 'contractStart', dir: 'asc' },
  Active: { key: 'contractEnd', dir: 'asc' },
  Ended: { key: 'contractEnd', dir: 'desc' },
  Cancelled: { key: 'contractStart', dir: 'desc' },
  checkinsWeek: { key: 'checkinDate', dir: 'asc' },
  checkoutsMonth: { key: 'checkoutDate', dir: 'asc' },
  myTask: { key: 'checkinDate', dir: 'asc' },
  depositsHeld: { key: 'contractEnd', dir: 'asc' },
}


export default function BookingsPage() {
  const router = useRouter()
  const store = usePerron()
  const { bookings, currentStaffId, updateBooking } = store
  const [tab, setTab] = React.useState<TabKey>('all')
  const [sort, setSort] = React.useState(DEFAULT_SORT.all)
  const [query, setQuery] = React.useState('')
  const [pendingCancel, setPendingCancel] = React.useState<Booking | null>(null)

  const [weekFrom, weekTo] = weekRange(TODAY)
  const month = TODAY.slice(0, 7)

  const matchesQuery = (b: Booking) => {
    if (!query) return true
    const q = query.toLowerCase()
    return b.id.toLowerCase().includes(q) || (store.tenant(b.tenantId)?.name.toLowerCase().includes(q) ?? false) || (store.room(b.roomId)?.name.toLowerCase().includes(q) ?? false)
  }

  const inTab = (b: Booking, key: TabKey): boolean => {
    switch (key) {
      case 'all': return b.status !== 'Cancelled'
      case 'checkinsWeek': return !!b.checkinDate && b.checkinDate >= weekFrom && b.checkinDate <= weekTo && b.status !== 'Cancelled'
      case 'checkoutsMonth': return b.checkoutDate.startsWith(month) && b.status !== 'Cancelled'
      case 'myTask': return myTask(b, currentStaffId) !== ''
      case 'depositsHeld': return b.depositStatus === 'Held'
      default: return b.status === key
    }
  }

  const searched = bookings.filter(matchesQuery)
  const count = (key: TabKey) => searched.filter((b) => inTab(b, key)).length

  const views = [
    { key: 'all', label: T.all, count: count('all') },
    ...BOOKING_STATUSES.map((s) => ({ key: s, label: s, count: count(s) })),
    { key: 'checkinsWeek', label: T.checkinsWeek, count: count('checkinsWeek') },
    { key: 'checkoutsMonth', label: T.checkoutsMonth, count: count('checkoutsMonth') },
    { key: 'myTask', label: T.myTask, count: count('myTask'), note: <DevNote q="Q28" text={COPY.dev.q28} /> },
    { key: 'depositsHeld', label: T.depositsHeld, count: count('depositsHeld') },
  ]

  const tabHint: Record<TabKey, string> = {
    all: BOOKINGS_COPY.tabHints.all,
    Upcoming: '', Active: '', Ended: '', Cancelled: '',
    checkinsWeek: BOOKINGS_COPY.tabHints.checkinsWeek(formatDate(weekFrom), formatDate(weekTo)),
    checkoutsMonth: BOOKINGS_COPY.tabHints.checkoutsMonth(`${MONTH_NAMES[Number(month.slice(5)) - 1]} ${month.slice(0, 4)}`),
    myTask: BOOKINGS_COPY.tabHints.myTask,
    depositsHeld: BOOKINGS_COPY.tabHints.depositsHeld,
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

  const changeTab = (key: string) => {
    setTab(key as TabKey)
    setSort(DEFAULT_SORT[key as TabKey])
  }

  const save = (b: Booking, patch: Partial<Booking>) => {
    updateBooking(b.id, patch)
    toast.success(COPY.common.saved, { description: store.tenant(b.tenantId)?.name })
  }

  const saveStatus = (b: Booking, v: string) => {
    if (v === 'Cancelled') setPendingCancel(b)
    else save(b, { status: v as BookingStatus })
  }

  const head = { sort, onSort: setSort }
  const options = (list: readonly string[]) => list.map((v) => ({ value: v, label: v }))

  return (
    <div className="flex flex-col gap-4 p-6">
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
        <span className="ml-auto text-sm text-[var(--color-text-secondary)]">{COPY.common.items(visible.length)}</span>
      </div>

      {visible.length === 0 ? (
        <Empty
          title={COPY.common.noResults}
          description={COPY.common.noResultsHint}
          primaryAction={<Button onClick={() => { setQuery(''); changeTab('all') }}>{COPY.common.clearFilters}</Button>}
        />
      ) : (
        <TableFrame>
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead label={C.id} sortKey="id" {...head} />
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
                <HeadWithNote label={C.total} q="Q29" text={COPY.dev.q29} />
                <SortHead label={C.depositStatus} sortKey="depositStatus" {...head} />
                <HeadWithNote label={C.myTask} q="Q28" text={COPY.dev.q28} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((b) => {
                const tenant = store.tenant(b.tenantId)
                const room = store.room(b.roomId)
                return (
                  <TableRow key={b.id}>
                    <TableCell className={CELL}>
                      <IdLink id={b.id} onOpen={() => router.push(recordHref('bookings', b.id))} />
                    </TableCell>
                    <TableCell className={`${CELL} font-medium`}>{tenant?.name}</TableCell>
                    <TableCell className={CELL}>{room?.name}</TableCell>
                    <TableCell className={CELL}>
                      <InlineCell label={C.contractStart} kind="date" value={b.contractStart} display={formatDate(b.contractStart)}
                        onSave={(v) => save(b, { contractStart: v })} />
                    </TableCell>
                    <TableCell className={CELL}>
                      <InlineCell label={C.contractEnd} kind="date" value={b.contractEnd} display={formatDate(b.contractEnd)}
                        onSave={(v) => save(b, { contractEnd: v })} />
                    </TableCell>
                    <TableCell className={CELL}>
                      <InlineCell label={C.checkoutDate} kind="date" value={b.checkoutDate} display={formatDate(b.checkoutDate) || undefined}
                        onSave={(v) => save(b, { checkoutDate: v })} />
                    </TableCell>
                    <TableCell className={CELL}>
                      <InlineCell label={C.status} kind="select" value={b.status} options={options(BOOKING_STATUSES)}
                        onSave={(v) => saveStatus(b, v)} />
                    </TableCell>
                    <TableCell className={CELL}>
                      <InlineCell label={C.checkinDate} kind="date" value={b.checkinDate} display={formatDate(b.checkinDate) || undefined}
                        onSave={(v) => save(b, { checkinDate: v })} />
                    </TableCell>
                    <TableCell className={CELL}>
                      <InlineCell label={C.checkinStaff} kind="select" value={b.checkinStaff} options={staffOptions}
                        display={store.staffName(b.checkinStaff) || undefined}
                        onSave={(v) => save(b, { checkinStaff: v })} />
                    </TableCell>
                    <TableCell className={CELL}>
                      <InlineCell label={C.checkoutStaff} kind="select" value={b.checkoutStaff} options={staffOptions}
                        display={store.staffName(b.checkoutStaff) || undefined}
                        onSave={(v) => save(b, { checkoutStaff: v })} />
                    </TableCell>
                    <TableCell className={CELL}>
                      <InlineCell label={C.monthlyRent} kind="number" value={String(b.monthlyRent)} display={formatMoney(b.monthlyRent)}
                        onSave={(v) => save(b, { monthlyRent: Number(v) })} />
                    </TableCell>
                    <TableCell className={`${CELL} text-[var(--color-text-secondary)]`}>
                      {formatMoney(contractTotal(b))}
                    </TableCell>
                    <TableCell className={CELL}>
                      <InlineCell label={C.depositStatus} kind="select" value={b.depositStatus} options={options(DEPOSIT_STATUSES)}
                        onSave={(v) => save(b, { depositStatus: v as Booking['depositStatus'] })} />
                    </TableCell>
                    <TableCell className={`${CELL} text-[var(--color-text-secondary)]`}>
                      {myTask(b, currentStaffId)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableFrame>
      )}

      <BookingDrawer />

      <CancelBookingDialog
        booking={pendingCancel}
        onKeep={() => setPendingCancel(null)}
        onConfirm={(b) => {
          save(b, { status: 'Cancelled' })
          setPendingCancel(null)
        }}
      />
    </div>
  )
}

function HeadWithNote({ label, q, text }: { label: string; q: string; text: string }) {
  return (
    <TableHead className="whitespace-nowrap px-3">
      <span className="inline-flex items-center gap-1.5">
        {label}
        <DevNote q={q} text={text} />
      </span>
    </TableHead>
  )
}

