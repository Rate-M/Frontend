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
    .mockResolvedValueOnce(new Response(JSON.stringify({ notifications: [], nextCursor: null })))
  vi.stubGlobal('fetch', fetchMock)
  const pinia = createPinia()
  useAuthStore(pinia).login('signed-token', { id: 'account-1' })
  const view = mount(Discover, { global: { plugins: [pinia], stubs: ['RouterLink', 'NotificationBell'] } })
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

it('pide la ubicación solo tras autorizar, registra el consentimiento y permite retirarlo', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'LOCATION_REQUIRED' }), { status: 409 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ type: 'location' })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ locationSaved: true })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ profiles: [] })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Revocado' })))
  vi.stubGlobal('fetch', fetchMock)
  const getCurrentPosition = vi.fn((success) => success({ coords: { latitude: 25.541, longitude: -103.443 } }))
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
  const pinia = createPinia()
  useAuthStore(pinia).login('signed-token', { id: 'account-1' })
  const view = mount(Discover, { global: { plugins: [pinia], stubs: ['RouterLink', 'NotificationBell'] } })
  try {
    await flushPromises()
    expect(getCurrentPosition).not.toHaveBeenCalled()
    const button = (label: string) => view.findAll('button').find((entry) => entry.text() === label)!
    await button('Autorizar y compartir ubicación').trigger('click')
    await flushPromises()
    expect(getCurrentPosition).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/consents\/location$/), expect.objectContaining({
      method: 'POST',
    }))
    expect(fetchMock).toHaveBeenNthCalledWith(3, expect.stringMatching(/\/profiles\/me\/location$/), expect.objectContaining({
      method: 'PUT', body: JSON.stringify({ latitude: 25.54, longitude: -103.44 }),
    }))
    await button('Retirar permiso de ubicación').trigger('click')
    await flushPromises()
    expect(fetchMock).toHaveBeenNthCalledWith(5, expect.stringMatching(/\/consents\/location$/), expect.objectContaining({
      method: 'DELETE',
    }))
    expect(button('Autorizar y compartir ubicación').exists()).toBe(true)
  } finally {
    view.unmount()
  }
})
