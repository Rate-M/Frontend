export type DocumentType = 'ine' | 'passport' | 'driver_license'

export interface DocumentOption {
  value: DocumentType
  label: string
  noun: string
  description: string
  needsBack: boolean
}

export const DOCUMENT_OPTIONS: DocumentOption[] = [
  {
    value: 'ine',
    label: 'INE',
    noun: 'INE',
    description: 'Credencial para votar vigente',
    needsBack: true
  },
  {
    value: 'passport',
    label: 'Pasaporte',
    noun: 'pasaporte',
    description: 'Pasaporte vigente',
    needsBack: false
  },
  {
    value: 'driver_license',
    label: 'Licencia de conducir',
    noun: 'licencia de conducir',
    description: 'Licencia vigente con tu foto',
    needsBack: true
  }
]

export type CaptureSlot = 'front' | 'back' | 'selfie'

export type VerificationStatus = 'idle' | 'approved' | 'rejected'