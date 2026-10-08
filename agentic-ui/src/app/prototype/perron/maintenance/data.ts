// Maintenance module data: choices, ID format, seed. Types in _shared/types.ts.
// Seed rows use room seed keys (p19-2.04); _shared/scenarios.ts maps them to RM- IDs.

import type { Maintenance, MaintenanceStatus } from '@/app/prototype/perron/_shared/types'

export const MAINTENANCE_STATUSES: MaintenanceStatus[] = ['Open', 'In progress', 'Done']

export const MAINTENANCE_ID_START = 3001
export const maintenanceId = (i: number) => `MT-${MAINTENANCE_ID_START + i}`

export function buildMaintenance(): Maintenance[] {
  return [
    { id: 'm1', roomId: 'p19-2.04', issue: 'Shower drain blocked', reportedDate: '2026-10-06', assignedStaff: 'u1', status: 'Open', notes: '' },
    { id: 'm2', roomId: 'p19-3.02', issue: 'Repaint wall after move-out', reportedDate: '2026-09-29', assignedStaff: 'u2', status: 'In progress', notes: 'Room is empty, no rush with access.' },
    { id: 'm3', roomId: 'p17-1.03', issue: 'Radiator not heating', reportedDate: '2026-10-07', assignedStaff: 'u1', status: 'In progress', notes: '' },
    { id: 'm4', roomId: 'p19-0.01', issue: 'Window handle loose', reportedDate: '2026-10-02', assignedStaff: 'u3', status: 'Open', notes: '' },
    { id: 'm5', roomId: 'p19-2.04', issue: 'Ceiling light flickers', reportedDate: '2026-10-08', assignedStaff: '', status: 'Open', notes: '' },
    { id: 'm6', roomId: 'p17-2.03', issue: 'Replace mattress before arrival', reportedDate: '2026-09-25', assignedStaff: 'u1', status: 'Done', notes: '' },
    { id: 'm7', roomId: 'p19-1.06', issue: 'Fridge door seal', reportedDate: '2026-09-14', assignedStaff: 'u2', status: 'Done', notes: '' },
  ]
}
