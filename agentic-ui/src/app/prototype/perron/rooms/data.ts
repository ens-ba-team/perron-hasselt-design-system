// Rooms module data: choices, ID format, seed. Types in _shared/types.ts.

import type { Building, Room, RoomStatus, RoomType } from '@/app/prototype/perron/_shared/types'

export const BUILDINGS: Building[] = ['Perron 19', 'Perron 17']
// D4: real room types come from the client before build. These are placeholders.
export const ROOM_TYPES: RoomType[] = ['Standard room', 'Large room', 'Studio']
export const ROOM_STATUSES: RoomStatus[] = ['Available', 'Reserved', 'Partially occupied', 'Occupied']

// Public ID shown to admins (stands in for the WordPress post ID)
export const ROOM_ID_START = 1001
export const roomId = (i: number) => `RM-${ROOM_ID_START + i}`

// ─── Rooms (41) ───────────────────────────────────────────────────────────────
// Perron 19: 29 rooms on floors 0–3. Perron 17: 12 studios on floors 1–3.
// 12 units take 2 people (10 large rooms in P19, 2 studios in P17).

const RENT: Record<RoomType, number> = { 'Standard room': 480, 'Large room': 620, Studio: 690 }

const P19_LAYOUT: Record<number, number> = { 0: 5, 1: 8, 2: 8, 3: 8 }
const P19_LARGE = new Set(['1.04', '1.08', '2.03', '2.04', '2.06', '2.08', '3.03', '3.04', '3.06', '3.07'])
const P17_DOUBLE = new Set(['2.01', '3.03'])

export function seedKey(building: Building, num: string) {
  return `${building === 'Perron 19' ? 'p19' : 'p17'}-${num}`
}

export function buildRooms(): Room[] {
  const rooms: Room[] = []
  for (const [floorStr, count] of Object.entries(P19_LAYOUT)) {
    const floor = Number(floorStr)
    for (let i = 1; i <= count; i++) {
      const num = `${floor}.${String(i).padStart(2, '0')}`
      const type: RoomType = P19_LARGE.has(num) ? 'Large room' : 'Standard room'
      rooms.push({
        id: seedKey('Perron 19', num),
        name: `P19 – ${num}`,
        building: 'Perron 19',
        floor,
        type,
        maxOccupancy: type === 'Large room' ? 2 : 1,
        monthlyRent: RENT[type],
        status: 'Occupied',
        availableFrom: '2027-09-01',
        notes: '',
      })
    }
  }
  for (const floor of [1, 2, 3]) {
    for (let i = 1; i <= 4; i++) {
      const num = `${floor}.${String(i).padStart(2, '0')}`
      rooms.push({
        id: seedKey('Perron 17', num),
        name: `P17 – ${num}`,
        building: 'Perron 17',
        floor,
        type: 'Studio',
        maxOccupancy: P17_DOUBLE.has(num) ? 2 : 1,
        monthlyRent: RENT.Studio,
        status: 'Occupied',
        availableFrom: '2027-09-01',
        notes: '',
      })
    }
  }
  return rooms
}
