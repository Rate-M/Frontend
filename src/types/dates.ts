export type DateStatus = 'pending' | 'accepted' | 'declined'

export interface DateInvitation {
  id: string
  conversationId: string
  direction: 'sent' | 'received'
  placeId: string
  startsAt: number
  note: string
  status: DateStatus
  createdAt: number
}