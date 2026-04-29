import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { EditPropertyForm } from '@/components/properties/EditPropertyForm'
import { DeletePropertyButton } from '@/components/properties/DeletePropertyButton'
import type { Property } from '@/types/property'

async function endTenancyAction(formData: FormData) {
  'use server'
  const tenantId = formData.get('tenantId') as string
  const propertyId = formData.get('propertyId') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('tenants')
    .update({ status: 'ended', end_date: new Date().toISOString().split('T')[0] })
    .eq('id', tenantId)
    .eq('user_id', user.id)

  revalidatePath(`/properties/${propertyId}`)
}

async function addComplianceAction(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const property_id = formData.get('property_id') as string

  await supabase.from('compliance_items').insert({
    user_id: user.id,
    property_id,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    expiry_date: formData.get('expiry_date') as string,
    notes: (formData.get('notes') as string) || null,
    status: 'active',
  })

  revalidatePath(`/properties/${property_id}`)
}

async function deleteComplianceAction(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const property_id = formData.get('property_id') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('compliance_items').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath(`/properties/${property_id}`)
}

const typeLabel: Record<string, string> = {
  gas: 'Gas Safety',
  eicr: 'Electrical EICR',
  epc: 'EPC',
  insurance: 'Insurance',
}

function expiryBadge(dateStr: string) {
  const days = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'Expired'
  if (days <= 30) return 'Expiring soon'
  return 'Valid'
}

interface Tenant {
  id: string
  full_name: string
  rent_amount: number
  start_date: string | null
  email: string | null
  phone: string | null
}

interface ComplianceItem {
  id: string
  type: string
  title: string
  status: string
  expiry_date: string
  notes: string | null
  document_url: string | null
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: property }, { data: activeTenant }, { data: complianceData }] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).eq('user_id', user!.id).single(),
    supabase.from('tenants').select('id, full_name, rent_amount, start_date, email, phone').eq('property_id', id).eq('user_id', user!.id).eq('status', 'active').maybeSingle(),
    supabase.from('compliance_items').select('*').eq('property_id', id).eq('user_id', user!.id).order('expiry_date'),
  ])

  if (!property) return <p style={{ padding: '40px' }}>Property not found.</p>

  const p = property as Property
  const tenant = activeTenant as Tenant | null
  const compliance = (complianceData ?? []) as ComplianceItem[]

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '24px' }}>
        <Link href="/properties">← Back to properties</Link>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>{p.address_line_1}</h1>
          <p>{p.town}, {p.postcode}</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
          <EditPropertyForm property={p} />
          <DeletePropertyButton propertyId={p.id} />
        </div>
      </div>

      <section style={{ marginTop: '32px' }}>
        <h2>Current tenant</h2>

        {!tenant ? (
          <div style={{ padding: '24px', border: '1px solid #ddd', borderRadius: '12px', marginTop: '12px' }}>
            <p><strong>Vacant</strong></p>
            <p>No active tenant for this property.</p>
            <Link href="/tenants">+ Add tenant</Link>
          </div>
        ) : (
          <div style={{ padding: '24px', border: '1px solid #ddd', borderRadius: '12px', marginTop: '12px' }}>
            <p><strong>{tenant.full_name}</strong></p>
            <p>Rent: £{tenant.rent_amount.toLocaleString('en-GB')}/month</p>
            {tenant.start_date && <p>Started: {new Date(tenant.start_date).toLocaleDateString('en-GB')}</p>}
            {tenant.email && <p>Email: {tenant.email}</p>}
            {tenant.phone && <p>Phone: {tenant.phone}</p>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <Link href="/tenants">Edit tenant</Link>

              <form action={endTenancyAction}>
                <input type="hidden" name="tenantId" value={tenant.id} />
                <input type="hidden" name="propertyId" value={id} />
                <button type="submit">End tenancy</button>
              </form>
            </div>
          </div>
        )}
      </section>

      <section style={{ marginTop: '32px' }}>
        <h2>Compliance</h2>

        <details style={{ marginTop: '12px', marginBottom: '16px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>+ Add compliance item</summary>

          <form action={addComplianceAction} style={{ marginTop: '16px', display: 'grid', gap: '12px', maxWidth: '500px' }}>
            <input type="hidden" name="property_id" value={id} />

            <select name="type" required>
              <option value="">Select type</option>
              <option value="gas">Gas Safety</option>
              <option value="eicr">Electrical EICR</option>
              <option value="epc">EPC</option>
              <option value="insurance">Insurance</option>
            </select>

            <input name="title" required placeholder="Title e.g. Gas Safety Certificate" />
            <input name="expiry_date" required type="date" />
            <textarea name="notes" placeholder="Notes" />

            <button type="submit">Save compliance item</button>
          </form>
        </details>

        {compliance.length === 0 ? (
          <p>No compliance items yet.</p>
        ) : (
          compliance.map(item => (
            <div key={item.id} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '12px', marginTop: '10px' }}>
              <p><strong>{item.title}</strong></p>
              <p>{typeLabel[item.type] ?? item.type}</p>
              <p>Expires: {new Date(item.expiry_date).toLocaleDateString('en-GB')}</p>
              <p>Status: {expiryBadge(item.expiry_date)}</p>
              {item.notes && <p>Notes: {item.notes}</p>}

              {item.document_url && (
                <a href={item.document_url} target="_blank" rel="noopener noreferrer">
                  View doc
                </a>
              )}

              <form action={deleteComplianceAction} style={{ marginTop: '8px' }}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="property_id" value={id} />
                <button type="submit">Remove</button>
              </form>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
