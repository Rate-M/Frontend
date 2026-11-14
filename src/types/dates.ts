export type DateStatus = 'pending' | 'accepted' | 'declined'

export type Attendance =
  | 'unverified'
  | 'verified'
  | 'gps_failed'
  | 'manual_pending'
  | 'manual_confirmed'

export const GEOFENCE_M = 150

export const TIME_TOLERANCE_MIN = 30

export interface GpsPoint {
  status: 'ok' | 'far' | 'late' | 'error'
  distanceM?: number
  arrivedAt?: number
}

export interface GpsCheck {
  me: GpsPoint
  them: GpsPoint
}

export type GpsScenario = 'both' | 'nosignal' | 'far' | 'late'

export interface DateInvitation {
  id: string
  conversationId: string
  direction: 'sent' | 'received'
  placeId: string
  startsAt: number
  note: string
  status: DateStatus
  createdAt: number
  attendance: Attendance
  gps?: GpsCheck
  manual?: { me: boolean; them: boolean }
}