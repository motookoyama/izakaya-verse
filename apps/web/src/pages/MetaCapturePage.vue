<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FeatureContent, KnowledgeContent } from '../types/home'
import metaIcon from '../assets/icons/metacapture.png'
import MetaCaptureWorkspace from '../components/MetaCaptureWorkspace.vue'
import type { MetacaptureEventPayload } from '../types/metacapture'
import {
  listMetacaptureDrafts,
  removeMetacaptureDraft,
  saveMetacaptureDraft,
  type MetacaptureStoredDraft,
} from '../utils/metacaptureLibrary'

const { tm } = useI18n({ useScope: 'global' })

const page = computed(() => tm('pages.metacapture') as {
  title: string
  lead: string[]
  notesTitle: string
  notes: string[]
})

const feature = computed(() => (tm('home.features') as FeatureContent[]).find((item) => item.id === 'metacapture'))
const knowledge = computed(() => {
  const content = tm('home.knowledge') as KnowledgeContent
  return content.topics.find((topic) => topic.id === 'meta')
})

const workspaceRef = ref<InstanceType<typeof MetaCaptureWorkspace> | null>(null)
const library = ref<MetacaptureStoredDraft[]>([])
const loadingLibrary = ref(false)
const lastSavedId = ref<string | null>(null)
const statusMessage = ref<string | null>(null)
let statusTimer: number | undefined

function setStatus(message: string) {
  statusMessage.value = message
  if (typeof window === 'undefined') return
  if (statusTimer) {
    window.clearTimeout(statusTimer)
  }
  statusTimer = window.setTimeout(() => {
    statusMessage.value = null
    statusTimer = undefined
  }, 4000)
}

async function refreshLibrary() {
  if (loadingLibrary.value) return
  loadingLibrary.value = true
  try {
    library.value = await listMetacaptureDrafts()
  } catch (err) {
    console.error('[MetaCapture:library:list]', err)
    setStatus('ライブラリの読み込みに失敗しました')
  } finally {
    loadingLibrary.value = false
  }
}

onMounted(() => {
  refreshLibrary()
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && statusTimer) {
    window.clearTimeout(statusTimer)
  }
})

function formatTimestamp(value: number) {
  try {
    return new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
  } catch (err) {
    return new Date(value).toLocaleString()
  }
}

async function downloadFromLibrary(record: MetacaptureStoredDraft, kind: 'json' | 'qr' | 'qrEmbedded') {
  try {
    if (kind === 'json') {
      const blob = new Blob([JSON.stringify(record.draft, null, 2)], { type: 'application/json' })
      triggerDownload(`${record.name || 'metacapture-card'}.json`, blob)
      return
    }
    const source = kind === 'qr' ? record.qrImage : record.qrEmbedded
    if (!source) return
    const response = await fetch(source)
    const blob = await response.blob()
    const suffix = kind === 'qr' ? '-qr' : '-qr-data'
    triggerDownload(`${record.name || 'metacapture-card'}${suffix}.png`, blob)
  } catch (err) {
    console.error('[MetaCapture:library:download]', err)
    setStatus('ダウンロードに失敗しました')
  }
}

function triggerDownload(filename: string, blob: Blob) {
  if (typeof document === 'undefined') return
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(href)
}

async function handleSave(payload: MetacaptureEventPayload) {
  try {
    const saved = await saveMetacaptureDraft(payload)
    lastSavedId.value = saved.id
    const index = library.value.findIndex((item) => item.id === saved.id)
    if (index >= 0) {
      library.value.splice(index, 1, saved)
    } else {
      library.value.unshift(saved)
    }
    setStatus(`${saved.name} をローカルに保存しました`)
  } catch (err) {
    console.error('[MetaCapture:save]', err)
    setStatus('ローカル保存に失敗しました')
  }
}

function handlePreview(payload: MetacaptureEventPayload) {
  console.info('[MetaCapture:preview]', payload)
}

function loadDraft(record: MetacaptureStoredDraft) {
  workspaceRef.value?.loadDraft(record)
  setStatus(`${record.name} を読み込みました`)
}

async function deleteDraft(record: MetacaptureStoredDraft) {
  try {
    await removeMetacaptureDraft(record.id)
    library.value = library.value.filter((item) => item.id !== record.id)
    if (lastSavedId.value === record.id) {
      lastSavedId.value = null
    }
    setStatus(`${record.name} を削除しました`)
  } catch (err) {
    console.error('[MetaCapture:library:delete]', err)
    setStatus('削除に失敗しました')
  }
}
</script>

<template>
  <div class="metacapture">
    <header class="metacapture__hero">
      <img class="metacapture__icon" :src="metaIcon" alt="MetaCapture" />
      <h1>{{ page.title }}</h1>
      <p v-for="line in page.lead" :key="line">{{ line }}</p>
    </header>

    <MetaCaptureWorkspace
      ref="workspaceRef"
      :feature-title="feature?.title"
      :feature-description="feature?.description"
      :feature-bullets="feature?.bullets"
      :knowledge-title="knowledge?.title"
      :knowledge-body="knowledge?.body"
      @save="handleSave"
      @preview="handlePreview"
    />

    <section class="metacapture__library">
      <header class="library__header">
        <h2>ローカルライブラリ</h2>
        <span v-if="loadingLibrary" class="library__status">同期中...</span>
        <span v-else-if="statusMessage" class="library__status">{{ statusMessage }}</span>
      </header>
      <p v-if="!loadingLibrary && library.length === 0" class="library__empty">
        解析結果を保存すると、この一覧から再編集・再送・JSON/QRダウンロードができます。
      </p>
      <ul v-else class="library__list">
        <li
          v-for="record in library"
          :key="record.id"
          :class="['library__item', { 'is-recent': record.id === lastSavedId }]"
        >
          <div class="library__meta">
            <h3>{{ record.name }}</h3>
            <p>
              更新: {{ formatTimestamp(record.updatedAt) }}
              <span class="library__meta-sep">/</span>
              QR: {{ record.qrSizeKb.toFixed(2) }} KB
            </p>
          </div>
          <div class="library__actions">
            <button type="button" class="library__btn" @click="loadDraft(record)">再編集</button>
            <button type="button" class="library__btn" @click="downloadFromLibrary(record, 'json')">
              JSON
            </button>
            <button type="button" class="library__btn" @click="downloadFromLibrary(record, 'qr')">
              QR
            </button>
            <button type="button" class="library__btn" @click="downloadFromLibrary(record, 'qrEmbedded')">
              QR+埋込
            </button>
            <button type="button" class="library__btn library__btn--danger" @click="deleteDraft(record)">
              削除
            </button>
          </div>
        </li>
      </ul>
    </section>

    <section class="metacapture__notes">
      <h2>{{ page.notesTitle }}</h2>
      <ul>
        <li v-for="note in page.notes" :key="note">{{ note }}</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.metacapture {
  display: grid;
  gap: 32px;
}

.metacapture__hero {
  display: grid;
  gap: 12px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.45);
  padding: clamp(24px, 4vw, 40px);
  position: relative;
}

.metacapture__hero h1 {
  margin: 0;
  font-size: clamp(1.9rem, 4vw, 2.6rem);
}

.metacapture__icon {
  position: absolute;
  top: clamp(12px, 2vw, 24px);
  right: clamp(12px, 3vw, 32px);
  width: clamp(56px, 7vw, 96px);
  height: auto;
}

.metacapture__library {
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.45);
  padding: clamp(24px, 3vw, 32px);
  display: grid;
  gap: 16px;
}

.library__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px;
}

.library__status {
  font-size: 0.85rem;
  opacity: 0.7;
}

.library__empty {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.library__list {
  list-style: none;
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
}

.library__item {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 16px;
  display: grid;
  gap: 12px;
  background: rgba(9, 14, 24, 0.45);
}

.library__item.is-recent {
  border-color: var(--brand-2, #58cff5);
}

.library__meta {
  display: grid;
  gap: 6px;
}

.library__meta h3 {
  margin: 0;
  font-size: 1.1rem;
}

.library__meta p {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.75;
}

.library__meta-sep {
  margin: 0 6px;
}

.library__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.library__btn {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.25);
  color: inherit;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.library__btn:hover {
  background: rgba(0, 0, 0, 0.35);
}

.library__btn--danger {
  border-color: rgba(255, 92, 92, 0.6);
  color: #ff8080;
}

.library__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.metacapture__notes {
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.45);
  padding: clamp(24px, 3vw, 32px);
  display: grid;
  gap: 12px;
}

.metacapture__notes ul {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
}

@media (max-width: 800px) {
  .metacapture__hero {
    padding-right: clamp(24px, 4vw, 40px);
  }
}
</style>
