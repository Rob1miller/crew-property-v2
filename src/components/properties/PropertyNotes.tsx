'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

type Note = {
  id: string
  property_id: string
  user_id: string
  note: string
  category: string | null
  created_at: string
}

export function PropertyNotes({
  propertyId,
  userId,
}: {
  propertyId: string
  userId: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [note, setNote] = useState('')
  const [category, setCategory] = useState('General')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function loadNotes() {
    const { data, error } = await supabase
      .from('property_notes')
      .select('*')
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      return
    }

    setNotes((data ?? []) as Note[])
  }

  useEffect(() => {
    loadNotes()
  }, [])

  async function addNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!note.trim()) {
      setError('Please write a note first.')
      return
    }

    const { error } = await supabase.from('property_notes').insert({
      property_id: propertyId,
      user_id: userId,
      note: note.trim(),
      category,
    })

    if (error) {
      setError(error.message)
      return
    }

    await supabase.from('activity_logs').insert({
      user_id: userId,
      property_id: propertyId,
      type: 'property_note_added',
      message: `Property note added (${category}): ${note.trim().slice(0, 80)}${note.trim().length > 80 ? '…' : ''}`,
    })

    setNote('')
    await loadNotes()
    startTransition(() => router.refresh())
  }

  async function deleteNote(id: string) {
    const { error } = await supabase
      .from('property_notes')
      .delete()
      .eq('id', id)
      .eq('property_id', propertyId)
      .eq('user_id', userId)

    if (error) {
      setError(error.message)
      return
    }

    await loadNotes()
    startTransition(() => router.refresh())
  }

  return (
    <section style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>Notes & activity</h2>
        <span style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </span>
      </div>

      <div style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', padding: '18px', marginBottom: '16px' }}>
        <form onSubmit={addNote}>
          <div className="property-notes-form-grid" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px', marginBottom: '12px' }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: '9px 10px', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', background: 'white' }}
            >
              <option>General</option>
              <option>Tenant</option>
              <option>Repair</option>
              <option>Rent</option>
              <option>Compliance</option>
              <option>Inspection</option>
            </select>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note, call record, tenant update, repair log, or reminder..."
              rows={3}
              style={{ width: '100%', padding: '9px 10px', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{ padding: '8px 18px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: isPending ? 0.7 : 1 }}
          >
            {isPending ? 'Saving…' : '+ Add note'}
          </button>
        </form>

        {error && <p style={{ marginTop: '10px', color: 'hsl(0 72% 45%)', fontSize: '13px' }}>{error}</p>}
      </div>

      {notes.length === 0 ? (
        <div style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', padding: '28px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>No notes yet</p>
          <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>Start building a property history here.</p>
        </div>
      ) : (
        <div style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {notes.map((n, index) => (
            <div key={n.id} style={{ padding: '14px 18px', borderBottom: index < notes.length - 1 ? '1px solid hsl(var(--color-border))' : 'none' }}>
              <div className="property-note-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))', marginBottom: '4px' }}>
                    <strong>{n.category ?? 'General'}</strong>
                    {' · '}
                    {new Date(n.created_at).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--color-ink))', whiteSpace: 'pre-wrap' }}>{n.note}</p>
                </div>

                <button
                  onClick={() => deleteNote(n.id)}
                  style={{ padding: '4px 10px', background: 'transparent', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
