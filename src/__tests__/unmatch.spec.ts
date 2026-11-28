// @vitest-environment jsdom
import { createPinia } from 'pinia'
import { afterEach, expect, it, vi } from 'vitest'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  localStorage.clear()
})

it('conserva el chat si falla la API y lo quita cuando confirma el cambio', async () => {
  vi.useFakeTimers()
  const pinia = createPinia()
  useAuthStore(pinia).login('jwt', { id: 'account' })
  const store = useChatStore(pinia)
  store.conversations = [{ id: 'match-1', name: 'Alex', photo: '', online: false, unread: 0, messages: [] }]
  const request = vi.fn()
    .mockResolvedValueOnce(Response.json({ message: 'Intenta de nuevo' }, { status: 503 }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', request)

  await expect(store.unmatch('match-1')).rejects.toThrow('Intenta de nuevo')
  expect(store.getById('match-1')).toBeDefined()
  await expect(store.unmatch('match-1')).resolves.toBe(true)
  expect(store.getById('match-1')).toBeUndefined()
  expect(request).toHaveBeenLastCalledWith(expect.stringMatching(/\/matches\/match-1$/), {
    method: 'DELETE', headers: { Authorization: 'Bearer jwt' },
  })
})
