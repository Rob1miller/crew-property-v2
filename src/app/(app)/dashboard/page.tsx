import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.email}</p>
        </div>
      </div>

      {/* Placeholder stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1px',
        background: 'hsl(var(--color-border))',
        border: '1px solid hsl(var(--color-border))',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        {['Properties', 'Tenants', 'Compliance items', 'EPC plans'].map(label => (
          <div key={label} style={{
            background: 'hsl(var(--color-surface))',
            padding: '20px 24px',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--color-ink-faint))', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              {label}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'hsl(var(--color-ink))' }}>
              0
            </p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>
        Your portfolio is empty. Properties and features are coming in the next phase.
      </p>
    </div>
  )
}
