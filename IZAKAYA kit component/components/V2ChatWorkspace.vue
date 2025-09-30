<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ChatConsole from './ChatConsole.vue'
import type { ChatContent } from '../types/home'
import type { AccountAction } from '../types/home'
import type { ChatAttachment, ChatMessage } from '../composables/useChat'

const props = defineProps<{
  chatContent: ChatContent
  cards: Array<{ id: string; title: string; thumbnail?: string; summary?: string; tags?: string[] }>
  extraCards?: Array<{ id: string; title: string }>
  selectedId: string
  pointsLabel: string
  pointsValue: string
  accountName: string
  accountTier: string
  userAvatar?: string
  assistantTone?: { background?: string; text?: string; font?: string }
  userTone?: { background?: string; text?: string; font?: string }
  navigator?: {
    name: string
    summary: string
    tags: string[]
    avatar?: string
    persona?: string
    scenario?: string
    firstMessage?: string
    notes?: string
  }
  quickActions?: AccountAction[]
  busy?: boolean
  error?: string | null
  notes?: string[]
  wallpaper?: string
  wallpaperOptions?: Array<{ id: string; label: string; value: string }>
  wallpaperSelected?: string
  wallpaperCustomValue?: string
}>()

const emits = defineEmits<{
  (e: 'select-card', id: string): void
  (e: 'run-action', action: AccountAction): void
  (e: 'change-wallpaper', id: string): void
  (e: 'update-wallpaper-custom', value: string): void
  (e: 'message-rerun', message: ChatMessage): void
  (e: 'message-edit', message: ChatMessage): void
  (e: 'message-fork', message: ChatMessage): void
  (e: 'message-bookmark', message: ChatMessage): void
  (e: 'attachments-added', files: File[]): void
  (e: 'attachment-removed', attachment: ChatAttachment): void
  (e: 'eject-card', id: string): void
  (e: 'activate-card', id: string): void
}>()

const hasExtra = computed(() => (props.extraCards?.length ?? 0) > 0)
const wallpaperStyle = computed(() => ({
  background: props.wallpaper || 'rgba(12, 18, 32, 0.55)',
}))
const hasCustomWallpaper = computed(() => (props.wallpaperCustomValue?.trim().length ?? 0) > 0)
const dockSide = ref<'left' | 'right'>('right')
const sidebarOpen = ref(true)
const { t } = useI18n({ useScope: 'global' })

const layoutClass = computed(() => [
  'v2chat',
  `v2chat--aside-${dockSide.value}`,
  { 'v2chat--collapsed': !sidebarOpen.value },
])

function handleSelect(id: string) {
  emits('select-card', id)
}

function onAction(action: AccountAction) {
  emits('run-action', action)
}

function changeWallpaper(id: string) {
  emits('change-wallpaper', id)
}

function updateWallpaperCustom(value: string) {
  emits('update-wallpaper-custom', value)
}

function proxyMessage(event: 'message-rerun' | 'message-edit' | 'message-fork' | 'message-bookmark', payload: ChatMessage) {
  switch (event) {
    case 'message-rerun':
      emits('message-rerun', payload)
      break
    case 'message-edit':
      emits('message-edit', payload)
      break
    case 'message-fork':
      emits('message-fork', payload)
      break
    case 'message-bookmark':
      emits('message-bookmark', payload)
      break
    default:
      break
  }
}

function onAttachmentsAdded(files: File[]) {
  emits('attachments-added', files)
}

function onAttachmentRemoved(attachment: ChatAttachment) {
  emits('attachment-removed', attachment)
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function toggleDockSide() {
  dockSide.value = dockSide.value === 'right' ? 'left' : 'right'
}

function ejectCard(id: string, event: Event) {
  event.stopPropagation()
  emits('eject-card', id)
}

function activateCard(id: string) {
  emits('activate-card', id)
  emits('select-card', id)
}

function onSelectExtra(event: Event) {
  const select = event.target as HTMLSelectElement
  const value = select.value
  if (!value) return
  activateCard(value)
  select.value = ''
}
</script>

<template>
  <div :class="layoutClass">
    <button
      v-if="!sidebarOpen"
      type="button"
      class="v2chat__handle"
      :class="[`v2chat__handle--${dockSide}`]"
      @click="toggleSidebar"
    >
      {{ t('pages.chat.workspace.reopen') }}
    </button>

    <section class="v2chat__main" :style="wallpaperStyle">
      <div class="v2chat__toolbar">
        <button type="button" class="v2chat__toolbar-btn" @click="toggleSidebar">
          {{ sidebarOpen ? t('pages.chat.workspace.toggleClose') : t('pages.chat.workspace.toggleOpen') }}
        </button>
        <button type="button" class="v2chat__toolbar-btn" @click="toggleDockSide">
          {{ dockSide === 'right' ? t('pages.chat.workspace.swapLeft') : t('pages.chat.workspace.swapRight') }}
        </button>
      </div>
      <ChatConsole
        :content="chatContent"
        :assistant-avatar="navigator?.avatar"
        :user-avatar="userAvatar"
        :assistant-tone="assistantTone"
        :user-tone="userTone"
        :greeting="navigator?.firstMessage"
        @message-rerun="proxyMessage('message-rerun', $event)"
        @message-edit="proxyMessage('message-edit', $event)"
        @message-fork="proxyMessage('message-fork', $event)"
        @message-bookmark="proxyMessage('message-bookmark', $event)"
        @attachments-added="onAttachmentsAdded"
        @attachment-removed="onAttachmentRemoved"
      />
    </section>

    <aside v-if="sidebarOpen" class="v2chat__sidebar">
      <header class="sidebar-tools">
        <span>{{ t('pages.chat.workspace.title') }}</span>
        <div class="sidebar-tools__buttons">
          <button type="button" @click="toggleDockSide">
            {{ dockSide === 'right' ? t('pages.chat.workspace.swapLeft') : t('pages.chat.workspace.swapRight') }}
          </button>
          <button type="button" @click="toggleSidebar">{{ t('pages.chat.workspace.toggleClose') }}</button>
        </div>
      </header>
      <section class="profile">
        <header>
          <h3>{{ accountName }}</h3>
          <span class="profile__tier">{{ accountTier }}</span>
        </header>
        <p class="profile__points">{{ pointsLabel }} : {{ pointsValue }}</p>
      </section>

      <section class="cards">
        <div class="cards__strip">
          <button
            v-for="card in cards"
            :key="card.id"
            type="button"
            :class="['cards__item', { active: card.id === selectedId }]"
            @click="handleSelect(card.id)"
          >
            <div class="cards__thumb" :style="card.thumbnail ? { backgroundImage: `url(${card.thumbnail})` } : undefined"></div>
            <span class="cards__label">{{ card.title }}</span>
            <button
              v-if="card.id !== 'account-persona'"
              type="button"
              class="cards__eject"
              @click="ejectCard(card.id, $event)"
            >
              ⏏
            </button>
          </button>
        </div>
        <label v-if="hasExtra" class="cards__select">
          <span>+</span>
          <select @change="onSelectExtra($event)">
            <option value="" selected disabled>{{ t('pages.chat.workspace.addCard') }}</option>
            <option v-for="card in extraCards" :key="card.id" :value="card.id">{{ card.title }}</option>
          </select>
        </label>
      </section>

      <section v-if="navigator" class="navigator">
        <div class="navigator__header">
          <div class="navigator__avatar" :style="navigator.avatar ? { backgroundImage: `url(${navigator.avatar})` } : undefined"></div>
          <div>
            <h3>{{ navigator.name }}</h3>
            <p class="navigator__tags">
              <span v-for="tag in navigator.tags" :key="tag">{{ tag }}</span>
            </p>
          </div>
        </div>
        <p class="navigator__summary">{{ navigator.summary }}</p>
      </section>

      <section v-if="wallpaperOptions?.length || chatContent.wallpaper" class="wallpaper">
        <h3>{{ chatContent.wallpaper?.label ?? 'Wallpaper' }}</h3>
        <p v-if="chatContent.wallpaper?.paletteLabel" class="wallpaper__hint">{{ chatContent.wallpaper.paletteLabel }}</p>
        <div class="wallpaper__options">
          <button
            v-for="option in wallpaperOptions"
            :key="option.id"
            type="button"
            :class="['wallpaper__chip', { active: option.id === wallpaperSelected }]"
            :style="{ background: option.value }"
            @click="changeWallpaper(option.id)"
          >
            {{ option.label }}
          </button>
        </div>
        <label
          v-if="chatContent.wallpaper?.customLabel"
          :class="['wallpaper__custom', { active: wallpaperSelected === 'custom' && hasCustomWallpaper }]"
        >
          <span>{{ chatContent.wallpaper.customLabel }}</span>
          <input
            type="text"
            :placeholder="chatContent.wallpaper.customPlaceholder"
            :value="wallpaperCustomValue"
            @input="updateWallpaperCustom(($event.target as HTMLInputElement).value)"
          />
        </label>
      </section>

      <section v-if="quickActions?.length" class="actions">
        <h3>Actions</h3>
        <button
          v-for="action in quickActions"
          :key="action.id"
          type="button"
          class="actions__button"
          :disabled="busy"
          @click="onAction(action)"
        >
          {{ action.label }}
        </button>
        <p v-if="error" class="actions__error">{{ error }}</p>
      </section>

      <section v-if="notes?.length" class="notes">
        <h3>Notes</h3>
        <ul>
          <li v-for="item in notes" :key="item">{{ item }}</li>
        </ul>
      </section>
    </aside>
  </div>
</template>

<style scoped>
.v2chat {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
  align-items: start;
  position: relative;
}

.v2chat--aside-left {
  grid-template-columns: 300px minmax(0, 1fr);
}

.v2chat--aside-left .v2chat__sidebar {
  order: -1;
}

.v2chat--collapsed {
  grid-template-columns: minmax(0, 1fr);
}

.v2chat__main {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(12, 18, 32, 0.55);
  padding: clamp(18px, 3vw, 28px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  display: grid;
  gap: 18px;
}

.v2chat__toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.v2chat__toolbar-btn {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.35);
  color: inherit;
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
}

.v2chat__handle {
  position: absolute;
  top: 12px;
  z-index: 20;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(12, 18, 32, 0.75);
  color: inherit;
  padding: 6px 12px;
  font-size: 0.75rem;
  cursor: pointer;
}

.v2chat__handle--right {
  right: 12px;
}

.v2chat__handle--left {
  left: 12px;
}

.v2chat__sidebar {
  display: grid;
  gap: 18px;
  position: sticky;
  top: 96px;
}

.sidebar-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.55);
  padding: 12px 16px;
  font-size: 0.85rem;
}

.sidebar-tools__buttons {
  display: flex;
  gap: 8px;
}

.sidebar-tools__buttons button {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.35);
  color: inherit;
  padding: 4px 10px;
  font-size: 0.75rem;
  cursor: pointer;
}

.profile,
.cards,
.navigator,
.actions,
.notes,
.wallpaper {
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.55);
  padding: 18px;
  display: grid;
  gap: 12px;
}

.profile header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile__tier {
  font-size: 0.8rem;
  opacity: 0.7;
}

.profile__points {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.85;
}

.cards__strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.cards__item {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.35);
  padding: 10px;
  display: grid;
  gap: 6px;
  justify-items: center;
  font-size: 0.85rem;
  cursor: pointer;
  position: relative;
}

.cards__item.active {
  border-color: var(--brand-2, #58cff5);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}

.cards__thumb {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  background-size: cover;
  background-position: center;
}

.cards__label {
  text-align: center;
}

.cards__eject {
  position: absolute;
  top: 6px;
  right: 6px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.45);
  color: inherit;
  font-size: 0.65rem;
  padding: 2px 6px;
}

.cards__select {
  display: grid;
  gap: 6px;
  font-size: 0.8rem;
}

.cards__select select {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: inherit;
  padding: 8px 10px;
}

.wallpaper__hint {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.7;
}

.wallpaper__options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 10px;
}

.wallpaper__chip {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  padding: 14px 12px;
  color: inherit;
  cursor: pointer;
  font-size: 0.85rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.wallpaper__chip.active {
  border-color: var(--brand-2, #58cff5);
  box-shadow: 0 12px 24px rgba(0,0,0,0.35);
  transform: translateY(-2px);
}

.wallpaper__chip:hover {
  transform: translateY(-2px);
}

.wallpaper__custom {
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
}

.wallpaper__custom input {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.35);
  color: inherit;
  padding: 10px 12px;
}

.wallpaper__custom.active input {
  border-color: var(--brand-2, #58cff5);
  box-shadow: 0 0 0 2px rgba(88, 207, 245, 0.2);
}

.navigator__header {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 12px;
  align-items: center;
}

.navigator__avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  background-size: cover;
  background-position: center;
}

.navigator__tags {
  margin: 0;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.75rem;
  opacity: 0.75;
}

.navigator__tags span {
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 2px 8px;
}

.navigator__summary {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.85;
}

.actions__button {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.35);
  text-align: left;
  cursor: pointer;
}

.actions__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.actions__error {
  color: #f87171;
  font-size: 0.85rem;
}

.notes ul {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
}

@media (max-width: 1024px) {
  .v2chat {
    grid-template-columns: 1fr;
  }

  .v2chat__sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .cards__strip {
    grid-template-columns: repeat(3, 80px);
  }
}
</style>
