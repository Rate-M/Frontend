const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')

export interface ChatInvitation {
  id: string
  direction: 'sent' | 'received'
  placeId: string
  startsAt: string
  note: string
  status: 'pending' | 'accepted' | 'declined'
  revision: number
  awaitingYourResponse: boolean
}

export type InvitationResponse = { action: 'accept' | 'decline'; revision: number }
  | { action: 'propose'; revision: number; startsAt: string }

export class InvitationError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function request<T>(matchId: string, token: string, signal: AbortSignal, id?: string, body?: InvitationResponse): Promise<T> {
  const path = '/matches/' + encodeURIComponent(matchId) + '/invitations'
  const response = await fetch(apiUrl + path + (id ? '/' + encodeURIComponent(id) : ''), {
    method: body ? 'PATCH' : 'GET',
    headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result) {
    throw new InvitationError(result?.message ?? 'No pudimos consultar o actualizar la cita.', response.status)
  }
  return result
}

export function listInvitations(matchId: string, token: string, signal: AbortSignal) {
  return request<{ invitations: ChatInvitation[] }>(matchId, token, signal)
}

export function respondToInvitation(matchId: string, token: string, signal: AbortSignal, id: string, body: InvitationResponse) {
  return request<ChatInvitation>(matchId, token, signal, id, body)
}
