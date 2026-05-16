import type { Metadata } from 'next'
import {
  CardGrid,
  MarketingCard,
  MarketingHero,
  MarketingPage,
  MarketingSection,
  primaryButtonStyle,
  secondaryButtonStyle,
} from '@/components/marketing/MarketingShell'

export const metadata: Metadata = {
  title: 'Request a Crew Property demo',
  description: 'Request early access to Crew Property.',
}

export default function DemoPage() {
  return (
    <MarketingPage>
      <MarketingHero
        eyebrow="Early access"
        title="Request a Crew Property demo"
        subtitle="Crew Property is currently shaped around early access and private beta feedback from self-managing UK landlords. The demo is intended to show how the control centre handles properties, compliance dates, EPC planning, documents and reminders."
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="mailto:hello@crewproperty.co.uk?subject=Crew%20Property%20demo%20request" style={primaryButtonStyle}>
            Email to request access
          </a>
          <a href="/login" style={secondaryButtonStyle}>
            Sign in
          </a>
        </div>
      </MarketingHero>

      <MarketingSection title="What you’ll see">
        <CardGrid>
          <MarketingCard title="Portfolio dashboard">A practical view of properties, reminders, rent risk and compliance alerts.</MarketingCard>
          <MarketingCard title="EPC planning">Current ratings, target ratings, works, receipts and spend-cap tracking.</MarketingCard>
          <MarketingCard title="Compliance records">Certificates, expiry dates, document links, reminders and activity history.</MarketingCard>
        </CardGrid>
      </MarketingSection>

      <MarketingSection title="Who it’s for">
        <CardGrid>
          <MarketingCard title="Self-managing landlords">Landlords who manage their own tenants, renewals, documents and property admin.</MarketingCard>
          <MarketingCard title="Small portfolios">Owners who need a clear operating record without a large property management system.</MarketingCard>
          <MarketingCard title="Compliance-conscious operators">Landlords who want EPC and compliance risk visible before it becomes urgent.</MarketingCard>
        </CardGrid>
      </MarketingSection>

      <MarketingSection title="What happens next" intro="For now, demo requests are handled manually. Send an email with a few details about your portfolio and what you want to manage better.">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="mailto:hello@crewproperty.co.uk?subject=Crew%20Property%20demo%20request" style={primaryButtonStyle}>
            Email to request access
          </a>
          <a href="/" style={secondaryButtonStyle}>
            Back to homepage
          </a>
        </div>
      </MarketingSection>
    </MarketingPage>
  )
}
