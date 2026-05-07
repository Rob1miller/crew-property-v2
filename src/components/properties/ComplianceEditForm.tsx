'use client'

import { useState } from 'react'
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

interface Item {
  id: string
  type: string
  title: string
  expiry_date: string
  notes: string | null
  document_url: string | null
}

export function ComplianceEditForm({ item, propertyId }: { item: Item; propertyId: string }) {
  const router = useRouter()
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
    let document_url = item.document_url          // keep existing if no new file uploaded
    if (file && file.size > 0) {
      const uploaded = await uploadDocument(file, user.id, propertyId)
      if (!uploaded) { setError('File upload failed — check file size and try again.'); setPending(false); return }
      document_url = uploaded
    }

    const type        = (data.get('type')        as string)?.trim()
    const title       = (data.get('title')       as string)?.trim()
    const expiry_date = (data.get('expiry_date') as string)?.trim()
    const notes       = (data.get('notes')       as string)?.trim() || null

    if (!type || !title || !expiry_date) { setError('Please fill in all required fields.'); setPending(false); return }

    const { error: dbError } = await supabase
      .from('compliance_items')
      .update({ type, title, expiry_date, notes, document_url, updated_at: new Date().toISOString() })
      .eq('id', item.id)
      .eq('user_id', user.id)
    if (dbError) { setError(dbError.message); setPending(false); return }

    router.refresh()
    setPending(false)
  }

  return (
    <details style={{ borderTop: '1px dashed hsl(var(--color-border))' }}>
      <summary style={{ listStyle: 'none', padding: '8px 20px', fontSize: '12px', fontWeight: 600, color: 'hsl(var(--color-ink-subtle))', cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        ✏️ Edit / renew
      </summary>
      <div style={{ padding: '16px 20px 20px', background: 'hsl(var(--color-surface-muted))' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelSt}>Type *</label>
              <select name="type" required defaultValue={item.type} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="gas_safety">Gas Safety</option>
                <option value="eicr">Electrical (EICR)</option>
                <option value="epc">EPC</option>
                <option value="landlord_insurance">Insurance</option>
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
            <textarea name="notes" rows={2} defaultValue={item.notes ?? ''} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelSt}>Replace document (optional)</label>
            {item.document_url && (
              <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))', marginBottom: '6px' }}>
                Current: <a href={item.document_url} target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--color-green))' }}>view existing document</a>
              </p>
            )}
            <input name="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv" style={{ ...inputStyle, padding: '7px 12px' }} />
          </div>
          {error && <p style={{ fontSize: '13px', color: 'hsl(0 72% 45%)', marginBottom: '12px' }}>{error}</p>}
          <button type="submit" disabled={pending} style={{ padding: '7px 18px', background: pending ? 'hsl(var(--color-surface-muted))' : 'hsl(var(--color-green))', color: pending ? 'hsl(var(--color-ink-subtle))' : 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer' }}>
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </details>
  )
}
