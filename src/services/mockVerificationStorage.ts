import type { CaptureSlot } from '../types/verification'

const PREFIX = 'rm:verification:'

export const mockVerificationStorage = {
  save(slot: CaptureSlot, dataUrl: string): boolean {
    try {
      sessionStorage.setItem(PREFIX + slot, dataUrl)
      return true
    } catch (error) {
      console.error('No se pudo guardar la captura:', error)
      return false
    }
  },

  get(slot: CaptureSlot): string | null {
    return sessionStorage.getItem(PREFIX + slot)
  },

  remove(slot: CaptureSlot) {
    sessionStorage.removeItem(PREFIX + slot)
  },

  purgeAll() {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(PREFIX)) sessionStorage.removeItem(key)
    }
  }
}