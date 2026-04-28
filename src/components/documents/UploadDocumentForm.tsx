'use client'

import { useActionState, useEffect, useState } from 'react'
import { uploadDocumentAction } from '@/app/actions/documents'

interface Props {
  properties:      { id: string; address_line_1: string; town: string }[]
  complianceItems: { id: string; property_id: string; title: string }[]
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

function UploadDocumentForm({ properties, complianceItems }: Props) {
  const [open, setOpen]                             = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [state, formAction, isPending]              = useActionState(uploadDocumentAction, null)

  useEffect(() => {
    if (state && state.error === '') setOpen(false)
  }, [state])

  const filteredItems = complianceItems.filter(
    (i) => i.property_id === selectedPropertyId
  )

  return (
    <div style={{ marginBottom: '24px' }}>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{ padding: '9px 18px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Upload document
        </button>
      )}

      {open && (
        <div style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>Upload document</h2>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'hsl(var(--color-ink-subtle))', lineHeight: 1 }}>
              ×
            </button>
          </div>

          <form action={formAction}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Property *</label>
              <select
                name="property_id"
                required
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select property…</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.address_line_1}, {p.town}
                  </option>
                ))}
              </select>
            </div>

            {selectedPropertyId && filteredItems.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Link to compliance item (optional)</label>
                <select name="compliance_item_id" style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">None</option>
                  {filteredItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>File * (max 10 MB)</label>
              <input
                name="file"
                type="file"
                required
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv"
                style={{ ...inputStyle, padding: '7px 12px' }}
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
                style={{ padding: '9px 20px', background: isPending ? 'hsl(var(--color-surface-muted))' : 'hsl(var(--color-green))', color: isPending ? 'hsl(var(--color-ink-subtle))' : 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer' }}
              >
                {isPending ? 'Uploading…' : 'Upload'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ padding: '9px 20px', background: 'transparent', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer' }}
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

export default UploadDocumentForm
