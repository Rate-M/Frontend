import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { placeholderPhoto } from '../types/discover'
import type { DiscoverProfile } from '../types/discover'
import { useAuthStore } from './auth'

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

interface PendingPage {
  notifications: { id: string; createdAt: string }[]
  nextCursor: string | null
}

export interface AppNotification {
  id: string
  type: 'match' | 'system'
  title: string
  text: string
  avatar?: string
  createdAt: number
  read: boolean
}

const HOUR = 60 * 60 * 1000

export const useNotificationsStore = defineStore('notifications', () => {
  const auth = useAuthStore()
  const loading = ref(false)
  const marking = ref(false)
  const error = ref('')
  let request: AbortController | undefined
  const items = ref<AppNotification[]>(useMocks ? [
    {
      id: 'n-seed-1',
      type: 'match',
      title: '¡Nuevo match!',
      text: 'Tú y Camila se gustaron mutuamente.',
      avatar: placeholderPhoto('Camila', '#B3202E', '#F8D5D2'),
      createdAt: Date.now() - 3 * HOUR,
      read: false
    },
    {
      id: 'n-seed-2',
      type: 'system',
      title: 'Identidad verificada',
      text: 'Tu cuenta ya tiene la insignia de verificación.',
      createdAt: Date.now() - 26 * HOUR,
      read: true
    }
  ] : [])

  const unreadCount = computed(() => items.value.filter((n) => !n.read).length)

  watch(() => auth.token, () => {
    if (useMocks) return
    request?.abort()
    request = undefined
    items.value = []
    loading.value = false
    marking.value = false
    error.value = ''
  }, { flush: 'sync' })

  const refresh = async () => {
    const token = auth.token
    if (useMocks || !token || marking.value) return

    request?.abort()
    const controller = new AbortController()
    request = controller
    loading.value = true
    error.value = ''
    const pending: AppNotification[] = []
    try {
      let before: string | null = null
      do {
        const query = before ? '?before=' + encodeURIComponent(before) : ''
        const response = await fetch(apiUrl + '/notifications' + query, {
          headers: { Authorization: 'Bearer ' + token }, signal: controller.signal,
        })
        if (!response.ok) throw new Error()
        const page = await response.json() as PendingPage
        pending.push(...page.notifications.map((notice): AppNotification => ({
          id: notice.id,
          type: 'match',
          title: '¡Nuevo match!',
          text: 'Tú y otra persona se dieron me gusta.',
          createdAt: Date.parse(notice.createdAt),
          read: false,
        })))
        before = page.nextCursor
      } while (before && !controller.signal.aborted)
      if (!controller.signal.aborted) items.value = pending
    } catch {
      if (!controller.signal.aborted) error.value = 'No pudimos cargar tus notificaciones.'
    } finally {
      if (request === controller) {
        request = undefined
        loading.value = false
      }
    }
  }

  const addMatch = (profile: DiscoverProfile) => {
    if (!useMocks) {
      void refresh()
      return
    }
    items.value.unshift({
      id: `n-${Date.now()}`,
      type: 'match',
      title: '¡Nuevo match!',
      text: `Tú y ${profile.name} se gustaron mutuamente.`,
      avatar: profile.photos[0],
      createdAt: Date.now(),
      read: false
    })
  }

  const markAllRead = async () => {
    if (useMocks) {
      items.value.forEach((notice) => (notice.read = true))
      return
    }

    const token = auth.token
    if (!token || loading.value || marking.value) return
    const pending = items.value.filter((notice) => !notice.read)
    const controller = new AbortController()
    request = controller
    marking.value = true
    error.value = ''
    const results = await Promise.allSettled(pending.map(async (notice) => {
      const response = await fetch(apiUrl + '/notifications/' + encodeURIComponent(notice.id) + '/read', {
        method: 'PATCH', headers: { Authorization: 'Bearer ' + token }, signal: controller.signal,
      })
      if (!response.ok && response.status !== 404) throw new Error()
      return notice.id
    }))
    if (request !== controller) return
    request = undefined
    marking.value = false
    const completed = new Set(results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []))
    items.value = items.value.filter((notice) => !completed.has(notice.id))
    if (completed.size < pending.length) error.value = 'Algunas notificaciones siguen sin leer. Intenta de nuevo.'
  }

  return { items, unreadCount, loading, marking, error, addMatch, refresh, markAllRead }
})
