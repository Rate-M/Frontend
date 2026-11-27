// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, expect, it, vi } from 'vitest'
import Discover from '../views/Discover.vue'
import { useAuthStore } from '../stores/auth'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  localStorage.clear()
})

it('carga perfiles reales, conserva la tarjeta si falla el envío y muestra el match confirmado', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  const person = {
    user: 'account-2', name: 'Alex', age: 25, distanceKm: 3,
    bio: '', interests: [], photos: ['/uploads/profiles/alex.jpg'],
  }
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ profiles: [person] })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Intenta otra vez' }), { status: 503 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ match: { id: 'match-1' } }), { status: 201 }))
  vi.stubGlobal('fetch', fetchMock)
  const pinia = createPinia()
  useAuthStore(pinia).login('signed-token', { id: 'account-1' })
  const view = mount(Discover, { global: { plugins: [pinia], stubs: ['RouterLink'] } })
  try {
    await flushPromises()
    expect(view.text()).toContain('Alex')
    expect(fetchMock).toHaveBeenNthCalledWith(1, expect.stringMatching(/\/discovery$/), expect.objectContaining({
      headers: { Authorization: 'Bearer signed-token' },
    }))
    await view.get('button[aria-label="Me gusta"]').trigger('click')
    await flushPromises()
    expect(view.get('[role="alert"]').text()).toBe('Intenta otra vez')
    expect(view.text()).toContain('Alex')
    await view.get('button[aria-label="Me gusta"]').trigger('click')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(320)
    expect(view.get('[role="dialog"]').text()).toContain('match')
    expect(fetchMock).toHaveBeenNthCalledWith(3, expect.stringMatching(/\/swipes$/), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ to: 'account-2', action: 'like' }),
    }))
  } finally {
    view.unmount()
  }
})
