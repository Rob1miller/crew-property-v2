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

export function EpcWorkAddForm({ propertyId, planId }: { propertyId: string; planId: string }) {
  const router  = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
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
    let receipt_url: string | null = null
    if (file && file.size > 0) {
      receipt_url = await uploadDocument(file, user.id, propertyId)
      if (!receipt_url) { setError('File upload failed — check file size and try again.'); setPending(false); return }
    }

    const work_completed = (data.get('work_completed') as string)?.trim()
    const cost           = Number(data.get('cost')) || 0
    const completed_date = (data.get('completed_date') as string) || null
    const contractor     = (data.get('contractor') as string)?.trim() || null
    const notes          = (data.get('notes')      as string)?.trim() || null

    if (!work_completed) { setError('Please enter the work completed.'); setPending(false); return }

    const { error: dbError } = await supabase.from('epc_works').insert({
      user_id: user.id, property_id: propertyId, epc_plan_id: planId,
      work_completed, cost, completed_date, contractor, notes, receipt_url,
    })
    if (dbError) { setError(dbError.message); setPending(false); return }

    form.reset()
    router.refresh()
    setPending(false)
  }

  return (
    <details style={{ marginBottom: '16px' }}>
      <summary style={{ listStyle: 'none', display: 'inline-flex', alignItems: 'center', padding: '7px 16px', background: 'hsl(var(--color-green))', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
        + Add completed work
      </summary>
      <div style={{ marginTop: '12px', ...card }}>
        <form ref={formRef} onSubmit={handleSubmit}>
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
          <div style={{ marginBottom: '14px' }}>
            <label style={labelSt}>Contractor</label>
            <input name="contractor" type="text" placeholder="Company or name" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelSt}>Notes</label>
            <textarea name="notes" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelSt}>Receipt (optional)</label>
            <input name="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv" style={{ ...inputStyle, padding: '7px 12px' }} />
          </div>
          {error && <p style={{ fontSize: '13px', color: 'hsl(0 72% 45%)', marginBottom: '14px' }}>{error}</p>}
          <button type="submit" disabled={pending} style={{ padding: '8px 20px', background: pending ? 'hsl(var(--color-surface-muted))' : 'hsl(var(--color-green))', color: pending ? 'hsl(var(--color-ink-subtle))' : 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer' }}>
            {pending ? 'Saving…' : 'Save work'}
          </button>
        </form>
      </div>
    </details>
  )
}
