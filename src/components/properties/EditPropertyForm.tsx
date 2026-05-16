'use client'

import { useActionState, useEffect, useState } from 'react'
import { editPropertyAction } from '@/app/actions/properties'
import type { Property } from '@/types/property'

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

export function EditPropertyForm({ property }: { property: Property }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(editPropertyAction, null)

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '8px 16px',
          background: 'hsl(var(--color-surface))',
          color: 'hsl(var(--color-ink))',
          border: '1px solid hsl(var(--color-border))',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {open ? 'Cancel edit' : 'Edit'}
      </button>

      {open && (
        <div style={{
          marginTop: '20px',
          background: 'hsl(var(--color-surface))',
          border: '1px solid hsl(var(--color-border))',
          borderRadius: 'var(--radius)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '20px' }}>
            Edit property
          </h2>

          <form action={formAction}>
            {/* Hidden property id */}
            <input type="hidden" name="id" value={property.id} />

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Address line 1 *</label>
              <input name="address_line_1" type="text" required defaultValue={property.address_line_1} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Address line 2</label>
              <input name="address_line_2" type="text" defaultValue={property.address_line_2 ?? ''} style={inputStyle} />
            </div>

            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Town / City *</label>
                <input name="town" type="text" required defaultValue={property.town} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Postcode *</label>
                <input name="postcode" type="text" required defaultValue={property.postcode} style={inputStyle} />
              </div>
            </div>

            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Property type *</label>
                <select name="property_type" required defaultValue={property.property_type} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="house">House</option>
                  <option value="flat">Flat</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="hmo">HMO</option>
                  <option value="commercial">Commercial</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status *</label>
                <select name="status" required defaultValue={property.status} style={{ ...inputStyle, cursor: 'pointer' }}>
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
                {isPending ? 'Saving…' : 'Save changes'}
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
    </>
  )
}
