'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Building01, CalendarCheck01, Tool02, Users01 } from '@untitledui/icons'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLogo,
  SidebarBrand,
  SidebarWatermark,
  SidebarHeader,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Toaster } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PerronMark } from '@/app/prototype/perron/_shared/components/brand'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { STAFF, TODAY, formatDate } from '@/app/prototype/perron/_shared/format'
import { PerronStoreProvider, usePerron } from '@/app/prototype/perron/_shared/store'

// Perron Hasselt Room Management (Lite) — desktop shell
// Stands in for the WordPress admin: left menu with the four post types, list screens on the right.
//
// Sidebar follows Figma Perron DS 95:15648 (2026-10-08): round brand/primary logo with the white
// Perron mark, title + caption, and a 20% navy/200 watermark of the mark at the bottom left.

const BASE = '/prototype/perron'

const NAV = [
  { href: `${BASE}/rooms`, label: COPY.nav.rooms, icon: <Building01 /> },
  { href: `${BASE}/bookings`, label: COPY.nav.bookings, icon: <CalendarCheck01 /> },
  { href: `${BASE}/tenants`, label: COPY.nav.tenants, icon: <Users01 /> },
  { href: `${BASE}/maintenance`, label: COPY.nav.maintenance, icon: <Tool02 /> },
]

// Prototype-only controls. Kept out of the Sidebar so the Sidebar matches the DS pattern.
// In WordPress the logged-in user comes from the admin bar, and "today" is the real date.
function PrototypeBar() {
  const { currentStaffId, setCurrentStaffId } = usePerron()
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--color-border-default)] bg-[var(--color-background-muted)] px-6 py-2 text-xs text-[var(--color-text-secondary)]">
      <div className="flex items-center gap-2">
        <Label htmlFor="perron-staff" className="text-xs">{COPY.app.signedInAs}</Label>
        <Select value={currentStaffId} onValueChange={setCurrentStaffId}>
          <SelectTrigger id="perron-staff" className="h-7 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAFF.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <span>
        {COPY.app.today}: <span className="font-medium">{formatDate(TODAY)}</span>
      </span>
      <span className="ml-auto">{COPY.app.prototypeNote}</span>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background-default)]">
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarHeader>
            <SidebarLogo className="rounded-full bg-[var(--color-brand-primary)] text-[var(--color-white)]">
              <PerronMark className="h-[23px] w-[19px]" />
            </SidebarLogo>
            <SidebarBrand title={COPY.app.title} caption={COPY.app.caption} />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{COPY.nav.group}</SidebarGroupLabel>
              {NAV.map((item) => (
                <SidebarMenuItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname.startsWith(item.href)}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(item.href)
                  }}
                />
              ))}
            </SidebarGroup>
          </SidebarContent>
          <SidebarWatermark className="text-[var(--color-navy-200)]">
            <PerronMark className="h-[245px] w-[201px]" />
          </SidebarWatermark>
        </Sidebar>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <PrototypeBar />
          <React.Suspense>{children}</React.Suspense>
        </main>
      </SidebarProvider>
    </div>
  )
}

export default function PerronLayout({ children }: { children: React.ReactNode }) {
  return (
    <PerronStoreProvider>
      <TooltipProvider delayDuration={200}>
        <Shell>{children}</Shell>
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </PerronStoreProvider>
  )
}
