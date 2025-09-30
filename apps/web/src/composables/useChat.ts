import { computed, reactive, ref } from 'vue'
import { apiRequest } from '../utils/api'

type ChatRole = 'system' | 'user' | 'assistant'

export type ChatAttachment = {
  id: string
  name: string
  size: number
  type: string
  source?: File
}

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
  attachments?: ChatAttachment[]
}

type ChatResponse = {
  choices?: Array<{
    index: number
    message?: { role?: ChatRole; content?: string }
  }>
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    try {
      return `${prefix}-${crypto.randomUUID()}`
    } catch (err) {
      /* noop fallback */
    }
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function useChat(initialSystemPrompt?: string) {
  const history = reactive<ChatMessage[]>([])
  if (initialSystemPrompt && initialSystemPrompt.trim().length > 0) {
    history.push({
      id: createId('sys'),
      role: 'system',
      content: initialSystemPrompt.trim(),
      createdAt: Date.now(),
    })
  }

  const loading = ref(false)
  const error = ref<string | null>(null)

  const visibleMessages = computed(() => history.filter((message) => message.role !== 'system'))

  function resetConversation() {
    const startIndex = history.findIndex((entry) => entry.role !== 'system')
    if (startIndex >= 0) {
      history.splice(startIndex)
    }
    error.value = null
  }

  async function sendMessage(input: string, attachments: ChatAttachment[] = []): Promise<void> {
    const trimmed = input.trim()
    if (trimmed.length === 0 || loading.value) {
      return
    }

    loading.value = true
    error.value = null

    const userMessage: ChatMessage = {
      id: createId('user'),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
      attachments: attachments.length ? attachments.map((item) => ({ ...item })) : undefined,
    }

    history.push(userMessage)

    try {
      const response = await apiRequest<ChatResponse>('/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          messages: history.map((message) => ({ role: message.role, content: message.content })),
          stream: false,
          attachments: attachments.map((item) => ({
            id: item.id,
            name: item.name,
            size: item.size,
            type: item.type,
          })),
        }),
      })

      const assistantContent = response.choices?.[0]?.message?.content?.trim()
      if (assistantContent && assistantContent.length > 0) {
        history.push({
          id: createId('assistant'),
          role: 'assistant',
          content: assistantContent,
          createdAt: Date.now(),
        })
      } else {
        history.push({
          id: createId('assistant'),
          role: 'assistant',
          content: '[no response]',
          createdAt: Date.now(),
        })
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  return {
    history,
    visibleMessages,
    loading,
    error,
    sendMessage,
    resetConversation,
  }
}
