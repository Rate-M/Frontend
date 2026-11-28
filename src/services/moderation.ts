const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')

export const reportTypes = { review: 'Reseña', message: 'Mensaje', photo: 'Foto', profile: 'Perfil' } as const
export const reportStatuses = { pending: 'Pendiente', in_review: 'En revisión', resolved: 'Resuelto' } as const
export type ReportType = keyof typeof reportTypes
export type ReportStatus = keyof typeof reportStatuses

export interface ReportRow {
  id: string
  type: ReportType
  reporter: string
  reportedUser: string
  reporterName?: string | null
  reportedUserName?: string | null
  reason: string
  priority: number
  status: ReportStatus
  createdAt: string
}

export interface ReportDetail extends ReportRow {
  content: { rating?: number; text?: string; photo?: string; name?: string; bio?: string } | null
  audit: { actor: string; at: string; status: ReportStatus; note: string }[]
}

export interface ReportsPage {
  reports: ReportRow[]
  nextPage: number | null
  counts: Record<ReportStatus, number>
  typeCounts: Record<ReportType, number>
  resolvedToday: number
  averageResponseMs: number | null
}

async function request<T>(token: string, path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl + '/moderation/reports' + path, {
    ...options,
    headers: { Authorization: 'Bearer ' + token, ...options.headers },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data) throw new Error(data?.message ?? 'No pudimos consultar los reportes.')
  return data
}

export function listReports(token: string, query: URLSearchParams, signal: AbortSignal) {
  return request<ReportsPage>(token, '?' + query, { signal })
}

export function getReport(token: string, id: string, signal: AbortSignal) {
  return request<ReportDetail>(token, '/' + encodeURIComponent(id), { signal })
}

export function updateReport(token: string, id: string, status: 'in_review' | 'resolved', note: string, signal: AbortSignal) {
  return request<Pick<ReportDetail, 'status' | 'audit'>>(token, '/' + encodeURIComponent(id), {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }), signal,
  })
}

export function reportPhotoUrl(photo: string) {
  if (!/^\/uploads\/profiles\/[A-Za-z0-9_.-]+$/.test(photo)) return ''
  return new URL(photo, new URL(apiUrl, window.location.origin).origin).href
}
