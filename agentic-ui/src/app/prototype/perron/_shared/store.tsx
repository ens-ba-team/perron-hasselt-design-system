'use client'

import * as React from 'react'
import { STAFF } from '@/app/prototype/perron/_shared/format'
import { SEED } from '@/app/prototype/perron/_shared/scenarios'
import type { Booking, Maintenance, Room, Tenant } from '@/app/prototype/perron/_shared/types'
import { useBookingsSlice } from '@/app/prototype/perron/bookings/store'
import { useMaintenanceSlice } from '@/app/prototype/perron/maintenance/store'
import { useRoomsSlice } from '@/app/prototype/perron/rooms/store'
import { useTenantsSlice } from '@/app/prototype/perron/tenants/store'

// One Provider, composed from module slices (rooms/, bookings/, tenants/, maintenance/ store.ts).
// One Provider because modules read each other's data (Room drawer lists bookings and
// maintenance; cancelling a booking needs the room name). Stands in for the WordPress database.
//
// BR01: saving a booking never touches its room. Do not add cross-slice side effects here.

interface PerronStore {
  rooms: Room[]
  tenants: Tenant[]
  bookings: Booking[]
  maintenance: Maintenance[]
  currentStaffId: string
  setCurrentStaffId: (id: string) => void
  updateRoom: (id: string, patch: Partial<Room>) => void
  updateTenant: (id: string, patch: Partial<Tenant>) => void
  addTenant: (t: Omit<Tenant, 'id'>) => string
  updateBooking: (id: string, patch: Partial<Booking>) => void
  addBooking: (b: Omit<Booking, 'id'>) => string
  updateMaintenance: (id: string, patch: Partial<Maintenance>) => void
  addMaintenance: (m: Omit<Maintenance, 'id'>) => string
  room: (id: string) => Room | undefined
  tenant: (id: string) => Tenant | undefined
  staffName: (id: string) => string
}

const StoreContext = React.createContext<PerronStore | null>(null)

export function PerronStoreProvider({ children }: { children: React.ReactNode }) {
  const rooms = useRoomsSlice(SEED.rooms)
  const tenants = useTenantsSlice(SEED.tenants)
  const bookings = useBookingsSlice(SEED.bookings)
  const maintenance = useMaintenanceSlice(SEED.maintenance)
  const [currentStaffId, setCurrentStaffId] = React.useState(STAFF[0].id)

  const roomMap = React.useMemo(() => new Map(rooms.rooms.map((r) => [r.id, r])), [rooms.rooms])
  const tenantMap = React.useMemo(() => new Map(tenants.tenants.map((t) => [t.id, t])), [tenants.tenants])

  const value: PerronStore = {
    ...rooms,
    ...tenants,
    ...bookings,
    ...maintenance,
    currentStaffId,
    setCurrentStaffId,
    room: (id) => roomMap.get(id),
    tenant: (id) => tenantMap.get(id),
    staffName: (id) => STAFF.find((s) => s.id === id)?.name ?? '',
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function usePerron() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error('usePerron must be used inside PerronStoreProvider')
  return ctx
}
