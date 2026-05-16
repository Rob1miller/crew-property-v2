import Link from 'next/link'
import { NavItem } from './NavItem'
import { logoutAction } from '@/app/actions/auth'

interface AppSidebarProps {
  email: string
}

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase()
}

export function AppSidebar({ email }: AppSidebarProps) {
  return (
    <aside className="app-sidebar">

      {/* Brand */}
      <div style={{ padding: '16px', borderBottom: '1px solid hsl(var(--color-border))', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'block' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 400, color: 'hsl(var(--color-ink))', lineHeight: 1.3 }}>
            Crew{' '}
            <span style={{ color: 'hsl(var(--color-green-mid))' }}>Property</span>
          </p>
          <p style={{ fontSize: '10px', color: 'hsl(var(--color-ink-faint))', marginTop: '2px', letterSpacing: '0.3px' }}>
            UK property management
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>

        <NavItem href="/dashboard" icon="⊞" label="Dashboard" exact />

        <p style={{ fontSize: '10px', fontWeight: 700, color: 'hsl(var(--color-ink-faint))', textTransform: 'uppercase', letterSpacing: '1px', padding: '16px 10px 4px' }}>
          Portfolio
        </p>
        <NavItem href="/properties" icon="🏠" label="Properties" />
        <NavItem href="/tenants"    icon="👤" label="Tenants & Rent" />
        <NavItem href="/reminders"  icon="⏰" label="Reminders" />

        <p style={{ fontSize: '10px', fontWeight: 700, color: 'hsl(var(--color-ink-faint))', textTransform: 'uppercase', letterSpacing: '1px', padding: '16px 10px 4px' }}>
          Compliance
        </p>
        <NavItem href="/compliance" icon="✓"  label="Compliance" />
        <NavItem href="/epc"        icon="⚡" label="EPC Planner" />

        <p style={{ fontSize: '10px', fontWeight: 700, color: 'hsl(var(--color-ink-faint))', textTransform: 'uppercase', letterSpacing: '1px', padding: '16px 10px 4px' }}>
          Knowledge
        </p>
        <NavItem href="/case-studies" icon="📖" label="Case Studies" />

      </nav>

      {/* User + logout */}
      <div style={{ flexShrink: 0, borderTop: '1px solid hsl(var(--color-border))', padding: '12px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, flexShrink: 0,
            background: 'hsl(var(--color-green-muted))', color: 'hsl(var(--color-green))',
          }}>
            {getInitials(email)}
          </span>
          <span style={{ flex: 1, fontSize: '13px', color: 'hsl(var(--color-ink-muted))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </span>
        </div>
        <form action={logoutAction} style={{ marginTop: '4px' }}>
          <button type="submit" style={{
            display: 'block', width: '100%', padding: '8px 10px',
            background: 'transparent', border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px', color: 'hsl(var(--color-ink-subtle))',
            cursor: 'pointer', textAlign: 'left',
          }}>
            Sign out
          </button>
        </form>
      </div>

    </aside>
  )
}
