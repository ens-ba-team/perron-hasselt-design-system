// Rooms slice of the prototype store. Composed in _shared/store.tsx.
// BR01: only writes the fields the admin changed. No side effects on other modules.

import * as React from 'react'
import type { Room } from '@/app/prototype/perron/_shared/types'
import { roomId } from '@/app/prototype/perron/rooms/data'

export function useRoomsSlice(initial: Room[]) {
  const [list, setList] = React.useState<Room[]>(initial)
  return {
    rooms: list,
    updateRoom: (id: string, patch: Partial<Room>) =>
      setList((l) => l.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    addRoom: (item: Omit<Room, 'id'>) => {
      const id = roomId(list.length)
      setList((l) => [...l, { ...item, id }])
      return id
    },
  }
}
