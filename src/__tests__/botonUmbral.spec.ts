// @vitest-environment jsdom
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { defineComponent, h } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import StreakBanner from '../components/chat/StreakBanner.vue'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { useStreakThreshold } from '../composables/useStreakThreshold'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

function withThreshold(token: string | null) {
  const pinia = createPinia()
  const auth = useAuthStore(pinia)
  if (token) auth.login(token, { id: 'yo' })
  let result!: ReturnType<typeof useStreakThreshold>
  const Host = defineComponent({ setup() { result = useStreakThreshold(); return () => h('div') } })
  const wrapper = mount(Host, { global: { plugins: [pinia] } })
  return { wrapper, auth, get state() { return result } }
}

const respondWith = (body: unknown, status = 200) => vi.fn(async () => Response.json(body, { status }))

describe('useStreakThreshold: configuración del umbral', () => {
  it.each([3, 4, 5])('acepta el umbral válido de %i días', async (days) => {
    const fetchMock = respondWith({ thresholdDays: days })
    vi.stubGlobal('fetch', fetchMock)
    const ctx = withThreshold('jwt')
    await flushPromises()
    expect(ctx.state.threshold.value).toBe(days)
    expect(ctx.state.loading.value).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/config\/streak$/), expect.objectContaining({
      headers: { Authorization: 'Bearer jwt' },
    }))
    ctx.wrapper.unmount()
  })

  it.each([[2], [6], [0], [-1], [3.5], ['4'], [null]])('rechaza el valor inválido %j y deja el botón bloqueado', async (value) => {
    vi.stubGlobal('fetch', respondWith({ thresholdDays: value }))
    const ctx = withThreshold('jwt')
    await flushPromises()
    expect(ctx.state.threshold.value).toBeNull()
    ctx.wrapper.unmount()
  })

  it('mantiene el umbral nulo si el servidor responde con error', async () => {
    vi.stubGlobal('fetch', respondWith({ message: 'boom' }, 500))
    const ctx = withThreshold('jwt')
    await flushPromises()
    expect(ctx.state.threshold.value).toBeNull()
    expect(ctx.state.loading.value).toBe(false)
    ctx.wrapper.unmount()
  })

  it('mantiene el umbral nulo si falla la red', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network') }))
    const ctx = withThreshold('jwt')
    await flushPromises()
    expect(ctx.state.threshold.value).toBeNull()
    expect(ctx.state.loading.value).toBe(false)
    ctx.wrapper.unmount()
  })

  it('no consulta nada sin sesión', async () => {
    const fetchMock = respondWith({ thresholdDays: 3 })
    vi.stubGlobal('fetch', fetchMock)
    const ctx = withThreshold(null)
    await flushPromises()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(ctx.state.threshold.value).toBeNull()
    expect(ctx.state.loading.value).toBe(false)
    ctx.wrapper.unmount()
  })

  it('reinicia el umbral al cerrar sesión', async () => {
    vi.stubGlobal('fetch', respondWith({ thresholdDays: 4 }))
    const ctx = withThreshold('jwt')
    await flushPromises()
    expect(ctx.state.threshold.value).toBe(4)
    ctx.auth.logout()
    await flushPromises()
    expect(ctx.state.threshold.value).toBeNull()
    ctx.wrapper.unmount()
  })
})

describe('Botón "Invitar a cita" con el umbral real', () => {
  const messagesFor = (days: number) => Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(10, 0, 0, 0)
    return [
      { id: `me-${i}`, from: 'me' as const, text: 'hola', sentAt: d.getTime() },
      { id: `them-${i}`, from: 'them' as const, text: 'hola', sentAt: d.getTime() + 60_000 },
    ]
  }).flat()

  async function render(streakDays: number, thresholdDays: number | 'error') {
    vi.stubGlobal('fetch', thresholdDays === 'error'
      ? respondWith({}, 500)
      : respondWith({ thresholdDays }))
    const pinia = createPinia()
    useAuthStore(pinia).login('jwt', { id: 'yo' })
    useChatStore(pinia).conversations = [
      { id: 'm1', name: 'Alex', photo: '', online: false, unread: 0, messages: messagesFor(streakDays) },
    ]
    const wrapper = mount(StreakBanner, {
      props: { conversationId: 'm1' },
      global: { plugins: [pinia], stubs: { RouterLink: RouterLinkStub } },
    })
    await flushPromises()
    return wrapper
  }

  it.each([[3, 3], [4, 4], [5, 5]])('se desbloquea justo al llegar a la racha mínima (%i de %i)', async (days, threshold) => {
    const w = await render(days, threshold)
    expect(w.get('.invite-btn').attributes('disabled')).toBeUndefined()
    w.unmount()
  })

  it.each([[2, 3], [3, 4], [4, 5]])('sigue bloqueado un día antes del mínimo (%i de %i)', async (days, threshold) => {
    const w = await render(days, threshold)
    expect(w.get('.invite-btn').attributes('disabled')).toBeDefined()
    w.unmount()
  })

  it('queda bloqueado y avisa si no se puede obtener el umbral', async () => {
    const w = await render(5, 'error')
    expect(w.get('.invite-btn').attributes('disabled')).toBeDefined()
    expect(w.text()).toContain('No se pudo verificar la racha mínima')
    w.unmount()
  })
})