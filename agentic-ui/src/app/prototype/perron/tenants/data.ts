// Tenants module data: ID format, seed. Types in _shared/types.ts.

import type { Tenant } from '@/app/prototype/perron/_shared/types'

export const TENANT_ID_START = 2001
export const tenantId = (i: number) => `TN-${TENANT_ID_START + i}`

// ─── Tenants ──────────────────────────────────────────────────────────────────

const FIRST = ['Lotte', 'Wout', 'Elise', 'Arne', 'Fien', 'Jonas', 'Marie', 'Thibault', 'Noor', 'Seppe', 'Lien', 'Ruben', 'Hanne', 'Bram', 'Ines', 'Kobe', 'Amber', 'Jasper', 'Lore', 'Milan', 'Sarah', 'Lucas', 'Febe', 'Robbe', 'Julie', 'Tibo', 'Eva', 'Stan', 'Nina', 'Wannes', 'Laura', 'Vic', 'Margot', 'Daan', 'Emma', 'Lars', 'Paulien', 'Dries', 'Charlotte', 'Matthias', 'Silke', 'Toon', 'Zoë', 'Jens', 'Anouk', 'Cas', 'Yana', 'Bert']
const LAST = ['Peeters', 'Janssens', 'Maes', 'Jacobs', 'Mertens', 'Willems', 'Claes', 'Goossens', 'Wouters', 'De Smet', 'Dubois', 'Lambert', 'Dupont', 'Hermans', 'Aerts', 'Vermeulen', 'Pauwels', 'Van Damme', 'Michiels', 'Smets', 'Leclercq', 'Cools', 'Martens', 'Thys']
const UNIS = ['UHasselt', 'PXL', 'UCLL', 'UHasselt', 'PXL']

export const INTERNATIONAL: Omit<Tenant, 'id'>[] = [
  { name: 'Giulia Romano', phone: '+39 347 210 4481', email: 'giulia.romano@studenti.unipd.it', university: 'UHasselt', erasmus: true },
  { name: 'Mateo García', phone: '+34 612 448 901', email: 'mateo.garcia@uv.es', university: 'UHasselt', erasmus: true },
  { name: 'Zofia Kowalska', phone: '+48 501 228 774', email: 'z.kowalska@uw.edu.pl', university: 'PXL', erasmus: true },
  { name: 'Lukas Becker', phone: '+49 151 2239 4410', email: 'lukas.becker@rwth-aachen.de', university: 'UHasselt', erasmus: true },
  { name: 'Inês Carvalho', phone: '+351 912 334 120', email: 'ines.carvalho@uporto.pt', university: 'UHasselt', erasmus: true },
]

export function buildTenants(): Tenant[] {
  const tenants: Tenant[] = INTERNATIONAL.map((t, i) => ({ ...t, id: `t${i + 1}` }))
  let n = tenants.length
  for (let i = 0; i < FIRST.length; i++) {
    const first = FIRST[i]
    const last = LAST[(i * 7) % LAST.length]
    n++
    tenants.push({
      id: `t${n}`,
      name: `${first} ${last}`,
      phone: `+32 4${70 + (i % 29)} ${String(100 + i * 13).slice(-3)} ${String(210 + i * 17).slice(-3)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase().replace(/\s/g, '')}@student.be`.normalize('NFD').replace(/[̀-ͯ]/g, ''),
      university: UNIS[i % UNIS.length],
      erasmus: false,
    })
  }
  return tenants
}
