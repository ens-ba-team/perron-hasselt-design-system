'use client'

import * as React from 'react'
import { File02, InfoCircle, Plus, XClose } from '@untitledui/icons'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
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

const MAX_INSPECTION_IMAGES = 8
const MAX_INSPECTION_IMAGE_BYTES = 10 * 1024 * 1024
const INSPECTION_IMAGE_TYPES = new Set(['image/jpeg', 'image/png'])

export function ImageField({
  id,
  label,
  value,
  onChange,
  className,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  const names = value ? value.split('|').filter(Boolean) : []
  const [previews, setPreviews] = React.useState<Record<string, string>>({})
  const [metadata, setMetadata] = React.useState<Record<string, string>>({})
  const [error, setError] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const add = (files: FileList | null) => {
    if (!files?.length) return
    const picked = Array.from(files)
    const available = Math.max(0, MAX_INSPECTION_IMAGES - names.length)
    const accepted = picked
      .filter((file) => INSPECTION_IMAGE_TYPES.has(file.type) && file.size <= MAX_INSPECTION_IMAGE_BYTES)
      .slice(0, available)

    setError(accepted.length === picked.length ? '' : COPY.common.invalidInspectionImages)
    if (accepted.length === 0) return

    setPreviews((p) => ({ ...p, ...Object.fromEntries(accepted.map((f) => [f.name, URL.createObjectURL(f)])) }))
    setMetadata((m) => ({
      ...m,
      ...Object.fromEntries(accepted.map((f) => [f.name, `${formatImageType(f.name, f.type)} · ${formatFileSize(f.size)} · Uploaded just now`])),
    }))
    onChange([...names, ...accepted.map((f) => f.name)].join('|'))
  }
  const remove = (name: string) => {
    if (previews[name]) URL.revokeObjectURL(previews[name])
    setPreviews((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== name)))
    setMetadata((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== name)))
    onChange(names.filter((n) => n !== name).join('|'))
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-[var(--spacing-component-md)]">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-xs text-[var(--color-text-secondary)]" aria-live="polite">
          {names.length} / {MAX_INSPECTION_IMAGES}
        </span>
      </div>
      <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png" multiple className="sr-only"
        onChange={(e) => { add(e.target.files); e.target.value = '' }} />
      {names.length === 0 ? (
        <div className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] p-[var(--spacing-component-lg)] text-center">
          <p className="text-sm font-medium text-[var(--color-surface-default-foreground)]">{COPY.common.noInspectionImages}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{COPY.common.inspectionImagesHint}</p>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => inputRef.current?.click()}>
            {COPY.common.browseImages}
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {names.map((name) => (
            <li key={name} className="flex items-center gap-[var(--spacing-component-md)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] p-[var(--spacing-component-md)]">
              <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-background-muted)]">
                {previews[name] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previews[name]} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <File02 className="size-4 text-[var(--color-icon-muted)]" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[var(--color-surface-default-foreground)]">{name}</span>
                <span className="block text-xs text-[var(--color-text-secondary)]">
                  {metadata[name] ?? `${formatImageType(name)} · ${COPY.common.storedImage}`}
                </span>
              </span>
              <Button type="button" size="sm" variant="outline" aria-label={`${COPY.common.remove} ${name}`}
                onClick={() => remove(name)}>
                {COPY.common.remove}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {names.length > 0 && (
        <Button type="button" variant="outline" size="sm" className="w-fit" disabled={names.length >= MAX_INSPECTION_IMAGES} onClick={() => inputRef.current?.click()}>
          {COPY.common.addPhotos}
        </Button>
      )}
      {error && <p className="text-xs text-[var(--color-text-invalid)]">{error}</p>}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatImageType(name: string, mimeType?: string): string {
  if (mimeType === 'image/png' || name.toLowerCase().endsWith('.png')) return 'PNG'
  return 'JPG'
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
