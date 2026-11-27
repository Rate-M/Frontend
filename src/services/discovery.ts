import type { DiscoverProfile } from '../types/discover'

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')

type PublicProfile = Pick<DiscoverProfile, 'name' | 'age' | 'distanceKm' | 'bio' | 'interests' | 'photos'> & {
  user: string
}

export class DiscoveryError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message)
  }
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options?.headers },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data) {
    throw new DiscoveryError(data?.message ?? 'No pudimos completar la solicitud.', response.status, data?.code)
  }
  return data
}

export async function loadDiscovery(token: string, signal: AbortSignal): Promise<DiscoverProfile[]> {
  const { profiles } = await request<{ profiles: PublicProfile[] }>('/discovery', token, { signal })
  const apiOrigin = new URL(apiUrl, window.location.origin).origin
  return profiles.map(({ user, photos, ...profile }) => ({
    ...profile,
    id: user,
    photos: photos.map((photo) => new URL(photo, apiOrigin).href),
    occupation: '',
    verified: true,
    likesYou: false,
  }))
}

export function saveSwipe(token: string, to: string, action: 'like' | 'pass', signal: AbortSignal) {
  return request<{ match: { id: string } | null }>('/swipes', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, action }),
    signal,
  })
}

export async function shareDiscoveryLocation(
  token: string,
  { latitude, longitude }: GeolocationCoordinates,
  signal: AbortSignal,
  onConsentGranted: () => void,
) {
  await request('/consents/location', token, { method: 'POST', signal })
  onConsentGranted()
  await request('/profiles/me/location', token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: Number(latitude.toFixed(2)), longitude: Number(longitude.toFixed(2)) }),
    signal,
  })
}

export function revokeDiscoveryLocation(token: string, signal: AbortSignal) {
  return request('/consents/location', token, { method: 'DELETE', signal })
}
