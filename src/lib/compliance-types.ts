export function complianceTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case 'gas_safety':
      return 'Gas Safety'
    case 'eicr':
      return 'EICR'
    case 'epc':
      return 'EPC'
    case 'right_to_rent':
      return 'Right to Rent'
    case 'deposit':
      return 'Deposit Protection'
    case 'smoke_alarm':
      return 'Smoke Alarm'
    case 'co_alarm':
      return 'CO Alarm'
    case 'licence':
      return 'Licence'
    case 'insurance':
      return 'Insurance'
    default:
      return 'Other'
  }
}

export function complianceTypeIcon(type: string | null | undefined): string {
  switch (type) {
    case 'gas_safety':
      return '🔥'
    case 'eicr':
      return '⚡'
    case 'epc':
      return '🏠'
    case 'right_to_rent':
      return '🪪'
    case 'deposit':
      return '💷'
    case 'smoke_alarm':
      return '🚨'
    case 'co_alarm':
      return '☁️'
    case 'licence':
      return '📄'
    case 'insurance':
      return '🛡️'
    default:
      return '✅'
  }
}
