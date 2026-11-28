// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import StreakBanner from '../components/chat/StreakBanner.vue'
import { useChatStore } from '../stores/chat'
import type { ChatMessage } from '../types/chat'

const threshold = ref<number | null>(3)
vi.mock('../composables/useStreakThreshold', () => ({
  useStreakThreshold: () => ({ threshold, loading: ref(false) }),
}))

const conversationId = 'match-de-prueba'
const now = new Date(2026, 10, 27, 12)

function messagesOn(daysAgo: number, ...senders: ChatMessage['from'][]): ChatMessage[] {
  const date = new Date(2026, 10, 27 - daysAgo, 10)
  return senders.map((from, index) => ({
    id: `${daysAgo}-${index}`,
    sentAt: date.getTime(),
    text: 'Hola',
    from,
  }))
}

function renderBanner(messages: ChatMessage[], exists = true, streakDays?: number) {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(now)
  const pinia = createPinia()
  const router = createRouter({ history: createMemoryHistory(), routes: [] })
  useChatStore(pinia).conversations = exists
    ? [{ id: conversationId, name: 'Alex', photo: '', online: false, unread: 0, messages, streakDays }]
    : []
  return mount(StreakBanner, {
    props: { conversationId },
    global: { plugins: [pinia, router] },
  })
}

afterEach(() => {
  threshold.value = 3
  vi.useRealTimers()
})

describe('Indicador de racha del chat', () => {
  it('muestra los días consecutivos y señala cuando ambos ya escribieron hoy', () => {
    const banner = renderBanner([...messagesOn(1, 'me', 'them'), ...messagesOn(0, 'them', 'me')])
    expect(banner.get('section').classes()).toContain('done')
    expect(banner.text()).toContain('2 días seguidos')
    expect(banner.text()).toContain('Hoy ya cumplieron')
    expect(banner.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('2')
    banner.unmount()
  })

  it('conserva la racha de ayer y marca hoy pendiente con mensajes de un solo lado', () => {
    const banner = renderBanner([...messagesOn(1, 'me', 'them'), ...messagesOn(0, 'me', 'me')])
    expect(banner.get('section').classes()).toContain('pending')
    expect(banner.text()).toContain('1 día seguido')
    expect(banner.text()).toContain('Escribe hoy para no perder la racha')
    banner.unmount()
  })

  it('muestra racha cero después de saltarse un día', () => {
    const banner = renderBanner(messagesOn(2, 'me', 'them'))
    expect(banner.text()).toContain('Sin racha por ahora')
    expect(banner.find('.count').exists()).toBe(false)
    expect(banner.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')
    banner.unmount()
  })

  it('habilita la invitación cuando alcanza el umbral configurado', () => {
    threshold.value = 5
    const banner = renderBanner([0, 1, 2, 3].flatMap((day) => messagesOn(day, 'me', 'them')))
    expect(banner.get('.invite-btn').attributes('disabled')).toBeDefined()
    expect(banner.get('[role="progressbar"]').attributes('aria-valuemax')).toBe('5')
    banner.unmount()

    threshold.value = 4
    const unlocked = renderBanner([0, 1, 2, 3].flatMap((day) => messagesOn(day, 'me', 'them')))
    expect(unlocked.get('.invite-btn').attributes('disabled')).toBeUndefined()
    unlocked.unmount()
  })

  it('mantiene la invitación bloqueada si no hay umbral disponible', () => {
    threshold.value = null
    const banner = renderBanner([0, 1, 2, 3, 4].flatMap((day) => messagesOn(day, 'me', 'them')))
    expect(banner.get('.invite-btn').attributes('disabled')).toBeDefined()
    expect(banner.text()).toContain('No se pudo verificar la racha mínima')
    banner.unmount()
  })

  it('muestra la racha guardada aunque el historial disponible sea limitado', () => {
    const banner = renderBanner(messagesOn(0, 'me'), true, 4)
    expect(banner.text()).toContain('4 días seguidos')
    expect(banner.text()).toContain('La racha se actualiza al cerrar cada día')
    expect(banner.find('.invite-btn').exists()).toBe(false)
    banner.unmount()
  })

  it('oculta el indicador cuando la conversación ya no existe', () => {
    const banner = renderBanner([], false)
    expect(banner.find('section').exists()).toBe(false)
    banner.unmount()
  })
})
