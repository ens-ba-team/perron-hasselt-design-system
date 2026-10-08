// Rooms screen copy. Field labels are in _shared/copy.ts (COPY.labels).

export const ROOMS_COPY = {
  title: 'Rooms',
  description: 'Sorted by Available from. Room status sits next to it on purpose: they answer different questions.',
  searchPlaceholder: 'Search rooms',
  detail: {
    fields: 'Room details',
    bookings: 'Bookings for this room',
    bookingsHint: 'Not Cancelled and not Ended bookings decide Available from.',
    maintenance: 'Maintenance for this room',
    noBookings: 'No bookings for this room yet',
    noMaintenance: 'No maintenance logged for this room',
    notes: 'Notes',
    addBooking: 'Add booking for this room',
  },
  reference: {
    title: 'Working out Available from',
    intro: 'The first day the room, or one bed in a 2-person room, can be offered to a new tenant. You set it by hand.',
    step1: 'Free place today with no booking for it? Available from = today.',
    step2one: '1-person room: the day after the latest contract end.',
    step2two: '2-person room: per bed, take its latest contract end. Use the day after the earlier one.',
    rule: 'Always use Contract end, never Check-out date. A tenant who leaves early still pays until the contract ends.',
  },
} as const
