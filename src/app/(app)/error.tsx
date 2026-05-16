'use client'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="animate-slide-up">
      <div
        style={{
          padding: '24px',
          background: 'hsl(var(--color-surface))',
          border: '1px solid hsl(var(--color-border))',
          borderRadius: 'var(--radius)',
        }}
      >
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '6px' }}>
          Something went wrong
        </p>
        <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', marginBottom: '16px' }}>
          {error.message || 'The page could not be loaded. Please try again.'}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ padding: '8px 16px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
