'use client'

import { useTransition } from 'react'

interface Props {
  action:         () => Promise<void>
  confirmMessage: string
}

export function DeleteDocButton({ action, confirmMessage }: Props) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(confirmMessage)) return
    startTransition(() => { action() })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      style={{
        padding:      '6px 14px',
        background:   'transparent',
        color:        pending ? 'hsl(var(--color-ink-subtle))' : 'hsl(0 72% 51%)',
        border:       '1px solid hsl(var(--color-border))',
        borderRadius: 'var(--radius-sm)',
        fontSize:     '12px',
        fontWeight:   600,
        cursor:       pending ? 'not-allowed' : 'pointer',
        whiteSpace:   'nowrap',
      }}
    >
      {pending ? '…' : 'Delete'}
    </button>
  )
}
