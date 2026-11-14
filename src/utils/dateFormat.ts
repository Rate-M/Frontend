const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const formatDateLong = (ts: number) =>
  capitalize(new Date(ts).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }))

export const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })

export const formatDateTime = (ts: number) => `${formatDateLong(ts)} · ${formatTime(ts)}`