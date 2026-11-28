import { emptyProfile } from '../types/profile'
import type { Gender, LookingFor, ProfileFormData, ZodiacSign } from '../types/profile'

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')

const gender: Record<Gender, string> = {
  male: 'hombre', female: 'mujer', non_binary: 'no_binario', other: 'otra_identidad',
}
const lookingFor: Record<LookingFor, string> = {
  relationship: 'relacion', casual: 'conocer_personas', friendship: 'amistad', not_sure: 'no_lo_se',
}
const zodiac: Record<ZodiacSign, string> = {
  aries: 'aries', taurus: 'tauro', gemini: 'geminis', cancer: 'cancer', leo: 'leo', virgo: 'virgo',
  libra: 'libra', scorpio: 'escorpio', sagittarius: 'sagitario', capricorn: 'capricornio',
  aquarius: 'acuario', pisces: 'piscis',
}

async function save(path: string, token: string, options: RequestInit) {
  const response = await fetch(apiUrl + '/profiles/me' + path, {
    ...options,
    headers: { Authorization: 'Bearer ' + token, ...options.headers },
  }).catch(() => {
    throw new Error('No pudimos conectar con el servidor. Intenta de nuevo.')
  })
  if (!response.ok) {
    const result = await response.json().catch(() => null)
    throw new Error(result?.message ?? 'No pudimos guardar tu perfil.')
  }
}

export async function createProfile(token: string, data: ProfileFormData) {
  const body = new FormData()
  body.set('name', data.displayName.trim())
  body.set('birthDate', data.birthDate)
  body.set('gender', data.gender ? gender[data.gender] : 'prefiero_no_decir')
  body.set('interestedIn', JSON.stringify(data.interestedIn.map((value) => gender[value])))
  body.set('lookingFor', data.lookingFor ? lookingFor[data.lookingFor] : '')
  body.set('interests', JSON.stringify(data.interests))
  body.set('bio', data.bio)
  if (data.zodiac) body.set('zodiacSign', zodiac[data.zodiac])

  const photos = [
    ...data.photos.filter((photo) => photo.isPrimary),
    ...data.photos.filter((photo) => !photo.isPrimary),
  ]
  for (const photo of photos) {
    if (photo.file) body.append('photos', photo.file)
  }
  await save('', token, { method: 'POST', body })
}

export function saveProfilePreferences(token: string, data: ProfileFormData) {
  return save('/preferences', token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minAge: data.ageMin, maxAge: data.ageMax, maxDistanceKm: data.maxDistanceKm,
    }),
  })
}

function formValue<T extends string>(mapping: Record<T, string>, value?: string): T | '' {
  const match = Object.entries(mapping).find(([, apiValue]) => apiValue === value)
  return match ? match[0] as T : ''
}

export async function loadMyProfile(token: string): Promise<ProfileFormData> {
  const response = await fetch(apiUrl + '/profiles/me', { headers: { Authorization: 'Bearer ' + token } })
  const profile = await response.json().catch(() => null)
  if (!response.ok || !profile) throw new Error(profile?.message ?? 'No pudimos cargar tu perfil.')
  const origin = new URL(apiUrl, window.location.origin).origin
  return {
    ...emptyProfile(),
    displayName: profile.name,
    gender: formValue(gender, profile.gender),
    zodiac: formValue(zodiac, profile.zodiacSign),
    lookingFor: formValue(lookingFor, profile.lookingFor),
    bio: profile.bio ?? '',
    interests: profile.interests ?? [],
    interestedIn: (profile.interestedIn as string[]).map((value) => formValue(gender, value)).filter((value) => value !== ''),
    photos: (profile.photos as string[]).map((url, index) => ({ id: url, url: new URL(url, origin).href, isPrimary: index === 0 })),
    ageMin: profile.preferences?.minAge ?? 18,
    ageMax: profile.preferences?.maxAge ?? 99,
    maxDistanceKm: profile.preferences?.maxDistanceKm ?? 50,
  }
}

export function editMyProfile(token: string, data: ProfileFormData) {
  return save('', token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.displayName.trim(),
      gender: data.gender ? gender[data.gender] : 'prefiero_no_decir',
      interestedIn: data.interestedIn.map((value) => gender[value]),
      lookingFor: data.lookingFor ? lookingFor[data.lookingFor] : '',
      zodiacSign: data.zodiac ? zodiac[data.zodiac] : null,
      bio: data.bio,
      interests: data.interests,
    }),
  })
}
