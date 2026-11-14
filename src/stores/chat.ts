import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createMockConversations } from '../types/chat'
import type { Conversation } from '../types/chat'
import { computeStreak } from '../utils/streak'

const REPLIES = [
  '¡Jaja, qué bien!',
  'Me encantaría, ¿qué día te late?',
  'Suena perfecto 😊',
  'Cuéntame más',
  'Ay, qué lindo, gracias'
]

const lastTs = (c: Conversation) => c.messages[c.messages.length - 1]?.sentAt ?? 0

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>(createMockConversations())
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
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
        sentAt: Date.now()
      })
    }, 2300)
  }

  const sendMessage = (id: string, text: string) => {
    const c = getById(id)
    const clean = text.trim()
    if (!c || !clean) return

    c.messages.push({
      id: `m-${Date.now()}`,
      from: 'me',
      text: clean,
      sentAt: Date.now(),
      status: 'sent'
    })

    if (c.online) simulateReply(id)
  }

  const unmatch = (id: string) => {
    const c = getById(id)
    if (!c) return
    conversations.value = conversations.value.filter((x) => x.id !== id)
    if (typingId.value === id) typingId.value = null
    setNotice(`Deshiciste el match con ${c.name}`)
  }

  return {
    conversations,
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