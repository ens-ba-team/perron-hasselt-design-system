'use client'

import * as React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { STAFF } from '@/app/prototype/perron/_shared/format'

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
  error,
  children,
  className,
}: {
  id: string
  label: React.ReactNode
  hint?: React.ReactNode
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-[var(--color-text-invalid)]">{error}</p>
      ) : (
        hint && <p className="text-xs text-[var(--color-text-secondary)]">{hint}</p>
      )}
    </div>
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
