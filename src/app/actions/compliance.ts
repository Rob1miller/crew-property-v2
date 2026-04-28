'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addComplianceItemAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const property_id  = formData.get('property_id') as string
  const type         = formData.get('type') as string
  const title        = (formData.get('title') as string)?.trim()
  const status       = formData.get('status') as string
  const expiry_date  = (formData.get('expiry_date') as string) || null
  const notes        = (formData.get('notes') as string)?.trim() || null

  if (!property_id || !type || !title || !status) {
    return { error: 'Please fill in all required fields' }
  }

  // Verify the property belongs to this user before inserting
  const { data: property } = await supabase
    .from('properties')
    .select('id')
    .eq('id', property_id)
    .eq('user_id', user.id)
    .single()

  if (!property) return { error: 'Property not found' }

  const { error } = await supabase.from('compliance_items').insert({
    user_id: user.id,
    property_id,
    type,
    title,
    status,
    expiry_date,
    notes,
  })

  if (error) return { error: error.message }

  revalidatePath('/compliance')
  return { error: '' }
}
