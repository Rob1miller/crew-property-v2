'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddTenantForm({ propertyId }: { propertyId: string }) {
  const [name, setName] = useState('')
  const supabase = createClient()

  async function handleAdd() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !name.trim()) return

    await supabase.from('tenants').insert({
      user_id: user.id,
      property_id: propertyId,
      full_name: name.trim(),
    })

    setName('')
    window.location.reload()
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tenant name"
        style={{ padding: '8px', marginRight: '8px' }}
      />
      <button onClick={handleAdd}>Add tenant</button>
    </div>
  )
}
