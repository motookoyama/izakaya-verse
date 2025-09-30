<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChatMessage } from '../composables/useChat'

const props = defineProps<{
  messages: ChatMessage[]
  assistantLabel: string
  userLabel: string
  assistantAvatar?: string
  userAvatar?: string
  assistantTone?: { background?: string; text?: string; font?: string }
  userTone?: { background?: string; text?: string; font?: string }
}>()

const emits = defineEmits<{
  (e: 'rerun', message: ChatMessage): void
  (e: 'edit', message: ChatMessage): void
  (e: 'fork', message: ChatMessage): void
  (e: 'bookmark', message: ChatMessage): void
}>()

const { t } = useI18n({ useScope: 'global' })

const toneStyles = computed(() => ({
  '--bubble-assistant-bg': props.assistantTone?.background ?? 'rgba(96, 165, 250, 0.12)',
  '--bubble-assistant-color': props.assistantTone?.text ?? 'inherit',
  '--bubble-assistant-font': props.assistantTone?.font ?? 'inherit',
  '--bubble-user-bg': props.userTone?.background ?? 'rgba(249, 168, 212, 0.12)',
  '--bubble-user-color': props.userTone?.text ?? 'inherit',
  '--bubble-user-font': props.userTone?.font ?? 'inherit',
}))

function labelFor(role: ChatMessage['role']) {
  return role === 'assistant' ? props.assistantLabel : props.userLabel
}

function avatarFor(role: ChatMessage['role']) {
  return role === 'assistant' ? props.assistantAvatar : props.userAvatar
}

function initialsFrom(label: string) {
  return label
    .split(/\s|·|・/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2) || 'AI'
}

function clipId(message: ChatMessage) {
  return `avatar-clip-${message.id}`
}

function onAction(type: 'rerun' | 'edit' | 'fork' | 'bookmark', message: ChatMessage) {
  switch (type) {
    case 'rerun':
      emits('rerun', message)
      break
    case 'edit':
      emits('edit', message)
      break
    case 'fork':
      emits('fork', message)
      break
    case 'bookmark':
      emits('bookmark', message)
      break
    default:
      break
  }
}

function formatSize(size: number) {
  if (!Number.isFinite(size)) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="chat-log" role="log" :style="toneStyles">
    <article
      v-for="message in messages"
      :key="message.id"
      class="chat-log__item"
      :class="[`chat-log__item--${message.role}`]"
    >
      <figure class="chat-log__avatar" :data-role="message.role">
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <defs>
            <clipPath :id="clipId(message)">
              <rect x="4" y="4" width="64" height="64" rx="18"></rect>
            </clipPath>
          </defs>
          <rect x="4" y="4" width="64" height="64" rx="18" class="chat-log__avatar-bg" />
          <image
            v-if="avatarFor(message.role)"
            :href="avatarFor(message.role)"
            width="64"
            height="64"
            x="4"
            y="4"
            preserveAspectRatio="xMidYMid slice"
            :clip-path="`url(#${clipId(message)})`"
          />
          <text
            v-else
            x="36"
            y="40"
            text-anchor="middle"
            dominant-baseline="middle"
            class="chat-log__avatar-text"
          >
            {{ initialsFrom(labelFor(message.role)) }}
          </text>
        </svg>
        <figcaption class="chat-log__role">{{ labelFor(message.role) }}</figcaption>
      </figure>

      <div class="chat-log__bubble">
        <header class="chat-log__bubble-header">
          <span class="chat-log__timestamp">{{ new Date(message.createdAt).toLocaleTimeString() }}</span>
          <div class="chat-log__actions" aria-label="message actions">
            <button type="button" class="chat-log__action" :title="`${labelFor(message.role)} · ${t('home.chat.actions.rerun')}`" @click="onAction('rerun', message)">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10a6 6 0 1 1 1.76 4.24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><polyline points="4 6 4 10 8 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button type="button" class="chat-log__action" :title="t('home.chat.actions.edit')" @click="onAction('edit', message)">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 13.5 13.5 3a1.5 1.5 0 0 1 2.12 0l1.38 1.38a1.5 1.5 0 0 1 0 2.12L6.5 17H3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><line x1="3" y1="17" x2="7" y2="17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            </button>
            <button type="button" class="chat-log__action" :title="t('home.chat.actions.fork')" @click="onAction('fork', message)">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4v6a4 4 0 0 0 4 4h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="4" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="14" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="14" cy="16" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
            </button>
            <button type="button" class="chat-log__action" :title="t('home.chat.actions.bookmark')" @click="onAction('bookmark', message)">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h10v14l-5-3-5 3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </header>
        <p class="chat-log__content">{{ message.content }}</p>
        <ul v-if="message.attachments?.length" class="chat-log__attachments">
          <li v-for="file in message.attachments" :key="file.id" class="chat-log__attachment">
            <span class="chat-log__attachment-icon" aria-hidden="true">📎</span>
            <span class="chat-log__attachment-name">{{ file.name }}</span>
            <span class="chat-log__attachment-meta">{{ formatSize(file.size) }}</span>
          </li>
        </ul>
      </div>
    </article>
  </div>
</template>

<style scoped>
.chat-log {
  display: grid;
  gap: 20px;
  padding: 12px 8px 12px 0;
  overflow-y: auto;
  max-height: 70vh;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
}

.chat-log__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-log__item--assistant {
  background: var(--bubble-assistant-bg);
  color: var(--bubble-assistant-color);
  font-family: var(--bubble-assistant-font);
}

.chat-log__item--user {
  background: var(--bubble-user-bg);
  color: var(--bubble-user-color);
  font-family: var(--bubble-user-font);
}

.chat-log__avatar {
  margin: 0;
  display: grid;
  justify-items: center;
  gap: 6px;
  font-size: 0.75rem;
  opacity: 0.85;
}

.chat-log__avatar svg {
  width: 60px;
  height: 60px;
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.35));
}

.chat-log__avatar-bg {
  fill: rgba(255, 255, 255, 0.08);
  stroke: rgba(255, 255, 255, 0.15);
  stroke-width: 1.5px;
}

.chat-log__avatar-text {
  font-size: 22px;
  font-weight: 600;
  fill: rgba(255, 255, 255, 0.85);
}

.chat-log__role {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.chat-log__bubble {
  display: grid;
  gap: 12px;
}

.chat-log__bubble-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.chat-log__timestamp {
  font-size: 0.75rem;
  opacity: 0.7;
}

.chat-log__actions {
  display: inline-flex;
  gap: 8px;
}

.chat-log__action {
  appearance: none;
  border: none;
  background: rgba(0, 0, 0, 0.2);
  color: inherit;
  padding: 6px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}

.chat-log__action svg {
  width: 16px;
  height: 16px;
}

.chat-log__action:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.chat-log__action:focus-visible {
  outline: 2px solid rgba(88, 207, 245, 0.8);
  outline-offset: 2px;
}

.chat-log__content {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.6;
}

.chat-log__attachments {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.chat-log__attachment {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 0.75rem;
  color: inherit;
}

.chat-log__attachment-icon {
  font-size: 0.85rem;
}

.chat-log__attachment-name {
  font-weight: 600;
}

.chat-log__attachment-meta {
  opacity: 0.7;
}

@media (max-width: 720px) {
  .chat-log__item {
    grid-template-columns: minmax(0, 1fr);
  }

  .chat-log__avatar {
    justify-items: start;
    grid-template-columns: auto 1fr;
  }

  .chat-log__avatar svg {
    width: 48px;
    height: 48px;
  }
}
</style>
