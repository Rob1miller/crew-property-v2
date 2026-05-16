import type { Metadata } from 'next'
import {
  MarketingHero,
  MarketingPage,
  MarketingSection,
  primaryButtonStyle,
  secondaryButtonStyle,
} from '@/components/marketing/MarketingShell'

export const metadata: Metadata = {
  title: 'Crew Property demo',
  description: 'Static preview of the Crew Property landlord control centre.',
}

const demoStats = [
  ['6', 'Properties'],
  ['5', 'Active tenants'],
  ['£4,250', 'Monthly rent'],
  ['2', 'Compliance expiring soon'],
  ['1', 'EPC below C'],
  ['£640', 'Current arrears'],
]

const rowCard = {
  background: 'hsl(var(--color-surface))',
  border: '1px solid hsl(var(--color-border))',
  borderRadius: 'var(--radius)',
  padding: '14px 16px',
} as const

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'red' | 'neutral' }) {
  const styles = {
    green: { bg: 'hsl(var(--color-green-subtle))', color: 'hsl(var(--color-green))', border: 'hsl(var(--color-green-muted))' },
    amber: { bg: 'hsl(var(--color-amber-muted))', color: 'hsl(var(--color-amber))', border: 'hsl(var(--color-amber-muted))' },
    red: { bg: 'hsl(var(--color-red-muted))', color: 'hsl(var(--color-red))', border: 'hsl(var(--color-red-muted))' },
    neutral: { bg: 'hsl(var(--color-surface-muted))', color: 'hsl(var(--color-ink-subtle))', border: 'hsl(var(--color-border))' },
  }[tone]

  return (
    <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: styles.bg, color: styles.color, border: `1px solid ${styles.border}` }}>
      {children}
    </span>
  )
}

export default function DemoPage() {
  return (
    <MarketingPage>
      <MarketingHero
        eyebrow="Open demo preview"
        title="Crew Property demo"
        subtitle="This sample view shows how a landlord could manage properties, rent, compliance, EPC works, documents, reminders and activity in one control centre. The data below is static preview content only."
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/login" style={secondaryButtonStyle}>
            Sign in
          </a>
          <a href="#request-access" style={{ ...secondaryButtonStyle, color: 'hsl(var(--color-green))' }}>
            Request access
          </a>
        </div>
      </MarketingHero>

      <MarketingSection title="Demo dashboard cards" intro="A high-level snapshot of the portfolio health a landlord might see after adding properties, tenants, compliance records and rent details.">
        <div className="marketing-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'hsl(var(--color-border))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {demoStats.map(([value, label]) => (
            <div key={label} style={{ background: 'hsl(var(--color-surface))', padding: '22px' }}>
              <p style={{ fontSize: '11px', fontWeight: 800, color: 'hsl(var(--color-ink-subtle))', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>{label}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '34px', lineHeight: 1, color: label.includes('arrears') || label.includes('EPC') || label.includes('Compliance') ? 'hsl(var(--color-amber))' : 'hsl(var(--color-ink))' }}>{value}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection title="Portfolio snapshot">
        <div style={{ display: 'grid', gap: '10px' }}>
          {[
            ['12 King Street', 'Residential', 'Occupied', 'green'],
            ['Unit 4 Riverside Yard', 'Commercial', 'Vacant', 'amber'],
            ['8 Oak Avenue', 'Residential', 'EPC D', 'amber'],
          ].map(([address, type, status, tone]) => (
            <div key={address} style={{ ...rowCard, display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--color-ink))' }}>{address}</p>
                <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>{type}</p>
              </div>
              <Badge tone={tone as 'green' | 'amber'}>{status}</Badge>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection title="Compliance snapshot">
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={rowCard}><strong>Gas Safety</strong><span style={{ color: 'hsl(var(--color-ink-subtle))' }}> — expires in 21 days</span></div>
          <div style={rowCard}><strong>EICR</strong><span style={{ color: 'hsl(var(--color-ink-subtle))' }}> — valid until 2028</span></div>
          <div style={rowCard}><strong>Landlord Insurance</strong><span style={{ color: 'hsl(var(--color-ink-subtle))' }}> — renewal due soon</span></div>
        </div>
      </MarketingSection>

      <MarketingSection title="EPC planning snapshot">
        <div style={{ ...rowCard, display: 'grid', gap: '12px' }}>
          <p style={{ fontSize: '18px', fontWeight: 800, color: 'hsl(var(--color-ink))' }}>Current D → Target C</p>
          <div style={{ display: 'grid', gap: '8px' }}>
            <p>Loft insulation completed <strong>£850</strong></p>
            <p>Boiler upgrade planned <strong>£2,300</strong></p>
            <p>Spend cap <strong>£10,000</strong></p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection title="Rent snapshot">
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ ...rowCard, display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span>John Smith</span><Badge tone="green">Paid</Badge></div>
          <div style={{ ...rowCard, display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span>Sarah Jones</span><Badge tone="amber">Partial, £320 outstanding</Badge></div>
          <div style={{ ...rowCard, display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span>Unit 4 tenant</span><Badge>Vacant</Badge></div>
        </div>
      </MarketingSection>

      <MarketingSection title="Recent activity">
        <div style={{ display: 'grid', gap: '10px' }}>
          {['Rent marked paid', 'Compliance document uploaded', 'EPC work added', 'Reminder completed'].map((item) => (
            <div key={item} style={rowCard}>{item}</div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection title="Ready to use Crew Property?" intro="Sign in if you already have an account, or request access to discuss the private beta.">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/login" style={primaryButtonStyle}>
            Sign in
          </a>
          <a href="mailto:hello@crewproperty.co.uk?subject=Crew%20Property%20demo%20request" style={primaryButtonStyle}>
            Request access
          </a>
        </div>
        <div id="request-access" />
      </MarketingSection>
    </MarketingPage>
  )
}
