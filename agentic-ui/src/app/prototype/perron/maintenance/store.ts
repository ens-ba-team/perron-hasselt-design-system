// Maintenance slice of the prototype store. Composed in _shared/store.tsx.
// BR01: only writes the fields the admin changed. No side effects on other modules.

import * as React from 'react'
import type { Maintenance } from '@/app/prototype/perron/_shared/types'
import { maintenanceId } from '@/app/prototype/perron/maintenance/data'

export function useMaintenanceSlice(initial: Maintenance[]) {
  const [list, setList] = React.useState<Maintenance[]>(initial)
  return {
    maintenance: list,
    updateMaintenance: (id: string, patch: Partial<Maintenance>) =>
      setList((l) => l.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    addMaintenance: (item: Omit<Maintenance, 'id'>) => {
      const id = maintenanceId(list.length)
      setList((l) => [{ ...item, id }, ...l])
      return id
    },
  }
}
