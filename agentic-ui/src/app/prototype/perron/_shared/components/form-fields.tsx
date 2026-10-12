'use client'

import * as React from 'react'
import { InfoCircle, Plus, UploadCloud01, XClose } from '@untitledui/icons'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { STAFF, dateToIso, isoToDate } from '@/app/prototype/perron/_shared/format'

// Form building blocks shared by every record drawer.
// Defined at module level: defining them inside a form component loses focus on re-render.

// Radix Select does not accept an empty string as a value; NONE stands for "not set".
export const NONE = '__none'

export interface Option {
  value: string
  label: string
}

export const asOptions = (list: readonly string[]): Option[] => list.map((v) => ({ value: v, label: v }))

// Staff picker options, with "Not set" first. Staff = WordPress users.
export const staffOptions: Option[] = [{ value: '', label: COPY.common.notSet }, ...STAFF.map((s) => ({ value: s.id, label: s.name }))]

export function Field({
  id,
  label,
  hint,
  hintBelow,
  error,
  children,
  className,
}: {
  id: string
  label: React.ReactNode
  /** Shown on hover behind an info icon next to the label. */
  hint?: React.ReactNode
  /** Rare: keep the hint under the field because it must not be missed. */
  hintBelow?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <Label htmlFor={id} className="flex items-center gap-1.5">
        {label}
        {hint && !hintBelow && <FieldHint text={hint} />}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-[var(--color-text-invalid)]">{error}</p>
      ) : (
        hint && hintBelow && <p className="text-xs text-[var(--color-text-secondary)]">{hint}</p>
      )}
    </div>
  )
}

// Helper text lives behind an info icon (designer, 2026-10-12): hover or focus to read it,
// so the form stays short. Only genuinely important hints use `hintBelow`.
export function FieldHint({ text }: { text: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={COPY.common.moreInfo} className="text-[var(--color-icon-muted)] hover:text-[var(--color-icon-default)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] rounded-full">
          <InfoCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 leading-snug">{text}</TooltipContent>
    </Tooltip>
  )
}

export function ChoiceSelect({
  id,
  value,
  options,
  onChange,
  placeholder,
  invalid,
}: {
  id: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  placeholder?: string
  invalid?: boolean
}) {
  return (
    <Select value={value || undefined} onValueChange={(v) => onChange(v === NONE ? '' : v)}>
      <SelectTrigger id={id} aria-invalid={invalid || undefined}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value || NONE} value={o.value || NONE}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Date field = DS DatePicker (type "input"), stored as an ISO string. Never the browser's native
// date input: its look and "mm/dd/yyyy" placeholder differ per browser and break the DS.
// key={value} re-syncs the picker, which only reads its value on mount.
export function DateField({ id, value, onChange, placeholder, className }: {
  id?: string
  value: string
  onChange: (iso: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <DatePicker
      key={value}
      id={id}
      type="input"
      value={isoToDate(value)}
      placeholder={placeholder ?? COPY.common.pickDate}
      onChange={(d) => onChange(d instanceof Date ? dateToIso(d) : '')}
      className={className}
    />
  )
}

// ─── Image field ──────────────────────────────────────────────────────────────
// Inspection photos: pictures of the room, uploaded like any WordPress media (ACF Gallery).
// GDPR note from the client spec applies to ID cards and contracts, not room photos —
// those stay as a private Drive link in the "Other" section.
// Prototype only: file names are kept in the record, previews come from object URLs.

export function ImageField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const names = value ? value.split('|').filter(Boolean) : []
  const [previews, setPreviews] = React.useState<Record<string, string>>({})
  const inputRef = React.useRef<HTMLInputElement>(null)

  const add = (files: FileList | null) => {
    if (!files?.length) return
    const picked = Array.from(files)
    setPreviews((p) => ({ ...p, ...Object.fromEntries(picked.map((f) => [f.name, URL.createObjectURL(f)])) }))
    onChange([...names, ...picked.map((f) => f.name)].join('|'))
  }
  const remove = (name: string) => onChange(names.filter((n) => n !== name).join('|'))

  return (
    <div className="flex flex-col gap-2">
      <input ref={inputRef} id={id} type="file" accept="image/*" multiple className="sr-only"
        onChange={(e) => { add(e.target.files); e.target.value = '' }} />
      {names.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {names.map((name) => (
            <li key={name} className="group/photo relative">
              <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-background-muted)]">
                {previews[name] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previews[name]} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <span className="px-1 text-center text-[10px] leading-tight text-[var(--color-background-muted-foreground)] break-all">{name}</span>
                )}
              </span>
              <Button type="button" size="icon-sm" variant="outline" aria-label={`${COPY.common.remove} ${name}`}
                onClick={() => remove(name)}
                className="absolute -right-2 -top-2 h-5 w-5 rounded-full opacity-0 group-hover/photo:opacity-100 focus-visible:opacity-100">
                <XClose className="h-3 w-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => inputRef.current?.click()}>
        <UploadCloud01 />
        {names.length ? COPY.common.addPhotos : COPY.common.selectPhotos}
      </Button>
    </div>
  )
}

// ─── Creatable select ─────────────────────────────────────────────────────────
// Pick an existing value or type a new one (e.g. a new building). In WordPress this is a
// taxonomy field with "Create terms" on, so no custom code is needed.

export function CreatableSelect({ id, value, options, onChange, addLabel, newPlaceholder }: {
  id: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
  addLabel: string
  newPlaceholder: string
}) {
  const [adding, setAdding] = React.useState(false)
  if (adding) {
    return (
      <div className="flex items-center gap-1">
        <Input id={id} autoFocus value={value} placeholder={newPlaceholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setAdding(false) } }} />
        <Button type="button" size="icon-sm" variant="ghost" aria-label={COPY.common.cancel} onClick={() => setAdding(false)}>
          <XClose />
        </Button>
      </div>
    )
  }
  return (
    <Select value={value || undefined} onValueChange={(v) => { if (v === ADD_NEW) { onChange(''); setAdding(true) } else onChange(v) }}>
      <SelectTrigger id={id}><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        <SelectItem value={ADD_NEW}>
          <span className="flex items-center gap-2 text-[var(--color-text-link)]"><Plus className="h-3.5 w-3.5" />{addLabel}</span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

const ADD_NEW = '__add_new'
