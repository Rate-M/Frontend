import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { createMockConversations } from '../types/chat'
import type { Conversation } from '../types/chat'
import { computeStreak } from '../utils/streak'
import { deleteMatch, loadConversations, loadHistory } from '../services/conversations'
import { useAuthStore } from './auth'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

const REPLIES = [
  '¡Jaja, qué bien!',
  'Me encantaría, ¿qué día te late?',
  'Suena perfecto 😊',
  'Cuéntame más',
  'Ay, qué lindo, gracias'
] as const

const lastTs = (c: Conversation) => c.messages[c.messages.length - 1]?.sentAt ?? 0

export const useChatStore = defineStore('chat', () => {
  const auth = useAuthStore()
  const conversations = ref<Conversation[]>(useMocks ? createMockConversations() : [])
  const loading = ref(false)
  const error = ref('')
  let request: AbortController | undefined

  watch(() => auth.token, () => {
    if (useMocks) return
    request?.abort()
    request = undefined
    conversations.value = []
    loading.value = false
    error.value = ''
  }, { flush: 'sync' })

  const refresh = async (matchId?: string) => {
    if (useMocks) return
    const token = auth.token
    const userId = auth.user?.id
    if (!token || typeof userId !== 'string') {
      error.value = 'Inicia sesión para ver tus conversaciones.'
      return
    }
    request?.abort()
    const controller = new AbortController()
    request = controller
    loading.value = true
    error.value = ''
    try {
      const matches = await loadConversations(token, userId, controller.signal)
      const selected = matches.find((match) => match.id === matchId)
      if (selected) Object.assign(selected, await loadHistory(token, userId, selected.id, controller.signal))
      if (!controller.signal.aborted) conversations.value = matches
    } catch {
      if (!controller.signal.aborted) error.value = 'No pudimos cargar tus conversaciones.'
    } finally {
      if (request === controller) {
        request = undefined
        loading.value = false
      }
    }
  }
  const typingId = ref<string | null>(null)
  const notice = ref<string | null>(null)
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  const getById = (id: string) => conversations.value.find((c) => c.id === id)

  const active = computed(() =>
    conversations.value.filter((c) => c.messages.length > 0).sort((a, b) => lastTs(b) - lastTs(a))
  )

  const newMatches = computed(() => conversations.value.filter((c) => c.messages.length === 0))

  const totalUnread = computed(() => conversations.value.reduce((sum, c) => sum + c.unread, 0))

  const streakOf = (id: string) => {
    const c = getById(id)
    return c ? computeStreak(c.messages) : null
  }

  const markRead = (id: string) => {
    const c = getById(id)
    if (c) c.unread = 0
  }

  const setNotice = (text: string) => {
    notice.value = text
    clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => (notice.value = null), 4000)
  }

  const simulateReply = (id: string) => {
    setTimeout(() => {
      if (getById(id)) typingId.value = id
    }, 700)

    setTimeout(() => {
      const c = getById(id)
      if (!c) return
      typingId.value = null
      c.messages.forEach((m) => {
        if (m.from === 'me') m.status = 'read'
      })
      c.messages.push({
        id: `m-${Date.now()}`,
        from: 'them',
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)] ?? REPLIES[0],
        sentAt: Date.now()
      })
    }, 2300)
  }

  const sendMessage = (id: string, text: string) => {
    const c = getById(id)
    const clean = text.trim()
    if (!useMocks || !c || !clean) return

    c.messages.push({
      id: `m-${Date.now()}`,
      from: 'me',
      text: clean,
      sentAt: Date.now(),
      status: 'sent'
    })

    if (c.online) simulateReply(id)
  }

  const unmatch = async (id: string) => {
    const c = getById(id)
    if (!c) return false
    if (!useMocks) {
      const token = auth.token
      if (!token) throw new Error('Inicia sesión para deshacer el match.')
      await deleteMatch(token, id)
      if (token !== auth.token) return false
    }
    conversations.value = conversations.value.filter((x) => x.id !== id)
    if (typingId.value === id) typingId.value = null
    setNotice(`Deshiciste el match con ${c.name}`)
    return true
  }

  return {
    conversations,
    useMocks,
    loading,
    error,
    refresh,
    typingId,
    notice,
    active,
    newMatches,
    totalUnread,
    streakOf,
    getById,
    markRead,
    setNotice,
    sendMessage,
    unmatch
  }
})