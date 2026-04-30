import { createClient } from '@/lib/supabase/client'

export async function uploadDocument(
  file:       File,
  userId:     string,
  propertyId: string
): Promise<string | null> {
  const supabase = createClient()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path     = `${userId}/${propertyId}/${Date.now()}_${safeName}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    console.error('Upload failed:', uploadError.message)
    return null
  }

  const { data } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  return data?.signedUrl ?? null
}
