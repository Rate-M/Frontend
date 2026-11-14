import { placeholderPhoto } from './discover'

export interface ChatMessage {
  id: string
  from: 'me' | 'them'
  text: string
  sentAt: number
  status?: 'sent' | 'read'
}

export interface Conversation {
  id: string
  name: string
  photo: string
  online: boolean
  unread: number
  messages: ChatMessage[]
}

const MIN = 60 * 1000

const atDay = (daysAgo: number, hour: number, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d.getTime()
}

const exchange = (prefix: string, daysAgo: number, them: string, me: string): ChatMessage[] => {
  const now = Date.now()
  const themTs = daysAgo === 0 ? now - 25 * MIN : atDay(daysAgo, 10, 5)
  const meTs = daysAgo === 0 ? now - 20 * MIN : atDay(daysAgo, 10, 20)
  return [
    { id: `${prefix}-${daysAgo}-t`, from: 'them', text: them, sentAt: themTs },
    { id: `${prefix}-${daysAgo}-m`, from: 'me', text: me, sentAt: meTs, status: 'read' }
  ]
}

const VALERIA_PAIRS: [string, string][] = [
  ['¡Hola! Vi que también te gusta el café de olla ☕', 'Jaja sí, es lo mejor. ¿Conoces alguna cafetería buena?'],
  ['Hay una en el centro que te va a encantar', 'Va, mándame la ubicación 😄'],
  ['Listo, ya te la mandé. ¿Qué tal tu día?', 'Ocupado pero bien, vengo saliendo de la oficina'],
  ['¿Qué haces los fines de semana?', 'Salgo a caminar o me quedo viendo series. ¿Y tú?'],
  ['Yo siempre ando buscando mercados nuevos', 'Me encanta eso, qué buen plan'],
  ['Buenos días ☕ ¿cómo amaneciste?', 'Bien, con sueño jaja. ¿Y tú?']
]

const SOFIA_PAIRS: [string, string][] = [
  ['¿Cómo va tu semana?', 'Bastante bien, ¿y la tuya?'],
  ['Hoy descubrí un vinilo increíble', 'Ese gusto tuyo me encanta, pásame el nombre'],
  ['¿Ya viste la nueva exposición del museo?', 'Todavía no, ¿vamos?']
]

export const createMockConversations = (): Conversation[] => {
  const now = Date.now()

  const valeria: ChatMessage[] = [
    ...VALERIA_PAIRS.flatMap(([them, me], i) => exchange('c1', 6 - i, them, me)),
    { id: 'c1-today-1', from: 'them', text: 'Buen día ☕ ¿ya desayunaste?', sentAt: now - 45 * MIN },
    { id: 'c1-today-2', from: 'them', text: '¿Te late ir a la cafetería este fin de semana?', sentAt: now - 12 * MIN }
  ]

  const sofia: ChatMessage[] = Array.from({ length: 9 }, (_, i) => {
    const [them, me] = SOFIA_PAIRS[i % SOFIA_PAIRS.length]
    return exchange('c4', 8 - i, them, me)
  }).flat()

  return [
    {
      id: 'c1',
      name: 'Valeria',
      photo: placeholderPhoto('Valeria', '#B3202E', '#F8D5D2'),
      online: true,
      unread: 2,
      messages: valeria
    },
    {

      id: 'c2',
      name: 'Mariana',
      photo: placeholderPhoto('Mariana', '#8E1622', '#E6D1CE'),
      online: false,
      unread: 0,
      messages: [
        { id: 'c2-1', from: 'them', text: 'Gracias por el match, qué gusto conocerte', sentAt: atDay(2, 9, 30) },
        { id: 'c2-2', from: 'me', text: '¡Igualmente! ¿Qué tal tu guardia, todo bien?', sentAt: atDay(2, 9, 45), status: 'sent' }
      ]
    },
    {
      id: 'c3',
      name: 'Diego',
      photo: placeholderPhoto('Diego', '#4A4246', '#E6D1CE'),
      online: true,
      unread: 0,
      messages: []
    },
    {
      id: 'c4',
      name: 'Sofía',
      photo: placeholderPhoto('Sofía', '#8E1622', '#F8D5D2'),
      online: true,
      unread: 0,
      messages: sofia
    }
  ]
}