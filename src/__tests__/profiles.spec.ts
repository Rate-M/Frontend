// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { createProfile, saveProfilePreferences } from '../services/profiles'
import { emptyProfile } from '../types/profile'

afterEach(() => vi.unstubAllGlobals())

it('envía el perfil con las fotos en orden y guarda sus preferencias por separado', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }))
  vi.stubGlobal('fetch', fetchMock)
  const first = new File(['first'], 'principal.jpg', { type: 'image/jpeg' })
  const second = new File(['second'], 'otra.jpg', { type: 'image/jpeg' })
  const data = {
    ...emptyProfile(), displayName: ' Alex ', birthDate: '1999-01-01',
    gender: 'female' as const, interestedIn: ['male' as const],
    lookingFor: 'relationship' as const, zodiac: 'taurus' as const,
    photos: [
      { id: '2', url: '', file: second, isPrimary: false },
      { id: '1', url: '', file: first, isPrimary: true },
    ],
  }

  await createProfile('jwt', data)
  const [url, options] = fetchMock.mock.calls[0]!
  expect(url).toMatch(/\/profiles\/me$/)
  expect(options).toMatchObject({ method: 'POST', headers: { Authorization: 'Bearer jwt' } })
  const body = options.body as FormData
  expect(body.get('name')).toBe('Alex')
  expect(body.get('gender')).toBe('mujer')
  expect(body.get('interestedIn')).toBe('["hombre"]')
  expect(body.get('zodiacSign')).toBe('tauro')
  expect(body.getAll('photos').map((photo) => (photo as File).name)).toEqual(['principal.jpg', 'otra.jpg'])

  await saveProfilePreferences('jwt', data)
  expect(fetchMock).toHaveBeenLastCalledWith(expect.stringMatching(/\/profiles\/me\/preferences$/), expect.objectContaining({
    method: 'PATCH', body: JSON.stringify({ minAge: 18, maxAge: 99, maxDistanceKm: 25 }),
  }))
})
