import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────

interface Property {
  id: string
  address_line_1: string
  town: string
  postcode: string | null
}

interface EpcPlan {
  id: string
  property_id: string
  current_rating: string
  target_rating: string
  expiry_date: string | null
  cap_amount: number
}

interface EpcWork {
  property_id: string
  cost: number
}

// ── Helpers ───────────────────────────────────────────────────

function ratingStyle(r: string) {
  if (['A', 'B', 'C'].includes(r)) return { color: 'hsl(var(--color-green))', bg: 'hsl(var(--color-green-subtle))', border: 'hsl(var(--color-green-muted))' }
  if (r === 'D')                   return { color: 'hsl(38 92% 40%)',          bg: 'hsl(38 92% 50% / 0.1)',          border: 'hsl(38 92% 65%)' }
  return                                  { color: 'hsl(0 72% 45%)',            bg: 'hsl(0 72% 45% / 0.1)',            border: 'hsl(0 72% 65%)' }
}

function expiryNote(dateStr: string): { text: string; color: string } {
  const days = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (days < 0)   return { text: 'Expired',       color: 'hsl(0 72% 45%)' }
  if (days <= 60) return { text: 'Expiring soon', color: 'hsl(38 92% 40%)' }
  return                 { text: new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), color: 'hsl(var(--color-ink-subtle))' }
}

function fmt(n: number) {
  return n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function RatingBadge({ r }: { r: string }) {
  const s = ratingStyle(r)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
      background: s.bg, border: `2px solid ${s.border}`,
      fontSize: '15px', fontWeight: 800, color: s.color,
      fontFamily: 'var(--font-display)',
    }}>
      {r}
    </span>
  )
}

// ── Page ─────────────────────────────────────────────────────

export default async function EpcPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: propertiesData },
    { data: epcPlansData },
    { data: epcWorksData },
  ] = await Promise.all([
    supabase
      .from('properties')
      .select('id, address_line_1, town, postcode')
      .eq('user_id', user!.id)
      .order('created_at'),
    supabase
      .from('epc_plans')
      .select('id, property_id, current_rating, target_rating, expiry_date, cap_amount')
      .eq('user_id', user!.id),
    supabase
      .from('epc_works')
      .select('property_id, cost')
      .eq('user_id', user!.id),
  ])

  const properties = (propertiesData ?? []) as Property[]
  const epcPlans   = (epcPlansData   ?? []) as EpcPlan[]
  const epcWorks   = (epcWorksData   ?? []) as EpcWork[]

  // Index plans and spend by property_id
  const planByProperty  = Object.fromEntries(epcPlans.map((p) => [p.property_id, p]))
  const spendByProperty = epcWorks.reduce<Record<string, number>>((acc, w) => {
    acc[w.property_id] = (acc[w.property_id] ?? 0) + (w.cost ?? 0)
    return acc
  }, {})

  // Summary stats
  const withPlan    = properties.filter((p) => planByProperty[p.id])
  const totalSpend  = epcWorks.reduce((s, w) => s + (w.cost ?? 0), 0)
  const belowC      = withPlan.filter((p) => {
    const r = planByProperty[p.id]?.current_rating
    return r && ['D', 'E', 'F', 'G'].includes(r)
  }).length

  return (
    <div className="animate-slide-up">

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>EPC Planner</h1>
          <p>
            {withPlan.length} of {properties.length}{' '}
            {properties.length === 1 ? 'property has' : 'properties have'} an EPC plan
          </p>
        </div>
      </div>

      {/* Summary strip */}
      {properties.length > 0 && (
        <div className="epc-stats-grid grid grid-cols-4 gap-px mb-6 bg-border border border-border rounded-lg overflow-hidden">
          {[
            { label: 'Properties',   value: properties.length },
            { label: 'Plans set up', value: `${withPlan.length} / ${properties.length}` },
            { label: 'Total spend',  value: fmt(totalSpend) },
            { label: 'Below EPC C',  value: belowC, warn: belowC > 0 },
          ].map((s) => (
            <div key={s.label} className="bg-surface px-5 py-4">
              <p className="text-[11px] font-bold text-ink-subtle uppercase tracking-[0.6px] mb-1.5">{s.label}</p>
              <p
                style={{ fontFamily: 'var(--font-display)', fontSize: '26px', lineHeight: 1 }}
                className={'warn' in s && s.warn ? 'text-amber' : 'text-ink'}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {properties.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: 'hsl(var(--color-surface))',
          border: '1px solid hsl(var(--color-border))',
          borderRadius: 'var(--radius)',
          color: 'hsl(var(--color-ink-subtle))',
        }}>
          <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px', color: 'hsl(var(--color-ink))' }}>
            No properties yet
          </p>
          <p style={{ fontSize: '13px', marginBottom: '20px' }}>
            Add a property first, then set up its EPC plan from the property page.
          </p>
          <Link
            href="/properties"
            style={{ padding: '9px 18px', background: 'hsl(var(--color-green))', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
          >
            Go to properties
          </Link>
        </div>
      )}

      {/* Property rows */}
      {properties.length > 0 && (
        <div style={{
          background:   'hsl(var(--color-surface))',
          border:       '1px solid hsl(var(--color-border))',
          borderRadius: 'var(--radius)',
          overflow:     'hidden',
        }}>
          {properties.map((property, index) => {
            const plan  = planByProperty[property.id] ?? null
            const spend = spendByProperty[property.id] ?? 0
            const cap   = plan?.cap_amount ?? 10000
            const rem   = cap - spend
            const pct   = plan ? Math.min(100, Math.round((spend / cap) * 100)) : 0

            return (
              <div
                key={property.id}
                style={{
                  padding:      '18px 20px',
                  borderBottom: index < properties.length - 1 ? '1px solid hsl(var(--color-border))' : 'none',
                }}
              >
                <div className="epc-property-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' as const }}>

                  {/* Address */}
                  <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {property.address_line_1}
                    </p>
                    <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                      {property.town}{property.postcode ? `, ${property.postcode}` : ''}
                    </p>
                  </div>

                  {plan ? (
                    <>
                      {/* Ratings */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <RatingBadge r={plan.current_rating} />
                        <span style={{ fontSize: '14px', color: 'hsl(var(--color-ink-subtle))' }}>→</span>
                        <RatingBadge r={plan.target_rating} />
                      </div>

                      {/* Expiry */}
                      <div style={{ flexShrink: 0, minWidth: '110px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--color-ink-subtle))', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '3px' }}>
                          EPC expires
                        </p>
                        {plan.expiry_date ? (() => {
                          const note = expiryNote(plan.expiry_date)
                          return (
                            <p style={{ fontSize: '13px', fontWeight: 600, color: note.color }}>
                              {note.text}
                            </p>
                          )
                        })() : (
                          <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>—</p>
                        )}
                      </div>

                      {/* Spend */}
                      <div style={{ flexShrink: 0, minWidth: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--color-ink-subtle))', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Spend</p>
                          <p style={{ fontSize: '11px', color: 'hsl(var(--color-ink-subtle))' }}>{fmt(spend)} / {fmt(cap)}</p>
                        </div>
                        <div style={{ height: '6px', background: 'hsl(var(--color-border))', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                          <div style={{
                            width:        `${pct}%`,
                            height:       '100%',
                            borderRadius: '3px',
                            background:   pct >= 100 ? 'hsl(0 72% 51%)' : pct >= 80 ? 'hsl(38 92% 50%)' : 'hsl(var(--color-green))',
                          }} />
                        </div>
                        <p style={{ fontSize: '11px', color: rem < 0 ? 'hsl(0 72% 45%)' : 'hsl(var(--color-ink-subtle))' }}>
                          {rem >= 0 ? `${fmt(rem)} left` : `${fmt(Math.abs(rem))} over cap`}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1 }}>
                      <span style={{
                        display:      'inline-flex',
                        alignItems:   'center',
                        padding:      '3px 10px',
                        borderRadius: '999px',
                        fontSize:     '12px',
                        fontWeight:   600,
                        background:   'hsl(var(--color-surface-muted))',
                        color:        'hsl(var(--color-ink-subtle))',
                        border:       '1px solid hsl(var(--color-border))',
                      }}>
                        No EPC plan
                      </span>
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={`/properties/${property.id}`}
                    style={{
                      flexShrink:     0,
                      padding:        '7px 14px',
                      background:     'transparent',
                      color:          'hsl(var(--color-green))',
                      border:         '1px solid hsl(var(--color-green-muted))',
                      borderRadius:   'var(--radius-sm)',
                      fontSize:       '12px',
                      fontWeight:     600,
                      textDecoration: 'none',
                      display:        'inline-flex',
                      alignItems:     'center',
                      whiteSpace:     'nowrap' as const,
                    }}
                  >
                    Open EPC planner
                  </Link>

                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
