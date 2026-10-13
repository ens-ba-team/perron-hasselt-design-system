import { Badge, type BadgeProps } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  type BookingStatus,
  type DepositStatus,
  type MaintenanceStatus,
  type RoomStatus,
  type TaskStatus,
  type TenantConfirmed,
  type YesNo,
} from '@/app/prototype/perron/_shared/types'

export type StatusValue =
  | RoomStatus
  | BookingStatus
  | DepositStatus
  | MaintenanceStatus
  | TaskStatus
  | YesNo
  | TenantConfirmed

type StatusVariant = NonNullable<BadgeProps['variant']>

// Existing DS status variants only: colour identifies the state category, not urgency.
const STATUS_VARIANT: Record<StatusValue, StatusVariant> = {
  Available: 'success',
  Reserved: 'blue',
  'Partially occupied': 'warning',
  Occupied: 'secondary',
  Upcoming: 'blue',
  Active: 'success',
  Ended: 'secondary',
  Cancelled: 'error',
  None: 'outline',
  Held: 'warning',
  Returned: 'success',
  Open: 'warning',
  'In progress': 'blue',
  Done: 'success',
  'Checkin Awaiting': 'warning',
  'Checkout Awaiting': 'warning',
  Yes: 'success',
  No: 'secondary',
  Confirmed: 'success',
  'Not confirmed': 'warning',
}

export function StatusBadge({ value, className }: { value: StatusValue; className?: string }) {
  return (
    <Badge
      variant={STATUS_VARIANT[value]}
      shape="pill"
      size="md"
      className={cn('whitespace-nowrap', className)}
    >
      {value}
    </Badge>
  )
}
