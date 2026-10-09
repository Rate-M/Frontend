export type Gender = 'male' | 'female' | 'non_binary' | 'other'

export interface ProfilePhoto {
  id: string
  url: string          
  isPrimary: boolean
  file?: File  
}

export interface ProfileFormData {
  displayName: string
  birthDate: string  
  gender: Gender | ''
  pronouns: string
  occupation: string
  bio: string
  interests: string[]
  photos: ProfilePhoto[]
  interestedIn: Gender[]
  ageMin: number
  ageMax: number
  maxDistanceKm: number
  visible: boolean
}

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Mujer' },
  { value: 'male', label: 'Hombre' },
  { value: 'non_binary', label: 'No binario' },
  { value: 'other', label: 'Otro' }
]

export const INTERESTED_IN_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Mujeres' },
  { value: 'male', label: 'Hombres' },
  { value: 'non_binary', label: 'Personas no binarias' },
  { value: 'other', label: 'Otros' }
]

export const LIMITS = {
  maxPhotos: 6,
  maxPhotoMB: 5,
  bio: 500,
  displayName: 40,
  interest: 30,
  maxInterests: 8
} as const

export function emptyProfile(): ProfileFormData {
  return {
    displayName: '',
    birthDate: '',
    gender: '',
    pronouns: '',
    occupation: '',
    bio: '',
    interests: [],
    photos: [],
    interestedIn: [],
    ageMin: 18,
    ageMax: 99,
    maxDistanceKm: 25,
    visible: true
  }
}

export function cloneProfile(src: ProfileFormData): ProfileFormData {
  return {
    ...src,
    interests: [...src.interests],
    interestedIn: [...src.interestedIn],
    photos: src.photos.map((p) => ({ ...p }))
  }
}