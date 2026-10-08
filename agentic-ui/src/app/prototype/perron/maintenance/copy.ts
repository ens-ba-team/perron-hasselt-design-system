// Maintenance screen copy. Field labels are in _shared/copy.ts (COPY.labels).

export const MAINTENANCE_COPY = {
  title: 'Maintenance',
  add: 'Add issue',
  searchPlaceholder: 'Search issues',
  actions: { Open: 'Received', 'In progress': 'Fixing' } as Record<string, string>,
  actionsHint: 'Shown only on issues assigned to you.',
  newTitle: 'Add issue',
  newIssuePlaceholder: 'Short description, for example Shower drain blocked',
  save: 'Save issue',
  savedToast: 'Issue saved',
  noBlocking: 'Maintenance never blocks a booking. It shows as a count on Rooms.',
} as const
