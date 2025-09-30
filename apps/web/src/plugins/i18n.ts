import { createI18n } from 'vue-i18n'
import ja from '../locales/ja'
import en from '../locales/en'

type Locale = 'ja' | 'en'

const STORAGE_KEY = 'iz_locale'
const SUPPORTED: Locale[] = ['ja', 'en']
const DEFAULT_LOCALE: Locale = 'ja'

function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }
  const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null
  if (stored && SUPPORTED.includes(stored)) {
    return stored
  }
  const nav = window.navigator.language.slice(0, 2) as Locale
  return SUPPORTED.includes(nav) ? nav : DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  locale: resolveInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    ja,
    en,
  },
})

i18n.global.locale.value = resolveInitialLocale()

export function persistLocale(locale: Locale) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, locale)
}

export function isSupported(locale: string): locale is Locale {
  return SUPPORTED.includes(locale as Locale)
}

export type { Locale }
