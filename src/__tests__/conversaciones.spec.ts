// @vitest-environment jsdom
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ConversationItem from '../components/chat/ConversationItem.vue'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import type { ChatMessage, Conversation } from '../types/chat'
import { formatListTime } from '../utils/chatTime'

const NOW = new Date(2026, 10, 27, 15, 0)

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
})

const msg = (id: string, from: ChatMessage['from'], sentAt: number, text = 'Hola'): ChatMessage => ({ id, from, text, sentAt })
const conv = (id: string, messages: ChatMessage[], extra: Partial<Conversation> = {}): Conversation => ({
  id, name: id, photo: '', online: false, unread: 0, messages, ...extra,
})

describe('Store de chat: conversaciones activas', () => {
  it('separa matches nuevos (sin mensajes) de conversaciones activas', () => {
    const store = useChatStore(createPinia())
    store.conversations = [conv('nuevo', []), conv('activa', [msg('1', 'them', 1000)])]
    expect(store.active.map((c) => c.id)).toEqual(['activa'])
    expect(store.newMatches.map((c) => c.id)).toEqual(['nuevo'])
  })

  it('ordena las activas por el último mensaje, la más reciente primero', () => {
    const store = useChatStore(createPinia())
    store.conversations = [
      conv('vieja', [msg('a', 'them', 1000)]),
      conv('reciente', [msg('b', 'me', 5000)]),
      conv('media', [msg('c', 'them', 3000), msg('d', 'me', 3500)]),
    ]
    expect(store.active.map((c) => c.id)).toEqual(['reciente', 'media', 'vieja'])
  })

  it('suma los mensajes no leídos y los limpia al marcar como leída', () => {
    const store = useChatStore(createPinia())
    store.conversations = [
      conv('a', [msg('1', 'them', 1)], { unread: 2 }),
      conv('b', [msg('2', 'them', 2)], { unread: 3 }),
    ]
    expect(store.totalUnread).toBe(5)
    store.markRead('a')
    expect(store.totalUnread).toBe(3)
    store.markRead('no-existe')
    expect(store.totalUnread).toBe(3)
  })

  it('devuelve lista vacía sin conversaciones', () => {
    const store = useChatStore(createPinia())
    store.conversations = []
    expect(store.active).toEqual([])
    expect(store.newMatches).toEqual([])
    expect(store.totalUnread).toBe(0)
  })

  it('pide iniciar sesión si se refresca sin token', async () => {
    const store = useChatStore(createPinia())
    await store.refresh()
    expect(store.error).toBe('Inicia sesión para ver tus conversaciones.')
  })

  it('muestra error y no pierde la sesión si la API falla al refrescar', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })))
    const pinia = createPinia()
    useAuthStore(pinia).login('jwt', { id: 'yo' })
    const store = useChatStore(pinia)
    await store.refresh()
    expect(store.error).toBe('No pudimos cargar tus conversaciones.')
    expect(store.loading).toBe(false)
    vi.unstubAllGlobals()
  })

  it('vacía las conversaciones al cambiar de cuenta', () => {
    const pinia = createPinia()
    const auth = useAuthStore(pinia)
    auth.login('jwt-a', { id: 'a' })
    const store = useChatStore(pinia)
    store.conversations = [conv('x', [msg('1', 'them', 1)])]
    auth.login('jwt-b', { id: 'b' })
    expect(store.conversations).toEqual([])
  })
})

describe('ConversationItem', () => {
  const mountItem = (c: Conversation) => mount(ConversationItem, {
    props: { conversation: c },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })

  it('muestra nombre, vista previa con "Tú:" y contador de no leídos', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    const w = mountItem(conv('c1', [msg('1', 'me', NOW.getTime() - 60_000, 'Nos vemos')], { name: 'Alex', unread: 3 }))
    expect(w.text()).toContain('Alex')
    expect(w.text()).toContain('Tú: Nos vemos')
    expect(w.get('.badge').text()).toBe('3')
    expect(w.getComponent(RouterLinkStub).props('to')).toBe('/chat/c1')
  })

  it('no antepone "Tú:" si el último mensaje es de la otra persona', () => {
    const w = mountItem(conv('c2', [msg('1', 'them', Date.now(), 'Hola!')], { name: 'Sofi' }))
    expect(w.get('.preview').text()).toBe('Hola!')
    expect(w.find('.badge').exists()).toBe(false)
  })

  it('no se pinta si la conversación aún no tiene mensajes', () => {
    const w = mountItem(conv('c3', []))
    expect(w.find('.item').exists()).toBe(false)
  })

  it('indica en línea solo cuando corresponde', () => {
    const on = mountItem(conv('c4', [msg('1', 'them', Date.now())], { online: true }))
    const off = mountItem(conv('c5', [msg('1', 'them', Date.now())], { online: false }))
    expect(on.find('.online-dot').exists()).toBe(true)
    expect(off.find('.online-dot').exists()).toBe(false)
  })

  it('muestra el chip de racha guardada por el servidor y lo oculta en cero', () => {
    const withStreak = mountItem(conv('c6', [msg('1', 'them', Date.now())], { streakDays: 4 }))
    expect(withStreak.get('.streak-chip').text()).toBe('4')
    const none = mountItem(conv('c7', [msg('1', 'them', Date.now())], { streakDays: 0 }))
    expect(none.find('.streak-chip').exists()).toBe(false)
  })
})

describe('formatListTime', () => {
  it('muestra la hora si es de hoy, "Ayer" si fue ayer y dd/mm si es más antiguo', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    expect(formatListTime(new Date(2026, 10, 27, 9, 5).getTime())).toBe('09:05')
    expect(formatListTime(new Date(2026, 10, 26, 23, 59).getTime())).toBe('Ayer')
    expect(formatListTime(new Date(2026, 10, 20, 12, 0).getTime())).toBe('20/11')
  })
})