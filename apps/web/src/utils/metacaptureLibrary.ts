import type { MetacaptureEventPayload, V2Draft } from '../types/metacapture'

const STORAGE_KEY = 'metacapture_drafts_v1'
const API_LATENCY = 32

export interface MetacaptureStoredDraft {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  draft: V2Draft
  qrImage: string
  qrEmbedded: string
  qrSizeKb: number
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

function readStorage(): MetacaptureStoredDraft[] {
  if (!canUseStorage()) return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as MetacaptureStoredDraft[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && typeof item === 'object' && typeof item.id === 'string')
      .map((item) => ({
        ...item,
        createdAt: Number(item.createdAt) || Date.now(),
        updatedAt: Number(item.updatedAt) || Number(item.createdAt) || Date.now(),
        qrSizeKb: Number(item.qrSizeKb) || 0,
      }))
  } catch (err) {
    console.warn('[MetaCaptureLibrary] failed to parse storage payload', err)
    return []
  }
}

function writeStorage(records: MetacaptureStoredDraft[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    try {
      return `${prefix}-${crypto.randomUUID()}`
    } catch (err) {
      /* noop */
    }
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function computeSizeKb(json: string) {
  return Math.round((json.length / 1024) * 100) / 100
}

export type MetacaptureSaveInput = MetacaptureEventPayload

export async function listMetacaptureDrafts(): Promise<MetacaptureStoredDraft[]> {
  const records = readStorage()
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(clone(records))
    }, API_LATENCY)
  })
}

export async function saveMetacaptureDraft(input: MetacaptureSaveInput): Promise<MetacaptureStoredDraft> {
  const records = readStorage()
  const now = Date.now()
  const safeName = input.draft.name?.trim() || 'metacapture-card'
  const existingIndex = records.findIndex((item) => item.name === safeName)
  const existing = existingIndex >= 0 ? records[existingIndex] : undefined

  const entry: MetacaptureStoredDraft = {
    id: existing?.id ?? createId('mc'),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    name: safeName,
    draft: clone(input.draft),
    qrImage: input.qrImage,
    qrEmbedded: input.qrEmbedded,
    qrSizeKb: computeSizeKb(input.json),
  }

  if (existingIndex >= 0) {
    records.splice(existingIndex, 1, entry)
  } else {
    records.unshift(entry)
  }

  writeStorage(records)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(clone(entry))
    }, API_LATENCY)
  })
}

export async function removeMetacaptureDraft(id: string): Promise<void> {
  const records = readStorage()
  const next = records.filter((item) => item.id !== id)
  if (next.length !== records.length) {
    writeStorage(next)
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(), API_LATENCY)
  })
}

export async function getMetacaptureDraft(id: string): Promise<MetacaptureStoredDraft | null> {
  const records = readStorage()
  const found = records.find((item) => item.id === id)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(found ? clone(found) : null)
    }, API_LATENCY)
  })
}
