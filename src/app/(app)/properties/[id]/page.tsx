import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { EditPropertyForm } from '@/components/properties/EditPropertyForm'
import { DeletePropertyButton } from '@/components/properties/DeletePropertyButton'
import type { Property } from '@/types/property'

// ─────────────────────────────────────────────────────────────
// Server actions
// ─────────────────────────────────────────────────────────────

async function endTenancyAction(formData: FormData) {
  'use server'
  const tenantId   = formData.get('tenantId')   as string
  const propertyId = formData.get('propertyId') as string
  if (!tenantId || !propertyId) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('tenants')
    .update({ status: 'ended', end_date: new Date().toISOString().split('T')[0] })
    .eq('id', tenantId).eq('user_id', user.id)
  revalidatePath(`/properties/${propertyId}`)
}

async function addComplianceAction(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const property_id = formData.get('property_id') as string
  const type        = formData.get('type')        as string
  const title       = formData.get('title')       as string
  const expiry_date = formData.get('expiry_date') as string
  const notes       = (formData.get('notes') as string) || null
  if (!property_id || !type || !title || !expiry_date) return
  await supabase.from('compliance_items').insert({
    user_id: user.id, property_id, type, title, expiry_date, notes, status: 'active',
  })
  revalidatePath(`/properties/${property_id}`)
}

async function updateComplianceAction(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const id           = (formData.get('id')           as string)?.trim()
  const property_id  = (formData.get('property_id')  as string)?.trim()
  const type         = (formData.get('type')         as string)?.trim()
  const title        = (formData.get('title')        as string)?.trim()
  const expiry_date  = (formData.get('expiry_date')  as string)?.trim()
  const notes        = (formData.get('notes')        as string)?.trim() || null
  const document_url = (formData.get('document_url') as string)?.trim() || null
  if (!id || !property_id || !type || !title || !expiry_date) return
  await supabase.from('compliance_items')
    .update({
      type,
      title,
      expiry_date,
      notes,
      document_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
  revalidatePath(`/properties/${property_id}`)
}

async function deleteComplianceAction(formData: FormData) {
  'use server'
  const id          = formData.get('id')          as string
  const property_id = formData.get('property_id') as string
  if (!id || !property_id) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('compliance_items').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath(`/properties/${property_id}`)
}

async function saveEpcPlanAction(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const property_id    = formData.get('property_id')    as string
  const plan_id        = (formData.get('plan_id') as string) || null
  const current_rating = formData.get('current_rating') as string
  const target_rating  = formData.get('target_rating')  as string
  const expiry_date    = (formData.get('expiry_date') as string) || null
  const cap_amount     = Number(formData.get('cap_amount')) || 10000
  if (!property_id || !current_rating || !target_rating) return
  if (plan_id) {
    await supabase.from('epc_plans')
      .update({ current_rating, target_rating, expiry_date, cap_amount, updated_at: new Date().toISOString() })
      .eq('id', plan_id).eq('user_id', user.id)
  } else {
    await supabase.from('epc_plans').insert({
      user_id: user.id, property_id, current_rating, target_rating, expiry_date, cap_amount,
    })
  }
  revalidatePath(`/properties/${property_id}`)
}

async function addEpcWorkAction(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const property_id    = formData.get('property_id')    as string
  const epc_plan_id    = formData.get('epc_plan_id')    as string
  const work_completed = formData.get('work_completed') as string
  const cost           = Number(formData.get('cost'))   || 0
  const completed_date = (formData.get('completed_date') as string) || null
  const contractor     = (formData.get('contractor')    as string) || null
  const notes          = (formData.get('notes')         as string) || null
  const receipt_url    = (formData.get('receipt_url')   as string) || null
  if (!property_id || !epc_plan_id || !work_completed) return
  await supabase.from('epc_works').insert({
    user_id: user.id, property_id, epc_plan_id, work_completed,
    cost, completed_date, contractor, notes, receipt_url,
  })
  revalidatePath(`/properties/${property_id}`)
}

async function deleteEpcWorkAction(formData: FormData) {
  'use server'
  const id          = formData.get('id')          as string
  const property_id = formData.get('property_id') as string
  if (!id || !property_id) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('epc_works').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath(`/properties/${property_id}`)
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Tenant {
  id: string; full_name: string; rent_amount: number
  start_date: string | null; email: string | null; phone: string | null
}
interface ComplianceItem {
  id: string; type: string; title: string; status: string
  expiry_date: string; notes: string | null; document_url: string | null
}
interface EpcPlan {
  id: string; current_rating: string; target_rating: string
  expiry_date: string | null; cap_amount: number
}
interface EpcWork {
  id: string; work_completed: string; cost: number
  completed_date: string | null; contractor: string | null
  notes: string | null; receipt_url: string | null
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const complianceTypeLabel: Record<string, string> = {
  gas: 'Gas Safety', eicr: 'Electrical (EICR)', epc: 'EPC', insurance: 'Insurance',
}

function expiryBadge(dateStr: string) {
  const days = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (days < 0)   return { label: 'Expired',       color: 'hsl(0 72% 45%)',    bg: 'hsl(0 72% 45% / 0.1)' }
  if (days <= 30) return { label: 'Expiring soon', color: 'hsl(38 92% 40%)',   bg: 'hsl(38 92% 50% / 0.1)' }
  return             { label: 'Valid',            color: 'hsl(var(--color-green))', bg: 'hsl(var(--color-green-subtle))' }
}

function ratingStyle(r: string) {
  if (['A', 'B', 'C'].includes(r)) return { color: 'hsl(var(--color-green))', bg: 'hsl(var(--color-green-subtle))', border: 'hsl(var(--color-green-muted))' }
  if (r === 'D')                   return { color: 'hsl(38 92% 40%)',  bg: 'hsl(38 92% 50% / 0.1)',  border: 'hsl(38 92% 70%)' }
  return                                  { color: 'hsl(0 72% 45%)',   bg: 'hsl(0 72% 45% / 0.1)',   border: 'hsl(0 72% 70%)' }
}

function fmt(n: number) {
  return n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: property },
    { data: activeTenant },
    { data: complianceData },
    { data: epcPlanData },
    { data: epcWorksData },
  ] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).eq('user_id', user!.id).single(),
    supabase.from('tenants')
      .select('id, full_name, rent_amount, start_date, email, phone')
      .eq('property_id', id).eq('user_id', user!.id).eq('status', 'active').maybeSingle(),
    supabase.from('compliance_items')
      .select('id, type, title, status, expiry_date, notes, document_url')
      .eq('property_id', id).eq('user_id', user!.id).order('expiry_date'),
    supabase.from('epc_plans').select('*')
      .eq('property_id', id).eq('user_id', user!.id)
      .order('created_at', { ascending: false }).maybeSingle(),
    supabase.from('epc_works').select('*')
      .eq('property_id', id).eq('user_id', user!.id).order('created_at'),
  ])

  if (!property) {
    return <p style={{ padding: '40px', color: 'hsl(var(--color-ink-subtle))' }}>Property not found.</p>
  }

  const p          = property as Property
  const tenant     = activeTenant  as Tenant        | null
  const compliance = (complianceData ?? []) as ComplianceItem[]
  const epcPlan    = epcPlanData   as EpcPlan       | null
  const epcWorks   = (epcWorksData ?? []) as EpcWork[]

  const totalSpend = epcWorks.reduce((s, w) => s + (w.cost ?? 0), 0)
  const cap        = epcPlan?.cap_amount ?? 10000
  const remaining  = cap - totalSpend
  const spendPct   = Math.min(100, Math.round((totalSpend / cap) * 100))

  const inputStyle = {
    display: 'block', width: '100%', padding: '9px 12px',
    border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)',
    fontSize: '14px', color: 'hsl(var(--color-ink))', background: 'hsl(var(--color-surface))',
    outline: 'none', fontFamily: 'inherit',
  }
  const labelSt = {
    display: 'block', fontSize: '12px', fontWeight: 600 as const,
    color: 'hsl(var(--color-ink-muted))', marginBottom: '5px',
    textTransform: 'uppercase' as const, letterSpacing: '0.4px',
  }
  const sectionHead = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
  }
  const h2Style = { fontSize: '15px', fontWeight: 600 as const, color: 'hsl(var(--color-ink))' }
  const card = {
    background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))',
    borderRadius: 'var(--radius)', padding: '20px 24px',
  }

  return (
    <div className="animate-slide-up">

      {/* Back */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/properties" style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', textDecoration: 'none' }}>
          ← Back to properties
        </Link>
      </div>

      {/* Header */}
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

      {/* ── Tenant ─────────────────────────────────────────── */}
      <section style={{ marginTop: '32px' }}>
        <div style={sectionHead}>
          <h2 style={h2Style}>Current tenant</h2>
          {!tenant && (
            <Link href="/tenants" style={{ padding: '7px 16px', background: 'hsl(var(--color-green))', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              + Add tenant
            </Link>
          )}
        </div>

        {!tenant ? (
          <div style={{ ...card, textAlign: 'center', padding: '40px 24px' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '6px' }}>Vacant</p>
            <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>No active tenant for this property.</p>
          </div>
        ) : (
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsl(var(--color-green-subtle))', border: '1px solid hsl(var(--color-green-muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px', fontWeight: 700, color: 'hsl(var(--color-green))' }}>
                  {tenant.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: 'hsl(var(--color-ink))' }}>{tenant.full_name}</p>
                    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: 'hsl(var(--color-green-subtle))', color: 'hsl(var(--color-green))', border: '1px solid hsl(var(--color-green-muted))' }}>Active</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', marginBottom: '2px' }}>£{tenant.rent_amount.toLocaleString('en-GB')}/month</p>
                  {tenant.start_date && (
                    <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', marginBottom: '2px' }}>
                      Started {new Date(tenant.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  {tenant.email && <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', marginBottom: '2px' }}>{tenant.email}</p>}
                  {tenant.phone && <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>{tenant.phone}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Link href="/tenants" style={{ padding: '7px 14px', background: 'transparent', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  Edit tenant
                </Link>
                <form action={endTenancyAction}>
                  <input type="hidden" name="tenantId"   value={tenant.id} />
                  <input type="hidden" name="propertyId" value={id} />
                  <button type="submit" style={{ padding: '7px 14px', background: 'transparent', color: 'hsl(0 72% 51%)', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    End tenancy
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Compliance ─────────────────────────────────────── */}
      <section style={{ marginTop: '32px' }}>
        <div style={sectionHead}>
          <h2 style={h2Style}>Compliance</h2>
          <span style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
            {compliance.length} {compliance.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Add new item */}
        <details style={{ marginBottom: '16px' }}>
          <summary style={{ listStyle: 'none', display: 'inline-flex', alignItems: 'center', padding: '7px 16px', background: 'hsl(var(--color-green))', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
            + Add item
          </summary>
          <div style={{ marginTop: '12px', ...card }}>
            <form action={addComplianceAction}>
              <input type="hidden" name="property_id" value={id} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={labelSt}>Type *</label>
                  <select name="type" required style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select…</option>
                    <option value="gas">Gas Safety</option>
                    <option value="eicr">Electrical (EICR)</option>
                    <option value="epc">EPC</option>
                    <option value="insurance">Insurance</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Expiry date *</label>
                  <input name="expiry_date" type="date" required style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelSt}>Title *</label>
                <input name="title" type="text" required placeholder="e.g. Gas Safety Certificate 2025" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelSt}>Notes</label>
                <textarea name="notes" rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
              </div>
              <button type="submit" style={{ padding: '8px 20px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Save item
              </button>
            </form>
          </div>
        </details>

        {compliance.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: '32px 24px' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'hsl(var(--color-ink))', marginBottom: '4px' }}>No compliance items yet</p>
            <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>Use the button above to add your first item.</p>
          </div>
        ) : (
          <div style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {compliance.map((item, index) => {
              const badge = expiryBadge(item.expiry_date)
              return (
                <div key={item.id} style={{ borderBottom: index < compliance.length - 1 ? '1px solid hsl(var(--color-border))' : 'none' }}>

                  {/* ── Item summary row ── */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', padding: '14px 20px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' as const }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>{item.title}</p>
                        <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: 'hsl(var(--color-surface-muted))', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))' }}>
                          {complianceTypeLabel[item.type] ?? item.type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const }}>
                        <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                          Expires {new Date(item.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: badge.bg, color: badge.color }}>{badge.label}</span>
                      </div>
                      {item.notes && <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))', fontStyle: 'italic', marginTop: '4px' }}>{item.notes}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                      {item.document_url ? (
                        <a href={item.document_url} target="_blank" rel="noopener noreferrer" style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, color: 'hsl(var(--color-green))', background: 'hsl(var(--color-green-subtle))', border: '1px solid hsl(var(--color-green-muted))', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
                          View
                        </a>
                      ) : null}
                      <form action={deleteComplianceAction}>
                        <input type="hidden" name="id"          value={item.id} />
                        <input type="hidden" name="property_id" value={id} />
                        <button type="submit" style={{ padding: '4px 10px', background: 'transparent', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* ── Edit / renew form ── */}
                  <details style={{ borderTop: '1px dashed hsl(var(--color-border))' }}>
                    <summary style={{ listStyle: 'none', padding: '8px 20px', fontSize: '12px', fontWeight: 600, color: 'hsl(var(--color-ink-subtle))', cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      ✏️ Edit / renew
                    </summary>
                    <div style={{ padding: '16px 20px 20px', background: 'hsl(var(--color-surface-muted))' }}>
                      <form action={updateComplianceAction}>
                        <input type="hidden" name="id"          value={item.id} />
                        <input type="hidden" name="property_id" value={id} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          <div>
                            <label style={labelSt}>Type *</label>
                            <select name="type" required defaultValue={item.type} style={{ ...inputStyle, cursor: 'pointer' }}>
                              <option value="gas">Gas Safety</option>
                              <option value="eicr">Electrical (EICR)</option>
                              <option value="epc">EPC</option>
                              <option value="insurance">Insurance</option>
                            </select>
                          </div>
                          <div>
                            <label style={labelSt}>Expiry date *</label>
                            <input name="expiry_date" type="date" required defaultValue={item.expiry_date} style={inputStyle} />
                          </div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={labelSt}>Title *</label>
                          <input name="title" type="text" required defaultValue={item.title} style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={labelSt}>Notes</label>
                          <textarea name="notes" rows={2} defaultValue={item.notes ?? ''} style={{ ...inputStyle, resize: 'vertical' as const }} />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={labelSt}>Document link</label>
                          <input name="document_url" type="url" defaultValue={item.document_url ?? ''} placeholder="Paste document link for now" style={inputStyle} />
                        </div>
                        <button type="submit" style={{ padding: '7px 18px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                          Save changes
                        </button>
                      </form>
                    </div>
                  </details>

                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── EPC Planner ────────────────────────────────────── */}
      <section style={{ marginTop: '32px', marginBottom: '48px' }}>
        <div style={sectionHead}>
          <h2 style={h2Style}>EPC Planner</h2>
          {epcPlan && (
            <span style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
              {epcWorks.length} {epcWorks.length === 1 ? 'work item' : 'work items'} recorded
            </span>
          )}
        </div>

        {/* Set up / edit plan */}
        <details style={{ marginBottom: '16px' }}>
          <summary style={{ listStyle: 'none', display: 'inline-flex', alignItems: 'center', padding: '7px 16px', background: epcPlan ? 'transparent' : 'hsl(var(--color-green))', color: epcPlan ? 'hsl(var(--color-ink-subtle))' : 'white', border: epcPlan ? '1px solid hsl(var(--color-border))' : 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
            {epcPlan ? 'Edit EPC plan' : '+ Set up EPC plan'}
          </summary>
          <div style={{ marginTop: '12px', ...card }}>
            <form action={saveEpcPlanAction}>
              <input type="hidden" name="property_id" value={id} />
              {epcPlan && <input type="hidden" name="plan_id" value={epcPlan.id} />}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={labelSt}>Current rating *</label>
                  <select name="current_rating" required defaultValue={epcPlan?.current_rating ?? ''} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select…</option>
                    {['A','B','C','D','E','F','G'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Target rating *</label>
                  <select name="target_rating" required defaultValue={epcPlan?.target_rating ?? ''} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select…</option>
                    {['A','B','C','D','E','F','G'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={labelSt}>EPC expiry date</label>
                  <input name="expiry_date" type="date" defaultValue={epcPlan?.expiry_date ?? ''} style={inputStyle} />
                </div>
                <div>
                  <label style={labelSt}>Improvement cap (£)</label>
                  <input name="cap_amount" type="number" min="0" step="1" defaultValue={epcPlan?.cap_amount ?? 10000} style={inputStyle} />
                </div>
              </div>
              <button type="submit" style={{ padding: '8px 20px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                {epcPlan ? 'Save changes' : 'Create plan'}
              </button>
            </form>
          </div>
        </details>

        {!epcPlan ? (
          <div style={{ ...card, textAlign: 'center', padding: '40px 24px' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'hsl(var(--color-ink))', marginBottom: '4px' }}>No EPC plan yet</p>
            <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>Set up a plan above to start tracking improvements.</p>
          </div>
        ) : (
          <>
            {/* Plan summary card */}
            <div style={{ ...card, marginBottom: '16px' }}>
              {/* Ratings row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' as const }}>
                <div style={{ textAlign: 'center' as const }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--color-ink-subtle))', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Current</p>
                  {(() => { const s = ratingStyle(epcPlan.current_rating); return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: s.bg, border: `2px solid ${s.border}`, fontSize: '22px', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>
                      {epcPlan.current_rating}
                    </span>
                  )})()}
                </div>
                <div style={{ fontSize: '20px', color: 'hsl(var(--color-ink-subtle))', marginTop: '18px' }}>→</div>
                <div style={{ textAlign: 'center' as const }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--color-ink-subtle))', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Target</p>
                  {(() => { const s = ratingStyle(epcPlan.target_rating); return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: s.bg, border: `2px solid ${s.border}`, fontSize: '22px', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>
                      {epcPlan.target_rating}
                    </span>
                  )})()}
                </div>
                {epcPlan.expiry_date && (
                  <div style={{ marginLeft: 'auto' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--color-ink-subtle))', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>EPC Expires</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>
                      {new Date(epcPlan.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {/* Spend bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--color-ink-subtle))', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Improvement spend</p>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>
                    <span style={{ fontWeight: 700, color: remaining < 0 ? 'hsl(0 72% 45%)' : 'hsl(var(--color-ink))' }}>{fmt(totalSpend)}</span>
                    {' / '}{fmt(cap)} cap
                  </p>
                </div>
                <div style={{ height: '8px', background: 'hsl(var(--color-border))', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ width: `${spendPct}%`, height: '100%', background: spendPct >= 100 ? 'hsl(0 72% 51%)' : spendPct >= 80 ? 'hsl(38 92% 50%)' : 'hsl(var(--color-green))', borderRadius: '4px', transition: 'width 0.3s' }} />
                </div>
                <p style={{ fontSize: '12px', color: remaining < 0 ? 'hsl(0 72% 45%)' : 'hsl(var(--color-ink-subtle))' }}>
                  {remaining >= 0 ? `${fmt(remaining)} remaining under cap` : `${fmt(Math.abs(remaining))} over cap`}
                </p>
              </div>
            </div>

            {/* Add work */}
            <details style={{ marginBottom: '16px' }}>
              <summary style={{ listStyle: 'none', display: 'inline-flex', alignItems: 'center', padding: '7px 16px', background: 'hsl(var(--color-green))', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                + Add completed work
              </summary>
              <div style={{ marginTop: '12px', ...card }}>
                <form action={addEpcWorkAction}>
                  <input type="hidden" name="property_id" value={id} />
                  <input type="hidden" name="epc_plan_id" value={epcPlan.id} />
                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelSt}>Work completed *</label>
                    <input name="work_completed" type="text" required placeholder="e.g. Loft insulation installed" style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={labelSt}>Cost (£) *</label>
                      <input name="cost" type="number" required min="0" step="0.01" placeholder="0.00" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelSt}>Date completed</label>
                      <input name="completed_date" type="date" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={labelSt}>Contractor</label>
                      <input name="contractor" type="text" placeholder="Company or name" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelSt}>Receipt URL</label>
                      <input name="receipt_url" type="url" placeholder="https://…" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={labelSt}>Notes</label>
                    <textarea name="notes" rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
                  </div>
                  <button type="submit" style={{ padding: '8px 20px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Save work
                  </button>
                </form>
              </div>
            </details>

            {/* Works list */}
            {epcWorks.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '32px 24px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'hsl(var(--color-ink))', marginBottom: '4px' }}>No works recorded yet</p>
                <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>Add completed work above to track your spend.</p>
              </div>
            ) : (
              <div style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                {epcWorks.map((work, index) => (
                  <div key={work.id} style={{ padding: '14px 20px', borderBottom: index < epcWorks.length - 1 ? '1px solid hsl(var(--color-border))' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>{work.work_completed}</p>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--color-ink))', flexShrink: 0 }}>{fmt(work.cost)}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                          {work.completed_date && new Date(work.completed_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {work.contractor ? ` · ${work.contractor}` : ''}
                        </p>
                        {work.notes && <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))', fontStyle: 'italic', marginTop: '3px' }}>{work.notes}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                        {work.receipt_url ? (
                          <a href={work.receipt_url} target="_blank" rel="noopener noreferrer" style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, color: 'hsl(var(--color-green))', background: 'hsl(var(--color-green-subtle))', border: '1px solid hsl(var(--color-green-muted))', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
                            Receipt
                          </a>
                        ) : null}
                        <form action={deleteEpcWorkAction}>
                          <input type="hidden" name="id"          value={work.id} />
                          <input type="hidden" name="property_id" value={id} />
                          <button type="submit" style={{ padding: '4px 10px', background: 'transparent', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                            Remove
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

    </div>
  )
}
