import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch data
  const [{ data: properties }, { data: tenants }] = await Promise.all([
    supabase
      .from('properties')
      .select('id')
      .eq('user_id', user!.id),

    supabase
      .from('tenants')
      .select('property_id, rent_amount, status')
      .eq('user_id', user!.id),
  ])

  const propertyCount = properties?.length ?? 0

  const activeTenants = (tenants ?? []).filter(t => t.status === 'active')
  const activeTenantCount = activeTenants.length

  const totalRent = activeTenants.reduce((sum, t) => sum + (t.rent_amount ?? 0), 0)

  const occupiedPropertyIds = new Set(activeTenants.map(t => t.property_id))
  const vacantCount = propertyCount - occupiedPropertyIds.size

  const stats = [
    { label: 'Properties', value: propertyCount },
    { label: 'Active tenants', value: activeTenantCount },
    { label: 'Monthly rent', value: `£${totalRent.toLocaleString('en-GB')}` },
    { label: 'Vacant', value: vacantCount },
  ]

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.email}</p>
        </div>
      </div>

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
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'hsl(var(--color-surface))',
            padding: '20px 24px',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--color-ink-faint))', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              {s.label}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'hsl(var(--color-ink))' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
