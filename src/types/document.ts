export interface Document {
  id: string
  user_id: string
  property_id: string
  compliance_item_id: string | null
  file_name: string
  file_path: string
  file_type: string | null
  uploaded_at: string
}
