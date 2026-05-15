'use client'

import { useActionState, useEffect, useState } from 'react'
import { addPropertyAction } from '@/app/actions/properties'

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
  fontWeight: 600,
  color: 'hsl(var(--color-ink-muted))',
  marginBottom: '5px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.4px',
}

const fieldStyle = { marginBottom: '14px' }

export function AddPropertyForm() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(addPropertyAction, null)

  // Close and reset form on successful submit
  useEffect(() => {
    if (state && state.error === '') {
      setOpen(false)
    }
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
          + Add property
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
              Add property
            </h2>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'hsl(var(--color-ink-subtle))', lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          <form action={formAction}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Address line 1 *</label>
              <input name="address_line_1" type="text" placeholder="12 Oak Street" required style={inputStyle} />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Address line 2</label>
              <input name="address_line_2" type="text" placeholder="Optional" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Town / City *</label>
                <input name="town" type="text" placeholder="Manchester" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Postcode *</label>
                <input name="postcode" type="text" placeholder="M1 1AA" required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Property type *</label>
                <select name="property_type" required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select…</option>
                  <option disabled>Residential</option>
                  <option value="house">House</option>
                  <option value="flat">Flat</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="hmo">HMO</option>
                  <option disabled>Commercial</option>
                  <option value="commercial">Commercial unit</option>
                  <option disabled>Other</option>
                  <option value="other">Other / mixed use</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status *</label>
                <select name="status" required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select…</option>
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                  <option value="refurb">Refurb</option>
                  <option value="for_sale">For sale</option>
                </select>
              </div>
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
                {isPending ? 'Saving…' : 'Save property'}
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
