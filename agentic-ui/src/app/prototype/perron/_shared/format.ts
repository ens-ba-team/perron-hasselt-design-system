// Shared constants and display helpers. Read-only: nothing here writes data.

import type { Staff } from '@/app/prototype/perron/_shared/types'

// "Today" is frozen so the date-based tabs (this week, this month, My task)
// stay stable while the prototype is reviewed.
export const TODAY = '2026-10-08'

// ─── Staff (WordPress users) ──────────────────────────────────────────────────

export const STAFF: Staff[] = [
  { id: 'u1', name: 'Mina' },
  { id: 'u2', name: 'Jef' },
  { id: 'u3', name: 'An' },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export function formatMoney(value: number | null): string {
  if (value === null || Number.isNaN(value)) return ''
  return `€ ${value.toLocaleString('nl-BE')}`
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// Monday–Sunday week containing `iso`
export function weekRange(iso: string): [string, string] {
  const d = new Date(`${iso}T00:00:00Z`)
  const dow = (d.getUTCDay() + 6) % 7
  const mon = addDays(iso, -dow)
  return [mon, addDays(mon, 6)]
}

export function withoutId<T extends { id: string }>(record: T): Omit<T, 'id'> {
  const copy: Partial<T> = { ...record }
  delete copy.id
  return copy as Omit<T, 'id'>
}
