import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import VerificationBadge from '../VerificationBadge.vue'
import VerificationToast from '../VerificationToast.vue'
import { useVerificationStore } from '../../stores/verification'
import { getVerificationStatus } from '../../services/verification.service'

// MOCK del servicio: nosotros decidimos qué "responde el backend"
vi.mock('../../services/verification.service', () => ({
  getVerificationStatus: vi.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {}
}))

const mockBackend = (status: 'idle' | 'pending' | 'approved' | 'rejected') =>
  vi.mocked(getVerificationStatus).mockResolvedValue(status)

let pinia: ReturnType<typeof createPinia>

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

const mountWithPinia = (component: object, props = {}) =>
  mount(component, { props, global: { plugins: [pinia] } })

describe('indicador de estado (VerificationBadge)', () => {
  it.each([
    ['idle', 'Sin verificar'],
    ['pending', 'Verificación pendiente'],
    ['approved', 'Verificada'],
    ['rejected', 'Verificación rechazada']
  ] as const)('muestra el texto correcto para el estado %s', (status, label) => {
    const wrapper = mountWithPinia(VerificationBadge, { statusOverride: status })

    expect(wrapper.text()).toContain(label)
    expect(wrapper.find('.v-badge').classes()).toContain(`v-badge-${status}`)
  })

  it('no muestra nada si todavía no se conoce el estado', () => {
    const wrapper = mountWithPinia(VerificationBadge)

    expect(wrapper.find('.v-badge').exists()).toBe(false)
  })

  it('se actualiza solo cuando el backend (mock) aprueba la cuenta', async () => {
    const store = useVerificationStore()
    store.status = 'pending'
    const wrapper = mountWithPinia(VerificationBadge)
    expect(wrapper.text()).toContain('Verificación pendiente')

    mockBackend('approved')
    await store.fetchStatus()
    await nextTick()

    expect(wrapper.text()).toContain('Verificada')
    expect(wrapper.find('.v-badge').classes()).toContain('v-badge-approved')
  })

  it('se actualiza solo cuando el backend (mock) rechaza la cuenta', async () => {
    const store = useVerificationStore()
    store.status = 'pending'
    const wrapper = mountWithPinia(VerificationBadge)

    mockBackend('rejected')
    await store.fetchStatus()
    await nextTick()

    expect(wrapper.text()).toContain('Verificación rechazada')
    expect(wrapper.find('.v-badge').classes()).toContain('v-badge-rejected')
  })
})

describe('notificación (VerificationToast)', () => {
  it('no aparece mientras no haya cambios', () => {
    const wrapper = mountWithPinia(VerificationToast)

    expect(wrapper.find('.toast').exists()).toBe(false)
  })

  it('aparece en verde cuando pasa de pendiente a aprobada', async () => {
    const store = useVerificationStore()
    store.status = 'pending'
    const wrapper = mountWithPinia(VerificationToast)

    mockBackend('approved')
    await store.fetchStatus()
    await nextTick()

    const toast = wrapper.find('.toast')
    expect(toast.exists()).toBe(true)
    expect(toast.classes()).toContain('toast-success')
    expect(toast.text()).toContain('aprobada')
  })

  it('aparece en rojo cuando pasa de pendiente a rechazada', async () => {
    const store = useVerificationStore()
    store.status = 'pending'
    const wrapper = mountWithPinia(VerificationToast)

    mockBackend('rejected')
    await store.fetchStatus()
    await nextTick()

    const toast = wrapper.find('.toast')
    expect(toast.classes()).toContain('toast-error')
    expect(toast.text()).toContain('rechazada')
  })

  it('no aparece si el estado sigue igual (pendiente)', async () => {
    const store = useVerificationStore()
    store.status = 'pending'
    const wrapper = mountWithPinia(VerificationToast)

    mockBackend('pending')
    await store.fetchStatus()
    await nextTick()

    expect(wrapper.find('.toast').exists()).toBe(false)
  })

  it('se cierra al hacer clic en la X', async () => {
    const store = useVerificationStore()
    store.status = 'pending'
    const wrapper = mountWithPinia(VerificationToast)
    mockBackend('approved')
    await store.fetchStatus()
    await nextTick()

    await wrapper.find('.toast-close').trigger('click')

    expect(wrapper.find('.toast').exists()).toBe(false)
  })

  it('se oculta solo a los 6 segundos', async () => {
    const store = useVerificationStore()
    store.status = 'pending'
    const wrapper = mountWithPinia(VerificationToast)
    mockBackend('rejected')
    await store.fetchStatus()
    await nextTick()
    expect(wrapper.find('.toast').exists()).toBe(true)

    vi.advanceTimersByTime(6000)
    await nextTick()

    expect(wrapper.find('.toast').exists()).toBe(false)
  })
})