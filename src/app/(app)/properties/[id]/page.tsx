import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Property, PropertyStatus, PropertyType } from '@/types/property'

const STATUS_LABELS: Record<PropertyStatus, string> = {
  occupied: 'Occupied',
  vacant:   'Vacant',
  refurb:   'Refurb',
  for_sale: 'For sale',
}

const STATUS_COLOURS: Record<PropertyStatus, { bg: string; text: string }> = {
  occupied: { bg: 'hsl(var(--color-green-muted))', text: 'hsl(var(--color-green))' },
  vacant:   { bg: 'hsl(var(--color-amber-muted))', text: 'hsl(var(--color-amber))' },
  refurb:   { bg: 'hsl(var(--color-blue-muted))',  text: 'hsl(var(--color-blue))' },
  for_sale: { bg: 'hsl(var(--color-surface-muted))', text: 'hsl(var(--color-ink-subtle))' },
}

const TYPE_LABELS: Record<PropertyType, string> = {
  house:      'House',
  flat:       'Flat',
  bungalow:   'Bungalow',
  hmo:        'HMO',
  commercial: 'Commercial',
  other:      'Other',
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '160px 1fr',
      gap: '12px',
      padding: '14px 0',
      borderBottom: '1px solid hsl(var(--color-border))',
      alignItems: 'start',
    }}>
      <p style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--color-ink-subtle))', textTransform: 'uppercase', letterSpacing: '0.4px', paddingTop: '1px' }}>
        {label}
      </p>
      <div style={{ fontSize: '14px', color: 'hsl(var(--color-ink))' }}>
        {value}
      </div>
    </div>
  )
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!data) {
    return (
      <div className="animate-slide-up">
        <Link
          href="/properties"
          style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}
        >
          ← Back to properties
        </Link>
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: 'hsl(var(--color-surface))',
          border: '1px solid hsl(var(--color-border))',
          borderRadius: 'var(--radius)',
        }}>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'hsl(var(--color-ink))', marginBottom: '6px' }}>Property not found</p>
          <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>This property does not exist or you do not have access to it.</p>
        </div>
      </div>
    )
  }

  const p = data as Property
  const status = STATUS_COLOURS[p.status]

  return (
    <div className="animate-slide-up">

      <Link
        href="/properties"
        style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}
      >
        ← Back to properties
      </Link>

      <div className="page-header">
        <div className="page-header-left">
          <h1>{p.address_line_1}</h1>
          <p>{p.town}, {p.postcode}</p>
        </div>
        <span style={{
          padding: '5px 12px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 700,
          background: status.bg,
          color: status.text,
          alignSelf: 'flex-start',
          marginTop: '4px',
        }}>
          {STATUS_LABELS[p.status]}
        </span>
      </div>

      <div style={{
        background: 'hsl(var(--color-surface))',
        border: '1px solid hsl(var(--color-border))',
        borderRadius: 'var(--radius)',
        padding: '0 24px',
      }}>
        <Row label="Address" value={
          <>
            <p>{p.address_line_1}</p>
            {p.address_line_2 && <p style={{ color: 'hsl(var(--color-ink-muted))' }}>{p.address_line_2}</p>}
          </>
        } />
        <Row label="Town / City" value={p.town} />
        <Row label="Postcode"    value={p.postcode} />
        <Row label="Type"        value={TYPE_LABELS[p.property_type]} />
        <Row label="Status"      value={
          <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            background: status.bg,
            color: status.text,
          }}>
            {STATUS_LABELS[p.status]}
          </span>
        } />
        <Row label="Added" value={new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
      </div>

    </div>
  )
}
