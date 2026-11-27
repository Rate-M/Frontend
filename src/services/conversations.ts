import { placeholderPhoto } from '../types/discover'
import type { ChatMessage, Conversation } from '../types/chat'

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')

interface ApiMessage {
  id: string
  senderId: string
  text: string
  createdAt: string
}

interface Match {
  id: string
  users: string[]
}

interface ActiveConversation {
  id: string
  otherUserId: string
  lastMessage: ApiMessage
  streakDays: number
}

async function get<T>(path: string, token: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(apiUrl + path, { headers: { Authorization: 'Bearer ' + token }, signal })
  if (!response.ok) throw new Error('No pudimos consultar tus conversaciones.')
  return response.json()
}

async function allPages<T>(
  path: string, token: string, signal: AbortSignal,
  items: (page: Record<string, unknown>) => T[],
) {
  const result: T[] = []
  let before: string | null = null
  do {
    const page: Record<string, unknown> = await get(
      path + (before ? '?before=' + encodeURIComponent(before) : ''), token, signal,
    )
    result.push(...items(page))
    before = typeof page.nextCursor === 'string' ? page.nextCursor : null
  } while (before)
  return result
}

function messageFromApi(message: ApiMessage, userId: string): ChatMessage {
  const from = message.senderId === userId ? 'me' : 'them'
  return {
    id: message.id, from, text: message.text, sentAt: Date.parse(message.createdAt),
    ...(from === 'me' ? { status: 'sent' } : {}),
  }
}

export async function loadConversations(token: string, userId: string, signal: AbortSignal): Promise<Conversation[]> {
  const [matches, active] = await Promise.all([
    allPages('/matches', token, signal, (page) => page.matches as Match[]),
    allPages('/conversations', token, signal, (page) => page.conversations as ActiveConversation[]),
  ])
  const byMatch = new Map(active.map((conversation) => [conversation.id, conversation]))
  const apiOrigin = new URL(apiUrl, window.location.origin).origin
  return Promise.all(matches.map(async (match): Promise<Conversation> => {
    const conversation = byMatch.get(match.id)
    const otherId = conversation?.otherUserId ?? match.users.find((id) => id !== userId)
    const profile = otherId
      ? await get<{ name: string; photos: string[] }>('/profiles/' + encodeURIComponent(otherId), token, signal).catch(() => null)
      : null
    const name = profile?.name || 'Tu match'
    return {
      id: match.id, name, online: false, unread: 0,
      photo: profile?.photos[0]
        ? new URL(profile.photos[0], apiOrigin).href
        : placeholderPhoto('Match', '#B3202E', '#F8D5D2'),
      messages: conversation ? [messageFromApi(conversation.lastMessage, userId)] : [],
      streakDays: conversation?.streakDays ?? 0,
    }
  }))
}

export async function loadHistory(token: string, userId: string, matchId: string, signal: AbortSignal) {
  const page = await get<{ messages: ApiMessage[]; nextCursor: string | null }>(
    '/matches/' + encodeURIComponent(matchId) + '/messages', token, signal,
  )
  return page.messages.map((message) => messageFromApi(message, userId)).reverse()
}
