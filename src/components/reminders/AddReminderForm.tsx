'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

type PropertyOption = {
  id: string
  address_line_1: string
  town: string
}

export function AddReminderForm({
  userId,
  properties,
}: {
  userId: string
  properties: PropertyOption[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !dueDate) {
      setError('Please add a title and due date.')
      return
    }

    const supabase = createClient()

    const { error } = await supabase.from('reminders').insert({
      user_id: userId,
      title: title.trim(),
      due_date: dueDate,
      property_id: propertyId || null,
      status: 'open',
    })

    if (error) {
      setError(error.message)
      return
    }

    await supabase.from('activity_logs').insert({
      user_id: userId,
      property_id: propertyId || null,
      type: 'reminder_added',
      message: `Reminder added: ${title.trim()}`,
    })

    setTitle('')
    setDueDate('')
    setPropertyId('')
    setOpen(false)
    startTransition(() => router.refresh())
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{ padding: '9px 14px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
        >
          + Add reminder
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', padding: '16px', display: 'grid', gap: '10px' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reminder title..."
            style={{ padding: '9px 10px', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}
          />

          <input
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            type="date"
            style={{ padding: '9px 10px', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}
          />

          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            style={{ padding: '9px 10px', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}
          >
            <option value="">No property link</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.address_line_1}, {p.town}
              </option>
            ))}
          </select>

          {error && <p style={{ fontSize: '13px', color: 'hsl(var(--color-red))' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={isPending}
              style={{ padding: '8px 14px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              {isPending ? 'Saving…' : 'Save reminder'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ padding: '8px 14px', background: 'transparent', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
