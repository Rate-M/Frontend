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
const HOUR = 60 * MIN

export const createMockConversations = (): Conversation[] => {
  const now = Date.now()

  return [
    {
      id: 'c1',
      name: 'Valeria',
      photo: placeholderPhoto('Valeria', '#B3202E', '#F8D5D2'),
      online: true,
      unread: 2,
      messages: [
        { id: 'c1-1', from: 'them', text: '¡Hola! Vi que también te gusta el café de olla ☕', sentAt: now - 45 * MIN },
        { id: 'c1-2', from: 'me', text: 'Jaja sí, es lo mejor. ¿Conoces alguna cafetería buena por aquí?', sentAt: now - 40 * MIN, status: 'read' },
        { id: 'c1-3', from: 'them', text: 'Sí, hay una en el centro que te va a encantar', sentAt: now - 12 * MIN },
        { id: 'c1-4', from: 'them', text: '¿Te late ir este fin de semana?', sentAt: now - 10 * MIN }
      ]
    },
    {
      id: 'c2',
      name: 'Mariana',
      photo: placeholderPhoto('Mariana', '#8E1622', '#E6D1CE'),
      online: false,
      unread: 0,
      messages: [
        { id: 'c2-1', from: 'them', text: 'Gracias por el match, qué gusto conocerte', sentAt: now - 27 * HOUR },
        { id: 'c2-2', from: 'me', text: '¡Igualmente! ¿Qué tal tu guardia, todo bien?', sentAt: now - 26 * HOUR, status: 'sent' }
      ]
    },
    {
      id: 'c3',
      name: 'Diego',
      photo: placeholderPhoto('Diego', '#4A4246', '#E6D1CE'),
      online: true,
      unread: 0,
      messages: []
    }
  ]
}