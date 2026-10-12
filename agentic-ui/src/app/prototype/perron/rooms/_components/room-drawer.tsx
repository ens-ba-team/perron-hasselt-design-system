'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from '@untitledui/icons'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { CreatableSelect, DateField, Field } from '@/app/prototype/perron/_shared/components/form-fields'
import { ROOMS_COPY } from '@/app/prototype/perron/rooms/copy'
import { TODAY, formatDate, formatMoney, withoutId } from '@/app/prototype/perron/_shared/format'
import { type Room } from '@/app/prototype/perron/_shared/types'
import { BUILDINGS, ROOM_STATUSES, ROOM_TYPES } from '@/app/prototype/perron/rooms/data'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { RecordAccordion } from '@/app/prototype/perron/_shared/components/record-accordion'
import { DrawerSection, NEW, RecordDrawer, recordHref, useRecordParam } from '@/app/prototype/perron/_shared/components/record-drawer'

// Room record. This is where the admin works out Available from by hand (BR01, BR02):
// the quick reference card and the room's own bookings sit right next to the field.
// Nothing here is computed from the bookings.

const C = COPY.labels.room
const R = ROOMS_COPY.reference
const BC = COPY.labels.booking
const MC = COPY.labels.maintenance

function SelectField({ id, label, value, options, onChange }: {
  id: string; label: string; value: string; options: readonly string[]; onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

function ReferenceCard() {
  return (
    <Card className="sm:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm">{R.title}</CardTitle>
        <CardDescription>{R.intro}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <ol className="flex list-decimal flex-col gap-1 pl-5">
          <li>{R.step1}</li>
          <li>{R.step2one}</li>
          <li>{R.step2two}</li>
        </ol>
        <p className="font-medium">{R.rule}</p>
      </CardContent>
    </Card>
  )
}

// A new room: the admin fills every field. Status starts Available, Available from today.
function emptyRoom(): Room {
  return { id: '', name: '', building: 'Perron 19', floor: 0, type: 'Standard room', maxOccupancy: 1, monthlyRent: 0, status: 'Available', availableFrom: TODAY, notes: '' }
}

function RoomRecord({ room, onDone }: { room: Room; onDone: () => void }) {
  const isNew = !room.id
  const [submitted, setSubmitted] = React.useState(false)
  const router = useRouter()
  const store = usePerron()
  const [draft, setDraft] = React.useState(room)
  const set = <K extends keyof Room>(k: K, v: Room[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const dirty = JSON.stringify(draft) !== JSON.stringify(room)

  const roomBookings = store.bookings
    .filter((b) => b.roomId === room.id)
    .sort((a, b) => {
      const live = (s: string) => (s === 'Upcoming' || s === 'Active' ? 0 : 1)
      return live(a.status) - live(b.status) || b.contractEnd.localeCompare(a.contractEnd)
    })
  const roomMaintenance = store.maintenance.filter((m) => m.roomId === room.id)
  // Buildings come from the rooms themselves, so a building added on one room is offered on the next.
  const buildings = [...new Set([...BUILDINGS, ...store.rooms.map((r) => r.building)])]
  const addBooking = () => router.push(recordHref('bookings', NEW, { room: room.id }))

  const nameError = submitted && !draft.name.trim() ? COPY.common.required(C.name) : undefined

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!draft.name.trim()) return
    if (isNew) store.addRoom(withoutId(draft))
    else store.updateRoom(room.id, draft)
    toast.success(COPY.common.saved, { description: draft.name })
    onDone()
  }

  return (
    <RecordDrawer
      open
      onClose={onDone}
      title={isNew ? ROOMS_COPY.newTitle : `${room.id} · ${room.name}`}
      description={isNew ? undefined : `${room.building} · ${room.type} · ${C.maxOccupancy} ${room.maxOccupancy}`}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onDone}>{COPY.common.cancel}</Button>
          <Button type="submit" form="room-form" disabled={!dirty}>{COPY.common.save}</Button>
        </>
      }
    >
      <form id="room-form" onSubmit={save} noValidate>
        <DrawerSection title={ROOMS_COPY.detail.fields}>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="name">{C.name}</Label>
            <Input id="name" value={draft.name} placeholder="P19 – 2.05" onChange={(e) => set('name', e.target.value)}
              aria-invalid={!!nameError || undefined} />
            {nameError && <p className="text-xs text-[var(--color-text-invalid)]">{nameError}</p>}
          </div>
          <SelectField id="status" label={C.status} value={draft.status} options={ROOM_STATUSES}
            onChange={(v) => set('status', v as Room['status'])} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="availableFrom">{C.availableFrom}</Label>
            <DateField id="availableFrom" value={draft.availableFrom} onChange={(v) => set('availableFrom', v)} />
          </div>
          <ReferenceCard />
          <Field
            id="building"
            label={C.building}
            hint={ROOMS_COPY.detail.buildingHint}
          >
            <CreatableSelect
              id="building"
              value={draft.building}
              options={buildings}
              onChange={(v) => set('building', v as Room['building'])}
              addLabel={ROOMS_COPY.detail.addBuilding}
              newPlaceholder={ROOMS_COPY.detail.newBuildingPlaceholder}
            />
          </Field>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="floor">{C.floor}</Label>
            <Input id="floor" type="number" value={draft.floor} onChange={(e) => set('floor', Number(e.target.value))} />
          </div>
          <SelectField id="type" label={C.type} value={draft.type} options={ROOM_TYPES}
            onChange={(v) => set('type', v as Room['type'])} />
          <SelectField id="maxOccupancy" label={C.maxOccupancy} value={String(draft.maxOccupancy)} options={['1', '2']}
            onChange={(v) => set('maxOccupancy', Number(v) as 1 | 2)} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="monthlyRent">{C.monthlyRent} (€)</Label>
            <Input id="monthlyRent" type="number" value={draft.monthlyRent} onChange={(e) => set('monthlyRent', Number(e.target.value))} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="notes">{ROOMS_COPY.detail.notes}</Label>
            <Textarea id="notes" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </DrawerSection>
      </form>

      {!isNew && (
        <>
          <DrawerSection
            title={`${ROOMS_COPY.detail.bookings} (${roomBookings.length})`}
            description={ROOMS_COPY.detail.bookingsHint}
            className="sm:grid-cols-1"
          >
            <Button type="button" size="sm" variant="outline" className="w-fit" onClick={addBooking}>
              <Plus />
              {ROOMS_COPY.detail.addBooking}
            </Button>
            {roomBookings.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">{ROOMS_COPY.detail.noBookings}</p>
            ) : (
              <RecordAccordion
                items={roomBookings.map((b) => ({
                  id: b.id,
                  href: recordHref('bookings', b.id),
                  title: store.tenant(b.tenantId)?.name ?? '',
                  meta: `${b.status} · ${BC.contractEnd} ${formatDate(b.contractEnd)}`,
                  details: [
                    [BC.contractStart, formatDate(b.contractStart)],
                    [BC.contractEnd, formatDate(b.contractEnd)],
                    [BC.checkoutDate, formatDate(b.checkoutDate) || COPY.common.none],
                    [ROOMS_COPY.detail.checkoutDone, b.checkoutDone],
                    [BC.monthlyRent, formatMoney(b.monthlyRent)],
                    [BC.depositStatus, b.depositStatus],
                  ],
                }))}
              />
            )}
          </DrawerSection>

          <DrawerSection title={`${ROOMS_COPY.detail.maintenance} (${roomMaintenance.length})`} className="sm:grid-cols-1">
            {roomMaintenance.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">{ROOMS_COPY.detail.noMaintenance}</p>
            ) : (
              <RecordAccordion
                items={roomMaintenance.map((m) => ({
                  id: m.id,
                  href: recordHref('maintenance', m.id),
                  title: m.issue,
                  meta: m.status,
                  details: [
                    [MC.reportedDate, formatDate(m.reportedDate)],
                    [MC.assignedStaff, store.staffName(m.assignedStaff) || COPY.common.none],
                    [MC.status, m.status],
                  ],
                }))}
              />
            )}
          </DrawerSection>
        </>
      )}
    </RecordDrawer>
  )
}

// Mounted on the Rooms list. Rooms are a fixed set of 41, so there is no create.
export function RoomDrawer() {
  const { record, close } = useRecordParam()
  const { isNew } = useRecordParam()
  const room = usePerron().room(record ?? '')
  if (isNew) return <RoomRecord key="new" room={emptyRoom()} onDone={close} />
  if (!room) return null
  return <RoomRecord key={JSON.stringify(room)} room={room} onDone={close} />
}
