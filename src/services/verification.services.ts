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

  const response = await fetch(`${API_URL}/verification/status`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })

  if (response.status === 401) throw new UnauthorizedError()

  const data = (await response.json()) as { verificationStatus: unknown }
  return normalize(data.verificationStatus)
}