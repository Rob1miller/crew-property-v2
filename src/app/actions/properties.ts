'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addPropertyAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const address_line_1 = (formData.get('address_line_1') as string)?.trim()
  const address_line_2 = (formData.get('address_line_2') as string)?.trim() || null
  const town           = (formData.get('town') as string)?.trim()
  const postcode       = (formData.get('postcode') as string)?.trim()
  const property_type  = formData.get('property_type') as string
  const status         = formData.get('status') as string

  if (!address_line_1 || !town || !postcode || !property_type || !status) {
    return { error: 'Please fill in all required fields' }
  }

  const { error } = await supabase.from('properties').insert({
    user_id: user.id,
    address_line_1,
    address_line_2,
    town,
    postcode,
    property_type,
    status,
  })

  if (error) return { error: error.message }

  revalidatePath('/properties')
  return { error: '' }
}
