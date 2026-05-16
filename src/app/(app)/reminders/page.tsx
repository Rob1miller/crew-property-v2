import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { AddReminderForm } from '@/components/reminders/AddReminderForm'

interface Property {
  id: string
  address_line_1: string
  town: string
  postcode: string | null
}

interface Reminder {
  id: string
  title: string
  due_date: string
  status: string
  property_id: string | null
  tenant_id: string | null
}

const badgeStyles: Record<string, { label: string; color: string; bg: string; border: string }> = {
  open: {
    label: 'Open',
    color: 'hsl(var(--color-amber))',
    bg: 'hsl(var(--color-amber-muted))',
    border: 'hsl(var(--color-amber-muted))',
  },
  done: {
    label: 'Completed',
    color: 'hsl(var(--color-green))',
    bg: 'hsl(var(--color-green-subtle))',
    border: 'hsl(var(--color-green-muted))',
  },
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function ReminderSection({
  title,
  reminders,
  propertyMap,
  completeReminderAction,
  deleteReminderAction,
  showHeader = true,
}: {
  title: string
  reminders: Reminder[]
  propertyMap: Record<string, string>
  completeReminderAction: (formData: FormData) => Promise<void>
  deleteReminderAction: (formData: FormData) => Promise<void>
  showHeader?: boolean
}) {
  return (
    <section style={{ marginBottom: '24px' }}>
      {showHeader && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>{title}</h2>
          <span style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
            {reminders.length} {reminders.length === 1 ? 'reminder' : 'reminders'}
          </span>
        </div>
      )}

      {reminders.length === 0 ? (
        <div style={{ padding: '18px 20px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)' }}>
          <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>No reminders in this section.</p>
        </div>
      ) : (
        <div style={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {reminders.map((reminder, index) => {
            const badge = badgeStyles[reminder.status] ?? {
              label: reminder.status,
              color: 'hsl(var(--color-ink-subtle))',
              bg: 'hsl(var(--color-surface-muted))',
              border: 'hsl(var(--color-border))',
            }

            return (
              <div
                className="reminder-row"
                key={reminder.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  borderBottom: index < reminders.length - 1 ? '1px solid hsl(var(--color-border))' : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--color-ink))' }}>
                      {reminder.title}
                    </p>
                    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}>
                      {badge.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
                    Due {formatDate(reminder.due_date)}
                    {reminder.property_id && propertyMap[reminder.property_id] ? (
                      <>
                        {' · '}
                        <Link href={`/properties/${reminder.property_id}`} style={{ color: 'hsl(var(--color-ink-subtle))', textDecoration: 'none' }}>
                          {propertyMap[reminder.property_id]}
                        </Link>
                      </>
                    ) : null}
                  </p>
                </div>

                <div className="reminder-row-actions" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <form action={completeReminderAction}>
                    <input type="hidden" name="reminder_id" value={reminder.id} />
                    <button
                      type="submit"
                      disabled={reminder.status === 'done'}
                      style={{ padding: '6px 12px', background: reminder.status === 'done' ? 'hsl(var(--color-surface-muted))' : 'hsl(var(--color-green))', color: reminder.status === 'done' ? 'hsl(var(--color-ink-subtle))' : 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 700, cursor: reminder.status === 'done' ? 'not-allowed' : 'pointer' }}
                    >
                      {reminder.status === 'done' ? 'Done' : 'Complete'}
                    </button>
                  </form>
                  <form action={deleteReminderAction}>
                    <input type="hidden" name="reminder_id" value={reminder.id} />
                    <button type="submit" style={{ padding: '6px 12px', background: 'transparent', color: 'hsl(var(--color-red))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default async function RemindersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: propertiesData }, { data: remindersData }] = await Promise.all([
    supabase
      .from('properties')
      .select('id, address_line_1, town, postcode')
      .eq('user_id', user!.id)
      .order('created_at'),
    supabase
      .from('reminders')
      .select('id, title, due_date, status, property_id, tenant_id')
      .eq('user_id', user!.id)
      .order('due_date', { ascending: true }),
  ])

  const properties = (propertiesData ?? []) as Property[]
  const reminders = (remindersData ?? []) as Reminder[]

  async function completeReminderAction(formData: FormData) {
    'use server'

    const reminderId = formData.get('reminder_id') as string
    if (!reminderId) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: reminder } = await supabase
      .from('reminders')
      .select('id, title, property_id, tenant_id')
      .eq('id', reminderId)
      .eq('user_id', user.id)
      .single()

    await supabase
      .from('reminders')
      .update({ status: 'done' })
      .eq('id', reminderId)
      .eq('user_id', user.id)

    if (reminder) {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        property_id: reminder.property_id,
        tenant_id: reminder.tenant_id,
        type: 'reminder_completed',
        message: `Reminder completed: ${reminder.title}`,
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/reminders')
  }

  async function deleteReminderAction(formData: FormData) {
    'use server'

    const reminderId = formData.get('reminder_id') as string
    if (!reminderId) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)
      .eq('user_id', user.id)

    revalidatePath('/dashboard')
    revalidatePath('/reminders')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const soon = new Date(today)
  soon.setDate(today.getDate() + 7)

  const propertyMap = Object.fromEntries(properties.map((p) => [
    p.id,
    `${p.address_line_1}, ${p.town}${p.postcode ? ` ${p.postcode}` : ''}`,
  ]))

  const openReminders = reminders.filter((r) => r.status === 'open')
  const completedReminders = reminders.filter((r) => r.status !== 'open')
  const overdue = openReminders.filter((r) => new Date(r.due_date) < today)
  const dueSoon = openReminders.filter((r) => {
    const due = new Date(r.due_date)
    return due >= today && due <= soon
  })
  const upcoming = openReminders.filter((r) => new Date(r.due_date) > soon)

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reminders</h1>
          <p>{openReminders.length} open {openReminders.length === 1 ? 'reminder' : 'reminders'}</p>
        </div>
      </div>

      <AddReminderForm userId={user!.id} properties={properties} />

      <ReminderSection
        title="Overdue"
        reminders={overdue}
        propertyMap={propertyMap}
        completeReminderAction={completeReminderAction}
        deleteReminderAction={deleteReminderAction}
      />

      <ReminderSection
        title="Due soon"
        reminders={dueSoon}
        propertyMap={propertyMap}
        completeReminderAction={completeReminderAction}
        deleteReminderAction={deleteReminderAction}
      />

      <ReminderSection
        title="Upcoming"
        reminders={upcoming}
        propertyMap={propertyMap}
        completeReminderAction={completeReminderAction}
        deleteReminderAction={deleteReminderAction}
      />

      <details style={{ marginBottom: '48px' }}>
        <summary style={{ listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-ink))' }}>Completed</span>
          <span style={{ fontSize: '12px', color: 'hsl(var(--color-ink-subtle))' }}>
            {completedReminders.length} {completedReminders.length === 1 ? 'reminder' : 'reminders'}
          </span>
        </summary>
        <div style={{ marginTop: '12px' }}>
          <ReminderSection
            title="Completed"
            reminders={completedReminders}
            propertyMap={propertyMap}
            completeReminderAction={completeReminderAction}
            deleteReminderAction={deleteReminderAction}
            showHeader={false}
          />
        </div>
      </details>
    </div>
  )
}
