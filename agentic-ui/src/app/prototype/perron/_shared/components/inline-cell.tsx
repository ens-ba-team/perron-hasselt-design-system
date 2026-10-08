'use client'

import * as React from 'react'
import { Check, Edit05, XClose } from '@untitledui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { NONE } from '@/app/prototype/perron/_shared/components/form-fields'

// Inline editing, modelled on Admin Columns Pro: a pencil appears on hover,
// the cell turns into its field, Save or Enter writes, Cancel or Escape restores.
// Only the edited field is written (BR01).


export interface InlineOption {
  value: string
  label: string
}

interface InlineCellProps {
  label: string
  value: string
  kind: 'text' | 'number' | 'date' | 'select'
  options?: InlineOption[]
  display?: React.ReactNode
  onSave: (value: string) => void
  className?: string
}

export function InlineCell({ label, value, kind, options, display, onSave, className }: InlineCellProps) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(value)

  const start = () => {
    setDraft(value)
    setEditing(true)
  }
  const cancel = () => setEditing(false)
  const commit = (next = draft) => {
    setEditing(false)
    if (next !== value) onSave(next)
  }

  if (editing && kind === 'select') {
    return (
      <Select
        defaultOpen
        value={value || NONE}
        onValueChange={(v) => commit(v === NONE ? '' : v)}
        onOpenChange={(open) => !open && cancel()}
      >
        <SelectTrigger aria-label={label} className={cn('h-8 min-w-36', className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options?.map((o) => (
            <SelectItem key={o.value} value={o.value || NONE}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (editing) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <Input
          autoFocus
          aria-label={label}
          type={kind}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') cancel()
          }}
          className={cn('h-8', kind === 'date' ? 'w-40' : 'min-w-28')}
        />
        <Button size="icon-sm" aria-label={COPY.inline.save} onClick={() => commit()}>
          <Check />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label={COPY.inline.cancel} onClick={cancel}>
          <XClose />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('group/cell flex items-center gap-1 min-h-8', className)}>
      <span className={cn(!value && 'text-[var(--color-text-secondary)]')}>
        {display ?? (value || COPY.common.none)}
      </span>
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={COPY.inline.edit(label)}
        onClick={start}
        className="opacity-0 group-hover/cell:opacity-100 focus-visible:opacity-100 text-[var(--color-icon-muted)]"
      >
        <Edit05 />
      </Button>
    </div>
  )
}
