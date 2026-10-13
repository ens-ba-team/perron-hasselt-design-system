'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Building01, CalendarCheck01, File02, Plus, Tool02 } from '@untitledui/icons'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { CreatableSelect, DateField, Field } from '@/app/prototype/perron/_shared/components/form-fields'
import { FormSection, RequiredLabel } from '@/app/prototype/perron/_shared/components/form-section'
import { ROOMS_COPY } from '@/app/prototype/perron/rooms/copy'
import { TODAY, formatDate, withoutId } from '@/app/prototype/perron/_shared/format'
import { type Room } from '@/app/prototype/perron/_shared/types'
import { BUILDINGS, ROOM_STATUSES, ROOM_TYPES } from '@/app/prototype/perron/rooms/data'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { RecordAccordion } from '@/app/prototype/perron/_shared/components/record-accordion'
import { NEW, RecordDrawer, RecordMetaCard, listHref, useRecordParam } from '@/app/prototype/perron/_shared/components/record-drawer'
import { StatusBadge } from '@/app/prototype/perron/_shared/components/status-badge'
import { MoneyValue } from '@/app/prototype/perron/_shared/components/money-value'
import { BookingForm, emptyDraft } from '@/app/prototype/perron/bookings/_components/booking-drawer'
import { MaintenanceForm } from '@/app/prototype/perron/maintenance/_components/maintenance-drawer'

// Room record. This is where the admin works out Available from by hand (BR01, BR02):
// the quick reference card and the room's own bookings sit right next to the field.
// Nothing here is computed from the bookings.

const C = COPY.labels.room
const R = ROOMS_COPY.reference
const BC = COPY.labels.booking
const MC = COPY.labels.maintenance

function SelectField({ id, label, value, options, onChange }: {
  id: string; label: React.ReactNode; value: string; options: readonly string[]; onChange: (v: string) => void
}) {
  return (
    <Field id={id} label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
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

function RelatedEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] p-[var(--spacing-component-lg)] text-center text-sm text-[var(--color-text-secondary)]">
      {children}
    </p>
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
  const [notesOpen, setNotesOpen] = React.useState(Boolean(room.notes))
  const [childBookingId, setChildBookingId] = React.useState<string | null>(null)
  const [childMaintenanceId, setChildMaintenanceId] = React.useState<string | null>(null)
  const set = <K extends keyof Room>(k: K, v: Room[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const dirty = JSON.stringify(draft) !== JSON.stringify(room)

  const roomBookings = store.bookings
    .filter((b) => b.roomId === room.id)
    .sort((a, b) => {
      const live = (s: string) => (s === 'Upcoming' || s === 'Active' ? 0 : 1)
      return live(a.status) - live(b.status) || b.contractEnd.localeCompare(a.contractEnd)
    })
  const roomMaintenance = store.maintenance.filter((m) => m.roomId === room.id)
  const childBooking = childBookingId && childBookingId !== NEW
    ? store.bookings.find((booking) => booking.id === childBookingId)
    : undefined
  const childMaintenance = childMaintenanceId
    ? store.maintenance.find((item) => item.id === childMaintenanceId)
    : undefined
  // Buildings come from the rooms themselves, so a building added on one room is offered on the next.
  const buildings = [...new Set([...BUILDINGS, ...store.rooms.map((r) => r.building)])]
  const addBooking = () => setChildBookingId(NEW)

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
    <>
    <RecordDrawer
      open
      onClose={onDone}
      title={isNew ? ROOMS_COPY.newTitle : `${ROOMS_COPY.editTitle} ${room.id}`}
      description={isNew ? undefined : `${room.building} · ${room.type} · ${C.maxOccupancy} ${room.maxOccupancy}`}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onDone}>{COPY.common.cancel}</Button>
          <Button type="submit" form="room-form" disabled={!dirty}>{COPY.common.save}</Button>
        </>
      }
    >
      <form id="room-form" onSubmit={save} noValidate className="flex flex-col">
        <RecordMetaCard
          label={ROOMS_COPY.detail.idField}
          description={ROOMS_COPY.detail.idHint}
          value={room.id || ROOMS_COPY.detail.idPending}
        />

        <FormSection
          id="room-details"
          icon={<Building01 />}
          title={ROOMS_COPY.detail.fields}
          requirement="required-now"
          description={ROOMS_COPY.detail.fieldsDescription}
        >
          <Field id="name" className="sm:col-span-2" label={<RequiredLabel>{C.name}</RequiredLabel>} error={nameError}>
            <Input id="name" value={draft.name} placeholder="P19 – 2.05" onChange={(e) => set('name', e.target.value)}
              aria-invalid={!!nameError || undefined} />
          </Field>
          <Field
            id="building"
            className="sm:col-span-2"
            label={<RequiredLabel>{C.building}</RequiredLabel>}
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
          <Field id="floor" label={<RequiredLabel>{C.floor}</RequiredLabel>}>
            <Input id="floor" type="number" value={draft.floor} onChange={(e) => set('floor', Number(e.target.value))} />
          </Field>
          <SelectField id="type" label={<RequiredLabel>{C.type}</RequiredLabel>} value={draft.type} options={ROOM_TYPES}
            onChange={(v) => set('type', v as Room['type'])} />
          <SelectField id="maxOccupancy" label={<RequiredLabel>{C.maxOccupancy}</RequiredLabel>} value={String(draft.maxOccupancy)} options={['1', '2']}
            onChange={(v) => set('maxOccupancy', Number(v) as 1 | 2)} />
          <Field id="monthlyRent" label={<RequiredLabel>{C.monthlyRent} (€)</RequiredLabel>}>
            <Input id="monthlyRent" type="number" value={draft.monthlyRent} onChange={(e) => set('monthlyRent', Number(e.target.value))} />
          </Field>
        </FormSection>

        <FormSection
          id="room-availability"
          icon={<CalendarCheck01 />}
          title={ROOMS_COPY.detail.availability}
          requirement="required-now"
          description={ROOMS_COPY.detail.availabilityDescription}
        >
          <SelectField id="status" label={<RequiredLabel>{C.status}</RequiredLabel>} value={draft.status} options={ROOM_STATUSES}
            onChange={(v) => set('status', v as Room['status'])} />
          <Field id="availableFrom" label={<RequiredLabel>{C.availableFrom}</RequiredLabel>}>
            <DateField id="availableFrom" value={draft.availableFrom} onChange={(v) => set('availableFrom', v)} />
          </Field>
          <ReferenceCard />
        </FormSection>

        <FormSection
          id="room-notes"
          icon={<File02 />}
          title={ROOMS_COPY.detail.notes}
          requirement="optional"
          collapsible
          open={notesOpen}
          onOpenChange={setNotesOpen}
        >
          <Field id="notes" label={ROOMS_COPY.detail.notes} className="sm:col-span-2">
            <Textarea id="notes" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
          </Field>
        </FormSection>
      </form>

      {!isNew && (
        <>
          <FormSection
            id="room-bookings"
            icon={<CalendarCheck01 />}
            title={`${ROOMS_COPY.detail.bookings} (${roomBookings.length})`}
            description={ROOMS_COPY.detail.bookingsHint}
            className="sm:grid-cols-1"
            action={
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 py-1"
                onClick={() => router.push(listHref('bookings', { room: room.id }))}
              >
                {COPY.common.history}
                <ArrowUpRight />
              </Button>
            }
          >
            <Button type="button" size="sm" variant="outline" className="w-fit" onClick={addBooking}>
              <Plus />
              {ROOMS_COPY.detail.addBooking}
            </Button>
            {roomBookings.length === 0 ? (
              <RelatedEmptyState>{ROOMS_COPY.detail.noBookings}</RelatedEmptyState>
            ) : (
              <RecordAccordion
                items={roomBookings.map((b) => ({
                  id: b.id,
                  onOpen: () => setChildBookingId(b.id),
                  title: store.tenant(b.tenantId)?.name ?? '',
                  status: <StatusBadge value={b.status} />,
                  secondary: <span>{BC.contractEnd} {formatDate(b.contractEnd)}</span>,
                  details: [
                    [BC.contractStart, formatDate(b.contractStart)],
                    [BC.contractEnd, formatDate(b.contractEnd)],
                    [BC.checkoutDate, formatDate(b.checkoutDate) || COPY.common.none],
                    [ROOMS_COPY.detail.checkoutDone, <StatusBadge key="checkout" value={b.checkoutDone} />],
                    [BC.monthlyRent, <MoneyValue key="rent" value={b.monthlyRent} />],
                    [BC.depositStatus, <StatusBadge key="deposit" value={b.depositStatus} />],
                  ],
                }))}
              />
            )}
          </FormSection>

          <FormSection
            id="room-maintenance"
            icon={<Tool02 />}
            title={`${ROOMS_COPY.detail.maintenance} (${roomMaintenance.length})`}
            description={ROOMS_COPY.detail.maintenanceHint}
            className="sm:grid-cols-1"
            action={
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 py-1"
                onClick={() => router.push(listHref('maintenance', { room: room.id }))}
              >
                {COPY.common.history}
                <ArrowUpRight />
              </Button>
            }
          >
            {roomMaintenance.length === 0 ? (
              <RelatedEmptyState>{ROOMS_COPY.detail.noMaintenance}</RelatedEmptyState>
            ) : (
              <RecordAccordion
                items={roomMaintenance.map((m) => ({
                  id: m.id,
                  onOpen: () => setChildMaintenanceId(m.id),
                  title: m.issue,
                  status: <StatusBadge value={m.status} />,
                  secondary: <span>{MC.reportedDate} {formatDate(m.reportedDate)}</span>,
                  details: [
                    [MC.reportedDate, formatDate(m.reportedDate)],
                    [MC.assignedStaff, store.staffName(m.assignedStaff) || COPY.common.none],
                    [MC.status, <StatusBadge key="status" value={m.status} />],
                  ],
                }))}
              />
            )}
          </FormSection>
        </>
      )}
    </RecordDrawer>
    {childBookingId === NEW && (
      <BookingForm key="room-new-booking" initial={emptyDraft(room.id)} onDone={() => setChildBookingId(null)} />
    )}
    {childBooking && (
      <BookingForm
        key={childBooking.id}
        bookingId={childBooking.id}
        initial={withoutId(childBooking)}
        onDone={() => setChildBookingId(null)}
      />
    )}
    {childMaintenance && (
      <MaintenanceForm
        key={childMaintenance.id}
        id={childMaintenance.id}
        initial={withoutId(childMaintenance)}
        onDone={() => setChildMaintenanceId(null)}
      />
    )}
    </>
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
