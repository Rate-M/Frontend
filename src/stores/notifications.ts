import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { placeholderPhoto } from '../types/discover'
import type { DiscoverProfile } from '../types/discover'

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
  const items = ref<AppNotification[]>([
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
  ])

  const unreadCount = computed(() => items.value.filter((n) => !n.read).length)

  const addMatch = (profile: DiscoverProfile) => {
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

  const markAllRead = () => {
    items.value.forEach((n) => (n.read = true))
  }

  return { items, unreadCount, addMatch, markAllRead }
})