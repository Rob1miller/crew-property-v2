import Link from 'next/link'
import type { ReactNode } from 'react'

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, hsl(var(--color-bg)) 0%, hsl(var(--color-surface-muted)) 100%)',
  color: 'hsl(var(--color-ink))',
} as const

const sectionStyle = {
  maxWidth: '1040px',
  margin: '0 auto',
  padding: '72px 24px',
} as const

const cardStyle = {
  background: 'hsl(var(--color-surface))',
  border: '1px solid hsl(var(--color-border))',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  boxShadow: 'var(--shadow-sm)',
} as const

export function MarketingPage({ children }: { children: ReactNode }) {
  return (
    <main style={pageStyle}>
      <MarketingNav />
      {children}
      <MarketingFooter />
    </main>
  )
}

export function MarketingNav() {
  return (
    <nav style={{ borderBottom: '1px solid hsl(var(--color-border))', background: 'hsl(var(--color-surface) / 0.92)', position: 'sticky', top: 0, zIndex: 20 }}>
      <div className="marketing-nav-inner" style={{ maxWidth: '1040px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '18px' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'hsl(var(--color-ink))', textDecoration: 'none' }}>
          Crew <span style={{ color: 'hsl(var(--color-green-mid))' }}>Property</span>
        </Link>
        <div className="marketing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link href="/" style={navLinkStyle}>Home</Link>
          <Link href="/epc-planner" style={navLinkStyle}>EPC Planner</Link>
          <Link href="/landlord-compliance" style={navLinkStyle}>Landlord Compliance</Link>
          <Link href="/demo" style={{ ...navLinkStyle, color: 'hsl(var(--color-green))', fontWeight: 800 }}>View Demo</Link>
          <Link href="/login" style={{ ...navLinkStyle, color: 'hsl(var(--color-green))', fontWeight: 700 }}>Sign in</Link>
        </div>
      </div>
    </nav>
  )
}

const navLinkStyle = {
  color: 'hsl(var(--color-ink-muted))',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 600,
} as const

export function MarketingHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string
  title: string
  subtitle: string
  children?: ReactNode
}) {
  return (
    <section style={{ ...sectionStyle, paddingTop: '104px', paddingBottom: '88px' }}>
      <div style={{ width: '52px', height: '4px', borderRadius: '999px', background: 'hsl(var(--color-green))', marginBottom: '22px' }} />
      {eyebrow && (
        <p style={{ fontSize: '12px', fontWeight: 800, color: 'hsl(var(--color-green))', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '18px' }}>
          {eyebrow}
        </p>
      )}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 7vw, 72px)', fontWeight: 400, lineHeight: 1.04, maxWidth: '820px', marginBottom: '22px' }}>
        {title}
      </h1>
      <p style={{ fontSize: '18px', lineHeight: 1.7, color: 'hsl(var(--color-ink-muted))', maxWidth: '700px', marginBottom: '30px' }}>
        {subtitle}
      </p>
      {children}
    </section>
  )
}

export function MarketingSection({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string
  title: string
  intro?: string
  children: ReactNode
}) {
  return (
    <section style={{ ...sectionStyle, borderTop: '1px solid hsl(var(--color-border))' }}>
      {eyebrow && (
        <p style={{ fontSize: '12px', fontWeight: 800, color: 'hsl(var(--color-green))', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, lineHeight: 1.2, marginBottom: intro ? '12px' : '26px' }}>
        {title}
      </h2>
      {intro && (
        <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'hsl(var(--color-ink-muted))', maxWidth: '720px', marginBottom: '28px' }}>
          {intro}
        </p>
      )}
      {children}
    </section>
  )
}

export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="marketing-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
      {children}
    </div>
  )
}

export function MarketingCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'hsl(var(--color-ink))', marginBottom: '8px' }}>{title}</h3>
      <div style={{ fontSize: '14px', lineHeight: 1.65, color: 'hsl(var(--color-ink-muted))' }}>{children}</div>
    </div>
  )
}

export function CTAButtons() {
  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Link href="/login" style={primaryButtonStyle}>Sign in</Link>
      <Link href="/demo" style={secondaryButtonStyle}>View Demo</Link>
    </div>
  )
}

export const primaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '11px 18px',
  background: 'hsl(var(--color-green))',
  color: 'white',
  borderRadius: 'var(--radius-sm)',
  fontSize: '13px',
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: 'var(--shadow-sm)',
} as const

export const secondaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '11px 18px',
  background: 'hsl(var(--color-surface))',
  color: 'hsl(var(--color-ink))',
  border: '1px solid hsl(var(--color-border))',
  borderRadius: 'var(--radius-sm)',
  fontSize: '13px',
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: 'var(--shadow-sm)',
} as const

export function MarketingFooter() {
  return (
    <footer style={{ borderTop: '1px solid hsl(var(--color-border))', background: 'hsl(var(--color-surface))' }}>
      <div className="marketing-footer-inner" style={{ maxWidth: '1040px', margin: '0 auto', padding: '24px', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>Crew Property</p>
        <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>Built for self-managing UK landlords.</p>
      </div>
    </footer>
  )
}
