export const PAGE_PATHS = {
  home: '#/',
  chat: '#/chat',
  metacapture: '#/metacapture',
  library: '#/library',
  help: '#/help',
  admin: '#/admin',
} as const

export type PageKey = keyof typeof PAGE_PATHS

export function resolvePathForNav(id: string): string | undefined {
  const normalized = id.replace(/^#\/?/, '')
  return PAGE_PATHS[normalized as PageKey] ?? PAGE_PATHS[id as PageKey]
}

export function navigateTo(target: string): void {
  if (typeof window === 'undefined') return
  const resolved = resolvePathForNav(target) ?? target
  const normalized = resolved.startsWith('#') ? resolved : `#/${resolved.replace(/^\/?/, '')}`
  if (window.location.hash === normalized) return
  window.location.hash = normalized
}
