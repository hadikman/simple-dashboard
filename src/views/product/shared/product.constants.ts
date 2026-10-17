export const NO_ID = '__NO_ID__'

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'PLN' | 'SEK'
type LocaleConfig = {
  locale: string
  currency: string
  sign: string
  label: string
}
export const LOCALS_MAP: Record<CurrencyCode, LocaleConfig> = {
  USD: { locale: 'en-US', currency: 'USD', sign: '$', label: 'US Dollar' },
  EUR: { locale: 'de-DE', currency: 'EUR', sign: '€', label: 'Euro' },
  GBP: { locale: 'en-GB', currency: 'GBP', sign: '£', label: 'British Pound' },
  CHF: { locale: 'de-CH', currency: 'CHF', sign: 'Fr.', label: 'Swiss Franc' },
  PLN: { locale: 'pl-PL', currency: 'PLN', sign: 'zł', label: 'Polish Złoty' },
  SEK: { locale: 'sv-SE', currency: 'SEK', sign: 'kr', label: 'Swedish Krona' },
}
export const CURRENCY_OPTIONS = Object.entries(LOCALS_MAP) as [
  CurrencyCode,
  LocaleConfig,
][]

export const REMOVED_FROM_GUARANTEE = '__REMOVED_FROM_GUARANTEE__'
