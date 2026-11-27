// @vitest-environment jsdom
import { createPinia } from 'pinia'
import { afterEach, expect, it, vi } from 'vitest'
import { useAuthStore } from '../stores/auth'
import { useNotificationsStore } from '../stores/notifications'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

it('carga las páginas del backend y conserva los avisos que no pudo marcar como leídos', async () => {
  const pinia = createPinia()
  const auth = useAuthStore(pinia)
  const store = useNotificationsStore(pinia)
  auth.login('signed-token', { id: 'account' })
  const notice = (id: string) => ({ id, createdAt: '2026-11-27T12:00:00Z' })
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json({ notifications: [notice('a')], nextCursor: 'cursor' }))
    .mockResolvedValueOnce(Response.json({ notifications: [notice('b')], nextCursor: null }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetchMock)

  await store.refresh()
  expect(store.unreadCount).toBe(2)
  expect(fetchMock).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/notifications\?before=cursor$/),
    expect.objectContaining({ headers: { Authorization: 'Bearer signed-token' } }))

  await store.markAllRead()
  expect(store.items.map((item) => item.id)).toEqual(['b'])
  expect(store.error).toContain('siguen sin leer')

  await store.markAllRead()
  expect(store.unreadCount).toBe(0)
  expect(fetchMock).toHaveBeenLastCalledWith(expect.stringMatching(/\/notifications\/b\/read$/),
    expect.objectContaining({ method: 'PATCH' }))
  auth.logout()
  expect(store.items).toEqual([])
})
