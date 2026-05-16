import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AddPropertyForm } from '@/components/properties/AddPropertyForm'
import type { Property, PropertyStatus } from '@/types/property'

const STATUS_LABELS: Record<PropertyStatus, string> = {
  occupied: 'Occupied',
  vacant: 'Vacant',
  refurb: 'Refurb',
  for_sale: 'For sale',
}

const STATUS_COLOURS: Record<PropertyStatus, { bg: string; text: string }> = {
  occupied: { bg: 'hsl(var(--color-green-muted))', text: 'hsl(var(--color-green))' },
  vacant: { bg: 'hsl(var(--color-amber-muted))', text: 'hsl(var(--color-amber))' },
  refurb: { bg: 'hsl(var(--color-blue-muted))', text: 'hsl(var(--color-blue))' },
  for_sale: { bg: 'hsl(var(--color-surface-muted))', text: 'hsl(var(--color-ink-subtle))' },
}

function PropertyCard({ p }: { p: Property }) {
  const status = STATUS_COLOURS[p.status]

  return (
    <Link
      href={`/properties/${p.id}`}
      style={{
        textDecoration: 'none',
        background: 'hsl(var(--color-surface))',
        border: '1px solid hsl(var(--color-border))',
        borderRadius: 'var(--radius)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '2px' }}>
          {p.address_line_1}
        </p>
        {p.address_line_2 && (
          <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-muted))' }}>{p.address_line_2}</p>
        )}
        <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-muted))' }}>
          {p.town}, {p.postcode}
        </p>
        <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))', marginTop: '6px', textTransform: 'capitalize' }}>
          {p.property_type}
        </p>
      </div>

      <span
        style={{
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          flexShrink: 0,
          background: status.bg,
          color: status.text,
        }}
      >
        {STATUS_LABELS[p.status]}
      </span>
    </Link>
  )
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string; status?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const selectedType = resolvedSearchParams?.type ?? 'all'
  const selectedStatus = resolvedSearchParams?.status ?? 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const allProperties = (properties ?? []) as Property[]
  const typeFiltered = selectedType === 'all'
    ? allProperties
    : allProperties.filter((p) => selectedType === 'residential' ? p.property_type !== 'commercial' : p.property_type === 'commercial')
  const list = selectedStatus === 'all'
    ? typeFiltered
    : typeFiltered.filter((p) => p.status === selectedStatus)

  const residentialCount = allProperties.filter((p) => p.property_type !== 'commercial').length
  const commercialCount = allProperties.filter((p) => p.property_type === 'commercial').length
  const statusCounts = {
    all: typeFiltered.length,
    occupied: typeFiltered.filter((p) => p.status === 'occupied').length,
    vacant: typeFiltered.filter((p) => p.status === 'vacant').length,
    refurb: typeFiltered.filter((p) => p.status === 'refurb').length,
    for_sale: typeFiltered.filter((p) => p.status === 'for_sale').length,
  }

  function filterHref(type: string, status = selectedStatus) {
    const params = new URLSearchParams()
    if (type !== 'all') params.set('type', type)
    if (status !== 'all') params.set('status', status)
    const query = params.toString()
    return query ? `/properties?${query}` : '/properties'
  }

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Properties</h1>
          <p>{allProperties.length} {allProperties.length === 1 ? 'property' : 'properties'} in your portfolio</p>
        </div>
      </div>

      <AddPropertyForm />

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {[
          { label: `All (${allProperties.length})`, href: filterHref('all'), active: selectedType === 'all' },
          { label: `Residential (${residentialCount})`, href: filterHref('residential'), active: selectedType === 'residential' },
          { label: `Commercial (${commercialCount})`, href: filterHref('commercial'), active: selectedType === 'commercial' },
        ].map((filter) => (
          <Link
            key={filter.href}
            href={filter.href}
            style={{
              padding: '8px 14px',
              borderRadius: '999px',
              border: filter.active ? '1px solid hsl(var(--color-green))' : '1px solid hsl(var(--color-border))',
              background: filter.active ? 'hsl(var(--color-green-subtle))' : 'hsl(var(--color-surface))',
              color: filter.active ? 'hsl(var(--color-green))' : 'hsl(var(--color-ink-subtle))',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { id: 'all', label: `All statuses (${statusCounts.all})` },
          { id: 'occupied', label: `Occupied (${statusCounts.occupied})` },
          { id: 'vacant', label: `Vacant (${statusCounts.vacant})` },
          { id: 'refurb', label: `Refurb (${statusCounts.refurb})` },
          { id: 'for_sale', label: `For sale (${statusCounts.for_sale})` },
        ].map((filter) => {
          const active = selectedStatus === filter.id
          return (
            <Link
              key={filter.id}
              href={filterHref(selectedType, filter.id)}
              style={{ padding: '6px 11px', borderRadius: '999px', border: active ? '1px solid hsl(var(--color-green))' : '1px solid hsl(var(--color-border))', background: active ? 'hsl(var(--color-green-subtle))' : 'hsl(var(--color-surface))', color: active ? 'hsl(var(--color-green))' : 'hsl(var(--color-ink-subtle))', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}
            >
              {filter.label}
            </Link>
          )
        })}
      </div>

      {error && (
        <p style={{ fontSize: '13px', color: 'hsl(var(--color-red))', marginBottom: '16px' }}>
          Could not load properties: {error.message}
        </p>
      )}

      {list.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'hsl(var(--color-surface))',
            border: '1px solid hsl(var(--color-border))',
            borderRadius: 'var(--radius)',
            color: 'hsl(var(--color-ink-subtle))',
          }}
        >
          <p style={{ fontSize: '15px', marginBottom: '8px', fontWeight: 500, color: 'hsl(var(--color-ink))' }}>
            {allProperties.length === 0 ? 'No properties yet' : 'No matching properties'}
          </p>
          <p style={{ fontSize: '13px', marginBottom: allProperties.length === 0 ? '20px' : 0 }}>
            {allProperties.length === 0 ? 'Add your first property to start building your portfolio dashboard.' : 'Try another property type or status filter.'}
          </p>
          {allProperties.length === 0 && (
            <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-faint))' }}>
              Tip: add the address, property type and current status first. Tenants, compliance and documents can follow.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {list.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  )
}
