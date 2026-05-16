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
  title: 'EPC Planner — Crew Property',
  description: 'Plan EPC improvements, track spend and keep evidence of works.',
}

export default function PublicEpcPlannerPage() {
  return (
    <MarketingPage>
      <MarketingHero
        eyebrow="EPC planning"
        title="Plan EPC improvements before they become urgent."
        subtitle="Crew Property helps landlords record current ratings, set target ratings, track improvement works, monitor spend and keep receipts linked to the right property."
      >
        <CTAButtons />
      </MarketingHero>

      <MarketingSection
        title="EPC risk is easier to manage when the work is visible."
        intro="Without a clear plan, EPC upgrades can become a last-minute scramble across old certificates, contractor quotes and scattered receipts."
      >
        <CardGrid>
          <MarketingCard title="Unknown priorities">It is hard to see which properties need EPC attention first.</MarketingCard>
          <MarketingCard title="Spend uncertainty">Improvement costs can be difficult to track across multiple jobs.</MarketingCard>
          <MarketingCard title="Missing evidence">Receipts and notes often sit outside the main property record.</MarketingCard>
        </CardGrid>
      </MarketingSection>

      <MarketingSection title="A practical EPC planning workflow">
        <CardGrid>
          <MarketingCard title="Current rating">Record the existing EPC rating for each property.</MarketingCard>
          <MarketingCard title="Target rating">Set the rating you want to work toward.</MarketingCard>
          <MarketingCard title="Expiry date">Keep the EPC expiry date visible alongside the plan.</MarketingCard>
          <MarketingCard title="Improvement works">Log completed works such as insulation, heating or glazing improvements.</MarketingCard>
          <MarketingCard title="Spend cap tracking">Track costs against a sensible improvement cap.</MarketingCard>
          <MarketingCard title="Receipts and documents">Keep evidence attached to the work history.</MarketingCard>
        </CardGrid>
      </MarketingSection>

      <MarketingSection
        title="Benefits for self-managing landlords"
        intro="Crew Property is designed to help you understand EPC exposure across the portfolio and keep a record of the work already done."
      >
        <CardGrid>
          <MarketingCard title="Know what needs attention">Spot properties below target ratings and review them first.</MarketingCard>
          <MarketingCard title="Avoid upgrade panic">Plan works before expiry dates or policy changes become urgent.</MarketingCard>
          <MarketingCard title="Keep evidence of works">Store notes and receipts against the property record.</MarketingCard>
          <MarketingCard title="Track improvement spend">See how much has been spent and what remains under the cap.</MarketingCard>
        </CardGrid>
      </MarketingSection>

      <MarketingSection title="See EPC planning inside Crew Property" intro="View the open demo preview, or sign in if you already have an account.">
        <CTAButtons />
      </MarketingSection>
    </MarketingPage>
  )
}
