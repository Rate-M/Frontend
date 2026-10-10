import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { DocumentType } from '../types/verification'

export const useVerificationStore = defineStore('verification', () => {
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
    verified.value = true
    verifiedAt.value = new Date().toISOString()
    documentType.value = type
  }

  const reset = () => {
    biometricConsent.value = null
    verified.value = false
    verifiedAt.value = null
    documentType.value = null
  }

  return {
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