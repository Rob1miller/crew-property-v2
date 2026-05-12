import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────

interface Property {
  id: string
  address_line_1: string
  town: string
  postcode: string | null
}
interface Tenant {
  id: string
  property_id: string
  status: string
  rent_amount: number
}

interface RentPayment {
  id: string
  tenant_id: string
  payment_month: string
  amount_due: number
  amount_paid: number
  paid: boolean
}
interface ComplianceItem {
  id: string
  property_id: string
  title: string | null
  type: string
  expiry_date: string
}
interface EpcPlan {
  id: string
  property_id: string
  current_rating: string
  target_rating: string
}

type AlertLevel = 'urgent' | 'warning' | 'info'
interface Alert {
  level:           AlertLevel
  message:         string
  propertyId:      string
  propertyAddress: string
  urgencyRank:     number
  href?:           string
  actionLabel?:    string
}

// ── Helpers ───────────────────────────────────────────────────

const complianceTypeLabel: Record<string, string> = {
  gas: 'Gas Safety', eicr: 'Electrical (EICR)', epc: 'EPC', insurance: 'Insurance',
}

function fmt(n: number) {
  return n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 })
}

const alertBorder: Record<AlertLevel, string> = {
  urgent:  'hsl(0 72% 51%)',
  warning: 'hsl(38 92% 50%)',
  info:    'hsl(var(--color-border))',
}
const alertDot: Record<AlertLevel, string> = {
  urgent:  'hsl(0 72% 51%)',
  warning: 'hsl(38 92% 50%)',
  info:    'hsl(var(--color-ink-subtle))',
}
const alertLabel: Record<AlertLevel, string> = {
  urgent:  'Urgent',
  warning: 'Warning',
  info:    'Info',
}
const alertLabelColour: Record<AlertLevel, string> = {
  urgent:  'hsl(0 72% 45%)',
  warning: 'hsl(38 92% 40%)',
  info:    'hsl(var(--color-ink-subtle))',
}
const alertLabelBg: Record<AlertLevel, string> = {
  urgent:  'hsl(0 72% 45% / 0.1)',
  warning: 'hsl(38 92% 50% / 0.1)',
  info:    'hsl(var(--color-surface-muted))',
}

// ── Page ─────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: propertiesData },
    { data: tenantsData },
    { data: complianceData },
    { data: epcPlansData },
    { data: rentPaymentsData },
  ] = await Promise.all([
    supabase
      .from('properties')
      .select('id, address_line_1, town, postcode')
      .eq('user_id', user!.id)
      .order('created_at'),
    supabase
      .from('tenants')
      .select('id, property_id, status, rent_amount')
      .eq('user_id', user!.id),
    supabase
      .from('compliance_items')
      .select('id, property_id, title, type, expiry_date')
      .eq('user_id', user!.id),
    supabase
      .from('epc_plans')
      .select('id, property_id, current_rating, target_rating')
      .eq('user_id', user!.id),
    supabase
      .from('rent_payments')
      .select('id, tenant_id, payment_month, amount_due, amount_paid, paid')
      .eq('user_id', user!.id),
  ])

  const properties = (propertiesData ?? []) as Property[]
  const tenants    = (tenantsData    ?? []) as Tenant[]
  const compliance = (complianceData ?? []) as ComplianceItem[]
  const epcPlans   = (epcPlansData   ?? []) as EpcPlan[]
  const rentPayments = (rentPaymentsData ?? []) as RentPayment[]

  // ── Computed values ──────────────────────────────────────

  const today    = new Date(); today.setHours(0, 0, 0, 0)
  const in30     = new Date(today); in30.setDate(today.getDate() + 30)

  const activeTenants      = tenants.filter((t) => t.status === 'active')
  const monthlyRent        = activeTenants.reduce((s, t) => s + (t.rent_amount ?? 0), 0)
  const occupiedIds        = new Set(activeTenants.map((t) => t.property_id))
  const vacantProperties   = properties.filter((p) => !occupiedIds.has(p.id))

  const expiredCompliance  = compliance.filter((c) => new Date(c.expiry_date) < today)
  const expiringCompliance = compliance.filter((c) => {
    const d = new Date(c.expiry_date)
    return d >= today && d <= in30
  })

  const epcPlanMap          = Object.fromEntries(epcPlans.map((p) => [p.property_id, p]))
  const belowCPlans         = epcPlans.filter((p) => ['D','E','F','G'].includes(p.current_rating))
  const propertiesNoEpcPlan = properties.filter((p) => !epcPlanMap[p.id])

  const propertyAddress = (p: Property) => `${p.address_line_1}, ${p.town}`
  const propertyMap     = Object.fromEntries(properties.map((p) => [p.id, propertyAddress(p)]))

  const currentMonthKey = (() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })()

  const currentRentPayments = rentPayments.filter((p) => p.payment_month === currentMonthKey)
  const currentPaymentMap = Object.fromEntries(currentRentPayments.map((p) => [p.tenant_id, p]))

  const unpaidTenants = activeTenants.filter((t) => {
    const payment = currentPaymentMap[t.id]
    return !payment || Number(payment.amount_paid ?? 0) <= 0
  })

  const partialTenants = activeTenants.filter((t) => {
    const payment = currentPaymentMap[t.id]
    if (!payment) return false
    const paid = Number(payment.amount_paid ?? 0)
    const due = Number(payment.amount_due ?? t.rent_amount ?? 0)
    return paid > 0 && paid < due
  })

  const currentArrears = activeTenants.reduce((sum, t) => {
    const payment = currentPaymentMap[t.id]
    if (!payment) return sum + Number(t.rent_amount ?? 0)
    return sum + Math.max(0, Number(payment.amount_due ?? t.rent_amount ?? 0) - Number(payment.amount_paid ?? 0))
  }, 0)

  // ── Build alerts ─────────────────────────────────────────

  const alerts: Alert[] = []

  for (const c of expiredCompliance) {
    const label = c.title || complianceTypeLabel[c.type] || c.type
    alerts.push({ level: 'urgent', urgencyRank: 0, message: `${label} has expired`, propertyId: c.property_id, propertyAddress: propertyMap[c.property_id] ?? 'Unknown property' })
  }

  for (const c of expiringCompliance) {
    const label = c.title || complianceTypeLabel[c.type] || c.type
    const days  = Math.floor((new Date(c.expiry_date).getTime() - today.getTime()) / 86_400_000)
    alerts.push({ level: 'warning', urgencyRank: 1, message: `${label} expires in ${days} day${days !== 1 ? 's' : ''}`, propertyId: c.property_id, propertyAddress: propertyMap[c.property_id] ?? 'Unknown property' })
  }

  for (const t of unpaidTenants) {
    alerts.push({ level: 'urgent', urgencyRank: 2, message: `Rent unpaid this month — ${fmt(t.rent_amount)}`, propertyId: t.property_id, propertyAddress: propertyMap[t.property_id] ?? 'Unknown property', href: '/tenants', actionLabel: 'View tenant →' })
  }

  for (const t of partialTenants) {
    const payment = currentPaymentMap[t.id]
    const shortfall = Math.max(0, Number(payment.amount_due ?? t.rent_amount ?? 0) - Number(payment.amount_paid ?? 0))
    alerts.push({ level: 'warning', urgencyRank: 3, message: `Partial rent paid — ${fmt(shortfall)} outstanding`, propertyId: t.property_id, propertyAddress: propertyMap[t.property_id] ?? 'Unknown property', href: '/tenants', actionLabel: 'View tenant →' })
  }

  for (const p of vacantProperties) {
    alerts.push({ level: 'warning', urgencyRank: 4, message: 'Property is vacant', propertyId: p.id, propertyAddress: propertyAddress(p) })
  }

  for (const plan of belowCPlans) {
    alerts.push({ level: 'warning', urgencyRank: 5, message: `EPC rating ${plan.current_rating} — target ${plan.target_rating}`, propertyId: plan.property_id, propertyAddress: propertyMap[plan.property_id] ?? 'Unknown property' })
  }

  for (const p of propertiesNoEpcPlan) {
    alerts.push({ level: 'info', urgencyRank: 6, message: 'No EPC plan set up', propertyId: p.id, propertyAddress: propertyAddress(p) })
  }

  alerts.sort((a, b) => a.urgencyRank - b.urgencyRank)

  // ── Stat cards ───────────────────────────────────────────

  const stats = [
    { label: 'Properties',               value: properties.length,             warn: false },
    { label: 'Active tenants',           value: activeTenants.length,          warn: false },
    { label: 'Monthly rent',             value: fmt(monthlyRent),              warn: false },
    { label: 'Vacant',                   value: vacantProperties.length,       warn: vacantProperties.length > 0 },
    { label: 'Compliance expiring soon', value: expiringCompliance.length,     warn: expiringCompliance.length > 0 },
    { label: 'Expired compliance',       value: expiredCompliance.length,      warn: expiredCompliance.length > 0 },
    { label: 'EPC below C',              value: belowCPlans.length,            warn: belowCPlans.length > 0 },
    { label: 'Missing EPC plan',         value: propertiesNoEpcPlan.length,    warn: propertiesNoEpcPlan.length > 0 },
    { label: 'Unpaid rent',              value: unpaidTenants.length,           warn: unpaidTenants.length > 0 },
    { label: 'Partial rent',             value: partialTenants.length,          warn: partialTenants.length > 0 },
    { label: 'Current arrears',          value: fmt(currentArrears),            warn: currentArrears > 0 },
  ]

  return (
    <div className="animate-slide-up">

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Overview of your portfolio</p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', marginBottom: '32px', background: 'hsl(var(--color-border))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-lg, var(--radius))', overflow: 'hidden' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: 'hsl(var(--color-surface))', padding: '20px 24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--color-ink-subtle))', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              {s.label}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '30px', lineHeight: 1, color: s.warn ? 'hsl(38 92% 40%)' : 'hsl(var(--color-ink))' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <Link href="/properties" style={{ padding: '10px 14px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, color: 'hsl(var(--color-ink))', textDecoration: 'none' }}>
          Manage properties →
        </Link>
        <Link href="/compliance" style={{ padding: '10px 14px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, color: 'hsl(var(--color-ink))', textDecoration: 'none' }}>
          Review compliance →
        </Link>
        <Link href="/epc" style={{ padding: '10px 14px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, color: 'hsl(var(--color-ink))', textDecoration: 'none' }}>
          EPC planner →
        </Link>
        <Link href="/documents" style={{ padding: '10px 14px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, color: 'hsl(var(--color-ink))', textDecoration: 'none' }}>
          Documents →
        </Link>
      </div>

      {/* Alerts */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>Alerts</h2>
          {alerts.length > 0 && (
            <span style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
              {alerts.length} {alerts.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {alerts.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '28px', marginBottom: '10px' }}>✓</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '6px' }}>All clear</p>
            <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>No urgent issues across your portfolio.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alerts.map((alert, i) => (
              <div
                key={i}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '14px',
                  padding:      '14px 18px',
                  background:   'hsl(var(--color-surface))',
                  border:       '1px solid hsl(var(--color-border))',
                  borderLeft:   `4px solid ${alertBorder[alert.level]}`,
                  borderRadius: 'var(--radius)',
                }}
              >
                {/* Dot */}
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: alertDot[alert.level] }} />

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '2px' }}>
                    {alert.message}
                  </p>
                  <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {alert.propertyAddress}
                  </p>
                </div>

                {/* Level badge */}
                <span style={{ flexShrink: 0, padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: alertLabelBg[alert.level], color: alertLabelColour[alert.level] }}>
                  {alertLabel[alert.level]}
                </span>

                {/* Link */}
                <Link
                  href={alert.href ?? `/properties/${alert.propertyId}`}
                  style={{ flexShrink: 0, padding: '5px 12px', background: 'transparent', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  {alert.actionLabel ?? 'View property →'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      {properties.length === 0 && (
        <div style={{ marginTop: '32px', padding: '32px 24px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', textAlign: 'center' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '8px' }}>Get started</p>
          <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', marginBottom: '20px' }}>Add your first property to start tracking your portfolio.</p>
          <Link
            href="/properties"
            style={{ padding: '9px 20px', background: 'hsl(var(--color-green))', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
          >
            Add a property
          </Link>
        </div>
      )}

    </div>
  )
}
