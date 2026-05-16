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
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '14px' }}>Loading…</p>
        <div style={{ display: 'grid', gap: '10px' }}>
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              style={{
                height: item === 0 ? '14px' : '36px',
                maxWidth: item === 0 ? '220px' : '100%',
                borderRadius: 'var(--radius-sm)',
                background: 'hsl(var(--color-surface-muted))',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
