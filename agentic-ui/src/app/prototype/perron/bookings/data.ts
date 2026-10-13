// Bookings module data: choices, ID format, seed defaults, booking-only helpers.
// Types in _shared/types.ts. Seed bookings are created in _shared/scenarios.ts
// because every hard case also sets the room it lives in.


import type { Booking, BookingStatus, ContractType, DepositStatus, TaskStatus, TenantConfirmed, YesNo } from '@/app/prototype/perron/_shared/types'

export const BOOKING_STATUSES: BookingStatus[] = ['Upcoming', 'Active', 'Ended', 'Cancelled']
export const CONTRACT_TYPES: ContractType[] = ['6 months', '12 months', 'Others']
export const DEPOSIT_STATUSES: DepositStatus[] = ['None', 'Held', 'Returned']
export const YES_NO: YesNo[] = ['No', 'Yes']
export const TENANT_CONFIRMED: TenantConfirmed[] = ['Not confirmed', 'Confirmed']

// Booking ID = WordPress post ID shown with the PH- prefix. Sequential from 463502.
export const BOOKING_ID_START = 463502
export function bookingId(index: number): string {
  return `PH-${BOOKING_ID_START + index}`
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const DRIVE = 'https://drive.google.com/drive/folders/'

// Inspection photos are uploaded files (ACF Gallery in WordPress). The prototype keeps
// the file names, separated by "|". Contracts and IDs stay on Drive — see `document`.
export const CHECKIN_PHOTOS = 'checkin-room-01.jpg|checkin-room-02.jpg|checkin-kitchen.jpg'
export const CHECKOUT_PHOTOS = 'checkout-room-01.jpg|checkout-room-02.jpg'

export function blankBooking(): Omit<Booking, 'id' | 'tenantId' | 'roomId'> {
  return {
    status: 'Active',
    contractType: '12 months',
    otherContractLength: '',
    contractStart: '2026-09-01',
    contractEnd: '2027-08-31',
    monthlyRent: 480,
    deposit: 960,
    depositStatus: 'Held',
    depositReturnedDate: '',
    checkinDate: '2026-09-01',
    checkinDone: 'Yes',
    checkinStaff: 'u1',
    checkinPhotos: CHECKIN_PHOTOS,
    checkinTenantConfirmed: 'Confirmed',
    checkoutDate: '',
    checkoutDone: 'No',
    checkoutStaff: '',
    checkoutPhotos: '',
    checkoutTenantConfirmed: 'Not confirmed',
    document: `${DRIVE}contracts`,
    notes: '',
  }
}

// Hard cases (README §7). Room ids point at the rows to inspect.

// Whole months between contract start and end (BR10: no partial months)
export function contractMonths(start: string, end: string): number {
  if (!start || !end) return 0
  const [sy, sm] = start.split('-').map(Number)
  const [ey, em] = end.split('-').map(Number)
  return Math.max(0, (ey - sy) * 12 + (em - sm) + 1)
}

// Confirmed display-only contract total.
export function contractTotal(b: Pick<Booking, 'monthlyRent' | 'contractStart' | 'contractEnd'>): number {
  return b.monthlyRent * contractMonths(b.contractStart, b.contractEnd)
}

export type TaskValue = TaskStatus | ''

// What a booking still needs, regardless of who does it. Display only.
// Anchored to the current week (designer, 2026-10-12): "My task" and "This week"
// answer the same question — what has to happen this week — for one person or for everyone.
export function taskDue(b: Booking, weekTo: string): TaskValue {
  if (b.status === 'Cancelled' || b.checkoutDone === 'Yes') return ''
  // Check-in first: it must happen before the check-out phase starts.
  if (b.checkinDone === 'No') return b.checkinDate && b.checkinDate <= weekTo ? 'Checkin Awaiting' : ''
  if (b.checkoutDate && b.checkoutDate <= weekTo) return 'Checkout Awaiting'
  return ''
}

// The logged-in user's share of it: they are the staff for that phase (BR19).
export function myTask(b: Booking, staffId: string, weekTo: string): TaskValue {
  const due = taskDue(b, weekTo)
  if (due === 'Checkin Awaiting') return b.checkinStaff === staffId ? due : ''
  if (due === 'Checkout Awaiting') return b.checkoutStaff === staffId ? due : ''
  return ''
}

// Functional Spec §5. Overlapping bookings on a room for a new contract period.
export function overlapping(bookings: Booking[], roomIdValue: string, start: string, end: string, ignoreId?: string): Booking[] {
  if (!start || !end) return []
  return bookings.filter(
    (e) =>
      e.roomId === roomIdValue &&
      e.id !== ignoreId &&
      (e.status === 'Upcoming' || e.status === 'Active') &&
      e.contractStart <= end &&
      e.contractEnd >= start,
  )
}
