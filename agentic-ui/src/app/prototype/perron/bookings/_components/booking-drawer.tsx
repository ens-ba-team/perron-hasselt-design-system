'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ComboboxField } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { BOOKINGS_COPY } from '@/app/prototype/perron/bookings/copy'
import { formatDate, formatMoney, withoutId } from '@/app/prototype/perron/_shared/format'
import { type Booking, type Room } from '@/app/prototype/perron/_shared/types'
import { BOOKING_STATUSES, CONTRACT_TYPES, DEPOSIT_STATUSES, TENANT_CONFIRMED, YES_NO, contractTotal, overlapping } from '@/app/prototype/perron/bookings/data'
import { MoneyValue } from '@/app/prototype/perron/_shared/components/money-value'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { CancelBookingDialog } from '@/app/prototype/perron/bookings/_components/cancel-booking-dialog'
import { ChoiceSelect, DateField, Field, ImageField, asOptions, staffOptions } from '@/app/prototype/perron/_shared/components/form-fields'
import { DevNote } from '@/app/prototype/perron/_shared/components/list-parts'
import { DrawerSection, RecordDrawer, recordHref, useRecordParam } from '@/app/prototype/perron/_shared/components/record-drawer'

// Booking edit screen — Functional Spec §2.3, §5, §7
// Groups are visual only. No tabs, no accordions: nothing hidden.
// Contract dates sit ABOVE the Room field so the confirmed overlap marker can work (BR04).
// Check-in / Check-out dates are never pre-filled from the contract.

const F = BOOKINGS_COPY.form.fields
const P = BOOKINGS_COPY.form.placeholders
const H = BOOKINGS_COPY.form.hints
const E = BOOKINGS_COPY.form.errors

export type BookingDraft = Omit<Booking, 'id'>

export function emptyDraft(roomId = ''): BookingDraft {
  return {
    status: 'Upcoming',
    tenantId: '',
    roomId,
    contractType: '12 months',
    otherContractLength: '',
    contractStart: '',
    contractEnd: '',
    monthlyRent: 0,
    deposit: null,
    depositStatus: 'None',
    depositReturnedDate: '',
    checkinDate: '',
    checkinDone: 'No',
    checkinStaff: '',
    checkinPhotos: '',
    checkinTenantConfirmed: 'Not confirmed',
    checkoutDate: '',
    checkoutDone: 'No',
    checkoutStaff: '',
    checkoutPhotos: '',
    checkoutTenantConfirmed: 'Not confirmed',
    document: '',
    notes: '',
  }
}

// ─── Field helpers (module level: defining them inside the form loses focus) ──



function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <DrawerSection title={title}>{children}</DrawerSection>
}


// ─── Room selector with overlap marker ────────────────────────────────────────

interface RoomChoice {
  room: Room
  marker: string
  pushedDown: boolean
}

function useRoomChoices(start: string, end: string, ignoreId?: string): RoomChoice[] {
  const { rooms, bookings, tenant } = usePerron()
  return React.useMemo(() => {
    const choices = rooms.map((room) => {
      const hits = overlapping(bookings, room.id, start, end, ignoreId)
      const pushedDown = hits.length >= room.maxOccupancy
      let marker = ''
      if (start && end) {
        if (hits.length === 0) marker = BOOKINGS_COPY.form.roomOption.free
        else if (!pushedDown) marker = BOOKINGS_COPY.form.roomOption.oneOfTwo
        else {
          const latest = [...hits].sort((a, b) => b.contractEnd.localeCompare(a.contractEnd))[0]
          marker = BOOKINGS_COPY.form.roomOption.overlaps(tenant(latest.tenantId)?.name ?? '', formatDate(latest.contractEnd))
          if (hits.length > 1) marker += ` ${BOOKINGS_COPY.form.roomOption.overlapsMore(hits.length - 1)}`
        }
      }
      return { room, marker, pushedDown }
    })
    // Marked rooms go to the bottom. Never hidden.
    return choices.sort((a, b) => Number(a.pushedDown) - Number(b.pushedDown) || a.room.name.localeCompare(b.room.name, 'en', { numeric: true }))
  }, [rooms, bookings, tenant, start, end, ignoreId])
}

function RoomSelect({
  value,
  onChange,
  start,
  end,
  ignoreId,
  invalid,
}: {
  value: string
  onChange: (v: string) => void
  start: string
  end: string
  ignoreId?: string
  invalid?: boolean
}) {
  const choices = useRoomChoices(start, end, ignoreId)
  const open = choices.filter((c) => !c.pushedDown)
  const marked = choices.filter((c) => c.pushedDown)
  const selected = choices.find((c) => c.room.id === value)

  const renderItem = (c: RoomChoice) => (
    <SelectItem key={c.room.id} value={c.room.id} textValue={c.room.name}>
      <span className="flex flex-col gap-0.5 py-0.5">
        <span>{c.room.name}</span>
        {c.marker && <span className="text-xs text-[var(--color-text-secondary)]">{c.marker}</span>}
      </span>
    </SelectItem>
  )

  return (
    <div className="flex flex-col gap-1.5">
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id="room" aria-invalid={invalid || undefined}>
          <SelectValue placeholder={P.room}>{selected?.room.name}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-96">
          <SelectGroup>{open.map(renderItem)}</SelectGroup>
          {marked.length > 0 && (
            <SelectGroup>
              <SelectLabel>{BOOKINGS_COPY.form.roomOption.markedGroup}</SelectLabel>
              {marked.map(renderItem)}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
      {selected?.marker && <p className="text-xs text-[var(--color-text-secondary)]">{selected.marker}</p>}
    </div>
  )
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export function BookingForm({ bookingId, initial, onDone }: { bookingId?: string; initial: BookingDraft; onDone: () => void }) {
  const router = useRouter()
  const store = usePerron()
  const [draft, setDraft] = React.useState<BookingDraft>(initial)
  const [submitted, setSubmitted] = React.useState(false)
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [confirmCancel, setConfirmCancel] = React.useState(false)
  const isNew = !bookingId

  const set = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const touch = (key: string) => setTouched((t) => ({ ...t, [key]: true }))
  const show = (key: string) => submitted || touched[key]

  const room = store.room(draft.roomId)
  const tenant = store.tenant(draft.tenantId)

  const errors: Partial<Record<keyof BookingDraft, string>> = {}
  if (!draft.tenantId) errors.tenantId = E.required(F.tenant)
  if (!draft.roomId) errors.roomId = E.required(F.room)
  if (!draft.contractStart) errors.contractStart = E.required(F.contractStart)
  if (!draft.contractEnd) errors.contractEnd = E.required(F.contractEnd)
  else if (draft.contractStart && draft.contractEnd < draft.contractStart) errors.contractEnd = E.endBeforeStart
  if (!draft.monthlyRent) errors.monthlyRent = E.required(F.monthlyRent)
  if (draft.contractType === 'Others' && !draft.otherContractLength.trim()) errors.otherContractLength = E.otherLength
  if (draft.depositStatus === 'Returned' && !draft.depositReturnedDate) errors.depositReturnedDate = E.returnedDate
  const err = (key: keyof BookingDraft) => (show(key) ? errors[key] : undefined)

  const title = room && tenant && draft.contractStart ? `${room.name.split(' – ')[1]} – ${tenant.name} – ${draft.contractStart}` : ''

  const persist = () => {
    if (isNew) {
      store.addBooking(draft)
      toast.success(BOOKINGS_COPY.savedToast, {
        description: BOOKINGS_COPY.savedToastHint,
        action: { label: BOOKINGS_COPY.cancelDialog.goToRoom, onClick: () => router.push(recordHref('rooms', draft.roomId)) },
      })
      onDone()
    } else {
      store.updateBooking(bookingId, draft)
      toast.success(COPY.common.saved, { description: tenant?.name })
      onDone()
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return
    if (!isNew && draft.status === 'Cancelled' && initial.status !== 'Cancelled') {
      setConfirmCancel(true)
      return
    }
    persist()
  }

  return (
    <RecordDrawer
      open
      onClose={onDone}
      title={isNew ? BOOKINGS_COPY.form.newTitle : `${BOOKINGS_COPY.form.editTitle} ${bookingId}`}
      description={isNew ? BOOKINGS_COPY.form.history : BOOKINGS_COPY.form.noDelete}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onDone}>{COPY.common.cancel}</Button>
          <Button type="submit" form="booking-form">{isNew ? BOOKINGS_COPY.form.save : BOOKINGS_COPY.form.update}</Button>
        </>
      }
    >
    <form id="booking-form" onSubmit={submit} noValidate className="flex flex-col">
      <div className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-[11rem_1fr]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bookingId">{BOOKINGS_COPY.form.idField}</Label>
          <Input id="bookingId" readOnly value={bookingId ?? ''} placeholder={BOOKINGS_COPY.form.idPending}
            className="bg-[var(--color-background-muted)] font-mono" title={BOOKINGS_COPY.form.idHint} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title" className="flex items-center gap-2">
            {BOOKINGS_COPY.form.titleField}
            <DevNote q="Title" text={COPY.dev.autoTitle} />
          </Label>
          <Input id="title" readOnly value={title} placeholder={BOOKINGS_COPY.form.titleHint} />
        </div>
      </div>

      <Group title={BOOKINGS_COPY.form.groups.identity}>
        <Field id="status" label={F.status}>
          <ChoiceSelect id="status" value={draft.status} options={asOptions(BOOKING_STATUSES)}
            onChange={(v) => set('status', v as Booking['status'])} />
        </Field>
        <div onBlur={() => touch('tenantId')}>
          <ComboboxField
            id="tenant"
            type="search"
            label={F.tenant}
            placeholder={P.tenant}
            // DS bug: ComboboxField shows `value` in the input, not `label`. Use the name as value
            // and map back to the id until the DS component is fixed.
            options={store.tenants.map((t) => ({ value: t.name, label: t.name }))}
            value={tenant?.name}
            onValueChange={(v) => set('tenantId', store.tenants.find((t) => t.name === v)?.id ?? '')}
            aria-invalid={!!err('tenantId') || undefined}
          />
          {err('tenantId') && <p className="mt-1.5 text-xs text-[var(--color-text-invalid)]">{err('tenantId')}</p>}
        </div>
      </Group>

      <Group title={BOOKINGS_COPY.form.groups.contract}>
        <Field id="contractType" label={F.contractType}>
          <ChoiceSelect id="contractType" value={draft.contractType} options={asOptions(CONTRACT_TYPES)}
            onChange={(v) => set('contractType', v as Booking['contractType'])} />
        </Field>
        {draft.contractType === 'Others' ? (
          <Field id="otherContractLength" label={F.otherContractLength} error={err('otherContractLength')}>
            <Input id="otherContractLength" value={draft.otherContractLength} placeholder={P.otherLength}
              onChange={(e) => set('otherContractLength', e.target.value)} onBlur={() => touch('otherContractLength')}
              aria-invalid={!!err('otherContractLength') || undefined} />
          </Field>
        ) : <div className="hidden sm:block" />}
        <Field id="contractStart" label={F.contractStart} error={err('contractStart')}>
          <DateField id="contractStart" value={draft.contractStart} onChange={(v) => { set('contractStart', v); touch('contractStart') }} />
        </Field>
        <Field id="contractEnd" label={F.contractEnd} error={err('contractEnd')}>
          <DateField id="contractEnd" value={draft.contractEnd} onChange={(v) => { set('contractEnd', v); touch('contractEnd') }} />
        </Field>
        <Field
          id="room"
          className="sm:col-span-2"
          label={F.room}
          hint={!draft.contractStart || !draft.contractEnd ? H.datesFirst : undefined}
          hintBelow
          error={err('roomId')}
        >
          <RoomSelect value={draft.roomId} onChange={(v) => { set('roomId', v); touch('roomId') }}
            start={draft.contractStart} end={draft.contractEnd} ignoreId={bookingId} invalid={!!err('roomId')} />
        </Field>
        <Field id="monthlyRent" label={F.monthlyRent} error={err('monthlyRent')}
          hint={room ? <>{COPY.labels.room.monthlyRent} {room.name}: <MoneyValue value={room.monthlyRent} /></> : undefined}>
          <Input id="monthlyRent" type="number" min={0} value={draft.monthlyRent || ''}
            onChange={(e) => set('monthlyRent', Number(e.target.value))} onBlur={() => touch('monthlyRent')}
            aria-invalid={!!err('monthlyRent') || undefined} />
        </Field>
        <Field id="total" label={F.total} hint={H.total}>
          <Input
            id="total"
            readOnly
            value={formatMoney(contractTotal(draft)) || ''}
            className="bg-[var(--color-background-muted)] font-semibold text-[var(--color-surface-default-foreground)]"
          />
        </Field>
      </Group>

      <Group title={BOOKINGS_COPY.form.groups.deposit}>
        <Field id="deposit" label={F.deposit} hint={H.emptyDeposit}>
          <Input id="deposit" type="number" min={0} value={draft.deposit ?? ''}
            onChange={(e) => set('deposit', e.target.value === '' ? null : Number(e.target.value))} />
        </Field>
        <Field id="depositStatus" label={F.depositStatus}>
          <ChoiceSelect id="depositStatus" value={draft.depositStatus} options={asOptions(DEPOSIT_STATUSES)}
            onChange={(v) => set('depositStatus', v as Booking['depositStatus'])} />
        </Field>
        {draft.depositStatus === 'Returned' && (
          <Field id="depositReturnedDate" label={F.depositReturnedDate} error={err('depositReturnedDate')}>
            <DateField id="depositReturnedDate" value={draft.depositReturnedDate} onChange={(v) => { set('depositReturnedDate', v); touch('depositReturnedDate') }} />
          </Field>
        )}
      </Group>

      <Group title={BOOKINGS_COPY.form.groups.checkin}>
        <Field id="checkinDate" label={F.checkinDate} hint={H.checkinDate}>
          <DateField id="checkinDate" value={draft.checkinDate} onChange={(v) => { set('checkinDate', v); touch('checkinDate') }} />
        </Field>
        <Field id="checkinStaff" label={F.checkinStaff}>
          <ChoiceSelect id="checkinStaff" value={draft.checkinStaff} options={staffOptions} placeholder={P.staff}
            onChange={(v) => set('checkinStaff', v)} />
        </Field>
        <Field id="checkinDone" label={F.checkinDone}>
          <ChoiceSelect id="checkinDone" value={draft.checkinDone} options={asOptions(YES_NO)}
            onChange={(v) => set('checkinDone', v as Booking['checkinDone'])} />
        </Field>
        {draft.checkinDone === 'Yes' ? (
          <>
            <Field id="checkinTenantConfirmed" label={F.checkinTenantConfirmed}>
              <ChoiceSelect id="checkinTenantConfirmed" value={draft.checkinTenantConfirmed} options={asOptions(TENANT_CONFIRMED)}
                onChange={(v) => set('checkinTenantConfirmed', v as Booking['checkinTenantConfirmed'])} />
            </Field>
            <Field id="checkinPhotos" label={F.checkinPhotos} className="sm:col-span-2">
              <ImageField id="checkinPhotos" value={draft.checkinPhotos} onChange={(v) => set('checkinPhotos', v)} />
            </Field>
          </>
        ) : <div className="hidden sm:block" />}
      </Group>

      <Group title={BOOKINGS_COPY.form.groups.checkout}>
        <Field id="checkoutDate" label={F.checkoutDate} hint={H.checkoutDate}>
          <DateField id="checkoutDate" value={draft.checkoutDate} onChange={(v) => { set('checkoutDate', v); touch('checkoutDate') }} />
        </Field>
        <Field id="checkoutStaff" label={F.checkoutStaff}>
          <ChoiceSelect id="checkoutStaff" value={draft.checkoutStaff} options={staffOptions} placeholder={P.staff}
            onChange={(v) => set('checkoutStaff', v)} />
        </Field>
        <Field id="checkoutDone" label={F.checkoutDone}>
          <ChoiceSelect id="checkoutDone" value={draft.checkoutDone} options={asOptions(YES_NO)}
            onChange={(v) => set('checkoutDone', v as Booking['checkoutDone'])} />
        </Field>
        {draft.checkoutDone === 'Yes' ? (
          <>
            <Field id="checkoutTenantConfirmed" label={F.checkoutTenantConfirmed}>
              <ChoiceSelect id="checkoutTenantConfirmed" value={draft.checkoutTenantConfirmed} options={asOptions(TENANT_CONFIRMED)}
                onChange={(v) => set('checkoutTenantConfirmed', v as Booking['checkoutTenantConfirmed'])} />
            </Field>
            <Field id="checkoutPhotos" label={F.checkoutPhotos} className="sm:col-span-2">
              <ImageField id="checkoutPhotos" value={draft.checkoutPhotos} onChange={(v) => set('checkoutPhotos', v)} />
            </Field>
          </>
        ) : <div className="hidden sm:block" />}
      </Group>

      <Group title={BOOKINGS_COPY.form.groups.other}>
        <Field id="document" label={F.document} className="sm:col-span-2">
          <Input id="document" type="url" value={draft.document} placeholder={P.drive} onChange={(e) => set('document', e.target.value)} />
        </Field>
        <Field id="notes" label={F.notes} className="sm:col-span-2">
          <Textarea id="notes" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </Group>

      <CancelBookingDialog
        booking={confirmCancel && bookingId ? { ...draft, id: bookingId } : null}
        onKeep={() => setConfirmCancel(false)}
        onConfirm={() => {
          setConfirmCancel(false)
          persist()
        }}
      />
    </form>
    </RecordDrawer>
  )
}

// Mounted on the Bookings list. Opens from ?record=<Booking ID> or ?record=new[&room=<id>].
export function BookingDrawer() {
  const { record, isNew, param, close } = useRecordParam()
  const { bookings } = usePerron()
  if (!record) return null
  if (isNew) return <BookingForm key="new" initial={emptyDraft(param('room') ?? '')} onDone={close} />
  const booking = bookings.find((b) => b.id === record)
  if (!booking) return null
  return <BookingForm key={record} bookingId={record} initial={withoutId(booking)} onDone={close} />
}
