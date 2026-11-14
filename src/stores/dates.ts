import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useChatStore } from './chat'
import { getPlace } from '../types/places'
import type { DateInvitation, DateStatus } from '../types/dates'
import { formatDateTime } from '../utils/dateFormat'

const HOUR = 60 * 60 * 1000

const inDays = (days: number, hour: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return d.getTime()
}

export const useDatesStore = defineStore('dates', () => {
  const chat = useChatStore()


  const invitations = ref<DateInvitation[]>([
    {
      id: 'd-seed-1',
      conversationId: 'c4',
      direction: 'received',
      placeId: 'p1',
      startsAt: inDays(1, 19),
      note: '¿Te late un café mañana en la tarde?',
      status: 'pending',
      createdAt: Date.now() - 2 * HOUR
    },
    {
      id: 'd-seed-2',
      conversationId: 'c1',
      direction: 'received',
      placeId: 'p3',
      startsAt: inDays(3, 17),
      note: '',
      status: 'pending',
      createdAt: Date.now() - 5 * HOUR
    },
    {
      id: 'd-seed-3',
      conversationId: 'c4',
      direction: 'sent',
      placeId: 'p2',
      startsAt: inDays(5, 16),
      note: 'Caminata y helado, ¿qué dices?',
      status: 'accepted',
      createdAt: Date.now() - 20 * HOUR
    }
  ])

  const pendingReceivedCount = computed(
    () => invitations.value.filter((i) => i.direction === 'received' && i.status === 'pending').length
  )

  const byConversation = (conversationId: string) =>
    invitations.value
      .filter((i) => i.conversationId === conversationId)
      .sort((a, b) => b.createdAt - a.createdAt)

  const pushMessage = (conversationId: string, text: string) => {
    chat.getById(conversationId)?.messages.push({
      id: `m-${Date.now()}-d`,
      from: 'me',
      text,
      sentAt: Date.now(),
      status: 'sent'
    })
  }

  const send = (p: { conversationId: string; placeId: string; startsAt: number; note: string }) => {
    const place = getPlace(p.placeId)
    if (!place) return null

    const invitation: DateInvitation = {
      id: `d-${Date.now()}`,
      conversationId: p.conversationId,
      direction: 'sent',
      placeId: p.placeId,
      startsAt: p.startsAt,
      note: p.note.trim(),
      status: 'pending',
      createdAt: Date.now()
    }
    invitations.value.unshift(invitation)
    pushMessage(p.conversationId, `📅 Te invité a una cita en ${place.name}: ${formatDateTime(p.startsAt)}`)
    return invitation
  }

  const respond = (id: string, status: Exclude<DateStatus, 'pending'>) => {
    const invitation = invitations.value.find((i) => i.id === id)
    if (!invitation || invitation.direction !== 'received' || invitation.status !== 'pending') return

    invitation.status = status
    const place = getPlace(invitation.placeId)

    pushMessage(
      invitation.conversationId,
      status === 'accepted'
        ? `✅ Acepté tu invitación a ${place?.name ?? 'la cita'}. ¡Nos vemos!`
        : 'Gracias por invitarme, pero esta vez no podré ir 🙏'
    )
  }

  return { invitations, pendingReceivedCount, byConversation, send, respond }
})