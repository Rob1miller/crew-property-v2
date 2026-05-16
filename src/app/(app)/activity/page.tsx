import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface ActivityLog {
  id: string
  type: string
  message: string
  created_at: string
  property_id: string | null
  tenant_id: string | null
}

interface Property {
  id: string
  address_line_1: string
  town: string
}

interface Tenant {
  id: string
  full_name: string
}

const filters = [
  { id: 'all', label: 'All', types: null },
  { id: 'rent', label: 'Rent', types: ['rent_paid', 'rent_partial', 'rent_unpaid', 'rent_due_generated'] },
  { id: 'notes', label: 'Notes', types: ['property_note_added', 'tenant_note_added'] },
  { id: 'documents', label: 'Documents', types: ['document_uploaded'] },
  { id: 'compliance', label: 'Compliance', types: ['compliance_added', 'compliance_updated', 'reminder_completed'] },
  { id: 'epc', label: 'EPC', types: ['epc_work_added'] },
  { id: 'reminders', label: 'Reminders', types: ['reminder_added', 'reminder_completed'] },
]

const typeTone: Record<string, { label: string; color: string; bg: string; border: string }> = {
  rent_paid: { label: 'Rent', color: 'hsl(var(--color-green))', bg: 'hsl(var(--color-green-subtle))', border: 'hsl(var(--color-green-muted))' },
  rent_partial: { label: 'Rent', color: 'hsl(var(--color-amber))', bg: 'hsl(var(--color-amber-muted))', border: 'hsl(var(--color-amber-muted))' },
  rent_unpaid: { label: 'Rent', color: 'hsl(var(--color-red))', bg: 'hsl(var(--color-red-muted))', border: 'hsl(var(--color-red-muted))' },
  rent_due_generated: { label: 'Rent', color: 'hsl(var(--color-amber))', bg: 'hsl(var(--color-amber-muted))', border: 'hsl(var(--color-amber-muted))' },
  property_note_added: { label: 'Note', color: 'hsl(var(--color-blue))', bg: 'hsl(var(--color-blue-muted))', border: 'hsl(var(--color-blue-muted))' },
  tenant_note_added: { label: 'Note', color: 'hsl(var(--color-blue))', bg: 'hsl(var(--color-blue-muted))', border: 'hsl(var(--color-blue-muted))' },
  document_uploaded: { label: 'Document', color: 'hsl(var(--color-green))', bg: 'hsl(var(--color-green-subtle))', border: 'hsl(var(--color-green-muted))' },
  compliance_added: { label: 'Compliance', color: 'hsl(var(--color-green))', bg: 'hsl(var(--color-green-subtle))', border: 'hsl(var(--color-green-muted))' },
  compliance_updated: { label: 'Compliance', color: 'hsl(var(--color-green))', bg: 'hsl(var(--color-green-subtle))', border: 'hsl(var(--color-green-muted))' },
  epc_work_added: { label: 'EPC', color: 'hsl(var(--color-amber))', bg: 'hsl(var(--color-amber-muted))', border: 'hsl(var(--color-amber-muted))' },
  reminder_added: { label: 'Reminder', color: 'hsl(var(--color-ink-subtle))', bg: 'hsl(var(--color-surface-muted))', border: 'hsl(var(--color-border))' },
  reminder_completed: { label: 'Reminder', color: 'hsl(var(--color-green))', bg: 'hsl(var(--color-green-subtle))', border: 'hsl(var(--color-green-muted))' },
}

function fallbackTypeLabel(type: string) {
  return type.replaceAll('_', ' ')
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const activeFilterId = resolvedSearchParams?.filter ?? 'all'
  const activeFilter = filters.find((filter) => filter.id === activeFilterId) ?? filters[0]

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let logsQuery = supabase
    .from('activity_logs')
    .select('id, type, message, created_at, property_id, tenant_id')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (activeFilter.types) {
    logsQuery = logsQuery.in('type', activeFilter.types)
  }

  const [
    { count: totalCount },
    { data: logsData },
    { data: propertiesData },
    { data: tenantsData },
  ] = await Promise.all([
    supabase
      .from('activity_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id),
    logsQuery,
    supabase
      .from('properties')
      .select('id, address_line_1, town')
      .eq('user_id', user!.id),
    supabase
      .from('tenants')
      .select('id, full_name')
      .eq('user_id', user!.id),
  ])

  const logs = (logsData ?? []) as ActivityLog[]
  const properties = (propertiesData ?? []) as Property[]
  const tenants = (tenantsData ?? []) as Tenant[]
  const propertyMap = Object.fromEntries(properties.map((property) => [property.id, `${property.address_line_1}, ${property.town}`]))
  const tenantMap = Object.fromEntries(tenants.map((tenant) => [tenant.id, tenant.full_name]))

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Activity</h1>
          <p>{totalCount ?? logs.length} {totalCount === 1 ? 'activity item' : 'activity items'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {filters.map((filter) => {
          const active = filter.id === activeFilter.id
          return (
            <Link
              key={filter.id}
              href={filter.id === 'all' ? '/activity' : `/activity?filter=${filter.id}`}
              style={{
                padding: '7px 12px',
                borderRadius: '999px',
                border: active ? '1px solid hsl(var(--color-green))' : '1px solid hsl(var(--color-border))',
                background: active ? 'hsl(var(--color-green-subtle))' : 'hsl(var(--color-surface))',
                color: active ? 'hsl(var(--color-green))' : 'hsl(var(--color-ink-subtle))',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {filter.label}
            </Link>
          )
        })}
      </div>

      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', color: 'hsl(var(--color-ink-subtle))' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '6px' }}>No activity yet</p>
          <p style={{ fontSize: '13px' }}>Activity will appear here as you manage properties, tenants, reminders and documents.</p>
        </div>
      ) : (
        <div style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {logs.map((log, index) => {
            const tone = typeTone[log.type] ?? {
              label: fallbackTypeLabel(log.type),
              color: 'hsl(var(--color-ink-subtle))',
              bg: 'hsl(var(--color-surface-muted))',
              border: 'hsl(var(--color-border))',
            }

            return (
              <div
                className="activity-row"
                key={log.id}
                style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', padding: '14px 18px', borderBottom: index < logs.length - 1 ? '1px solid hsl(var(--color-border))' : 'none' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: tone.color, background: tone.bg, border: `1px solid ${tone.border}` }}>
                      {tone.label}
                    </span>
                    <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                      {new Date(log.created_at).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '3px' }}>
                    {log.message}
                  </p>

                  {(log.property_id || log.tenant_id) && (
                    <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                      {log.property_id && propertyMap[log.property_id] ? (
                        <Link href={`/properties/${log.property_id}`} style={{ color: 'hsl(var(--color-ink-subtle))', textDecoration: 'none' }}>
                          {propertyMap[log.property_id]}
                        </Link>
                      ) : null}
                      {log.property_id && log.tenant_id && tenantMap[log.tenant_id] ? ' · ' : ''}
                      {log.tenant_id && tenantMap[log.tenant_id] ? tenantMap[log.tenant_id] : null}
                    </p>
                  )}
                </div>

                <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 700, color: 'hsl(var(--color-ink-faint))', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {fallbackTypeLabel(log.type)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
