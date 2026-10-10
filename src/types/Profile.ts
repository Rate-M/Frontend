export type Gender = 'male' | 'female' | 'non_binary' | 'other'

export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces'

export type LookingFor = 'relationship' | 'casual' | 'friendship' | 'not_sure'

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
  zodiac: ZodiacSign | ''
  bio: string
  interests: string[]
  photos: ProfilePhoto[]
  interestedIn: Gender[]
  lookingFor: LookingFor | ''
  ageMin: number
  ageMax: number
  maxDistanceKm: number
  visible: boolean
}

export interface LegalAcceptance {
  termsVersion: string
  privacyVersion: string
  acceptedAt: string
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

export const LOOKING_FOR_OPTIONS: { value: LookingFor; label: string }[] = [
  { value: 'relationship', label: 'Una relación' },
  { value: 'casual', label: 'Algo casual' },
  { value: 'friendship', label: 'Amistad' },
  { value: 'not_sure', label: 'Aún no lo sé' }
]

export const ZODIAC_OPTIONS: { value: ZodiacSign; label: string }[] = [
  { value: 'aries', label: 'Aries' },
  { value: 'taurus', label: 'Tauro' },
  { value: 'gemini', label: 'Géminis' },
  { value: 'cancer', label: 'Cáncer' },
  { value: 'leo', label: 'Leo' },
  { value: 'virgo', label: 'Virgo' },
  { value: 'libra', label: 'Libra' },
  { value: 'scorpio', label: 'Escorpio' },
  { value: 'sagittarius', label: 'Sagitario' },
  { value: 'capricorn', label: 'Capricornio' },
  { value: 'aquarius', label: 'Acuario' },
  { value: 'pisces', label: 'Piscis' }
]

export const PHOTO_TYPES: string[] = ['image/jpeg', 'image/png']

export const LIMITS = {
  minPhotos: 1,
  maxPhotos: 6,
  maxPhotoMB: 5,
  bio: 500,
  displayName: 100,
  interest: 40,
  maxInterests: 10
} as const

export function emptyProfile(): ProfileFormData {
  return {
    displayName: '',
    birthDate: '',
    gender: '',
    pronouns: '',
    occupation: '',
    zodiac: '',
    bio: '',
    interests: [],
    photos: [],
    interestedIn: [],
    lookingFor: '',
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