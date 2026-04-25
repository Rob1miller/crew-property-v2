import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <nav>
        <span>Crew Property</span>
        <form action={logoutAction}>
          <button type="submit" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
            Sign out
          </button>
        </form>
      </nav>
      <main>{children}</main>
    </>
  )
}
