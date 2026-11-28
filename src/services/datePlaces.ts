import type { PlaceCategory } from '../types/places'

type SearchCategory = Exclude<PlaceCategory, 'museo'>

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')

export interface DatePlace {
  id: string
  name: string
  category: SearchCategory
  address: string
}

export async function loadDatePlaces(token: string, category: SearchCategory, signal: AbortSignal): Promise<DatePlace[]> {
  async function get<T>(path: string): Promise<T> {
    const response = await fetch(apiUrl + path, {
      headers: { Authorization: 'Bearer ' + token }, signal,
    })
    if (!response.ok) throw new Error('No pudimos consultar los lugares cercanos.')
    return response.json()
  }

  const { location } = await get<{ location?: { coordinates?: [number, number] } }>('/profiles/me')
  const coordinates = location?.coordinates
  if (!coordinates || coordinates.length !== 2) {
    throw new Error('Comparte tu ubicación desde Descubrimiento para consultar lugares cercanos.')
  }
  const [longitude, latitude] = coordinates
  const query = new URLSearchParams({ lat: String(latitude), lng: String(longitude), category })
  const { places } = await get<{ places: { placeId: string }[] }>('/places?' + query)
  const nearby = await Promise.all(places.slice(0, 5).map(async ({ placeId }) => {
    const details = await get<{ name: string | null; address: string | null }>(
      '/places/' + encodeURIComponent(placeId),
    ).catch(() => null)
    if (!details?.name) return null
    return { id: placeId, name: details.name, category, address: details.address ?? '' }
  }))
  const available = nearby.filter((place) => place !== null)
  if (places.length && !available.length) throw new Error('No pudimos consultar los detalles de los lugares.')
  return available
}
