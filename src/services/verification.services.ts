import type { VerificationStatus } from '../types/verification'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const VALID_STATUSES: VerificationStatus[] = ['idle', 'pending', 'approved', 'rejected']

export class UnauthorizedError extends Error {
  constructor() {
    super('No autorizado')
    this.name = 'UnauthorizedError'
  }
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

function normalize(raw: unknown): VerificationStatus {
  return VALID_STATUSES.includes(raw as VerificationStatus) ? (raw as VerificationStatus) : 'idle'
}

export async function getVerificationStatus(): Promise<VerificationStatus> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return normalize(localStorage.getItem('mock_verification_status') ?? 'pending')
  }

  const response = await fetch(`${API_URL}/auth/verification-status`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })

  if (response.status === 401) throw new UnauthorizedError()

  if (!response.ok) throw new Error('No pudimos consultar tu verificación.')

  const data = (await response.json()) as { verificationStatus: unknown }
  return normalize(data.verificationStatus)
}
export async function startIdentityVerification(token: string): Promise<string> {
  const headers = { Authorization: 'Bearer ' + token }
  const consent = await fetch(API_URL + '/consents/biometric', { method: 'POST', headers })
  if (!consent.ok) throw new Error('No pudimos registrar tu autorización biométrica.')

  const response = await fetch(API_URL + '/verification/sessions', { method: 'POST', headers })
  const data = await response.json().catch(() => null)
  if (!response.ok || typeof data?.verificationUrl !== 'string') {
    throw new Error(response.status >= 500
      ? 'El servicio de verificación no está disponible. Intenta de nuevo más tarde.'
      : data?.message ?? 'No pudimos iniciar la verificación.')
  }
  const verificationUrl = new URL(data.verificationUrl)
  if (verificationUrl.protocol !== 'https:') throw new Error('El enlace de verificación no es válido.')
  return verificationUrl.href
}
