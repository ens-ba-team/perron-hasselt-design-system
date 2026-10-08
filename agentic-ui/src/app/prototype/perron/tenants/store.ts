// Tenants slice of the prototype store. Composed in _shared/store.tsx.
// BR01: only writes the fields the admin changed. No side effects on other modules.

import * as React from 'react'
import type { Tenant } from '@/app/prototype/perron/_shared/types'
import { tenantId } from '@/app/prototype/perron/tenants/data'

export function useTenantsSlice(initial: Tenant[]) {
  const [list, setList] = React.useState<Tenant[]>(initial)
  return {
    tenants: list,
    updateTenant: (id: string, patch: Partial<Tenant>) =>
      setList((l) => l.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    addTenant: (item: Omit<Tenant, 'id'>) => {
      const id = tenantId(list.length)
      setList((l) => [...l, { ...item, id }])
      return id
    },
  }
}
