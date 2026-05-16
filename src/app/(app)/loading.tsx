export default function AppLoading() {
  return (
    <div className="animate-fade-in">
      <div
        style={{
          padding: '22px',
          background: 'hsl(var(--color-surface))',
          border: '1px solid hsl(var(--color-border))',
          borderRadius: 'var(--radius)',
        }}
      >
        <p style={{ fontSize: '14px', color: 'hsl(var(--color-ink-subtle))' }}>Loading…</p>
      </div>
    </div>
  )
}
