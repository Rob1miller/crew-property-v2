'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function uploadDocumentAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('file') as File
  const property_id = (formData.get('property_id') as string)?.trim()
  const compliance_item_id = (formData.get('compliance_item_id') as string)?.trim() || null

  if (!file || file.size === 0) return { error: 'Please choose a file' }
  if (!property_id) return { error: 'Please select a property' }

  const { data: property } = await supabase
    .from('properties')
    .select('id')
    .eq('id', property_id)
    .eq('user_id', user.id)
    .single()

  if (!property) return { error: 'Property not found' }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `${user.id}/${property_id}/${Date.now()}_${safeName}`
  const fileBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, fileBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` }

  const { error: dbError } = await supabase.from('documents').insert({
    user_id: user.id,
    property_id,
    compliance_item_id,
    file_name: file.name,
    file_path: filePath,
    file_type: file.type || null,
  })

  if (dbError) {
    await supabase.storage.from('documents').remove([filePath])
    return { error: `Database error: ${dbError.message}` }
  }

  revalidatePath('/documents')
  return { error: '' }
}

export async function deleteDocumentAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const id = (formData.get('id') as string)?.trim()
  if (!id) return

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
