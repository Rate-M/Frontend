// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, expect, it, vi } from 'vitest'
import ChatInvitations from '../components/dates/ChatInvitations.vue'
import { useAuthStore } from '../stores/auth'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

it('consulta invitaciones y confirma la respuesta usando la revisión recibida', async () => {
  const invitation = {
    id: 'cita', direction: 'received', placeId: 'venue', startsAt: '2026-12-01T19:00:00.000Z',
    note: 'Nos vemos ahí', status: 'pending', revision: 3, awaitingYourResponse: true,
  }
  const request = vi.fn()
    .mockResolvedValueOnce(Response.json({ invitations: [invitation] }))
    .mockResolvedValueOnce(Response.json({ ...invitation, status: 'accepted', revision: 4, awaitingYourResponse: false }))
  vi.stubGlobal('fetch', request)
  const pinia = createPinia()
  useAuthStore(pinia).login('jwt', { id: 'me' })
  const view = mount(ChatInvitations, { props: { matchId: 'match' }, global: { plugins: [pinia], stubs: ['DateCheckin'] } })
  try {
    await flushPromises()
    await view.findAll('button').find((button) => button.text() === 'Aceptar')!.trigger('click')
    await flushPromises()
    expect(request).toHaveBeenLastCalledWith(expect.stringMatching(/\/matches\/match\/invitations\/cita$/), expect.objectContaining({
      method: 'PATCH', body: JSON.stringify({ action: 'accept', revision: 3 }),
    }))
    expect(view.text()).toContain('Cita aceptada')
    expect(view.find('button').exists()).toBe(false)
  } finally {
    view.unmount()
  }
})
