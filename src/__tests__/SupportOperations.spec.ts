// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, expect, it, vi } from 'vitest'
import SupportOperations from '../components/SupportOperations.vue'
import { useAuthStore } from '../stores/auth'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

it.each(['moderator', 'admin'])('muestra las acciones de cuenta según el rol %s', async (role) => {
  const pinia = createPinia()
  useAuthStore(pinia).login('jwt', { role })
  const data = { items: [{ _id: 'example', name: 'Alex', role: 'user', status: 'active' }], nextPage: null }
  const fetchMock = vi.fn(async () => Response.json(data))
  vi.stubGlobal('fetch', fetchMock)
  const view = mount(SupportOperations, { props: { section: 'users' }, global: { plugins: [pinia] } })
  try {
    await flushPromises()
    await view.get('li button').trigger('click')
    const form = view.get('.decision')
    expect(form.text().includes('Bloquear permanentemente')).toBe(role === 'admin')
    await form.get('select').setValue('suspend')
    await form.get('textarea').setValue('Caso revisado')
    await form.trigger('submit')
    await flushPromises()
    expect(fetchMock).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/users\/example\/status$/), expect.objectContaining({
      method: 'PATCH', body: JSON.stringify({ action: 'suspend', reason: 'Caso revisado', days: 7 }),
    }))
  } finally {
    view.unmount()
  }
})
