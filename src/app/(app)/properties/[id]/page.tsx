import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { EditPropertyForm } from '@/components/properties/EditPropertyForm'
import { DeletePropertyButton } from '@/components/properties/DeletePropertyButton'
import AddTenantForm from '@/components/tenants/AddTenantForm'
import type { Property } from '@/types/property'

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .eq('property_id', id)
    .eq('user_id', user!.id)

  if (!property) {
    return <p>Property not found</p>
  }

  const p = property as Property

  return (
    <div>
      <Link href="/properties">← Back to properties</Link>

      <h1>{p.address_line_1}</h1>
      <p>{p.town}, {p.postcode}</p>

      <div style={{ marginTop: '20px' }}>
        <EditPropertyForm property={p} />
        <DeletePropertyButton propertyId={p.id} />
      </div>

      <section style={{ marginTop: '40px' }}>
        <h2>Tenants</h2>

        {!tenants || tenants.length === 0 ? (
          <p>No tenants yet</p>
        ) : (
          tenants.map((tenant) => (
            <div
              key={tenant.id}
              style={{
                marginTop: '12px',
                padding: '16px',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: 'var(--radius)',
                background: 'hsl(var(--color-surface))',
              }}
            >
              <p style={{ fontWeight: 700, marginBottom: '6px' }}>
                {tenant.full_name}
              </p>
              <p>Rent: £{tenant.rent_amount}/month</p>
              <p>Status: {tenant.status}</p>
              {tenant.email && <p>Email: {tenant.email}</p>}
              {tenant.phone && <p>Phone: {tenant.phone}</p>}
              {tenant.start_date && <p>Start date: {tenant.start_date}</p>}
            </div>
          ))
        )}

        <AddTenantForm propertyId={id} />
      </section>
    </div>
  )
}
