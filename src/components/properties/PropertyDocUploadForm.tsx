'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export function PropertyDocUploadForm({
  propertyId,
  userId,
}: {
  propertyId: string
  userId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('Please choose a file.')
      return
    }

    const supabase = createClient()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${userId}/${propertyId}/${Date.now()}_${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`)
      return
    }

    const { error: dbError } = await supabase.from('documents').insert({
      user_id: userId,
      property_id: propertyId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type || null,
      compliance_item_id: null,
    })

    if (dbError) {
      await supabase.storage.from('documents').remove([filePath])
      setError(`Database error: ${dbError.message}`)
      return
    }

    await supabase.from('activity_logs').insert({
      user_id: userId,
      property_id: propertyId,
      type: 'document_uploaded',
      message: `Document uploaded: ${file.name}`,
    })

    setSuccess(true)
    if (fileRef.current) fileRef.current.value = ''
    startTransition(() => router.refresh())
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'hsl(var(--color-ink-muted))', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Upload a document
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            style={{ display: 'block', width: '100%', padding: '7px 10px', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'hsl(var(--color-ink))', background: 'hsl(var(--color-surface))', fontFamily: 'inherit' }}
          />
        </div>
        <button type="submit" disabled={isPending} style={{ padding: '8px 18px', background: 'hsl(var(--color-green))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1 }}>
          {isPending ? 'Uploading…' : '↑ Upload'}
        </button>
      </div>

      {error && <p style={{ marginTop: '8px', fontSize: '13px', color: 'hsl(0 72% 51%)' }}>{error}</p>}
      {success && <p style={{ marginTop: '8px', fontSize: '13px', color: 'hsl(var(--color-green))' }}>Uploaded successfully.</p>}
    </form>
  )
}
