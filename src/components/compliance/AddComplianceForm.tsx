'use client'

import { useActionState, useEffect, useState } from 'react'
import { addComplianceItemAction } from '@/app/actions/compliance'

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '9px 12px',
  border: '1px solid hsl(var(--color-border))',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  color: 'hsl(var(--color-ink))',
  background: 'hsl(var(--color-surface))',
  outline: 'none',
} as const

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600 as const,
  color: 'hsl(var(--color-ink-muted))',
  marginBottom: '5px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.4px',
}

interface Props {
  properties: { id: string; address_line_1: string; town: string }[]
}

export function AddComplianceForm({ properties }: Props) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(addComplianceItemAction, null)

  useEffect(() => {
    if (state && state.error === '') setOpen(false)
  }, [state])

  return (
    <div style={{ marginBottom: '24px' }}>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '9px 18px',
            background: 'hsl(var(--color-green))',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Add compliance item
        </button>
      )}

      {open && (
        <div style={{
          background: 'hsl(var(--color-surface))',
          border: '1px solid hsl(var(--color-border))',
          borderRadius: 'var(--radius)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>
              Add compliance item
            </h2>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'hsl(var(--color-ink-subtle))', lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          <form action={formAction}>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Property *</label>
              <select name="property_id" required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select property…</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.address_line_1}, {p.town}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Type *</label>
                <select name="type" required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select…</option>
                  <option value="gas_safety">Gas Safety</option>
                  <option value="eicr">EICR</option>
                  <option value="epc">EPC</option>
                  <option value="landlord_insurance">Landlord Insurance</option>
                  <option value="smoke_alarms">Smoke Alarms</option>
                  <option value="deposit_protection">Deposit Protection</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status *</label>
                <select name="status" required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select…</option>
                  <option value="valid">Valid</option>
                  <option value="due_soon">Due soon</option>
                  <option value="expired">Expired</option>
                  <option value="missing">Missing</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Title *</label>
              <input
                name="title"
                type="text"
                placeholder="e.g. Gas Safety Certificate 2024"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Expiry date</label>
              <input name="expiry_date" type="date" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Notes</label>
              <textarea
                name="notes"
                placeholder="Optional notes…"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {state?.error && (
              <p style={{ fontSize: '13px', color: 'hsl(var(--color-red))', marginBottom: '14px' }}>
                {state.error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  padding: '9px 20px',
                  background: isPending ? 'hsl(var(--color-surface-muted))' : 'hsl(var(--color-green))',
                  color: isPending ? 'hsl(var(--color-ink-subtle))' : 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {isPending ? 'Saving…' : 'Save item'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: '9px 20px',
                  background: 'transparent',
                  color: 'hsl(var(--color-ink-subtle))',
                  border: '1px solid hsl(var(--color-border))',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
