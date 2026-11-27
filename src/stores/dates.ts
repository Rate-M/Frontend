import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useChatStore } from './chat'
import { getPlace } from '../types/places'
import type { DateInvitation, DateStatus, GpsCheck, GpsScenario } from '../types/dates'
import { formatDateTime } from '../utils/dateFormat'
import { findProhibited } from '../utils/moderation'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

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
      attendance: 'unverified',
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
      attendance: 'unverified',
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
      attendance: 'unverified',
      createdAt: Date.now() - 20 * HOUR
    },
    {
  
      id: 'd-seed-4',
      conversationId: 'c1',
      direction: 'sent',
      placeId: 'p1',
      startsAt: Date.now() - 1 * HOUR,
      note: 'Café y buena plática ☕',
      status: 'accepted',
      attendance: 'unverified',
      createdAt: Date.now() - 2 * DAY
    },
    {

      id: 'd-seed-5',
      conversationId: 'c2',
      direction: 'received',
      placeId: 'p5',
      startsAt: Date.now() - 3 * HOUR,
      note: '',
      status: 'accepted',
      attendance: 'unverified',
      createdAt: Date.now() - 3 * DAY
    },
    {

      id: 'd-seed-6',
      conversationId: 'c4',
      direction: 'sent',
      placeId: 'p7',
      startsAt: inDays(-1, 19),
      note: '',
      status: 'accepted',
      attendance: 'verified',
      gps: {
        me: { status: 'ok', distanceM: 28, arrivedAt: inDays(-1, 19) - 10 * MINUTE },
        them: { status: 'ok', distanceM: 54, arrivedAt: inDays(-1, 19) + 3 * MINUTE }
      },
      theirReview: {
        rating: 5,
        tags: ['Amable', 'Buena conversación'],
        comment: 'Fue una cita muy agradable, gracias por la buena plática 😊',
        createdAt: Date.now() - 2 * HOUR
      },
      createdAt: Date.now() - 4 * DAY
    }
  ])

  const getById = (id: string) => invitations.value.find((i) => i.id === id)

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
      attendance: 'unverified',
      createdAt: Date.now()
    }
    invitations.value.unshift(invitation)
    pushMessage(p.conversationId, `📅 Te invité a una cita en ${place.name}: ${formatDateTime(p.startsAt)}`)
    return invitation
  }

 
  const respond = (id: string, status: Exclude<DateStatus, 'pending'>) => {
    const invitation = getById(id)
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

  const verify = (id: string, scenario: GpsScenario) => {
    const invitation = getById(id)
    if (!invitation || invitation.status !== 'accepted') return

    const t = invitation.startsAt

    const gps: GpsCheck =
      scenario === 'both'
        ? {
            me: { status: 'ok', distanceM: 35, arrivedAt: t - 6 * MINUTE },
            them: { status: 'ok', distanceM: 62, arrivedAt: t + 4 * MINUTE }
          }
        : scenario === 'nosignal'
          ? {
              me: { status: 'error' },
              them: { status: 'ok', distanceM: 48, arrivedAt: t + 2 * MINUTE }
            }
          : scenario === 'far'
            ? {
                me: { status: 'ok', distanceM: 41, arrivedAt: t - 3 * MINUTE },
                them: { status: 'far', distanceM: 420 }
              }
            : {
                me: { status: 'ok', distanceM: 41, arrivedAt: t - 3 * MINUTE },
                them: { status: 'late', distanceM: 55, arrivedAt: t + 75 * MINUTE }
              }

    invitation.gps = gps
    invitation.attendance = gps.me.status === 'ok' && gps.them.status === 'ok' ? 'verified' : 'gps_failed'
  }

  const confirmManually = (id: string) => {
    const invitation = getById(id)
    if (!invitation || invitation.attendance !== 'gps_failed') return

    invitation.manual = { me: true, them: false }
    invitation.attendance = 'manual_pending'

    setTimeout(() => {
      const current = getById(id)
      if (current && current.attendance === 'manual_pending') {
        current.manual = { me: true, them: true }
        current.attendance = 'manual_confirmed'
      }
    }, 3500)
  }

  const submitReview = (id: string, p: { rating: number; tags: string[]; comment: string }): boolean => {
    const invitation = getById(id)
    if (!invitation || invitation.review) return false
    if (invitation.attendance !== 'verified' && invitation.attendance !== 'manual_confirmed') return false
    if (findProhibited(p.comment).length > 0) return false

    invitation.review = {
      rating: p.rating,
      tags: p.tags,
      comment: p.comment.trim(),
      createdAt: Date.now()
    }
    return true
  }

  const simulateTheirReview = (id: string, variant: 'clean' | 'prohibited' = 'clean') => {
    const invitation = getById(id)
    if (!invitation || !invitation.review || invitation.theirReview) return

    invitation.theirReview =
      variant === 'clean'
        ? {
            rating: 4,
            tags: ['Puntual', 'Amable'],
            comment: 'Me la pasé muy bien, gracias por la invitación 😊',
            createdAt: Date.now()
          }
        : {
            rating: 1,
            tags: ['Poca conversación'],
            comment: 'Fue un desastre, es una persona muy idiota y la plática fue una mierda.',
            createdAt: Date.now()
          }
  }

  return {
    invitations,
    pendingReceivedCount,
    getById,
    byConversation,
    send,
    respond,
    verify,
    confirmManually,
    submitReview,
    simulateTheirReview
  }
})