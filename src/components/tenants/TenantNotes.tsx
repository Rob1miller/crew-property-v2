'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type TenantNote = {
  id: string
  tenant_id: string
  user_id: string
  note: string
  note_type: string
  created_at: string
}

export function TenantNotes({
  tenantId,
  userId,
}: {
  tenantId: string
  userId: string
}) {
  const supabase = createClient()
  const [notes, setNotes] = useState<TenantNote[]>([])
  const [note, setNote] = useState('')
  const [noteType, setNoteType] = useState('general')
  const [error, setError] = useState<string | null>(null)

  async function loadNotes() {
    const { data, error } = await supabase
      .from('tenant_notes')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      return
    }

    setNotes((data ?? []) as TenantNote[])
  }

  useEffect(() => {
    loadNotes()
  }, [])

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!note.trim()) return

    const { error } = await supabase.from('tenant_notes').insert({
      tenant_id: tenantId,
      user_id: userId,
      note: note.trim(),
      note_type: noteType,
    })

    if (error) {
      setError(error.message)
      return
    }

    await supabase.from('activity_logs').insert({
      user_id: userId,
      tenant_id: tenantId,
      type: 'tenant_note_added',
      message: `Tenant note added (${noteType}): ${note.trim().slice(0, 80)}${note.trim().length > 80 ? '…' : ''}`,
    })

    setNote('')
    await loadNotes()
  }

  async function deleteNote(id: string) {
    const { error } = await supabase
      .from('tenant_notes')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)

    if (error) {
      setError(error.message)
      return
    }

    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <details style={{ marginTop: '12px' }}>
      <summary style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: 'hsl(var(--color-ink-muted))' }}>
        Tenant notes ({notes.length})
      </summary>

      <div style={{ marginTop: '10px', padding: '12px', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--color-surface-muted))' }}>
        <form onSubmit={addNote} style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
          <select value={noteType} onChange={(e) => setNoteType(e.target.value)} style={{ padding: '8px', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)' }}>
            <option value="general">General</option>
            <option value="rent">Rent</option>
            <option value="repair">Repair</option>
            <option value="call">Call</option>
            <option value="inspection">Inspection</option>
            <option value="notice">Notice</option>
          </select>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add tenant note..."
            rows={2}
            style={{ padding: '8px', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit' }}
          />

          <button type="submit" style={{ padding: '7px 12px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            Add note
          </button>
        </form>

        {error && <p style={{ fontSize: '12px', color: 'hsl(var(--color-red))' }}>{error}</p>}

        {notes.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>No notes yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {notes.map((n) => (
              <div key={n.id} style={{ padding: '9px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: '11px', color: 'hsl(var(--color-ink-subtle))', marginBottom: '3px' }}>
                  {n.note_type} · {new Date(n.created_at).toLocaleString('en-GB')}
                </p>
                <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink))', whiteSpace: 'pre-wrap' }}>{n.note}</p>
                <button onClick={() => deleteNote(n.id)} style={{ marginTop: '6px', padding: '3px 8px', background: 'transparent', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '11px', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  )
}
