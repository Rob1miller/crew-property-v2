import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppTopBar } from '@/components/layout/AppTopBar'

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
    <div className="app-shell">
      <AppSidebar email={user.email ?? ''} />
      <div className="app-main">
        <AppTopBar />
        <main className="app-content animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
