import { computed, reactive, ref } from 'vue'
import personaDefault from '../assets/persona-default.svg'
import { apiRequest } from '../utils/api'

export type LedgerEntry = {
  id: string
  userId: string
  type: 'charge' | 'spend'
  amount: number
  balance: number
  note?: string
  createdAt: string
}

export type AccountState = {
  user: {
    id: string
    name: string
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
    personaUrl: string
    lastLogin: string
  }
  points: {
    available: number
    reserved: number
    currency: 'P'
  }
  ledger: LedgerEntry[]
  recentActivities: string[]
}

type PointsSnapshot = {
  user: {
    id: string
    name: string
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
    personaUrl?: string
    lastLogin: string
    points: number
  }
  ledger: LedgerEntry[]
}

const state = reactive<AccountState>({
  user: {
    id: 'default',
    name: 'Loading...',
    tier: 'Bronze',
    personaUrl: personaDefault,
    lastLogin: new Date().toISOString(),
  },
  points: {
    available: 0,
    reserved: 0,
    currency: 'P',
  },
  ledger: [],
  recentActivities: [],
})

const loading = ref(false)
const error = ref<string | null>(null)
const apiOnline = ref(true)

const personaGallery = [
  personaDefault,
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=96&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80',
]

let galleryIndex = 0

function syncPersonaIndex(url: string | undefined) {
  const nextIndex = personaGallery.findIndex((entry) => entry === url)
  galleryIndex = nextIndex >= 0 ? nextIndex : 0
}

function describeLedger(entry: LedgerEntry): string {
  const prefix = entry.type === 'charge' ? '+' : '-'
  const action = entry.type === 'charge' ? 'Charge' : 'Spend'
  const amount = `${prefix}${entry.amount.toLocaleString()}${state.points.currency}`
  const note = entry.note ? ` · ${entry.note}` : ''
  const when = new Date(entry.createdAt).toLocaleString()
  return `${when} · ${action} ${amount}${note}`
}

function applySnapshot(snapshot: PointsSnapshot) {
  state.user.id = snapshot.user.id
  state.user.name = snapshot.user.name
  state.user.tier = snapshot.user.tier
  state.user.personaUrl = snapshot.user.personaUrl ?? personaDefault
  state.user.lastLogin = snapshot.user.lastLogin
  state.points.available = snapshot.user.points
  state.points.reserved = 0
  state.points.currency = 'P'
  state.ledger.splice(0, state.ledger.length, ...snapshot.ledger)
  state.recentActivities.splice(0, state.recentActivities.length, ...snapshot.ledger.map(describeLedger))
  syncPersonaIndex(snapshot.user.personaUrl ?? personaDefault)
}

function createSnapshot(): PointsSnapshot {
  return {
    user: {
      id: state.user.id,
      name: state.user.name,
      tier: state.user.tier,
      personaUrl: state.user.personaUrl,
      lastLogin: state.user.lastLogin,
      points: state.points.available,
    },
    ledger: [...state.ledger],
  }
}

function addLedgerEntry(type: LedgerEntry['type'], amount: number, note?: string) {
  const entry: LedgerEntry = {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `local-${Math.random().toString(36).slice(2, 10)}`,
    userId: state.user.id,
    type,
    amount,
    balance: type === 'charge' ? state.points.available + amount : Math.max(0, state.points.available - amount),
    note,
    createdAt: new Date().toISOString(),
  }

  state.points.available = entry.balance
  state.ledger.unshift(entry)
  state.recentActivities.unshift(describeLedger(entry))
  if (state.ledger.length > 20) state.ledger.length = 20
  if (state.recentActivities.length > 8) state.recentActivities.length = 8

  return entry
}

async function fetchAccount(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const snapshot = await apiRequest<PointsSnapshot>('/api/account')
    applySnapshot(snapshot)
    apiOnline.value = true
  } catch (err) {
    apiOnline.value = false
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
}

async function mutateAccount(path: string, payload?: Record<string, unknown>): Promise<PointsSnapshot> {
  loading.value = true
  error.value = null
  try {
    if (!apiOnline.value) {
      return createSnapshot()
    }
    const snapshot = await apiRequest<PointsSnapshot>(path, {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    })
    applySnapshot(snapshot)
    return snapshot
  } catch (err) {
    error.value = (err as Error).message
    apiOnline.value = false
    return createSnapshot()
  } finally {
    loading.value = false
  }
}

async function addPoints(amount = 500, note = 'Quick charge'): Promise<void> {
  if (amount <= 0) {
    throw new Error('Charge amount must be positive')
  }
  if (!apiOnline.value) {
    addLedgerEntry('charge', amount, note)
    return
  }
  await mutateAccount('/api/points/charge', { amount, note })
}

async function consumePoints(amount: number, note?: string): Promise<void> {
  if (amount <= 0) {
    throw new Error('Spend amount must be positive')
  }
  if (!apiOnline.value) {
    addLedgerEntry('spend', amount, note)
    return
  }
  await mutateAccount('/api/points/spend', { amount, note })
}

async function cyclePersona(): Promise<void> {
  const previousIndex = galleryIndex
  galleryIndex = (galleryIndex + 1) % personaGallery.length
  const personaUrl = personaGallery[galleryIndex] ?? personaDefault
  try {
    if (!apiOnline.value) {
      state.user.personaUrl = personaUrl
      return
    }
    await mutateAccount('/api/account/persona', { personaUrl })
  } catch (err) {
    galleryIndex = previousIndex
    state.user.personaUrl = personaGallery[previousIndex] ?? personaDefault
    throw err
  }
}

function resetHistory() {
  state.recentActivities.splice(0, state.recentActivities.length)
}

const formattedPoints = computed(() => `${state.points.available.toLocaleString()}${state.points.currency}`)
const lastLogin = computed(() => new Date(state.user.lastLogin).toLocaleString())

void fetchAccount().catch(() => {
  /* error ref already populated */
})

export function useAccount() {
  return {
    state,
    formattedPoints,
    lastLogin,
    loading,
    error,
    apiOnline,
    fetchAccount,
    addPoints,
    consumePoints,
    cyclePersona,
    resetHistory,
  }
}
