import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useChatStore } from './chat'
import { getPlace } from '../types/places'
import type { DateInvitation } from '../types/dates'
import { formatDateTime } from '../utils/dateFormat'

export const useDatesStore = defineStore('dates', () => {
  const chat = useChatStore()
  const invitations = ref<DateInvitation[]>([])

  const byConversation = (conversationId: string) =>
    invitations.value
      .filter((i) => i.conversationId === conversationId)
      .sort((a, b) => b.createdAt - a.createdAt)

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

    chat.getById(p.conversationId)?.messages.push({
      id: `m-${Date.now()}-d`,
      from: 'me',
      text: `📅 Te invité a una cita en ${place.name}: ${formatDateTime(p.startsAt)}`,
      sentAt: Date.now(),
      status: 'sent'
    })

    return invitation
  }

  return { invitations, byConversation, send }
})