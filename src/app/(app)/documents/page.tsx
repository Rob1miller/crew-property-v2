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

async function deleteGeneralDoc(id: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: doc } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!doc) return

  await supabase.storage.from('documents').remove([doc.file_path])
  await supabase.from('documents').delete().eq('id', id).eq('user_id', user.id)
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
  gas_safety: 'Gas Safety',
  landlord_insurance: 'Insurance',
}

const categories = ['all', 'tenancy', 'compliance', 'epc', 'insurance', 'invoice', 'repair', 'legal', 'other'] as const
type DocumentCategory = (typeof categories)[number]

const categoryLabel: Record<DocumentCategory, string> = {
  all: 'All',
  tenancy: 'Tenancy',
  compliance: 'Compliance',
  epc: 'EPC',
  insurance: 'Insurance',
  invoice: 'Invoice',
  repair: 'Repair',
  legal: 'Legal',
  other: 'Other',
}

function inferCategory(kind: 'compliance' | 'epc' | 'general', title: string, subLabel: string | null): Exclude<DocumentCategory, 'all'> {
  const text = `${title} ${subLabel ?? ''}`.toLowerCase()
  if (kind === 'epc' || text.includes('epc')) return 'epc'
  if (kind === 'compliance' || text.includes('gas') || text.includes('eicr') || text.includes('certificate')) return 'compliance'
  if (text.includes('insurance')) return 'insurance'
  if (text.includes('invoice') || text.includes('receipt')) return 'invoice'
  if (text.includes('repair') || text.includes('maintenance')) return 'repair'
  if (text.includes('lease') || text.includes('tenancy') || text.includes('tenant')) return 'tenancy'
  if (text.includes('legal') || text.includes('notice')) return 'legal'
  return 'other'
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; q?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const selectedCategory = categories.includes(resolvedSearchParams?.category as DocumentCategory)
    ? resolvedSearchParams?.category as DocumentCategory
    : 'all'
  const query = (resolvedSearchParams?.q ?? '').trim().toLowerCase()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: propertiesData },
    { data: complianceData },
    { data: epcWorksData },
    { data: documentsData },
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
    supabase
      .from('documents')
      .select('id, property_id, file_name, file_path, file_type, uploaded_at')
      .eq('user_id', user!.id)
      .order('uploaded_at', { ascending: false }),
  ])

  const propertyMap = Object.fromEntries(
    (propertiesData ?? []).map((p) => [p.id, `${p.address_line_1}, ${p.town}`])
  )

  type DocRow = {
    id:         string   // prefixed key for React
    rawId:      string   // actual DB uuid
    kind:       'compliance' | 'epc' | 'general'
    title:      string
    subLabel:   string | null
    propertyId: string
    url:        string
    date:       string | null
    category:   Exclude<DocumentCategory, 'all'>
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
    category:   inferCategory('compliance', c.title, complianceTypeLabel[c.type] ?? c.type),
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
    category:   inferCategory('epc', w.work_completed, null),
  }))

  const generalDocs: DocRow[] = await Promise.all((documentsData ?? []).map(async (d) => {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(d.file_path, 60 * 60 * 24 * 30)

    return {
      id: `d-${d.id}`,
      rawId: d.id,
      kind: 'general' as const,
      title: d.file_name,
      subLabel: d.file_type,
      propertyId: d.property_id,
      url: data?.signedUrl ?? '',
      date: d.uploaded_at,
      category: inferCategory('general', d.file_name, d.file_type),
    }
  }))

  const allDocs = [...complianceDocs, ...epcDocs, ...generalDocs].sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const filteredDocs = allDocs.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesQuery = !query || [
      doc.title,
      doc.subLabel,
      propertyMap[doc.propertyId],
      categoryLabel[doc.category],
    ].filter(Boolean).join(' ').toLowerCase().includes(query)
    return matchesCategory && matchesQuery
  })

  function documentsHref(category: DocumentCategory, q = resolvedSearchParams?.q ?? '') {
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (q.trim()) params.set('q', q.trim())
    const qs = params.toString()
    return qs ? `/documents?${qs}` : '/documents'
  }

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

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {categories.map((category) => {
          const active = selectedCategory === category
          const count = category === 'all' ? allDocs.length : allDocs.filter((doc) => doc.category === category).length
          return (
            <a
              key={category}
              href={documentsHref(category)}
              style={{ padding: '7px 12px', borderRadius: '999px', border: active ? '1px solid hsl(var(--color-green))' : '1px solid hsl(var(--color-border))', background: active ? 'hsl(var(--color-green-subtle))' : 'hsl(var(--color-surface))', color: active ? 'hsl(var(--color-green))' : 'hsl(var(--color-ink-subtle))', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}
            >
              {categoryLabel[category]} ({count})
            </a>
          )
        })}
      </div>

      <form action="/documents" style={{ marginBottom: '20px' }}>
        {selectedCategory !== 'all' && <input type="hidden" name="category" value={selectedCategory} />}
        <input
          name="q"
          defaultValue={resolvedSearchParams?.q ?? ''}
          placeholder="Search documents, properties or categories..."
          style={{ width: '100%', padding: '10px 12px', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--color-surface))', color: 'hsl(var(--color-ink))', fontSize: '14px' }}
        />
      </form>

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
          <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-faint))', marginTop: '10px' }}>
            Start with tenancy agreements, certificates, invoices or receipts. They will appear here once attached to a property.
          </p>
          <a href="/properties" style={{ display: 'inline-flex', marginTop: '18px', padding: '9px 18px', background: 'hsl(var(--color-green))', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Open properties
          </a>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 24px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', color: 'hsl(var(--color-ink-subtle))', marginTop: '24px' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))', marginBottom: '6px' }}>No matching documents</p>
          <p style={{ fontSize: '13px' }}>Try another category or search term.</p>
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
          {filteredDocs.map((doc, index) => {
            const address    = propertyMap[doc.propertyId] ?? 'Unknown property'
            const isLast     = index === filteredDocs.length - 1
            const kindBg     = doc.kind === 'epc' ? 'hsl(38 92% 50% / 0.1)' : 'hsl(var(--color-green-subtle))'
            const kindColor  = doc.kind === 'epc' ? 'hsl(38 92% 40%)' : 'hsl(var(--color-green))'
            const kindBorder = doc.kind === 'epc' ? 'hsl(38 92% 70%)' : 'hsl(var(--color-green-muted))'
            const kindLabel  = doc.kind === 'compliance' ? 'Compliance' : doc.kind === 'epc' ? 'EPC Receipt' : 'Document'

            const deleteAction = doc.kind === 'compliance'
              ? clearComplianceDoc.bind(null, doc.rawId)
              : doc.kind === 'epc'
                ? clearEpcReceipt.bind(null, doc.rawId)
                : deleteGeneralDoc.bind(null, doc.rawId)

            const confirmMessage = doc.kind === 'compliance'
              ? 'Remove this document? The compliance item will be kept but the file link will be cleared.'
              : doc.kind === 'epc'
                ? 'Remove this receipt? The EPC work record will be kept but the file link will be cleared.'
                : 'Delete this uploaded document? This cannot be undone.'

            return (
              <div
                className="document-row"
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
                    <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: 'hsl(var(--color-surface-muted))', color: 'hsl(var(--color-ink-subtle))', border: '1px solid hsl(var(--color-border))', flexShrink: 0 }}>
                      {categoryLabel[doc.category]}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                    {address}
                    {doc.date
                      ? ` · ${new Date(doc.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="document-row-actions" style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
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
