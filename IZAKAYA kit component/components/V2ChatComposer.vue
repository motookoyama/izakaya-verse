<script setup lang="ts">
import { ref } from 'vue'
import type { ChatAttachment } from '../composables/useChat'

defineProps<{
  modelValue: string
  disabled?: boolean
  placeholder: string
  sendLabel: string
  attachLabel: string
  attachHint: string
  enterHint: string
  filesLabel: string
  removeFileLabel: string
  attachments: ChatAttachment[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
  (e: 'add-files', files: File[]): void
  (e: 'remove-attachment', attachment: ChatAttachment): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isComposing = ref(false)

function onInput(event: Event) {
  emits('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

function onSubmit() {
  emits('send')
}

function triggerFileDialog() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  emits('add-files', Array.from(input.files))
  input.value = ''
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (!files?.length) return
  emits('add-files', Array.from(files))
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter') return
  if (event.shiftKey) return
  if (isComposing.value || event.isComposing) return
  event.preventDefault()
  emits('send')
}

function onCompositionStart() {
  isComposing.value = true
}

function onCompositionEnd() {
  isComposing.value = false
}

function removeAttachment(attachment: ChatAttachment) {
  emits('remove-attachment', attachment)
}
</script>

<template>
  <form class="composer" @submit.prevent="onSubmit" @drop="handleDrop" @dragover="handleDragOver">
    <label class="composer__field">
      <span class="sr-only">{{ placeholder }}</span>
      <textarea
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        rows="4"
        @input="onInput"
        @keydown="onKeydown"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
      ></textarea>
    </label>

    <div class="composer__toolbar">
      <div class="composer__hints">
        <small>{{ enterHint }}</small>
        <small>{{ attachHint }}</small>
      </div>
      <div class="composer__controls">
        <input
          ref="fileInput"
          class="sr-only"
          type="file"
          multiple
          @change="handleFileChange"
        />
        <button type="button" class="composer__attach" @click="triggerFileDialog" :disabled="disabled">
          {{ attachLabel }}
        </button>
        <button type="submit" class="composer__send" :disabled="disabled || !modelValue.trim()">
          {{ sendLabel }}
        </button>
      </div>
    </div>

    <div v-if="attachments.length" class="composer__attachments">
      <p class="composer__attachments-title">{{ filesLabel }}</p>
      <ul>
        <li v-for="file in attachments" :key="file.id" class="composer__attachment">
          <span class="composer__attachment-name">{{ file.name }}</span>
          <span class="composer__attachment-size">{{ (file.size / 1024).toFixed(1) }} KB</span>
          <button type="button" class="composer__attachment-remove" @click="removeAttachment(file)">
            {{ removeFileLabel }}
          </button>
        </li>
      </ul>
    </div>
  </form>
</template>

<style scoped>
.composer {
  display: grid;
  gap: 12px;
  border-radius: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
}

.composer__field textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.35);
  color: inherit;
  padding: 12px 14px;
  font: inherit;
  line-height: 1.5;
}

.composer__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.composer__hints {
  display: grid;
  gap: 4px;
  font-size: 0.75rem;
  opacity: 0.75;
}

.composer__controls {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.composer__attach,
.composer__send {
  appearance: none;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 12px;
  padding: 10px 16px;
  background: rgba(30, 64, 175, 0.35);
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.composer__attach {
  background: rgba(59, 130, 246, 0.25);
}

.composer__send {
  background: linear-gradient(135deg, rgba(88, 207, 245, 0.8), rgba(59, 130, 246, 0.8));
  font-weight: 600;
}

.composer__attach:disabled,
.composer__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.composer__attach:hover:not(:disabled),
.composer__send:hover:not(:disabled) {
  transform: translateY(-1px);
}

.composer__attachments {
  display: grid;
  gap: 8px;
}

.composer__attachments ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.composer__attachments-title {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.75;
}

.composer__attachment {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.85rem;
}

.composer__attachment-name {
  font-weight: 600;
}

.composer__attachment-size {
  opacity: 0.75;
}

.composer__attachment-remove {
  appearance: none;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 640px) {
  .composer__controls {
    width: 100%;
    justify-content: space-between;
  }

  .composer__attachment {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'name remove'
      'size remove';
  }
}
</style>
