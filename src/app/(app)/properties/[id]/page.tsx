import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { EditPropertyForm } from '@/components/properties/EditPropertyForm'
import { DeletePropertyButton } from '@/components/properties/DeletePropertyButton'
import type { Property } from '@/types/property'

async function endTenancyAction(formData: FormData) {
  'use server'
  const tenantId   = formData.get('tenantId')   as string
  const propertyId = formData.get('propertyId') as string
  if (!tenantId || !propertyId) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('tenants')
    .update({
      status:   'ended',
      end_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', tenantId)
    .eq('user_id', user.id)

  revalidatePath(`/properties/${propertyId}`)
}

interface Tenant {
  id:          string
  full_name:   string
  rent_amount: number
  start_date:  string | null
  status:      'active' | 'notice' | 'ended'
  email:       string | null
  phone:       string | null
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: property }, { data: activeTenant }] = await Promise.all([
    supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('user_id', user!.id)
      .single(),
    supabase
      .from('tenants')
      .select('id, full_name, rent_amount, start_date, status, email, phone')
      .eq('property_id', id)
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .maybeSingle(),
  ])

  if (!property) {
    return <p style={{ padding: '40px', color: 'hsl(var(--color-ink-subtle))' }}>Property not found.</p>
  }

  const p      = property as Property
  const tenant = activeTenant as Tenant | null

  return (
    <div className="animate-slide-up">

      {/* Back link */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/properties"
          style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', textDecoration: 'none' }}
        >
          ← Back to properties
        </Link>
      </div>

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>{p.address_line_1}</h1>
          <p>{p.town}{p.postcode ? `, ${p.postcode}` : ''}</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
          <EditPropertyForm property={p} />
          <DeletePropertyButton propertyId={p.id} />
        </div>
      </div>

      {/* Current tenant section */}
      <section style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>
            Current tenant
          </h2>
          {!tenant && (
            <Link
              href="/tenants"
              style={{ padding: '7px 16px', background: 'hsl(var(--color-green))', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
            >
              + Add tenant
            </Link>
          )}
        </div>

        {!tenant ? (
          <div
            style={{
              padding:      '40px 24px',
              textAlign:    'center',
              background:   'hsl(var(--color-surface))',
              border:       '1px solid hsl(var(--color-border))',
              borderRadius: 'var(--radius)',
            }}
          >
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '6px' }}>
              Vacant
            </p>
            <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>
              No active tenant for this property.
            </p>
          </div>
        ) : (
          <div
            style={{
              background:   'hsl(var(--color-surface))',
              border:       '1px solid hsl(var(--color-border))',
              borderRadius: 'var(--radius)',
              padding:      '20px 24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>

              {/* Tenant info */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width:           '40px',
                    height:          '40px',
                    borderRadius:    '50%',
                    background:      'hsl(var(--color-green-subtle))',
                    border:          '1px solid hsl(var(--color-green-muted))',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    flexShrink:      0,
                    fontSize:        '14px',
                    fontWeight:      700,
                    color:           'hsl(var(--color-green))',
                  }}
                >
                  {tenant.full_name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: 'hsl(var(--color-ink))' }}>
                      {tenant.full_name}
                    </p>
                    <span
                      style={{
                        padding:      '2px 8px',
                        borderRadius: '999px',
                        fontSize:     '11px',
                        fontWeight:   600,
                        background:   'hsl(var(--color-green-subtle))',
                        color:        'hsl(var(--color-green))',
                        border:       '1px solid hsl(var(--color-green-muted))',
                      }}
                    >
                      Active
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', marginBottom: '2px' }}>
                    £{tenant.rent_amount.toLocaleString('en-GB')}/month
                  </p>

                  {tenant.start_date && (
                    <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', marginBottom: '2px' }}>
                      Started{' '}
                      {new Date(tenant.start_date).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  )}

                  {tenant.email && (
                    <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', marginBottom: '2px' }}>
                      {tenant.email}
                    </p>
                  )}

                  {tenant.phone && (
                    <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>
                      {tenant.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Link
                  href="/tenants"
                  style={{
                    padding:        '7px 14px',
                    background:     'transparent',
                    color:          'hsl(var(--color-ink-subtle))',
                    border:         '1px solid hsl(var(--color-border))',
                    borderRadius:   'var(--radius-sm)',
                    fontSize:       '12px',
                    fontWeight:     600,
                    textDecoration: 'none',
                    display:        'inline-flex',
                    alignItems:     'center',
                  }}
                >
                  Edit tenant
                </Link>

                <form action={endTenancyAction}>
                  <input type="hidden" name="tenantId"   value={tenant.id} />
                  <input type="hidden" name="propertyId" value={id} />
                  <button
                    type="submit"
                    style={{
                      padding:      '7px 14px',
                      background:   'transparent',
                      color:        'hsl(var(--color-red, 0 72% 51%))',
                      border:       '1px solid hsl(var(--color-border))',
                      borderRadius: 'var(--radius-sm)',
                      fontSize:     '12px',
                      fontWeight:   600,
                      cursor:       'pointer',
                    }}
                  >
                    End tenancy
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}
      </section>

    </div>
  )
}
