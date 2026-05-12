'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type PropertyResult = {
  id: string
  address_line_1: string
  town: string
  postcode: string | null
}

type TenantResult = {
  id: string
  property_id: string
  full_name: string
  email: string | null
}

export function DashboardSearch({
  properties,
  tenants,
}: {
  properties: PropertyResult[]
  tenants: TenantResult[]
}) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const propertyResults = properties
      .filter((p) =>
        [p.address_line_1, p.town, p.postcode]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
      .map((p) => ({
        id: `property-${p.id}`,
        type: 'Property',
        title: p.address_line_1,
        subtitle: `${p.town}${p.postcode ? ` · ${p.postcode}` : ''}`,
        href: `/properties/${p.id}`,
      }))

    const tenantResults = tenants
      .filter((t) =>
        [t.full_name, t.email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
      .map((t) => ({
        id: `tenant-${t.id}`,
        type: 'Tenant',
        title: t.full_name,
        subtitle: t.email ?? 'Tenant record',
        href: '/tenants',
      }))

    return [...propertyResults, ...tenantResults].slice(0, 8)
  }, [query, properties, tenants])

  return (
    <div style={{ marginBottom: '24px' }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search properties or tenants..."
        style={{
          width: '100%',
          padding: '12px 14px',
          border: '1px solid hsl(var(--color-border))',
          borderRadius: 'var(--radius)',
          background: 'hsl(var(--color-surface))',
          fontSize: '14px',
          color: 'hsl(var(--color-ink))',
        }}
      />

      {query.trim() && (
        <div style={{ marginTop: '10px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {results.length === 0 ? (
            <p style={{ padding: '14px', fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>
              No results found.
            </p>
          ) : (
            results.map((r) => (
              <Link
                key={r.id}
                href={r.href}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '12px 14px',
                  borderBottom: '1px solid hsl(var(--color-border))',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--color-ink))' }}>{r.title}</p>
                  <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>{r.subtitle}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--color-green))' }}>
                  {r.type}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
