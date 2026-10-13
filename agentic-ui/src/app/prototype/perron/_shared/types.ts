// Perron data model — shared contract for every module (Functional Spec §2).
// Entity types live here because modules reference each other (a Booking points to a Room
// and a Tenant). Choices, seed data and module-only helpers live in each module's data.ts.

// ─── Types ────────────────────────────────────────────────────────────────────

export type Building = 'Perron 19' | 'Perron 17'
export type RoomType = 'Standard room' | 'Large room' | 'Studio'
export type RoomStatus = 'Available' | 'Reserved' | 'Partially occupied' | 'Occupied'
export type BookingStatus = 'Upcoming' | 'Active' | 'Ended' | 'Cancelled'
export type ContractType = '6 months' | '12 months' | 'Others'
export type DepositStatus = 'None' | 'Held' | 'Returned'
export type YesNo = 'No' | 'Yes'
export type TenantConfirmed = 'Not confirmed' | 'Confirmed'
export type MaintenanceStatus = 'Open' | 'In progress' | 'Done'
export type TaskStatus = 'Checkin Awaiting' | 'Checkout Awaiting'

export interface Staff {
  id: string
  name: string
}

export interface Room {
  id: string
  name: string
  building: Building
  floor: number
  type: RoomType
  maxOccupancy: 1 | 2
  monthlyRent: number
  status: RoomStatus
  availableFrom: string
  notes: string
}

export interface Tenant {
  id: string
  name: string
  phone: string
  email: string
  university: string
  erasmus: boolean
}

export interface Booking {
  id: string
  status: BookingStatus
  tenantId: string
  roomId: string
  contractType: ContractType
  otherContractLength: string
  contractStart: string
  contractEnd: string
  monthlyRent: number
  deposit: number | null
  depositStatus: DepositStatus
  depositReturnedDate: string
  checkinDate: string
  checkinDone: YesNo
  checkinStaff: string
  checkinPhotos: string
  checkinTenantConfirmed: TenantConfirmed
  checkoutDate: string
  checkoutDone: YesNo
  checkoutStaff: string
  checkoutPhotos: string
  checkoutTenantConfirmed: TenantConfirmed
  document: string
  notes: string
}

export interface Maintenance {
  id: string
  roomId: string
  issue: string
  reportedDate: string
  assignedStaff: string
  status: MaintenanceStatus
  notes: string
}
