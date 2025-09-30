<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ChatConsole from '../components/ChatConsole.vue'
import { useAccount } from '../composables/useAccount'
import { findNavigatorCard } from '../data/sampleCards'
import type { ChatContent } from '../types/home'

const { t, tm } = useI18n({ useScope: 'global' })
const page = computed(() => tm('pages.admin') as {
  title: string
  lead: string[]
  stats: { title: string; items: string[] }
  chargeLabel: string
  spendLabel: string
  chargePlaceholder: string
  spendPlaceholder: string
  updateButton: string
  ledgerTitle: string
  chatTitle: string
  chatPrompt: string
})

const {
  state,
  formattedPoints,
  addPoints,
  consumePoints,
  fetchAccount,
  loading,
  error,
} = useAccount()

const chargeAmount = ref(1000)
const chargeNote = ref('')
const spendAmount = ref(500)
const spendNote = ref('Maintenance')
const busy = ref(false)

const ledgerEntries = computed(() => state.ledger)
const drOrb = computed(() => findNavigatorCard('dr-orb'))
const baseChat = computed<ChatContent>(() => tm('home.chat') as ChatContent)
const adminChatContent = computed<ChatContent>(() => {
  const base = baseChat.value
  const orb = drOrb.value
  const systemPrompt = [
    base.systemPrompt,
    orb?.summary,
    page.value.chatPrompt,
  ]
    .filter(Boolean)
    .join('\n\n')

  return {
    ...base,
    title: page.value.chatTitle,
    systemPrompt,
  }
})

async function handleCharge() {
  if (busy.value || chargeAmount.value <= 0) return
  busy.value = true
  try {
    await addPoints(chargeAmount.value, chargeNote.value.trim() || 'Manual charge')
    await fetchAccount()
    chargeNote.value = ''
  } finally {
    busy.value = false
  }
}

async function handleSpend() {
  if (busy.value || spendAmount.value <= 0) return
  busy.value = true
  try {
    await consumePoints(spendAmount.value, spendNote.value.trim() || 'Adjustment')
    await fetchAccount()
    spendNote.value = ''
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="admin">
    <header class="admin__hero">
      <h1>{{ page.title }}</h1>
      <p v-for="line in page.lead" :key="line">{{ line }}</p>
    </header>

    <section class="admin__stats">
      <h2>{{ page.stats.title }}</h2>
      <div class="stats-grid">
        <article class="stats-card">
          <span class="stats-card__label">{{ t('home.account.status.pointsLabel') }}</span>
          <strong class="stats-card__value">{{ formattedPoints }}</strong>
          <small>{{ t('home.account.status.personaLabel') }}: {{ state.user.name }} ({{ state.user.tier }})</small>
        </article>
        <article class="stats-card" v-for="item in page.stats.items" :key="item">
          <p>{{ item }}</p>
        </article>
      </div>
    </section>

    <section class="admin__controls">
      <div class="control-card">
        <h3>{{ page.chargeLabel }}</h3>
        <label>
          <span>{{ t('home.account.actions.items.0.label') }}</span>
          <input type="number" v-model.number="chargeAmount" min="1" />
        </label>
        <label>
          <span>{{ page.chargePlaceholder }}</span>
          <input type="text" v-model="chargeNote" />
        </label>
        <button type="button" @click="handleCharge" :disabled="busy">{{ page.updateButton }}</button>
      </div>
      <div class="control-card">
        <h3>{{ page.spendLabel }}</h3>
        <label>
          <span>{{ t('home.account.status.pointsLabel') }}</span>
          <input type="number" v-model.number="spendAmount" min="1" />
        </label>
        <label>
          <span>{{ page.spendPlaceholder }}</span>
          <input type="text" v-model="spendNote" />
        </label>
        <button type="button" @click="handleSpend" :disabled="busy">{{ page.updateButton }}</button>
      </div>
      <p v-if="error" class="admin__error">{{ error }}</p>
    </section>

    <section class="admin__ledger">
      <h2>{{ page.ledgerTitle }}</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>{{ t('home.account.status.pointsLabel') }}</th>
            <th>{{ t('home.account.status.userLabel') }}</th>
            <th>Type</th>
            <th>Balance</th>
            <th>Note</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in ledgerEntries" :key="entry.id">
            <td>{{ entry.id.slice(0, 8) }}</td>
            <td>{{ entry.amount }}</td>
            <td>{{ entry.userId }}</td>
            <td>{{ entry.type }}</td>
            <td>{{ entry.balance }}</td>
            <td>{{ entry.note }}</td>
            <td>{{ new Date(entry.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
      <button type="button" class="admin__refresh" @click="fetchAccount" :disabled="loading">{{ t('home.account.actions?.title', 'Refresh') }}</button>
    </section>

    <section class="admin__chat">
      <h2>{{ page.chatTitle }}</h2>
      <ChatConsole :content="adminChatContent" />
    </section>
  </div>
</template>

<style scoped>
.admin {
  display: grid;
  gap: 32px;
}

.admin__hero {
  display: grid;
  gap: 12px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.45);
  padding: clamp(20px, 4vw, 36px);
}

.admin__stats,
.admin__controls,
.admin__ledger,
.admin__chat {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.45);
  padding: clamp(20px, 3vw, 36px);
  display: grid;
  gap: 18px;
}

.stats-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.stats-card {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 16px;
  display: grid;
  gap: 8px;
}

.stats-card__label {
  opacity: 0.75;
  font-size: 0.85rem;
}

.stats-card__value {
  font-size: 1.4rem;
  font-weight: 700;
}

.admin__controls {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.control-card {
  display: grid;
  gap: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 16px;
}

.control-card label {
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  opacity: 0.8;
}

.admin__error {
  color: #f87171;
  margin: 0;
}

.admin__ledger table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.admin__ledger th,
.admin__ledger td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding: 8px 12px;
  text-align: left;
}

.admin__refresh {
  justify-self: flex-start;
}

@media (max-width: 820px) {
  .admin__ledger table,
  .admin__ledger thead,
  .admin__ledger tbody,
  .admin__ledger th,
  .admin__ledger td,
  .admin__ledger tr {
    display: block;
  }
  .admin__ledger tr {
    margin-bottom: 12px;
  }
  .admin__ledger td {
    padding: 4px 0;
  }
}
</style>
