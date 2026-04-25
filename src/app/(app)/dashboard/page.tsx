import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Signed in as: {user?.email}</p>
    </div>
  )
}
