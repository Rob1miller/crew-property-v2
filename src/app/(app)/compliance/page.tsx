import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AddComplianceForm } from '@/components/compliance/AddComplianceForm'
import type { ComplianceItem, ComplianceStatus } from '@/types/compliance'
import type { Property } from '@/types/property'

const STATUS_LABELS: Record<ComplianceStatus, string> = {
  valid:      'Valid',
  due_soon:   'Due soon',
  expired:    'Expired',
  missing:    'Missing',
}

const STATUS_COLOURS: Record<ComplianceStatus, { bg: string; text: string }> = {
  valid:    { bg: 'hsl(var(--color-green-muted))', text: 'hsl(var(--color-green))' },
  due_soon: { bg: 'hsl(var(--color-amber-muted))', text: 'hsl(var(--color-amber))' },
  expired:  { bg: 'hsl(var(--color-red-muted))',   text: 'hsl(var(--color-red))' },
  missing:  { bg: 'hsl(var(--color-surface-muted))', text: 'hsl(var(--color-ink-subtle))' },
}

const TYPE_LABELS: Record<string, string> = {
  gas_safety:          'Gas Safety',
  eicr:                'EICR',
  epc:                 'EPC',
  landlord_insurance:  'Landlord Insurance',
  smoke_alarms:        'Smoke Alarms',
  deposit_protection:  'Deposit Protection',
  other:               'Other',
}

export default async function CompliancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: propertiesData }, { data: itemsData }] = await Promise.all([
    supabase
      .from('properties')
      .select('id, address_line_1, town, postcode')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('compliance_items')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  const properties = (propertiesData ?? []) as Pick<Property, 'id' | 'address_line_1' | 'town' | 'postcode'>[]
  const items      = (itemsData ?? []) as ComplianceItem[]

  // Group items by property_id
  const itemsByProperty = items.reduce<Record<string, ComplianceItem[]>>((acc, item) => {
    if (!acc[item.property_id]) acc[item.property_id] = []
    acc[item.property_id].push(item)
    return acc
  }, {})

  const totalItems   = items.length
  const expiredCount = items.filter(i => i.status === 'expired').length
  const missingCount = items.filter(i => i.status === 'missing').length

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Compliance</h1>
          <p>{totalItems} {totalItems === 1 ? 'item' : 'items'} across {properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>
        </div>
      </div>

      {/* Summary strip */}
      {totalItems > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1px',
          background: 'hsl(var(--color-border))',
          border: '1px solid hsl(var(--color-border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}>
          {[
            { label: 'Total',   value: totalItems },
            { label: 'Expired', value: expiredCount, warn: expiredCount > 0 },
            { label: 'Missing', value: missingCount, warn: missingCount > 0 },
          ].map(s => (
            <div key={s.label} style={{ background: 'hsl(var(--color-surface))', padding: '16px 20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--color-ink-faint))', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
                {s.label}
              </p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                color: 'warn' in s && s.warn ? 'hsl(var(--color-red))' : 'hsl(var(--color-ink))',
              }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {properties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', color: 'hsl(var(--color-ink-subtle))' }}>
          <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>No properties yet</p>
          <p style={{ fontSize: '13px' }}>Add a property first, then track its compliance items here.</p>
        </div>
      ) : (
        <>
          <AddComplianceForm properties={properties} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {properties.map(property => {
              const propItems = itemsByProperty[property.id] ?? []
              return (
                <div key={property.id} style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', overflow: 'hidden' }}>

                  {/* Property header */}
                  <div style={{ padding: '14px 20px', borderBottom: propItems.length > 0 ? '1px solid hsl(var(--color-border))' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>
                        {property.address_line_1}
                      </p>
                      <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                        {property.town}, {property.postcode}
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                      {propItems.length} {propItems.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Compliance items */}
                  {propItems.length === 0 ? (
                    <div style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>No compliance items yet for this property.</p>
                    </div>
                  ) : (
                    <div>
                      {propItems.map((item, index) => {
                        const sc = STATUS_COLOURS[item.status]
                        return (
                          <div
                            key={item.id}
                            style={{
                              padding: '14px 20px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '16px',
                              borderBottom: index < propItems.length - 1 ? '1px solid hsl(var(--color-border))' : 'none',
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '2px' }}>
                                {item.title}
                              </p>
                              <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                                {TYPE_LABELS[item.type] ?? item.type}
                                {item.expiry_date && (
                                  <> · Expires {new Date(item.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                )}
                              </p>
                              {item.notes && (
                                <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))', marginTop: '4px' }}>
                                  {item.notes}
                                </p>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: sc.bg,
                                color: sc.text,
                              }}>
                                {STATUS_LABELS[item.status]}
                              </span>

                              <Link
                                href={`/properties/${property.id}`}
                                style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--color-green))', background: 'hsl(var(--color-green-subtle))', border: '1px solid hsl(var(--color-green-muted))', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}
                              >
                                Open
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
