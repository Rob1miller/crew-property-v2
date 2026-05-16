import type { Metadata } from 'next'
import {
  CardGrid,
  CTAButtons,
  MarketingCard,
  MarketingHero,
  MarketingPage,
  MarketingSection,
  primaryButtonStyle,
} from '@/components/marketing/MarketingShell'

export const metadata: Metadata = {
  title: 'Crew Property — UK landlord control centre',
  description: 'A control centre for self-managing UK landlords.',
}

export default function HomePage() {
  return (
    <MarketingPage>
      <MarketingHero
        eyebrow="UK landlord control centre"
        title="Crew Property"
        subtitle="A control centre for self-managing UK landlords. Keep properties, rent, documents, compliance dates and EPC planning visible in one practical workspace."
      >
        <CTAButtons />
      </MarketingHero>

      <MarketingSection
        title="Property admin gets scattered quickly."
        intro="Many self-managing landlords end up switching between spreadsheets, WhatsApp messages, cloud folders and calendar reminders. Crew Property is designed to make the work visible before dates are missed."
      >
        <CardGrid>
          {['Spreadsheets for rent and deadlines', 'WhatsApp threads for tenant updates', 'Folders full of certificates and receipts', 'Missed dates and renewal anxiety', 'Compliance stress across multiple properties', 'Rent and document admin without a clear audit trail'].map((item) => (
            <MarketingCard key={item} title={item}>Bring the detail back into one property record so the next action is easier to see.</MarketingCard>
          ))}
        </CardGrid>
      </MarketingSection>

      <MarketingSection title="Core features for daily control.">
        <CardGrid>
          <MarketingCard title="Properties">Keep a clean record for each property, including status, notes, documents and linked tasks.</MarketingCard>
          <MarketingCard title="Tenants & rent">Track tenants, rent due, payments, arrears and payment history.</MarketingCard>
          <MarketingCard title="Compliance">Record certificate types, expiry dates, status and document links.</MarketingCard>
          <MarketingCard title="EPC planning">Set current and target ratings, track improvement work and monitor spend against a cap.</MarketingCard>
          <MarketingCard title="Documents">Keep certificates, receipts and property files attached to the right property.</MarketingCard>
          <MarketingCard title="Reminders">Create follow-ups for renewals, inspections, rent checks and admin tasks.</MarketingCard>
          <MarketingCard title="Activity log">Build a simple record of actions taken across the portfolio.</MarketingCard>
        </CardGrid>
      </MarketingSection>

      <MarketingSection
        title="Why it matters"
        intro="The goal is not to replace professional advice. It is to help landlords stay organised, spot risk earlier and keep better records."
      >
        <CardGrid>
          <MarketingCard title="Stay organised">See properties, tenants, documents and tasks in one place.</MarketingCard>
          <MarketingCard title="Avoid missed renewals">Keep expiry dates and reminders visible before they become urgent.</MarketingCard>
          <MarketingCard title="Track rent and documents">Connect rent records and important files to the right tenant or property.</MarketingCard>
          <MarketingCard title="Build an audit trail">Use activity history and notes to understand what happened and when.</MarketingCard>
        </CardGrid>
      </MarketingSection>

      <MarketingSection title="See the product shape" intro="View a static demo-style preview, or sign in if you already have an account. Request access remains available from the demo page.">
        <div id="early-access" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/demo" style={primaryButtonStyle}>View Demo</a>
          <a href="/login" style={{ ...primaryButtonStyle, background: 'hsl(var(--color-surface))', color: 'hsl(var(--color-ink))', border: '1px solid hsl(var(--color-border))' }}>Sign in</a>
        </div>
      </MarketingSection>
    </MarketingPage>
  )
}
