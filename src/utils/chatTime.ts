export const formatHour = (ts: number) =>
  new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })

export const formatListTime = (ts: number) => {
  const now = new Date()
  const d = new Date(ts)

  if (d.toDateString() === now.toDateString()) return formatHour(ts)

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'

  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })
}