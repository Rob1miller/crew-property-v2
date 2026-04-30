'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadDocument } from '@/lib/supabase/upload'

const inputStyle = {
  display: 'block', width: '100%', padding: '9px 12px',
  border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)',
  fontSize: '14px', color: 'hsl(var(--color-ink))', background: 'hsl(var(--color-surface))',
  outline: 'none', fontFamily: 'inherit',
} as const

const labelSt = {
  display: 'block', fontSize: '12px', fontWeight: 600 as const,
  color: 'hsl(var(--color-ink-muted))', marginBottom: '5px',
  textTransform: 'uppercase' as const, letterSpacing: '0.4px',
}

const card = {
  background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))',
  borderRadius: 'var(--radius)', padding: '20px 24px',
} as const

export function ComplianceAddForm({ propertyId }: { propertyId: string }) {
  const router   = useRouter()
  const formRef  = useRef<HTMLFormElement>(null)
  const [pending, setPending] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setPending(false); return }

    const file = data.get('file') as File | null
    let document_url: string | null = null
    if (file && file.size > 0) {
      document_url = await uploadDocument(file, user.id, propertyId)
      if (!document_url) { setError('File upload failed — check file size and try again.'); setPending(false); return }
    }

    const type        = (data.get('type')        as string)?.trim()
    const title       = (data.get('title')       as string)?.trim()
    const expiry_date = (data.get('expiry_date') as string)?.trim()
    const notes       = (data.get('notes')       as string)?.trim() || null

    if (!type || !title || !expiry_date) { setError('Please fill in all required fields.'); setPending(false); return }

    const { error: dbError } = await supabase.from('compliance_items').insert({
      user_id: user.id, property_id: propertyId,
      type, title, expiry_date, notes, document_url, status: 'active',
    })
    if (dbError) { setError(dbError.message); setPending(false); return }

    form.reset()
    router.refresh()
    setPending(false)
  }

  return (
    <details style={{ marginBottom: '16px' }}>
      <summary style={{ listStyle: 'none', display: 'inline-flex', alignItems: 'center', padding: '7px 16px', background: 'hsl(var(--color-green))', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
        + Add item
      </summary>
      <div style={{ marginTop: '12px', ...card }}>
        <form ref={formRef} onSubmit={handleSubmit}>
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
          <div style={{ marginBottom: '14px' }}>
            <label style={labelSt}>Notes</label>
            <textarea name="notes" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelSt}>Document (optional)</label>
            <input name="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv" style={{ ...inputStyle, padding: '7px 12px' }} />
          </div>
          {error && <p style={{ fontSize: '13px', color: 'hsl(0 72% 45%)', marginBottom: '14px' }}>{error}</p>}
          <button type="submit" disabled={pending} style={{ padding: '8px 20px', background: pending ? 'hsl(var(--color-surface-muted))' : 'hsl(var(--color-green))', color: pending ? 'hsl(var(--color-ink-subtle))' : 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer' }}>
            {pending ? 'Saving…' : 'Save item'}
          </button>
        </form>
      </div>
    </details>
  )
}
