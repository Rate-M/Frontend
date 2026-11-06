import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { useVerificationStore } from '../stores/verification'
import { clearToken, getToken } from '../services/verification.service'

export const LOGIN_PATH = '/login'
export const VERIFICATION_PATH = '/verificacion'

export async function verificationGuard(
  to: RouteLocationNormalized
): Promise<boolean | RouteLocationRaw> {
  if ((to.meta.requiresAuth || to.meta.requiresVerified) && !getToken()) {
    return { path: LOGIN_PATH }
  }

  if (to.meta.requiresVerified) {
    const verification = useVerificationStore()

    if (verification.status === null) {
      await verification.fetchStatus()
    }

    if (verification.error === 'unauthorized') {
      clearToken()
      return { path: LOGIN_PATH }
    }

    if (verification.status !== 'approved') {
      return { path: VERIFICATION_PATH }
    }
  }

  return true
}

