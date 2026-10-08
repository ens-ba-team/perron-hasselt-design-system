'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { TENANTS_COPY } from '@/app/prototype/perron/tenants/copy'
import { formatDate, withoutId } from '@/app/prototype/perron/_shared/format'
import { type Tenant } from '@/app/prototype/perron/_shared/types'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { CELL, IdLink, TableFrame } from '@/app/prototype/perron/_shared/components/list-parts'
import { DrawerSection, RecordDrawer, recordHref, useRecordParam } from '@/app/prototype/perron/_shared/components/record-drawer'

// Tenant record — Functional Spec §2.2, §3.3.
// Booking history is read from the bookings (reverse relationship), never stored on the tenant.

const C = COPY.labels.tenant
const EMPTY: Omit<Tenant, 'id'> = { name: '', phone: '', email: '', university: '', erasmus: false }

function TenantForm({ tenantId, initial, onDone }: { tenantId?: string; initial: Omit<Tenant, 'id'>; onDone: () => void }) {
  const router = useRouter()
  const store = usePerron()
  const [draft, setDraft] = React.useState(initial)
  const [touched, setTouched] = React.useState(false)
  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const nameError = touched && !draft.name.trim() ? COPY.common.required(C.name) : undefined

  const history = tenantId
    ? store.bookings.filter((b) => b.tenantId === tenantId).sort((a, b) => b.contractStart.localeCompare(a.contractStart))
    : []

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!draft.name.trim()) return
    if (tenantId) store.updateTenant(tenantId, draft)
    else store.addTenant(draft)
    toast.success(COPY.common.saved, { description: draft.name })
    onDone()
  }

  return (
    <RecordDrawer
      open
      onClose={onDone}
      title={tenantId ? `${tenantId} · ${initial.name}` : TENANTS_COPY.add}
      description={TENANTS_COPY.idDocs}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onDone}>{COPY.common.cancel}</Button>
          <Button type="submit" form="tenant-form">{COPY.common.save}</Button>
        </>
      }
    >
      <form id="tenant-form" onSubmit={submit} noValidate>
        <DrawerSection title={COPY.nav.tenants}>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="name">{C.name}</Label>
            <Input id="name" value={draft.name} onChange={(e) => set('name', e.target.value)} onBlur={() => setTouched(true)}
              aria-invalid={!!nameError || undefined} />
            {nameError && <p className="text-xs text-[var(--color-text-invalid)]">{nameError}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">{C.phone}</Label>
            <Input id="phone" type="tel" value={draft.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{C.email}</Label>
            <Input id="email" type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="university">{C.university}</Label>
            <Input id="university" value={draft.university} onChange={(e) => set('university', e.target.value)} />
          </div>
          <div className="flex items-center gap-3 self-end pb-2">
            <Switch id="erasmus" checked={draft.erasmus} onCheckedChange={(v) => set('erasmus', v)} />
            <Label htmlFor="erasmus">{C.erasmus}</Label>
          </div>
        </DrawerSection>
      </form>

      {tenantId && (
        <DrawerSection title={TENANTS_COPY.history} description={TENANTS_COPY.historyHint} className="sm:grid-cols-1">
          {history.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">{TENANTS_COPY.noHistory}</p>
          ) : (
            <TableFrame>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-3">{COPY.labels.booking.id}</TableHead>
                    <TableHead className="px-3">{COPY.labels.booking.room}</TableHead>
                    <TableHead className="px-3">{COPY.labels.booking.status}</TableHead>
                    <TableHead className="px-3">{COPY.labels.booking.contractStart}</TableHead>
                    <TableHead className="px-3">{COPY.labels.booking.contractEnd}</TableHead>
                    <TableHead className="px-3">{COPY.labels.booking.depositStatus}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className={CELL}>
                        <IdLink id={b.id} onOpen={() => router.push(recordHref('bookings', b.id))} />
                      </TableCell>
                      <TableCell className={CELL}>{store.room(b.roomId)?.name}</TableCell>
                      <TableCell className={CELL}>{b.status}</TableCell>
                      <TableCell className={CELL}>{formatDate(b.contractStart)}</TableCell>
                      <TableCell className={CELL}>{formatDate(b.contractEnd)}</TableCell>
                      <TableCell className={CELL}>{b.depositStatus}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableFrame>
          )}
        </DrawerSection>
      )}
    </RecordDrawer>
  )
}

// Mounted on the Tenants list. ?record=<tenant id> or ?record=new
export function TenantDrawer() {
  const { record, isNew, close } = useRecordParam()
  const tenant = usePerron().tenant(record ?? '')
  if (isNew) return <TenantForm key="new" initial={EMPTY} onDone={close} />
  if (!tenant) return null
  return <TenantForm key={tenant.id} tenantId={tenant.id} initial={withoutId(tenant)} onDone={close} />
}
