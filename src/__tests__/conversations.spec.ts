// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { loadConversations, loadHistory } from '../services/conversations'

afterEach(() => vi.unstubAllGlobals())

it('combina matches sin mensajes y conversaciones activas, y ordena el historial para el chat', async () => {
  const message = { id: 'm2', senderId: 'self', text: 'Hola', createdAt: '2026-11-27T12:00:00Z' }
  const fetchMock = vi.fn(async (url: string) => {
    const path = new URL(url).pathname
    if (path === '/api/matches') return Response.json({
      matches: [{ id: 'active', users: ['self', 'person'] }, { id: 'new', users: ['other', 'self'] }],
      nextCursor: null,
    })
    if (path === '/api/conversations') return Response.json({
      conversations: [{ id: 'active', otherUserId: 'person', lastMessage: message, streakDays: 4 }],
      nextCursor: null,
    })
    if (path === '/api/profiles/person') return Response.json({ name: 'Alex', photos: ['/uploads/profiles/photo.jpg'] })
    if (path === '/api/matches/active/messages') return Response.json({
      readThrough: { me: 'm1', other: null },
      messages: [message, { ...message, id: 'm1', senderId: 'person', createdAt: '2026-11-27T11:00:00Z' }],
      nextCursor: null,
    })
    return new Response(null, { status: 404 })
  })
  vi.stubGlobal('fetch', fetchMock)
  const { signal } = new AbortController()

  const [active, fresh] = await loadConversations('jwt', 'self', signal)
  expect(active).toMatchObject({ id: 'active', name: 'Alex', streakDays: 4, messages: [{ id: 'm2', from: 'me' }] })
  expect(active?.photo).toMatch(/\/uploads\/profiles\/photo.jpg$/)
  expect(fresh).toMatchObject({ id: 'new', name: 'Tu match', messages: [] })
  const history = await loadHistory('jwt', 'self', 'active', signal)
  expect(history.readThrough).toEqual({ me: 'm1', other: null })
  expect(history.messages.map(({ id, from }) => [id, from])).toEqual([['m1', 'them'], ['m2', 'me']])
})
