'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItemProps {
  href:        string
  icon:        string
  label:       string
  alertCount?: number
  exact?:      boolean
}

export function NavItem({ href, icon, label, alertCount, exact = false }: NavItemProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '10px',
        padding:        '8px 10px',
        borderRadius:   'var(--radius-sm)',
        fontSize:       '13.5px',
        fontWeight:     isActive ? 600 : 500,
        textDecoration: 'none',
        color:          isActive ? 'hsl(var(--color-green))' : 'hsl(var(--color-ink-muted))',
        background:     isActive ? 'hsl(var(--color-green-muted))' : 'transparent',
        transition:     'background 0.1s, color 0.1s',
      }}
    >
      <span style={{ fontSize: '15px', width: '18px', textAlign: 'center', flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {alertCount !== undefined && alertCount > 0 && (
        <span style={{
          fontSize: '10px', fontWeight: 700,
          padding: '2px 6px', borderRadius: '999px',
          background: 'hsl(var(--color-red))', color: 'white',
        }}>
          {alertCount > 99 ? '99+' : alertCount}
        </span>
      )}
    </Link>
  )
}
