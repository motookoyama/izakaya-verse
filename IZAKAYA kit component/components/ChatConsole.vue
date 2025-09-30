<script setup lang="ts">
import { computed, ref } from 'vue'
import V2ChatLog from './V2ChatLog.vue'
import V2ChatComposer from './V2ChatComposer.vue'
import { useChat, type ChatAttachment, type ChatMessage } from '../composables/useChat'
import type { ChatContent } from '../types/home'

const props = defineProps<{
  content: ChatContent
  assistantAvatar?: string
  userAvatar?: string
  assistantTone?: { background?: string; text?: string; font?: string }
  userTone?: { background?: string; text?: string; font?: string }
  greeting?: string
}>()

const emits = defineEmits<{
  (e: 'message-rerun', message: ChatMessage): void
  (e: 'message-edit', message: ChatMessage): void
  (e: 'message-fork', message: ChatMessage): void
  (e: 'message-bookmark', message: ChatMessage): void
  (e: 'attachments-added', files: File[]): void
  (e: 'attachment-removed', attachment: ChatAttachment): void
}>()

const input = ref('')
const attachments = ref<ChatAttachment[]>([])

const {
  visibleMessages,
  loading,
  error,
  sendMessage,
  resetConversation,
  history,
} = useChat(props.content.systemPrompt)

const hasMessages = computed(() => visibleMessages.value.length > 0)
const firstAssistantMessage = computed(() => {
  if (hasMessages.value) {
    const found = history.find((message) => message.role === 'assistant')
    if (found?.content) {
      return found.content
    }
  }
  return props.greeting ?? ''
})

async function onSubmit() {
  if (!input.value.trim()) return
  await sendMessage(input.value, attachments.value)
  input.value = ''
  attachments.value = []
}

function handleAddFiles(files: File[]) {
  if (!files.length) return
  const mapped = files.map((file) => ({
    id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    source: file,
  }))
  attachments.value = [...attachments.value, ...mapped]
  emits('attachments-added', files)
}

function handleRemoveAttachment(attachment: ChatAttachment) {
  attachments.value = attachments.value.filter((item) => item.id !== attachment.id)
  emits('attachment-removed', attachment)
}

function onRerun(message: ChatMessage) {
  emits('message-rerun', message)
}

function onEdit(message: ChatMessage) {
  emits('message-edit', message)
}

function onFork(message: ChatMessage) {
  emits('message-fork', message)
}

function onBookmark(message: ChatMessage) {
  emits('message-bookmark', message)
}
</script>

<template>
  <section class="chat-console">
    <V2ChatLog
      v-if="hasMessages"
      :messages="visibleMessages"
      :assistant-label="content.assistantLabel"
      :user-label="content.userLabel"
      :assistant-avatar="assistantAvatar"
      :user-avatar="userAvatar"
      :assistant-tone="assistantTone"
      :user-tone="userTone"
      @rerun="onRerun"
      @edit="onEdit"
      @fork="onFork"
      @bookmark="onBookmark"
    />
    <div v-else class="chat-console__empty">
      <p v-if="firstAssistantMessage">{{ firstAssistantMessage }}</p>
      <p v-else>{{ content.empty }}</p>
      <button type="button" @click="resetConversation">{{ content.composer.sendLabel }}</button>
    </div>

    <V2ChatComposer
      class="chat-console__composer"
      :model-value="input"
      :disabled="loading"
      :placeholder="content.composer.placeholder"
      :send-label="content.composer.sendLabel"
      :attach-label="content.composer.attachLabel"
      :attach-hint="content.composer.attachHint"
      :enter-hint="content.composer.enterToSendHint"
      :files-label="content.composer.filesLabel"
      :remove-file-label="content.composer.removeFileLabel"
      :attachments="attachments"
      @update:model-value="input = $event"
      @send="onSubmit"
      @add-files="handleAddFiles"
      @remove-attachment="handleRemoveAttachment"
    />

    <p v-if="loading" class="chat-console__status">{{ content.loadingMessage }}</p>
    <p v-else-if="error" class="chat-console__status chat-console__status--error">{{ error }}</p>
  </section>
</template>

<style scoped>

.chat-console {
  display: grid;
  gap: 18px;
  padding: clamp(12px, 3vw, 20px);
}

.chat-console__empty {
  display: grid;
  gap: 12px;
  justify-items: center;
  text-align: center;
  padding: 32px;
  border-radius: 20px;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.95rem;
  opacity: 0.8;
}

.chat-console__empty button {
  border-radius: 999px;
  padding: 10px 22px;
  font-weight: 600;
}

.chat-console__composer {
  margin-top: auto;
}

.chat-console__status {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.75;
}

.chat-console__status--error {
  color: #f87171;
}

@media (max-width: 720px) {
  .chat-console {
    padding: 12px;
  }
}
</style>
