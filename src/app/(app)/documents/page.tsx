import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DeleteDocButton } from '@/components/documents/DeleteDocButton'

// ─────────────────────────────────────────────────────────────
// Server actions
// ─────────────────────────────────────────────────────────────

async function clearComplianceDoc(id: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('compliance_items')
    .update({ document_url: null })
    .eq('id', id)
    .eq('user_id', user.id)
  revalidatePath('/documents')
}

async function clearEpcReceipt(id: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('epc_works')
    .update({ receipt_url: null })
    .eq('id', id)
    .eq('user_id', user.id)
  revalidatePath('/documents')
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const complianceTypeLabel: Record<string, string> = {
  gas:       'Gas Safety',
  eicr:      'Electrical (EICR)',
  epc:       'EPC',
  insurance: 'Insurance',
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: propertiesData },
    { data: complianceData },
    { data: epcWorksData },
  ] = await Promise.all([
    supabase
      .from('properties')
      .select('id, address_line_1, town')
      .eq('user_id', user!.id),
    supabase
      .from('compliance_items')
      .select('id, property_id, type, title, document_url, updated_at, created_at')
      .eq('user_id', user!.id)
      .not('document_url', 'is', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('epc_works')
      .select('id, property_id, work_completed, completed_date, receipt_url, created_at')
      .eq('user_id', user!.id)
      .not('receipt_url', 'is', null)
      .order('created_at', { ascending: false }),
  ])

  const propertyMap = Object.fromEntries(
    (propertiesData ?? []).map((p) => [p.id, `${p.address_line_1}, ${p.town}`])
  )

  type DocRow = {
    id:         string   // prefixed key for React
    rawId:      string   // actual DB uuid
    kind:       'compliance' | 'epc'
    title:      string
    subLabel:   string | null
    propertyId: string
    url:        string
    date:       string | null
  }

  const complianceDocs: DocRow[] = (complianceData ?? []).map((c) => ({
    id:         `c-${c.id}`,
    rawId:      c.id,
    kind:       'compliance',
    title:      c.title,
    subLabel:   complianceTypeLabel[c.type] ?? c.type,
    propertyId: c.property_id,
    url:        c.document_url!,
    date:       c.updated_at ?? c.created_at,
  }))

  const epcDocs: DocRow[] = (epcWorksData ?? []).map((w) => ({
    id:         `e-${w.id}`,
    rawId:      w.id,
    kind:       'epc',
    title:      w.work_completed,
    subLabel:   null,
    propertyId: w.property_id,
    url:        w.receipt_url!,
    date:       w.completed_date ?? w.created_at,
  }))

  const allDocs = [...complianceDocs, ...epcDocs].sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <div className="animate-slide-up">

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Documents</h1>
          <p>
            {allDocs.length}{' '}
            {allDocs.length === 1 ? 'document' : 'documents'} across all properties
          </p>
        </div>
      </div>

      {allDocs.length === 0 ? (
        <div
          style={{
            textAlign:    'center',
            padding:      '60px 24px',
            background:   'hsl(var(--color-surface))',
            border:       '1px solid hsl(var(--color-border))',
            borderRadius: 'var(--radius)',
            color:        'hsl(var(--color-ink-subtle))',
            marginTop:    '24px',
          }}
        >
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'hsl(var(--color-ink))', marginBottom: '8px' }}>
            No documents yet
          </p>
          <p style={{ fontSize: '13px' }}>
            Upload documents via compliance items or EPC work receipts on each property page.
          </p>
        </div>
      ) : (
        <div
          style={{
            background:   'hsl(var(--color-surface))',
            border:       '1px solid hsl(var(--color-border))',
            borderRadius: 'var(--radius)',
            overflow:     'hidden',
            marginTop:    '24px',
          }}
        >
          {allDocs.map((doc, index) => {
            const address    = propertyMap[doc.propertyId] ?? 'Unknown property'
            const isLast     = index === allDocs.length - 1
            const kindBg     = doc.kind === 'compliance' ? 'hsl(var(--color-green-subtle))' : 'hsl(38 92% 50% / 0.1)'
            const kindColor  = doc.kind === 'compliance' ? 'hsl(var(--color-green))' : 'hsl(38 92% 40%)'
            const kindBorder = doc.kind === 'compliance' ? 'hsl(var(--color-green-muted))' : 'hsl(38 92% 70%)'
            const kindLabel  = doc.kind === 'compliance' ? 'Compliance' : 'EPC Receipt'

            const deleteAction = doc.kind === 'compliance'
              ? clearComplianceDoc.bind(null, doc.rawId)
              : clearEpcReceipt.bind(null, doc.rawId)

            const confirmMessage = doc.kind === 'compliance'
              ? 'Remove this document? The compliance item will be kept but the file link will be cleared.'
              : 'Remove this receipt? The EPC work record will be kept but the file link will be cleared.'

            return (
              <div
                key={doc.id}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '14px',
                  padding:      '14px 20px',
                  borderBottom: isLast ? 'none' : '1px solid hsl(var(--color-border))',
                }}
              >
                {/* Kind badge */}
                <span
                  style={{
                    flexShrink:   0,
                    padding:      '3px 9px',
                    borderRadius: '999px',
                    fontSize:     '11px',
                    fontWeight:   600,
                    background:   kindBg,
                    color:        kindColor,
                    border:       `1px solid ${kindBorder}`,
                    whiteSpace:   'nowrap',
                  }}
                >
                  {kindLabel}
                </span>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '2px' }}>
                    <p
                      style={{
                        fontSize:     '14px',
                        fontWeight:   600,
                        color:        'hsl(var(--color-ink))',
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace:   'nowrap',
                        maxWidth:     '340px',
                      }}
                    >
                      {doc.title}
                    </p>
                    {doc.subLabel ? (
                      <span
                        style={{
                          padding:      '1px 7px',
                          borderRadius: '999px',
                          fontSize:     '11px',
                          fontWeight:   600,
                          background:   'hsl(var(--color-surface-muted))',
                          color:        'hsl(var(--color-ink-subtle))',
                          border:       '1px solid hsl(var(--color-border))',
                          flexShrink:   0,
                        }}
                      >
                        {doc.subLabel}
                      </span>
                    ) : null}
                  </div>
                  <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                    {address}
                    {doc.date
                      ? ` · ${new Date(doc.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : ''}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                  {doc.url ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 14px', background: 'hsl(var(--color-green-subtle))', color: 'hsl(var(--color-green))', border: '1px solid hsl(var(--color-green-muted))', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      View
                    </a>
                  ) : null}
                  <DeleteDocButton action={deleteAction} confirmMessage={confirmMessage} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
