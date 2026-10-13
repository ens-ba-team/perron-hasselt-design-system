import { cn } from '@/lib/utils'
import { formatMoney } from '@/app/prototype/perron/_shared/format'

export function MoneyValue({ value, className }: { value: number | null; className?: string }) {
  const formatted = formatMoney(value)

  if (!formatted) return null

  return (
    <span className={cn('font-semibold text-[var(--color-surface-default-foreground)]', className)}>
      {formatted}
    </span>
  )
}
