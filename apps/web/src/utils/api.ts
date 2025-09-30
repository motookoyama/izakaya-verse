const ENV_API_BASE = ((import.meta.env.VITE_API_BASE as string | undefined) ?? '').trim()
export const API_BASE = (ENV_API_BASE.length > 0 ? ENV_API_BASE : 'https://gen-lang-client-0676058874.de.r.appspot.com').replace(/\/$/, '')

export function resolveApiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const url = resolveApiUrl(path)
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
  }

  const response = await fetch(url, { ...init, headers })
  let parsed: any = null

  try {
    parsed = await response.json()
  } catch (parseError) {
    if (response.ok) {
      throw new Error('Empty response from server')
    }
  }

  if (!response.ok) {
    const detail = typeof parsed === 'object' && parsed && 'error' in parsed ? String(parsed.error) : ''
    throw new Error(detail || `Request failed with status ${response.status}`)
  }

  return parsed as T
}
