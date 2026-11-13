import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useVerificationStore } from '../stores/verification'

export const LOGIN_PATH = '/login'
export const IDENTITY_PATH = '/verificacion' 
export const STATUS_PATH = '/verificacion/estado'

export async function verificationGuard(
  to: RouteLocationNormalized
): Promise<boolean | RouteLocationRaw> {
  const auth = useAuthStore()

  if ((to.meta.requiresAuth || to.meta.requiresVerified) && !auth.isAuthenticated) {
    return { path: LOGIN_PATH }
  }

  if (to.meta.requiresVerified) {
    const verification = useVerificationStore()

    if (verification.status === null) {
      await verification.fetchStatus()
    }

    if (verification.error === 'unauthorized') {
      auth.logout()
      return { path: LOGIN_PATH }
    }

    if (verification.status === 'approved') return true

    if (verification.status === 'idle') return { path: IDENTITY_PATH }

    return { path: STATUS_PATH }
  }

  return true
}