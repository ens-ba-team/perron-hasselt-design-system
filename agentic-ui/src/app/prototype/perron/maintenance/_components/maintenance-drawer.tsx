'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { DateField } from '@/app/prototype/perron/_shared/components/form-fields'
import { MAINTENANCE_COPY } from '@/app/prototype/perron/maintenance/copy'
import { STAFF, TODAY, withoutId } from '@/app/prototype/perron/_shared/format'
import { type Maintenance } from '@/app/prototype/perron/_shared/types'
import { MAINTENANCE_STATUSES } from '@/app/prototype/perron/maintenance/data'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { DrawerSection, RecordDrawer, useRecordParam } from '@/app/prototype/perron/_shared/components/record-drawer'

// Maintenance record — Functional Spec §2.4.
// Reported date defaults to today: a form default, not automation. No link to booking or tenant (BR26).

const C = COPY.labels.maintenance
const NONE = '__none'

export function MaintenanceForm({ id, initial, onDone }: { id?: string; initial: Omit<Maintenance, 'id'>; onDone: () => void }) {
  const { rooms, addMaintenance, updateMaintenance } = usePerron()
  const [draft, setDraft] = React.useState(initial)
  const [submitted, setSubmitted] = React.useState(false)
  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const roomError = submitted && !draft.roomId ? COPY.common.required(C.room) : undefined
  const issueError = submitted && !draft.issue.trim() ? COPY.common.required(C.issue) : undefined
  const sortedRooms = [...rooms].sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!draft.roomId || !draft.issue.trim()) return
    if (id) updateMaintenance(id, draft)
    else addMaintenance(draft)
    toast.success(MAINTENANCE_COPY.savedToast, { description: draft.issue })
    onDone()
  }

  return (
    <RecordDrawer
      open
      onClose={onDone}
      title={id ? `${id} · ${initial.issue}` : MAINTENANCE_COPY.newTitle}
      description={MAINTENANCE_COPY.noBlocking}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onDone}>{COPY.common.cancel}</Button>
          <Button type="submit" form="maintenance-form">{MAINTENANCE_COPY.save}</Button>
        </>
      }
    >
      <form id="maintenance-form" onSubmit={submit} noValidate>
        <DrawerSection title={MAINTENANCE_COPY.title}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="room">{C.room}</Label>
            <Select value={draft.roomId || undefined} onValueChange={(v) => set('roomId', v)}>
              <SelectTrigger id="room" aria-invalid={!!roomError || undefined}>
                <SelectValue placeholder={COPY.common.selectRoom} />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {sortedRooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {roomError && <p className="text-xs text-[var(--color-text-invalid)]">{roomError}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reportedDate">{C.reportedDate}</Label>
            <DateField id="reportedDate" value={draft.reportedDate} onChange={(v) => set('reportedDate', v)} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="issue">{C.issue}</Label>
            <Input id="issue" value={draft.issue} placeholder={MAINTENANCE_COPY.newIssuePlaceholder}
              onChange={(e) => set('issue', e.target.value)} aria-invalid={!!issueError || undefined} />
            {issueError && <p className="text-xs text-[var(--color-text-invalid)]">{issueError}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assignedStaff">{C.assignedStaff}</Label>
            <Select value={draft.assignedStaff || NONE} onValueChange={(v) => set('assignedStaff', v === NONE ? '' : v)}>
              <SelectTrigger id="assignedStaff"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{COPY.common.notSet}</SelectItem>
                {STAFF.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">{C.status}</Label>
            <Select value={draft.status} onValueChange={(v) => set('status', v as Maintenance['status'])}>
              <SelectTrigger id="status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MAINTENANCE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="notes">{COPY.common.notes}</Label>
            <Textarea id="notes" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </DrawerSection>
      </form>
    </RecordDrawer>
  )
}

// Mounted on the Maintenance list. ?record=<issue id> or ?record=new[&room=<id>]
export function MaintenanceDrawer() {
  const { record, isNew, param, close } = useRecordParam()
  const { maintenance } = usePerron()
  if (isNew) {
    const initial = { roomId: param('room') ?? '', issue: '', reportedDate: TODAY, assignedStaff: '', status: 'Open' as const, notes: '' }
    return <MaintenanceForm key="new" initial={initial} onDone={close} />
  }
  const item = maintenance.find((m) => m.id === record)
  if (!item) return null
  return <MaintenanceForm key={item.id} id={item.id} initial={withoutId(item)} onDone={close} />
}
