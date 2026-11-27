// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import StreakBanner from '../components/chat/StreakBanner.vue'
import { useChatStore } from '../stores/chat'
import type { ChatMessage } from '../types/chat'

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

function renderBanner(messages: ChatMessage[], exists = true) {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(now)
  const pinia = createPinia()
  const router = createRouter({ history: createMemoryHistory(), routes: [] })
  useChatStore(pinia).conversations = exists
    ? [{ id: conversationId, name: 'Alex', photo: '', online: false, unread: 0, messages }]
    : []
  return mount(StreakBanner, {
    props: { conversationId },
    global: { plugins: [pinia, router] },
  })
}

afterEach(() => vi.useRealTimers())

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

  it('oculta el indicador cuando la conversación ya no existe', () => {
    const banner = renderBanner([], false)
    expect(banner.find('section').exists()).toBe(false)
    banner.unmount()
  })
})
