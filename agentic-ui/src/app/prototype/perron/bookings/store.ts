// Bookings slice of the prototype store. Composed in _shared/store.tsx.
// BR01: only writes the fields the admin changed. No side effects on other modules.

import * as React from 'react'
import type { Booking } from '@/app/prototype/perron/_shared/types'
import { bookingId } from '@/app/prototype/perron/bookings/data'

export function useBookingsSlice(initial: Booking[]) {
  const [list, setList] = React.useState<Booking[]>(initial)
  return {
    bookings: list,
    updateBooking: (id: string, patch: Partial<Booking>) =>
      setList((l) => l.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    addBooking: (item: Omit<Booking, 'id'>) => {
      const id = bookingId(list.length)
      setList((l) => [...l, { ...item, id }])
      return id
    },
  }
}
