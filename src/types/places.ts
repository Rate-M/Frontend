export type PlaceCategory = 'cafe' | 'parque' | 'restaurante' | 'museo'

export interface Place {
  id: string
  name: string
  category: PlaceCategory
  address: string
  distanceKm: number
  hours: string
  safetyTip: string
  x: number
  y: number
}

export const categoryLabels: Record<PlaceCategory, string> = {
  cafe: 'Cafetería',
  parque: 'Parque',
  restaurante: 'Restaurante',
  museo: 'Museo'
}

export const places: Place[] = [
  {
    id: 'p1',
    name: 'Café Aroma',
    category: 'cafe',
    address: 'Av. Hidalgo 120, Centro',
    distanceKm: 1.2,
    hours: '8:00 – 22:00',
    safetyTip: 'Local muy concurrido, ideal para platicar con calma.',
    x: 40,
    y: 36
  },
  {
    id: 'p2',
    name: 'Parque Central',
    category: 'parque',
    address: 'Calzada Independencia s/n',
    distanceKm: 2.4,
    hours: '6:00 – 21:00',
    safetyTip: 'Zona con mucha gente y vigilancia. Mejor ir de día.',
    x: 18,
    y: 22
  },
  {
    id: 'p3',
    name: 'Museo de Arte',
    category: 'museo',
    address: 'Blvd. Revolución 450',
    distanceKm: 3.1,
    hours: '10:00 – 18:00',
    safetyTip: 'Espacio cerrado con personal y cámaras en todo momento.',
    x: 66,
    y: 28
  },
  {
    id: 'p4',
    name: 'Restaurante La Terraza',
    category: 'restaurante',
    address: 'Calle Morelos 88, Zona Centro',
    distanceKm: 2.0,
    hours: '13:00 – 23:00',
    safetyTip: 'Terraza abierta al público, siempre con personal.',
    x: 80,
    y: 50
  },
  {
    id: 'p5',
    name: 'Cafetería Origen',
    category: 'cafe',
    address: 'Calle Juárez 310',
    distanceKm: 0.8,
    hours: '7:00 – 21:00',
    safetyTip: 'Cerca de transporte público y con mucho movimiento.',
    x: 30,
    y: 62
  },
  {
    id: 'p6',
    name: 'Jardín Botánico',
    category: 'parque',
    address: 'Camino al Lago 200',
    distanceKm: 4.5,
    hours: '8:00 – 18:00',
    safetyTip: 'Tiene acceso controlado y guardias en la entrada.',
    x: 80,
    y: 76
  },
  {
    id: 'p7',
    name: 'Mercado Gourmet',
    category: 'restaurante',
    address: 'Av. del Mercado 15',
    distanceKm: 1.6,
    hours: '11:00 – 22:00',
    safetyTip: 'Varios puestos y mesas compartidas, siempre lleno de gente.',
    x: 56,
    y: 74
  },
  {
    id: 'p8',
    name: 'Museo de la Ciudad',
    category: 'museo',
    address: 'Plaza de Armas 3',
    distanceKm: 1.9,
    hours: '10:00 – 19:00',
    safetyTip: 'Recorrido tranquilo, con vigilancia y buena iluminación.',
    x: 12,
    y: 46
  }
]

export const getPlace = (id: string) => places.find((p) => p.id === id)