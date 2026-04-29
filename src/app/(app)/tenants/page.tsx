'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/helpers'

interface Property {
  id: string
  displayName: string
}

interface Tenant {
  id: string
  name: string
  propertyId: string
  propertyAddress: string
  rent: number
  deposit: number
  email: string
  phone: string
  startDate: string
  status: 'active' | 'notice' | 'ended'
}

const TENANT_KEY = 'crew_tenants'

const statusLabel: Record<Tenant['status'], string> = {
  active: 'Active',
  notice: 'Notice given',
  ended:  'Ended',
}

const statusColour: Record<Tenant['status'], string> = {
  active: 'hsl(var(--color-green))',
  notice: 'hsl(var(--color-amber))',
  ended:  'hsl(var(--color-ink-subtle))',
}

const inputStyle: React.CSSProperties = {
  display:      'block',
  width:        '100%',
  padding:      '9px 12px',
  border:       '1px solid hsl(var(--color-border))',
  borderRadius: 'var(--radius-sm)',
  fontSize:     '14px',
  color:        'hsl(var(--color-ink))',
  background:   'hsl(var(--color-surface))',
  outline:      'none',
}

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontSize:      '12px',
  fontWeight:    600,
  color:         'hsl(var(--color-ink-muted))',
  marginBottom:  '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
}

const row2: React.CSSProperties = {
  display:             'grid',
  gridTemplateColumns: '1fr 1fr',
  gap:                 '14px',
  marginBottom:        '14px',
}

// ── Read properties from Supabase ─────────────────────────

function buildDisplayName(p: any): string {
  return [p.address_line_1, p.town, p.postcode].filter(Boolean).join(', ')
}

async function loadPropertiesFromSupabase(): Promise<Property[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('properties')
    .select('id, address_line_1, town, postcode')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((p: any) => ({
    id: String(p.id),
    displayName: buildDisplayName(p),
  }))
}

// ── Page ──────────────────────────────────────────────────────

export default function TenantsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants,    setTenants]    = useState<Tenant[]>([])
  const [formOpen,   setFormOpen]   = useState(false)
  const [editing,    setEditing]    = useState<Tenant | null>(null)

  const [name,      setName]      = useState('')
  const [propId,    setPropId]    = useState('')
  const [rent,      setRent]      = useState('')
  const [deposit,   setDeposit]   = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [startDate, setStartDate] = useState('')
  const [status,    setStatus]    = useState<Tenant['status']>('active')

  useEffect(() => {
    loadPropertiesFromSupabase().then(setProperties)

    try {
      const raw = localStorage.getItem(TENANT_KEY)
      if (raw) setTenants(JSON.parse(raw))
    } catch {}
  }, [])

  function persist(updated: Tenant[]) {
    setTenants(updated)
    localStorage.setItem(TENANT_KEY, JSON.stringify(updated))
  }

  function openAdd() {
    setEditing(null)
    setName(''); setPropId(''); setRent(''); setDeposit('')
    setEmail(''); setPhone(''); setStartDate(''); setStatus('active')
    setFormOpen(true)
  }

  function openEdit(t: Tenant) {
    setEditing(t)
    setName(t.name); setPropId(t.propertyId); setRent(String(t.rent))
    setDeposit(String(t.deposit)); setEmail(t.email); setPhone(t.phone)
    setStartDate(t.startDate); setStatus(t.status)
    setFormOpen(true)
  }

  function closeForm() { setFormOpen(false); setEditing(null) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const prop = properties.find((p) => p.id === propId)
    const addr = prop ? prop.displayName : ''
    if (editing) {
      persist(tenants.map((t) =>
        t.id === editing.id
          ? { ...t, name, propertyId: propId, propertyAddress: addr, rent: Number(rent), deposit: Number(deposit), email, phone, startDate, status }
          : t
      ))
    } else {
      persist([...tenants, {
        id: crypto.randomUUID(),
        name, propertyId: propId, propertyAddress: addr,
        rent: Number(rent), deposit: Number(deposit),
        email, phone, startDate, status,
      }])
    }
    closeForm()
  }

  function deleteTenant(id: string) {
    if (!confirm('Delete this tenant?')) return
    persist(tenants.filter((t) => t.id !== id))
  }

  const active       = tenants.filter((t) => t.status === 'active')
  const totalRent    = active.reduce((s, t) => s + t.rent, 0)
  const totalDeposit = tenants.reduce((s, t) => s + t.deposit, 0)

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Tenants</h1>
          <p>{tenants.length} {tenants.length === 1 ? 'tenant' : 'tenants'} in your portfolio</p>
        </div>
        <div className="page-header-actions">
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-green text-white text-[13px] font-semibold hover:bg-green-mid transition-colors duration-100"
          >
            + Add tenant
          </button>
        </div>
      </div>

      {tenants.length > 0 && (
        <div className="grid grid-cols-4 gap-px mb-6 bg-border border border-border rounded-lg overflow-hidden">
          {[
            { label: 'Total',          value: tenants.length },
            { label: 'Active',         value: `${active.length} / ${tenants.length}` },
            { label: 'Monthly rent',   value: formatCurrency(totalRent) },
            { label: 'Total deposits', value: formatCurrency(totalDeposit) },
          ].map((s) => (
            <div key={s.label} className="bg-surface px-5 py-4">
              <p className="text-[11px] font-bold text-ink-subtle uppercase tracking-[0.6px] mb-1.5">{s.label}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '26px', lineHeight: 1, color: 'hsl(var(--color-ink))' }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>
              {editing ? 'Edit tenant' : 'Add tenant'}
            </h2>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'hsl(var(--color-ink-subtle))', lineHeight: 1 }}>×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Full name *</label>
              <input required style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Smith" />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Property *</label>
              {properties.length > 0 ? (
                <select required value={propId} onChange={(e) => setPropId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select property…</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.displayName}</option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    required
                    style={inputStyle}
                    value={propId}
                    onChange={(e) => setPropId(e.target.value)}
                    placeholder="Enter property address"
                  />
                  <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))', marginTop: '4px' }}>
                    No saved properties found — type the address manually.
                  </p>
                </>
              )}
            </div>

            <div style={row2}>
              <div>
                <label style={labelStyle}>Monthly rent (£) *</label>
                <input required type="number" min="0" step="0.01" style={inputStyle} value={rent} onChange={(e) => setRent(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label style={labelStyle}>Deposit (£)</label>
                <input type="number" min="0" step="0.01" style={inputStyle} value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="0.00" />
              </div>
            </div>

            <div style={row2}>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input type="tel" style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07700 000000" />
              </div>
            </div>

            <div style={row2}>
              <div>
                <label style={labelStyle}>Tenancy start date</label>
                <input type="date" style={inputStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as Tenant['status'])} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="active">Active</option>
                  <option value="notice">Notice given</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button type="submit" style={{ padding: '9px 20px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                {editing ? 'Save changes' : 'Add tenant'}
              </button>
              <button type="button" onClick={closeForm} style={{ padding: '9px 20px', background: 'transparent', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tenants.length === 0 && !formOpen ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', color: 'hsl(var(--color-ink-subtle))' }}>
          <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>No tenants yet</p>
          <p style={{ fontSize: '13px', marginBottom: '20px' }}>Add your first tenant to get started.</p>
          <button onClick={openAdd} style={{ padding: '9px 18px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            + Add tenant
          </button>
        </div>
      ) : tenants.length > 0 ? (
        <div style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {tenants.map((t, index) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderBottom: index < tenants.length - 1 ? '1px solid hsl(var(--color-border))' : 'none' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'hsl(var(--color-green-subtle))', border: '1px solid hsl(var(--color-green-muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px', fontWeight: 700, color: 'hsl(var(--color-green))' }}>
                {t.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.name}
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: t.status === 'active' ? 'hsl(var(--color-green-subtle))' : 'hsl(var(--color-surface-muted))', color: statusColour[t.status], border: `1px solid ${t.status === 'active' ? 'hsl(var(--color-green-muted))' : 'hsl(var(--color-border))'}` }}>
                    {statusLabel[t.status]}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.propertyAddress || '—'}
                  {t.email ? ` · ${t.email}` : ''}
                  {t.phone ? ` · ${t.phone}` : ''}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0, minWidth: '100px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>
                  {formatCurrency(t.rent)}<span style={{ fontSize: '11px', fontWeight: 400, color: 'hsl(var(--color-ink-subtle))' }}>/mo</span>
                </p>
                {t.deposit > 0 && (
                  <p style={{ fontSize: '11px', color: 'hsl(var(--color-ink-subtle))' }}>Dep. {formatCurrency(t.deposit)}</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => openEdit(t)} style={{ padding: '6px 14px', background: 'transparent', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Edit
                </button>
                <button onClick={() => deleteTenant(t.id)} style={{ padding: '6px 14px', background: 'transparent', color: 'hsl(var(--color-red))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
