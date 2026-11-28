// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, expect, it, vi } from 'vitest'
import DateCheckin from '../components/dates/DateCheckin.vue'
import { useAuthStore } from '../stores/auth'

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })

it('permite confirmar manualmente y espera la confirmación de la otra persona', async () => {
  const pinia = createPinia()
  useAuthStore(pinia).login('jwt', { id: 'user-a' })
  const request = vi.fn()
    .mockResolvedValueOnce(Response.json({ status: 'failed', manual: { available: true, me: false } }))
    .mockResolvedValueOnce(Response.json({ status: 'failed', manual: { available: true, me: true } }))
    .mockResolvedValueOnce(Response.json({ status: 'confirmed', confirmationMethod: 'manual' }))
  vi.stubGlobal('fetch', request)
  const view = mount(DateCheckin, { props: { matchId: 'match', invitationId: 'date' }, global: { plugins: [pinia] } })
  try {
    await flushPromises()
    await view.get('button').trigger('click')
    await flushPromises()
    expect(request).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/date\/manual-confirmations$/),
      expect.objectContaining({ method: 'POST' }))
    expect(view.text()).toContain('Falta la otra persona')
    await view.get('button').trigger('click')
    await flushPromises()
    expect(view.text()).toContain('Asistencia confirmada por ambas personas')
  } finally {
    view.unmount()
  }
})
