export interface DiscoverProfile {
  id: string
  name: string
  age: number
  occupation: string
  distanceKm: number
  bio: string
  interests: string[]
  photos: string[]
  verified: boolean
  /** Solo para el mock: si es true, al darle "me gusta" hay match */
  likesYou: boolean
}

export const placeholderPhoto = (label: string, from: string, to: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="30" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">${label}</text>
    </svg>`
  )

export const mockProfiles: DiscoverProfile[] = [
  {
    id: 'u1',
    name: 'Valeria',
    age: 27,
    occupation: 'Arquitecta',
    distanceKm: 4,
    bio: 'Amo el café de olla, los domingos de mercado y planear viajes que casi nunca hago. Busco a alguien con buena plática.',
    interests: ['Arquitectura', 'Café', 'Viajes', 'Fotografía'],
    photos: [
      placeholderPhoto('Valeria · Foto 1', '#B3202E', '#F8D5D2'),
      placeholderPhoto('Valeria · Foto 2', '#8E1622', '#E6D1CE'),
      placeholderPhoto('Valeria · Foto 3', '#6E0F19', '#F8D5D2')
    ],
    verified: true,
    likesYou: true
  },
  {
    id: 'u2',
    name: 'Diego',
    age: 29,
    occupation: 'Ingeniero de software',
    distanceKm: 8,
    bio: 'Corro por las mañanas, cocino por las noches. Si me recomiendas un buen libro, ya ganaste puntos.',
    interests: ['Running', 'Cocina', 'Lectura'],
    photos: [
      placeholderPhoto('Diego · Foto 1', '#4A4246', '#E6D1CE'),
      placeholderPhoto('Diego · Foto 2', '#141214', '#F8D5D2')
    ],
    verified: true,
    likesYou: false
  },
  {
    id: 'u3',
    name: 'Sofía',
    age: 25,
    occupation: 'Diseñadora gráfica',
    distanceKm: 12,
    bio: 'Dibujo en servilletas y colecciono vinilos. Me gustan los planes sin prisa.',
    interests: ['Diseño', 'Música', 'Cine', 'Vinilos', 'Museos'],
    photos: [
      placeholderPhoto('Sofía · Foto 1', '#8E1622', '#F8D5D2'),
      placeholderPhoto('Sofía · Foto 2', '#B3202E', '#E6D1CE'),
      placeholderPhoto('Sofía · Foto 3', '#6E0F19', '#E6D1CE'),
      placeholderPhoto('Sofía · Foto 4', '#5E5458', '#F8D5D2')
    ],
    verified: false,
    likesYou: false
  },
  {
    id: 'u4',
    name: 'Mariana',
    age: 31,
    occupation: 'Pediatra',
    distanceKm: 3,
    bio: 'Senderismo, tacos y series de misterio. Mi plan ideal: caminata y comida después.',
    interests: ['Senderismo', 'Tacos', 'Series'],
    photos: [placeholderPhoto('Mariana · Foto 1', '#B3202E', '#E6D1CE')],
    verified: true,
    likesYou: true
  }
]