import type { Metadata } from 'next'
import {
  CardGrid,
  CTAButtons,
  MarketingCard,
  MarketingHero,
  MarketingPage,
  MarketingSection,
} from '@/components/marketing/MarketingShell'

export const metadata: Metadata = {
  title: 'Landlord Compliance — Crew Property',
  description: 'Keep landlord compliance dates and documents visible.',
}

export default function LandlordCompliancePage() {
  return (
    <MarketingPage>
      <MarketingHero
        eyebrow="Landlord compliance"
        title="Keep compliance dates and documents in view."
        subtitle="Crew Property helps self-managing landlords track gas, electrical, EPC, insurance, deposit and other compliance items without relying on memory or scattered spreadsheets."
      >
        <CTAButtons />
      </MarketingHero>

      <MarketingSection
        title="Compliance admin is stressful when it is scattered."
        intro="Certificates, renewal dates and document links often live in different places. That makes it harder to know what is due next and what evidence you have on file."
      >
        <CardGrid>
          <MarketingCard title="Missed renewal dates">Expiry dates can slip when reminders are spread across calendars and notes.</MarketingCard>
          <MarketingCard title="Scattered certificates">Documents may sit in email, cloud folders or local files without a property context.</MarketingCard>
          <MarketingCard title="Manual spreadsheets">Spreadsheets can show dates, but not the full supporting record.</MarketingCard>
          <MarketingCard title="Unclear priorities">It is easy to lose sight of what needs attention next.</MarketingCard>
        </CardGrid>
      </MarketingSection>

      <MarketingSection title="A simple compliance workflow">
        <CardGrid>
          <MarketingCard title="Add certificates">Record gas, EICR, EPC, insurance, deposit and other items.</MarketingCard>
          <MarketingCard title="Record expiry dates">Keep key renewal dates visible at property and portfolio level.</MarketingCard>
          <MarketingCard title="Upload documents">Attach supporting documents where they belong.</MarketingCard>
          <MarketingCard title="Create reminders">Set follow-ups before dates become urgent.</MarketingCard>
          <MarketingCard title="Dashboard alerts">See expired and upcoming compliance issues from the dashboard.</MarketingCard>
          <MarketingCard title="Activity history">Keep a basic record of additions, updates and completed tasks.</MarketingCard>
        </CardGrid>
      </MarketingSection>

      <MarketingSection
        title="Benefits for self-managing landlords"
        intro="Crew Property gives you a clearer operating view of compliance work without making claims about legal advice or replacing professional support."
      >
        <CardGrid>
          <MarketingCard title="Fewer missed dates">Keep renewals visible before they become urgent.</MarketingCard>
          <MarketingCard title="Better document control">Attach files to properties and compliance records.</MarketingCard>
          <MarketingCard title="Clearer audit trail">Use notes and activity history to understand what changed and when.</MarketingCard>
          <MarketingCard title="Less admin anxiety">Know where to look when a tenant, contractor or adviser asks for information.</MarketingCard>
        </CardGrid>
      </MarketingSection>

      <MarketingSection title="Bring compliance into one workspace" intro="Join early access, request a demo, or sign in if you already have an account.">
        <CTAButtons />
      </MarketingSection>
    </MarketingPage>
  )
}
