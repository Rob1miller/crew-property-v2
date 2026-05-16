'use client'

import { usePathname } from 'next/navigation'

const ROUTE_TITLES: Array<{ prefix: string; title: string; exact?: boolean }> = [
  { prefix: '/dashboard',    title: 'Dashboard',    exact: true },
  { prefix: '/properties',   title: 'Properties' },
  { prefix: '/compliance',   title: 'Compliance' },
  { prefix: '/epc',          title: 'EPC Planner' },
  { prefix: '/tenants',      title: 'Tenants & Rent' },
  { prefix: '/reminders',    title: 'Reminders' },
]

function usePageTitle(pathname: string): string {
  for (const route of ROUTE_TITLES) {
    if (route.exact ? pathname === route.prefix : pathname.startsWith(route.prefix)) {
      return route.title
    }
  }
  return 'Crew Property'
}

export function AppTopBar() {
  const pathname  = usePathname()
  const pageTitle = usePageTitle(pathname)

  return (
    <header className="app-topbar">
      <h1 style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>
        {pageTitle}
      </h1>
    </header>
  )
}
