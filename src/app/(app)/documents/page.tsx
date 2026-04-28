import { createClient } from '@/lib/supabase/server'
import UploadDocumentForm from '@/components/documents/UploadDocumentForm'
import { deleteDocumentAction } from '@/app/actions/documents'
import type { Property } from '@/types/property'
import type { ComplianceItem } from '@/types/compliance'
import type { Document } from '@/types/document'

function fileIcon(fileType: string | null): string {
  if (!fileType) return '📄'
  if (fileType.includes('pdf')) return '📕'
  if (fileType.includes('image')) return '🖼️'
  if (fileType.includes('word') || fileType.includes('document')) return '📝'
  if (fileType.includes('sheet') || fileType.includes('excel')) return '📊'
  return '📄'
}

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: propertiesData },
    { data: complianceData },
    { data: documentsData },
  ] = await Promise.all([
    supabase.from('properties').select('id, address_line_1, town').eq('user_id', user!.id),
    supabase.from('compliance_items').select('id, property_id, title').eq('user_id', user!.id),
    supabase.from('documents').select('*').eq('user_id', user!.id),
  ])

  const properties = (propertiesData ?? []) as Pick<Property, 'id' | 'address_line_1' | 'town'>[]
  const complianceItems = (complianceData ?? []) as Pick<ComplianceItem, 'id' | 'property_id' | 'title'>[]
  const documents = (documentsData ?? []) as Document[]

  const propertyMap = Object.fromEntries(
    properties.map(p => [p.id, `${p.address_line_1}, ${p.town}`])
  )

  const docsWithUrls = await Promise.all(
    documents.map(async doc => {
      const { data } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_path, 3600)
      return { ...doc, signedUrl: data?.signedUrl ?? null }
    })
  )

  return (
    <div>
      <h1>Documents</h1>

      <UploadDocumentForm
        properties={properties}
        complianceItems={complianceItems}
      />

      {docsWithUrls.length === 0 ? (
        <p>No documents yet</p>
      ) : (
        <div>
          {docsWithUrls.map(doc => (
            <div key={doc.id} style={{ display: 'flex', gap: '10px' }}>
              
              <span>{fileIcon(doc.file_type)}</span>

              <div style={{ flex: 1 }}>
                <p>{doc.file_name}</p>
                <p>{propertyMap[doc.property_id]}</p>
              </div>

              {doc.signedUrl && (
                <a
                  href={doc.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                </a>
              )}

              <form action={deleteDocumentAction}>
                <input type="hidden" name="id" value={doc.id} />
                <button type="submit">Delete</button>
              </form>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
