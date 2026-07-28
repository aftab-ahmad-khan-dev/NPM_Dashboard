/** Shared bank + WhatsApp upgrade flow (same as Frameo / VorksPro / Publisher). */
export const WHATSAPP_NUMBER = '923224597697'
export const WHATSAPP_DISPLAY = '+92-3224597697'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

export type BankAccount = {
  id: string
  label: string
  name: string
  number: string
  iban: string | null
  branch?: string
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'jazzcash',
    label: 'JazzCash',
    name: 'Aftab Ahmad',
    number: '+92-3042626916',
    iban: null,
  },
  {
    id: 'ubl',
    label: 'UBL',
    name: 'Aftab Ahmad',
    number: '1149288702243',
    iban: 'PK45UNIL0109003288702243',
  },
  {
    id: 'nayapay',
    label: 'NayaPay',
    name: 'Aftab Ahmad',
    number: '+92-3224597697',
    iban: null,
  },
  {
    id: 'meezan',
    label: 'Meezan Bank',
    name: 'AFTAB AHMAD',
    number: '00300108876278',
    iban: 'PK23MEZN000300108876278',
    branch: 'MEEZAN DIGITAL CENTRE',
  },
]

export function whatsappUpgradeMessage(plan = 'Growth') {
  return [
    `Hi - I want to upgrade npm Packages Dashboard to *${plan}*.`,
    '',
    'I will transfer payment and send the receipt here.',
    'Please confirm after payment.',
  ].join('\n')
}

export function whatsappUrlForPlan(plan = 'Growth') {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(whatsappUpgradeMessage(plan))}`
}

export function whatsappSupportUrl() {
  const text = [
    'Hi - I need support with the npm Packages Dashboard.',
    '',
    'Please help me with:',
  ].join('\n')
  return `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`
}
