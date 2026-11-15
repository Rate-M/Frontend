import type { DateInvitation } from '../types/dates'

export type ReviewState = 'to_write' | 'waiting' | 'published'

export const reviewState = (invitation: DateInvitation): ReviewState => {
  if (!invitation.review) return 'to_write'
  return invitation.theirReview ? 'published' : 'waiting'
}