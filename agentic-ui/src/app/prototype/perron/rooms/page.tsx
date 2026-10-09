'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, SearchLg } from '@untitledui/icons'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { ListPagination, usePaged } from '@/app/prototype/perron/_shared/components/list-pagination'
import { ROOMS_COPY } from '@/app/prototype/perron/rooms/copy'
import { formatDate, formatMoney } from '@/app/prototype/perron/_shared/format'
import { type Room } from '@/app/prototype/perron/_shared/types'
import { BUILDINGS, ROOM_STATUSES, ROOM_TYPES } from '@/app/prototype/perron/rooms/data'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { InlineCell } from '@/app/prototype/perron/_shared/components/inline-cell'
import { NEW, recordHref } from '@/app/prototype/perron/_shared/components/record-drawer'
import { RoomDrawer } from '@/app/prototype/perron/rooms/_components/room-drawer'
import { CELL, DevNote, IdLink, PageHeader, SortHead, TableFrame, ViewLinks, compareValues, type SortState } from '@/app/prototype/perron/_shared/components/list-parts'

// Rooms — Functional Spec §3.1
// Default: all rooms, sorted by Available from ascending. No status filter by default:
// filtering hides rows, sorting does not. Room status sits directly left of Available from.

type RoomSortKey = 'id' | 'name' | 'building' | 'floor' | 'type' | 'maxOccupancy' | 'status' | 'availableFrom' | 'monthlyRent'

const ALL = 'all'
const C = COPY.labels.room

export default function RoomsPage() {
  const router = useRouter()
  const { rooms, maintenance, updateRoom } = usePerron()
  const [view, setView] = React.useState(ALL)
  const [building, setBuilding] = React.useState(ALL)
  const [type, setType] = React.useState(ALL)
  const [query, setQuery] = React.useState('')
  const [sort, setSort] = React.useState<SortState<RoomSortKey>>({ key: 'availableFrom', dir: 'asc' })

  const openCount = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of maintenance) if (m.status !== 'Done') counts.set(m.roomId, (counts.get(m.roomId) ?? 0) + 1)
    return counts
  }, [maintenance])

  const filteredExceptView = rooms.filter(
    (r) =>
      (building === ALL || r.building === building) &&
      (type === ALL || r.type === type) &&
      (!query || r.name.toLowerCase().includes(query.toLowerCase())),
  )

  const views = [
    { key: ALL, label: COPY.common.all, count: filteredExceptView.length },
    ...ROOM_STATUSES.map((s) => ({ key: s, label: s, count: filteredExceptView.filter((r) => r.status === s).length })),
  ]

  const visible = filteredExceptView
    .filter((r) => view === ALL || r.status === view)
    .sort((a, b) => compareValues(a[sort.key], b[sort.key], sort.dir) || compareValues(a.name, b.name, 'asc'))
  const paged = usePaged(visible, `${view}|${building}|${type}|${query}|${sort.key}-${sort.dir}`)

  const save = (r: Room, patch: Partial<Room>) => {
    updateRoom(r.id, patch)
    toast.success(COPY.common.saved, { description: r.name })
  }

  const clearFilters = () => {
    setBuilding(ALL)
    setType(ALL)
    setQuery('')
    setView(ALL)
  }

  const head = { sort, onSort: setSort }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title={ROOMS_COPY.title}
        description={ROOMS_COPY.description}
        action={
          <Button size="sm" onClick={() => router.push(recordHref('rooms', NEW))}>
            <Plus />
            {ROOMS_COPY.add}
          </Button>
        }
      />

      <ViewLinks views={views} active={view} onChange={setView} />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={building} onValueChange={setBuilding}>
          <SelectTrigger className="w-40" aria-label={C.building}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{COPY.common.allBuildings}</SelectItem>
            {BUILDINGS.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40" aria-label={C.type}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{COPY.common.allTypes}</SelectItem>
            {ROOM_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative ml-auto w-64">
          <SearchLg className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-icon-muted)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ROOMS_COPY.searchPlaceholder}
            aria-label={COPY.common.search}
            className="pl-9"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <Empty
          title={COPY.common.noResults}
          description={COPY.common.noResultsHint}
          primaryAction={<Button onClick={clearFilters}>{COPY.common.clearFilters}</Button>}
        />
      ) : (
        <TableFrame>
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead label={C.id} sortKey="id" {...head} />
                <SortHead label={C.name} sortKey="name" {...head} />
                <SortHead label={C.building} sortKey="building" {...head} />
                <SortHead label={C.floor} sortKey="floor" {...head} />
                <SortHead label={C.type} sortKey="type" {...head} />
                <SortHead label={C.maxOccupancy} sortKey="maxOccupancy" {...head} />
                <SortHead label={C.status} sortKey="status" {...head} />
                <SortHead label={C.availableFrom} sortKey="availableFrom" {...head} />
                <SortHead label={C.monthlyRent} sortKey="monthlyRent" {...head} />
                <TableHead className="whitespace-nowrap px-3">
                  <span className="inline-flex items-center gap-1.5">
                    {C.openMaintenance}
                    <DevNote q="Q30" text={COPY.dev.q30} />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.pageItems.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className={CELL}>
                    <IdLink id={r.id} onOpen={() => router.push(recordHref('rooms', r.id))} />
                  </TableCell>
                  <TableCell className={`${CELL} font-medium`}>{r.name}</TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.building} kind="select" value={r.building}
                      options={BUILDINGS.map((v) => ({ value: v, label: v }))}
                      onSave={(v) => save(r, { building: v as Room['building'] })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.floor} kind="number" value={String(r.floor)}
                      onSave={(v) => save(r, { floor: Number(v) })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.type} kind="select" value={r.type}
                      options={ROOM_TYPES.map((v) => ({ value: v, label: v }))}
                      onSave={(v) => save(r, { type: v as Room['type'] })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.maxOccupancy} kind="select" value={String(r.maxOccupancy)}
                      options={[{ value: '1', label: '1' }, { value: '2', label: '2' }]}
                      onSave={(v) => save(r, { maxOccupancy: Number(v) as 1 | 2 })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.status} kind="select" value={r.status}
                      options={ROOM_STATUSES.map((v) => ({ value: v, label: v }))}
                      onSave={(v) => save(r, { status: v as Room['status'] })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.availableFrom} kind="date" value={r.availableFrom}
                      display={formatDate(r.availableFrom)}
                      onSave={(v) => save(r, { availableFrom: v })} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <InlineCell label={C.monthlyRent} kind="number" value={String(r.monthlyRent)}
                      display={formatMoney(r.monthlyRent)}
                      onSave={(v) => save(r, { monthlyRent: Number(v) })} />
                  </TableCell>
                  <TableCell className={`${CELL} text-[var(--color-text-secondary)]`}>
                    {openCount.get(r.id) ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableFrame>
      )}

      {visible.length > 0 && <ListPagination {...paged} />}

      <RoomDrawer />
    </div>
  )
}
