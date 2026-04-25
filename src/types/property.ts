export type PropertyType = 'house' | 'flat' | 'bungalow' | 'hmo' | 'commercial' | 'other'
export type PropertyStatus = 'occupied' | 'vacant' | 'refurb' | 'for_sale'

export interface Property {
  id:             string
  user_id:        string
  address_line_1: string
  address_line_2: string | null
  town:           string
  postcode:       string
  property_type:  PropertyType
  status:         PropertyStatus
  created_at:     string
  updated_at:     string
}
