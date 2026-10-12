// Perron seed: cross-module scenarios.
//
// Every hard case touches more than one module (a booking AND the room status the admin
// typed for it). Keeping both halves in one place stops them drifting apart.
// This file is the one place in _shared/ allowed to import module data (composition root).
//
// Every Room status and Available from below is TYPED BY AN ADMIN (BR01).
// Nothing in the prototype derives them from bookings.

import { STAFF, TODAY } from '@/app/prototype/perron/_shared/format'
import type { Booking, Maintenance, Room, RoomStatus, Tenant } from '@/app/prototype/perron/_shared/types'
import { CHECKOUT_PHOTOS, blankBooking, bookingId } from '@/app/prototype/perron/bookings/data'
import { buildMaintenance, maintenanceId } from '@/app/prototype/perron/maintenance/data'
import { buildRooms, roomId } from '@/app/prototype/perron/rooms/data'
import { INTERNATIONAL, buildTenants, tenantId } from '@/app/prototype/perron/tenants/data'

// Seed keys (p19-1.01 = room P19 – 1.01). Records get their public IDs (RM-…) in assignIds().
export const HARD_CASES = {
  backToBack: 'p19-1.01', // 1-person room, A until 31 Jan, B from 1 Feb → Available from 1 Aug
  partiallyOccupied: 'p19-2.03', // 2-person room, one tenant → Available from today
  twoTenants: 'p19-2.04', // 2-person room, A until 31 Jan, C until 31 Aug → Available from 1 Feb
  reservedOneBed: 'p19-2.06', // 2-person room, empty, one booking from 1 Nov → Reserved, Available from today
  earlyMoveOutPlanned: 'p19-1.05', // Check-out date 15 Oct, contract until 31 Jan → Checkout Awaiting
  earlyMoveOutDone: 'p19-3.02', // Left 28 Sep, contract until 31 Dec → status Available, Available from 1 Jan
  overstay: 'p19-0.03', // Contract ended 30 Sep, not checked out → Occupied, Available from 1 Oct
  cancelled: 'p19-3.05', // Follow-up booking cancelled, Available from set back by hand
  renewal: 'p17-1.02', // Same tenant, same room, new booking from 1 Feb
  depositHeldAfterEnd: 'p19-1.07', // Previous booking Ended, deposit still Held
  checkinThisWeek: 'p17-2.03', // Erasmus arrival 10 Oct, contract from 1 Oct
  otherLength: 'p17-3.01', // Contract type Others, 9 months
} as const

// Rooms the admin left empty this term
const EMPTY_ROOMS = ['p19-0.01', 'p19-0.02', 'p19-3.08', 'p17-3.04']

interface Seed {
  rooms: Room[]
  tenants: Tenant[]
  bookings: Booking[]
  maintenance: Maintenance[]
}

function buildSeed(): Seed {
  const rooms = buildRooms()
  const tenants = buildTenants()
  const bookings: Booking[] = []
  const roomById = (id: string) => rooms.find((r) => r.id === id)!
  let tenantCursor = INTERNATIONAL.length // t1–t5 are placed by hand below
  const nextTenant = () => tenants[tenantCursor++].id
  const staffCycle = (i: number) => STAFF[i % STAFF.length].id

  const add = (roomIdValue: string, tenantId: string, patch: Partial<Booking> = {}) => {
    const room = roomById(roomIdValue)
    const b: Booking = {
      ...blankBooking(),
      monthlyRent: room.monthlyRent,
      deposit: room.monthlyRent * 2,
      checkinStaff: staffCycle(bookings.length),
      checkoutStaff: staffCycle(bookings.length + 1),
      ...patch,
      id: bookingId(bookings.length),
      roomId: roomIdValue,
      tenantId,
    }
    bookings.push(b)
    return b
  }

  const setRoom = (id: string, status: RoomStatus, availableFrom: string, notes = '') => {
    const r = roomById(id)
    r.status = status
    r.availableFrom = availableFrom
    r.notes = notes
  }

  // ── Hard cases first, so they get the international tenants (t1–t5) ──

  // Back-to-back on a 1-person room (Erasmus semesters)
  add(HARD_CASES.backToBack, 't1', {
    contractType: '6 months', contractStart: '2026-08-01', contractEnd: '2027-01-31',
    checkinDate: '2026-08-29', checkoutDate: '2027-01-29', checkinStaff: 'u2', checkoutStaff: 'u3',
  })
  add(HARD_CASES.backToBack, 't2', {
    status: 'Upcoming', contractType: '6 months', contractStart: '2027-02-01', contractEnd: '2027-07-31',
    depositStatus: 'None', checkinDate: '', checkinDone: 'No', checkinStaff: 'u1', checkinPhotos: '',
    checkinTenantConfirmed: 'Not confirmed', checkoutStaff: 'u2', notes: 'Arrives with the spring Erasmus group.',
  })
  setRoom(HARD_CASES.backToBack, 'Occupied', '2027-08-01')

  // Check-in this week: contract from 1 Oct, arrives 10 Oct
  add(HARD_CASES.checkinThisWeek, 't3', {
    status: 'Upcoming', contractType: '6 months', contractStart: '2026-10-01', contractEnd: '2027-03-31',
    checkinDate: '2026-10-10', checkinDone: 'No', checkinStaff: 'u1', checkinPhotos: '',
    checkinTenantConfirmed: 'Not confirmed', checkoutStaff: 'u3', notes: 'Late arrival, flight lands Saturday.',
  })
  setRoom(HARD_CASES.checkinThisWeek, 'Reserved', '2027-04-01')

  // Renewal: same tenant, same room
  add(HARD_CASES.renewal, 't4', {
    contractStart: '2026-02-01', contractEnd: '2027-01-31', checkinDate: '2026-02-01',
    checkoutDate: '2027-01-31', checkinStaff: 'u3', checkoutStaff: 'u1',
  })
  add(HARD_CASES.renewal, 't4', {
    status: 'Upcoming', contractStart: '2027-02-01', contractEnd: '2028-01-31', depositStatus: 'None',
    checkinDate: '2027-02-01', checkinDone: 'No', checkinStaff: 'u1', checkinPhotos: '',
    checkinTenantConfirmed: 'Not confirmed', checkoutStaff: 'u2', notes: 'Renewal. Old booking checks out as normal on 31 Jan.',
  })
  setRoom(HARD_CASES.renewal, 'Occupied', '2028-02-01')

  // Contract type Others
  add(HARD_CASES.otherLength, 't5', {
    contractType: 'Others', otherContractLength: '9 months', contractStart: '2026-09-01', contractEnd: '2027-05-31',
  })
  setRoom(HARD_CASES.otherLength, 'Occupied', '2027-06-01')

  // 2-person room with one tenant
  add(HARD_CASES.partiallyOccupied, nextTenant())
  setRoom(HARD_CASES.partiallyOccupied, 'Partially occupied', TODAY)

  // 2-person room, two tenants with different ends
  add(HARD_CASES.twoTenants, nextTenant(), { contractType: '6 months', contractEnd: '2027-01-31' })
  add(HARD_CASES.twoTenants, nextTenant())
  setRoom(HARD_CASES.twoTenants, 'Occupied', '2027-02-01')

  // 2-person room, empty, one bed booked
  add(HARD_CASES.reservedOneBed, nextTenant(), {
    status: 'Upcoming', contractStart: '2026-11-01', contractEnd: '2027-10-31', checkinDate: '2026-11-01',
    checkinDone: 'No', checkinPhotos: '', checkinTenantConfirmed: 'Not confirmed', checkinStaff: 'u2',
  })
  setRoom(HARD_CASES.reservedOneBed, 'Reserved', TODAY, 'One bed booked from 1 Nov. The other bed is free.')

  // Early move-out planned (Checkout Awaiting for the check-out staff)
  add(HARD_CASES.earlyMoveOutPlanned, nextTenant(), {
    contractType: '6 months', contractStart: '2026-08-01', contractEnd: '2027-01-31',
    checkoutDate: '2026-10-15', checkoutStaff: 'u1', notes: 'Leaves early for an internship. Pays until 31 Jan.',
  })
  setRoom(HARD_CASES.earlyMoveOutPlanned, 'Occupied', '2027-02-01')

  // Early move-out done: room empty, contract still running
  add(HARD_CASES.earlyMoveOutDone, nextTenant(), {
    contractType: 'Others', otherContractLength: '4 months', contractStart: '2026-09-01', contractEnd: '2026-12-31',
    checkoutDate: '2026-09-28', checkoutDone: 'Yes', checkoutStaff: 'u2', checkoutPhotos: CHECKOUT_PHOTOS,
    checkoutTenantConfirmed: 'Confirmed', notes: 'Left early. Contract and rent run until 31 Dec.',
  })
  setRoom(HARD_CASES.earlyMoveOutDone, 'Available', '2027-01-01', 'Empty since 28 Sep. Still paid until 31 Dec.')

  // Overstay: contract ended 30 Sep, tenant still there
  add(HARD_CASES.overstay, nextTenant(), {
    contractStart: '2025-10-01', contractEnd: '2026-09-30', checkinDate: '2025-10-01',
    checkoutDate: '2026-09-30', checkoutStaff: 'u3', notes: 'Asked to stay until mid-October. Not agreed yet.',
  })
  setRoom(HARD_CASES.overstay, 'Occupied', '2026-10-01')

  // Cancelled follow-up booking; admin set Available from back by hand (P7)
  add(HARD_CASES.cancelled, nextTenant(), { contractType: '6 months', contractStart: '2026-08-01', contractEnd: '2027-01-31' })
  add(HARD_CASES.cancelled, nextTenant(), {
    status: 'Cancelled', contractType: '6 months', contractStart: '2027-02-01', contractEnd: '2027-07-31',
    deposit: null, depositStatus: 'None', checkinDate: '', checkinDone: 'No', checkinPhotos: '',
    checkinTenantConfirmed: 'Not confirmed', notes: 'Cancelled before signing. Tenant chose another city.',
  })
  setRoom(HARD_CASES.cancelled, 'Occupied', '2027-02-01')

  // Previous booking Ended, deposit still held
  add(HARD_CASES.depositHeldAfterEnd, nextTenant(), {
    status: 'Ended', contractStart: '2025-09-01', contractEnd: '2026-08-31', checkinDate: '2025-09-01',
    checkoutDate: '2026-08-31', checkoutDone: 'Yes', checkoutPhotos: CHECKOUT_PHOTOS,
    checkoutTenantConfirmed: 'Not confirmed', notes: 'Wall damage under discussion. Deposit not returned yet.',
  })
  add(HARD_CASES.depositHeldAfterEnd, nextTenant())

  // One more Ended booking with the deposit returned, for history
  const prevTenant = nextTenant()
  add('p19-1.02', prevTenant, {
    status: 'Ended', contractStart: '2025-09-01', contractEnd: '2026-08-31', checkinDate: '2025-09-01',
    checkoutDate: '2026-08-30', checkoutDone: 'Yes', checkoutPhotos: CHECKOUT_PHOTOS,
    checkoutTenantConfirmed: 'Confirmed', depositStatus: 'Returned', depositReturnedDate: '2026-09-12',
  })

  // Empty rooms
  for (const id of EMPTY_ROOMS) setRoom(id, 'Available', '2026-09-01')

  // ── Everyone else: a regular academic-year contract ──
  const handled = new Set<string>([...Object.values(HARD_CASES), ...EMPTY_ROOMS])
  for (const room of rooms) {
    if (handled.has(room.id)) continue
    const beds = room.maxOccupancy
    for (let bed = 0; bed < beds; bed++) add(room.id, nextTenant())
    setRoom(room.id, 'Occupied', '2027-09-01')
  }

  const maintenance = buildMaintenance()

  return { rooms, tenants, bookings, maintenance }
}

// ─── Public IDs ───────────────────────────────────────────────────────────────
// Seed keys (p19-1.01, t1, m1) become the IDs admins see: RM-, TN-, PH-, MT-.

function assignIds(seed: Seed): Seed {
  const byName = [...seed.rooms].sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }))
  const roomMap = new Map(byName.map((r, i) => [r.id, roomId(i)]))
  const tenantMap = new Map(seed.tenants.map((t, i) => [t.id, tenantId(i)]))
  return {
    rooms: seed.rooms.map((r) => ({ ...r, id: roomMap.get(r.id)! })),
    tenants: seed.tenants.map((t) => ({ ...t, id: tenantMap.get(t.id)! })),
    bookings: seed.bookings.map((b) => ({ ...b, roomId: roomMap.get(b.roomId)!, tenantId: tenantMap.get(b.tenantId)! })),
    maintenance: seed.maintenance.map((m, i) => ({ ...m, id: maintenanceId(i), roomId: roomMap.get(m.roomId)! })),
  }
}

export const SEED: Seed = assignIds(buildSeed())
