export type ComplianceType =
  | 'gas_safety'
  | 'eicr'
  | 'epc'
  | 'landlord_insurance'
  | 'smoke_alarms'
  | 'deposit_protection'
  | 'other'

export type ComplianceStatus = 'valid' | 'due_soon' | 'expired' | 'missing'

export interface ComplianceItem {
  id:          string
  user_id:     string
  property_id: string
  type:        ComplianceType
  title:       string
  status:      ComplianceStatus
  expiry_date: string | null
  notes:       string | null
  created_at:  string
  updated_at:  string
}
