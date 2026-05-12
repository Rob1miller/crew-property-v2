'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/helpers'

interface Property {
  id: string
  address_line_1: string
  town: string
}

interface Tenant {
  id: string
  user_id: string
  property_id: string
  full_name: string
  email: string | null
  phone: string | null
  rent_amount: number
  rent_due_day: number | null
  deposit: number | null
  status: 'active' | 'notice' | 'ended'
  start_date: string | null
  end_date: string | null
  created_at: string
}

interface RentPayment {
  id: string
  tenant_id: string
  payment_month: string
  amount_due: number
  amount_paid: number
  paid: boolean
  paid_date: string | null
}


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

const emptyState: React.CSSProperties = {
  textAlign:    'center',
  padding:      '60px 24px',
  background:   'hsl(var(--color-surface))',
  border:       '1px solid hsl(var(--color-border))',
  borderRadius: 'var(--radius)',
  color:        'hsl(var(--color-ink-subtle))',
}


function getRentStatus(t: Tenant) {
  if (t.status !== 'active') return { label: 'Inactive', colour: 'hsl(var(--color-ink-subtle))', urgent: false }

  const dueDay = t.rent_due_day ?? 1
  const today = new Date()
  const currentDay = today.getDate()

  if (currentDay > dueDay + 7) {
    return { label: 'Check rent', colour: 'hsl(var(--color-red))', urgent: true }
  }

  if (currentDay > dueDay) {
    return { label: 'Due this month', colour: 'hsl(var(--color-amber))', urgent: true }
  }

  return { label: `Due ${dueDay}${ordinalSuffix(dueDay)}`, colour: 'hsl(var(--color-green))', urgent: false }
}

function ordinalSuffix(n: number) {
  if (n > 3 && n < 21) return 'th'
  switch (n % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

export default function TenantsPage() {
  const supabase = createClient()

  const [properties,  setProperties]  = useState<Property[]>([])
  const [tenants,     setTenants]     = useState<Tenant[]>([])
  const [payments,    setPayments]    = useState<RentPayment[]>([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState<string | null>(null)
  const [formOpen,    setFormOpen]    = useState(false)
  const [editing,     setEditing]     = useState<Tenant | null>(null)

  const [fullName,    setFullName]    = useState('')
  const [propId,      setPropId]      = useState('')
  const [rentAmount,  setRentAmount]  = useState('')
  const [rentDueDay,  setRentDueDay]  = useState('')
  const [deposit,     setDeposit]     = useState('')
  const [email,       setEmail]       = useState('')
  const [phone,       setPhone]       = useState('')
  const [startDate,   setStartDate]   = useState('')
  const [endDate,     setEndDate]     = useState('')
  const [status,      setStatus]      = useState<Tenant['status']>('active')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const currentMonth = new Date()
      currentMonth.setDate(1)

      const [{ data: props }, { data: tens }, { data: pays }] = await Promise.all([
        supabase
          .from('properties')
          .select('id, address_line_1, town')
          .eq('user_id', user.id)
          .order('created_at'),
        supabase
          .from('tenants')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at'),
        supabase
          .from('rent_payments')
          .select('*')
          .eq('user_id', user.id)
          .order('payment_month', { ascending: false }),
      ])

      if (props) setProperties(props)
      if (tens)  setTenants(tens)
      if (pays)  setPayments(pays)
      setLoading(false)
    }
    load()
  }, [])

  const propertyMap = Object.fromEntries(
    properties.map((p) => [p.id, `${p.address_line_1}, ${p.town}`])
  )

  const currentMonthKey = (() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })()

  const currentPaymentMap = Object.fromEntries(
    payments
      .filter((p) => p.payment_month === currentMonthKey)
      .map((p) => [p.tenant_id, p])
  )

  function tenantPaymentHistory(tenantId: string) {
    return payments.filter((p) => p.tenant_id === tenantId)
  }

  function tenantArrears(t: Tenant) {
    return tenantPaymentHistory(t.id).reduce((sum, p) => {
      return sum + Math.max(0, Number(p.amount_due ?? 0) - Number(p.amount_paid ?? 0))
    }, 0)
  }


  function resetForm() {
    setFullName(''); setPropId(''); setRentAmount(''); setRentDueDay('')
    setDeposit(''); setEmail(''); setPhone(''); setStartDate('')
    setEndDate(''); setStatus('active'); setFormError(null)
  }

  function openAdd() {
    setEditing(null)
    resetForm()
    setFormOpen(true)
  }

  function openEdit(t: Tenant) {
    setEditing(t)
    setFullName(t.full_name)
    setPropId(t.property_id)
    setRentAmount(String(t.rent_amount))
    setRentDueDay(t.rent_due_day != null ? String(t.rent_due_day) : '')
    setDeposit(t.deposit != null ? String(t.deposit) : '')
    setEmail(t.email ?? '')
    setPhone(t.phone ?? '')
    setStartDate(t.start_date ?? '')
    setEndDate(t.end_date ?? '')
    setStatus(t.status)
    setFormError(null)
    setFormOpen(true)
  }

  function closeForm() { setFormOpen(false); setEditing(null); setFormError(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setFormError('Not authenticated'); setSaving(false); return }

    const payload = {
      user_id:      user.id,
      property_id:  propId,
      full_name:    fullName,
      email:        email      || null,
      phone:        phone      || null,
      rent_amount:  Number(rentAmount),
      rent_due_day: rentDueDay ? Number(rentDueDay) : null,
      deposit:      deposit    ? Number(deposit)    : null,
      start_date:   startDate  || null,
      end_date:     endDate    || null,
      status,
    }

    if (editing) {
      const { error: err } = await supabase
        .from('tenants')
        .update(payload)
        .eq('id', editing.id)
        .eq('user_id', user.id)

      if (err) { setFormError(err.message); setSaving(false); return }

      setTenants((prev) =>
        prev.map((t) => t.id === editing.id ? { ...t, ...payload } : t)
      )
    } else {
      const { data, error: err } = await supabase
        .from('tenants')
        .insert(payload)
        .select()
        .single()

      if (err || !data) { setFormError(err?.message ?? 'Insert failed'); setSaving(false); return }

      setTenants((prev) => [...prev, data])
    }

    setSaving(false)
    closeForm()
  }


  async function saveRentPayment(t: Tenant, amountPaid: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const month = new Date()
    month.setDate(1)

    const paidInFull = amountPaid >= t.rent_amount

    const payload = {
      user_id: user.id,
      tenant_id: t.id,
      payment_month: month.toISOString().split('T')[0],
      amount_due: t.rent_amount,
      amount_paid: amountPaid,
      paid: paidInFull,
      paid_date: amountPaid > 0 ? new Date().toISOString().split('T')[0] : null,
    }

    const existing = currentPaymentMap[t.id]

    if (existing) {
      const { data, error } = await supabase
        .from('rent_payments')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()

      if (!error && data) {
        setPayments((prev) =>
          prev.map((p) => p.id === existing.id ? data : p)
        )
      }

      return
    }

    const { data, error } = await supabase
      .from('rent_payments')
      .insert(payload)
      .select()
      .single()

    if (!error && data) {
      setPayments((prev) => [...prev, data])
    }
  }

  async function markPaid(t: Tenant) {
    await saveRentPayment(t, t.rent_amount)
  }

  async function markUnpaid(t: Tenant) {
    await saveRentPayment(t, 0)
  }

  async function markPartial(t: Tenant) {
    const input = prompt('How much rent was paid?')
    if (input === null) return

    const amount = Number(input)
    if (Number.isNaN(amount) || amount < 0) {
      alert('Please enter a valid amount.')
      return
    }

    await saveRentPayment(t, amount)
  }

  async function deleteTenant(id: string) {
    if (!confirm('Delete this tenant? This cannot be undone.')) return
    const { error: err } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id)
    if (err) { alert(err.message); return }
    setTenants((prev) => prev.filter((t) => t.id !== id))
  }

  const active       = tenants.filter((t) => t.status === 'active')
  const totalRent    = active.reduce((s, t) => s + t.rent_amount, 0)
  const totalDeposit = tenants.reduce((s, t) => s + (t.deposit ?? 0), 0)
  const rentRisk     = active.filter((t) => getRentStatus(t).urgent)
  const rentRiskTotal = rentRisk.reduce((s, t) => s + t.rent_amount, 0)

  if (loading) {
    return (
      <div className="animate-slide-up">
        <div className="page-header">
          <div className="page-header-left"><h1>Tenants</h1></div>
        </div>
        <p style={{ fontSize: '14px', color: 'hsl(var(--color-ink-subtle))' }}>Loading…</p>
      </div>
    )
  }

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
        <div className="grid grid-cols-6 gap-px mb-6 bg-border border border-border rounded-lg overflow-hidden">
          {[
            { label: 'Total',          value: tenants.length },
            { label: 'Active',         value: `${active.length} / ${tenants.length}` },
            { label: 'Monthly rent',   value: formatCurrency(totalRent) },
            { label: 'Total deposits', value: formatCurrency(totalDeposit) },
            { label: 'Rent to check',  value: rentRisk.length },
            { label: 'Risk value',     value: formatCurrency(rentRiskTotal) },
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
              <input
                required
                style={inputStyle}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jane Smith"
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Property *</label>
              <select
                required
                value={propId}
                onChange={(e) => setPropId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select property…</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.address_line_1}, {p.town}
                  </option>
                ))}
              </select>
              {properties.length === 0 && (
                <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))', marginTop: '4px' }}>
                  No properties found — add a property first.
                </p>
              )}
            </div>

            <div style={row2}>
              <div>
                <label style={labelStyle}>Monthly rent (£) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  style={inputStyle}
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label style={labelStyle}>Rent due day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  style={inputStyle}
                  value={rentDueDay}
                  onChange={(e) => setRentDueDay(e.target.value)}
                  placeholder="e.g. 1"
                />
              </div>
            </div>

            <div style={row2}>
              <div>
                <label style={labelStyle}>Deposit (£)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  style={inputStyle}
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Tenant['status'])}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="active">Active</option>
                  <option value="notice">Notice given</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
            </div>

            <div style={row2}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="tel"
                  style={inputStyle}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07700 000000"
                />
              </div>
            </div>

            <div style={row2}>
              <div>
                <label style={labelStyle}>Start date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>End date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {formError && (
              <p style={{ fontSize: '13px', color: 'hsl(var(--color-red))', marginBottom: '14px' }}>
                {formError}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="submit"
                disabled={saving}
                style={{ padding: '9px 20px', background: saving ? 'hsl(var(--color-surface-muted))' : 'hsl(var(--color-green))', color: saving ? 'hsl(var(--color-ink-subtle))' : 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add tenant'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                style={{ padding: '9px 20px', background: 'transparent', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tenants.length === 0 && !formOpen ? (
        <div style={emptyState}>
          <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>No tenants yet</p>
          <p style={{ fontSize: '13px', marginBottom: '20px' }}>Add your first tenant to get started.</p>
          <button
            onClick={openAdd}
            style={{ padding: '9px 18px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Add tenant
          </button>
        </div>
      ) : tenants.length > 0 ? (
        <div style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {tenants.map((t, index) => (
            <div
              key={t.id}
              style={{ padding: '16px 20px', borderBottom: index < tenants.length - 1 ? '1px solid hsl(var(--color-border))' : 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'hsl(var(--color-green-subtle))', border: '1px solid hsl(var(--color-green-muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px', fontWeight: 700, color: 'hsl(var(--color-green))' }}>
                {t.full_name.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.full_name}
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: t.status === 'active' ? 'hsl(var(--color-green-subtle))' : 'hsl(var(--color-surface-muted))', color: statusColour[t.status], border: `1px solid ${t.status === 'active' ? 'hsl(var(--color-green-muted))' : 'hsl(var(--color-border))'}` }}>
                    {statusLabel[t.status]}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {propertyMap[t.property_id] ?? '—'}
                  {t.email ? ` · ${t.email}` : ''}
                  {t.phone ? ` · ${t.phone}` : ''}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0, minWidth: '110px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>
                  {formatCurrency(t.rent_amount)}
                  <span style={{ fontSize: '11px', fontWeight: 400, color: 'hsl(var(--color-ink-subtle))' }}>/mo</span>
                </p>
                {t.deposit != null && t.deposit > 0 && (
                  <p style={{ fontSize: '11px', color: 'hsl(var(--color-ink-subtle))' }}>
                    Dep. {formatCurrency(t.deposit)}
                  </p>
                )}
                {currentPaymentMap[t.id]?.paid ? (
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--color-green))' }}>
                    Paid this month
                  </p>
                ) : (() => {
                  const rs = getRentStatus(t)
                  return (
                    <p style={{ fontSize: '11px', fontWeight: 600, color: rs.colour }}>
                      {rs.label}
                    </p>
                  )
                })()}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {t.status === 'active' && (
                  <>
                    <button
                      onClick={() => markPaid(t)}
                      style={{ padding: '6px 14px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => markPartial(t)}
                      style={{ padding: '6px 14px', background: 'transparent', color: 'hsl(var(--color-amber))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Partial
                    </button>
                    <button
                      onClick={() => markUnpaid(t)}
                      style={{ padding: '6px 14px', background: 'transparent', color: 'hsl(var(--color-red))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Unpaid
                    </button>
                  </>
                )}

                <button
                  onClick={() => openEdit(t)}
                  style={{ padding: '6px 14px', background: 'transparent', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTenant(t.id)}
                  style={{ padding: '6px 14px', background: 'transparent', color: 'hsl(var(--color-red))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
              </div>

              <div style={{ marginLeft: '52px', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed hsl(var(--color-border))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'hsl(var(--color-ink-muted))', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Rent history
                </p>
                <p style={{ fontSize: '12px', fontWeight: 700, color: tenantArrears(t) > 0 ? 'hsl(var(--color-red))' : 'hsl(var(--color-green))' }}>
                  Arrears: {formatCurrency(tenantArrears(t))}
                </p>
              </div>

              {tenantPaymentHistory(t.id).length === 0 ? (
                <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                  No payment history yet.
                </p>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tenantPaymentHistory(t.id).slice(0, 6).map((p) => {
                    const due = Number(p.amount_due ?? 0)
                    const paid = Number(p.amount_paid ?? 0)
                    const status = paid >= due ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid'
                    const colour = paid >= due ? 'hsl(var(--color-green))' : paid > 0 ? 'hsl(var(--color-amber))' : 'hsl(var(--color-red))'

                    return (
                      <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 9px', border: '1px solid hsl(var(--color-border))', borderRadius: '999px', fontSize: '11px', color: colour }}>
                        {new Date(p.payment_month).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        {' · '}
                        {status}
                      </span>
                    )
                  })}
                </div>
              )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
