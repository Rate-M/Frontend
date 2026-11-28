import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getVerificationStatus, UnauthorizedError } from '../services/verification.services'
import type { DocumentType, VerificationStatus } from '../types/verification'

export const useVerificationStore = defineStore('verification', () => {
  const status = ref<VerificationStatus | null>(null)
  const loading = ref(false)
  const error = ref<'network' | 'unauthorized' | null>(null)
  const notice = ref<{ type: 'success' | 'error'; message: string } | null>(null)
  let polling: ReturnType<typeof setInterval> | undefined
  let generation = 0

  const clearNotice = () => { notice.value = null }

  const stopPolling = () => {
    clearInterval(polling)
    polling = undefined
  }

  const fetchStatus = async () => {
    const currentRequest = ++generation
    loading.value = true
    error.value = null
    try {
      const next = await getVerificationStatus()
      if (generation !== currentRequest) return null
      if (status.value === 'pending' && next === 'approved') {
        notice.value = { type: 'success', message: 'Tu verificación de identidad fue aprobada.' }
      } else if (status.value === 'pending' && next === 'rejected') {
        notice.value = { type: 'error', message: 'La verificación fue rechazada.' }
      }
      status.value = next
      verified.value = next === 'approved'
      if (next !== 'pending') stopPolling()
      return next
    } catch (cause) {
      if (generation === currentRequest) {
        error.value = cause instanceof UnauthorizedError ? 'unauthorized' : 'network'
        if (error.value === 'unauthorized') stopPolling()
      }
      return null
    } finally {
      if (generation === currentRequest) loading.value = false
    }
  }

  const startPolling = () => {
    stopPolling()
    polling = setInterval(() => {
      if (!loading.value) void fetchStatus()
    }, 5000)
  }

  const biometricConsent = ref<{ version: string; acceptedAt: string } | null>(null)
  const verified = ref(false)
  const verifiedAt = ref<string | null>(null)
  const documentType = ref<DocumentType | null>(null)

  const grantBiometricConsent = (version: string) => {
    biometricConsent.value = { version, acceptedAt: new Date().toISOString() }
  }

  const revokeBiometricConsent = () => {
    biometricConsent.value = null
  }

  const markApproved = (type: DocumentType) => {
    status.value = 'approved'
    verified.value = true
    verifiedAt.value = new Date().toISOString()
    documentType.value = type
  }

  const reset = () => {
    generation++
    stopPolling()
    status.value = null
    loading.value = false
    error.value = null
    clearNotice()
    biometricConsent.value = null
    verified.value = false
    verifiedAt.value = null
    documentType.value = null
  }

  return {
    status, loading, error, notice, fetchStatus, startPolling, stopPolling, clearNotice,
    biometricConsent,
    verified,
    verifiedAt,
    documentType,
    grantBiometricConsent,
    revokeBiometricConsent,
    markApproved,
    reset
  }
})