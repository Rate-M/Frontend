import type { ChatMessage } from '../types/chat'

export const INVITE_MIN_STREAK = 7

export interface StreakInfo {
  days: number
  doneToday: boolean
  alive: boolean
}

const dayKey = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export const computeStreak = (messages: ChatMessage[], now = Date.now()): StreakInfo => {
  const perDay = new Map<string, { me: boolean; them: boolean }>()

  for (const m of messages) {
    const key = dayKey(m.sentAt)
    const entry = perDay.get(key) ?? { me: false, them: false }
    if (m.from === 'me') entry.me = true
    else entry.them = true
    perDay.set(key, entry)
  }

  const isComplete = (d: Date) => {
    const e = perDay.get(dayKey(d.getTime()))
    return !!e && e.me && e.them
  }

  const cursor = new Date(now)
  cursor.setHours(0, 0, 0, 0)

  const doneToday = isComplete(cursor)
 
  if (!doneToday) cursor.setDate(cursor.getDate() - 1)

  let days = 0
  while (isComplete(cursor)) {
    days++
    cursor.setDate(cursor.getDate() - 1)
  }

  return { days, doneToday, alive: doneToday || days > 0 }
}