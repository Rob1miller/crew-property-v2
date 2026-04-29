export interface Tenant {
  id: string
  user_id: string
  property_id: string

  full_name: string
  email: string | null
  phone: string | null

  rent_amount: number | null
  rent_due_day: number | null

  start_date: string | null
  end_date: string | null

  created_at: string
}
