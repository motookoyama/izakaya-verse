import { computed, ref, watch } from 'vue'
import { findTheme, themes, themeVarKeys } from '../themes/palettes'
import type { ThemeId } from '../themes/palettes'

const STORAGE_KEY = 'iz_theme_id'

const DEFAULT_THEME_ID = (themes[0]?.id ?? 'onyx-neon') as ThemeId

function readInitialTheme(): ThemeId {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_ID
  }
  const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null
  const legacyMap: Record<string, ThemeId> = {
    'bright-sakura': 'hanami-sakura',
    rose: 'rose-aurora',
  }
  const normalized = saved ? (legacyMap[saved] ?? saved) : null
  return normalized && themes.some((theme) => theme.id === normalized)
    ? (normalized as ThemeId)
    : DEFAULT_THEME_ID
}

const themeId = ref<ThemeId>(readInitialTheme())
let initialized = false

function applyTheme(id: ThemeId) {
  const theme = findTheme(id)
  const root = document.documentElement
  root.setAttribute('data-theme', theme.id)
  themeVarKeys.forEach((key) => {
    const value = theme.vars[key]
    if (value) {
      root.style.setProperty(key, value)
    } else {
      root.style.removeProperty(key)
    }
  })
}

function ensureInit() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  applyTheme(themeId.value)
  window.localStorage.setItem(STORAGE_KEY, themeId.value)
  watch(
    themeId,
    (id) => {
      applyTheme(id)
      window.localStorage.setItem(STORAGE_KEY, id)
    },
    { immediate: false }
  )
}

export function useTheme() {
  ensureInit()
  return {
    themeId,
    themes,
    currentTheme: computed(() => findTheme(themeId.value)),
    setTheme(id: ThemeId) {
      themeId.value = id
    },
  }
}
