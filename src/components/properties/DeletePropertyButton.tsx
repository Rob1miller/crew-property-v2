'use client'

import { useState } from 'react'
import { deletePropertyAction } from '@/app/actions/properties'

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        style={{
          padding: '8px 16px',
          background: 'transparent',
          color: 'hsl(var(--color-red))',
          border: '1px solid hsl(var(--color-red-muted))',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Delete
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '13px', color: 'hsl(var(--color-ink-muted))' }}>
        Are you sure?
      </span>
      <form action={deletePropertyAction} style={{ display: 'inline' }}>
        <input type="hidden" name="id" value={propertyId} />
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            background: 'hsl(var(--color-red))',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Yes, delete
        </button>
      </form>
      <button
        onClick={() => setConfirming(false)}
        style={{
          padding: '8px 16px',
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
  )
}
