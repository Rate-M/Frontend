import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ChatMessage } from '../types/chat'
import { computeStreak } from '../utils/streak'

const originalTz = process.env.TZ
const setTz = (tz: string) => { process.env.TZ = tz }
beforeEach(() => setTz('America/Mexico_City'))
afterEach(() => {
  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
})

const at = (iso: string, from: ChatMessage['from'], id = iso + from): ChatMessage => ({ id, from, text: 'x', sentAt: Date.parse(iso) })
const pair = (isoA: string, isoB = isoA) => [at(isoA, 'me'), at(isoB, 'them')]

describe('Días sin mensajes', () => {
  it('sin mensajes: racha 0 y no está viva', () => {
    expect(computeStreak([], Date.parse('2026-11-27T18:00:00Z'))).toEqual({ days: 0, doneToday: false, alive: false })
  })

  it('un día intermedio sin mensajes rompe la racha', () => {
    const now = Date.parse('2026-11-27T18:00:00Z')
    const msgs = [...pair('2026-11-27T16:00:00Z'), ...pair('2026-11-25T16:00:00Z'), ...pair('2026-11-24T16:00:00Z')]
    expect(computeStreak(msgs, now)).toMatchObject({ days: 1, doneToday: true })
  })

  it('si ayer fue el último día completo y hoy aún no escriben, la racha sigue viva', () => {
    const now = Date.parse('2026-11-27T18:00:00Z')
    const msgs = [...pair('2026-11-26T16:00:00Z'), ...pair('2026-11-25T16:00:00Z')]
    expect(computeStreak(msgs, now)).toEqual({ days: 2, doneToday: false, alive: true })
  })

  it('si el último día completo fue anteayer, la racha se pierde', () => {
    const now = Date.parse('2026-11-27T18:00:00Z')
    expect(computeStreak(pair('2026-11-25T16:00:00Z'), now)).toEqual({ days: 0, doneToday: false, alive: false })
  })

  it('un día cuenta solo si ambas personas escribieron', () => {
    const now = Date.parse('2026-11-27T18:00:00Z')
    const msgs = [at('2026-11-27T16:00:00Z', 'me'), at('2026-11-27T17:00:00Z', 'me'), ...pair('2026-11-26T16:00:00Z')]
    expect(computeStreak(msgs, now)).toEqual({ days: 1, doneToday: false, alive: true })
  })

  it('varios mensajes el mismo día cuentan como un solo día', () => {
    const now = Date.parse('2026-11-27T18:00:00Z')
    const msgs = Array.from({ length: 6 }, (_, i) => at(`2026-11-27T1${i}:00:00Z`, i % 2 ? 'me' : 'them', 'm' + i))
    expect(computeStreak(msgs, now).days).toBe(1)
  })

  it('los mensajes no necesitan venir ordenados', () => {
    const now = Date.parse('2026-11-27T18:00:00Z')
    const msgs = [...pair('2026-11-25T16:00:00Z'), ...pair('2026-11-27T16:00:00Z'), ...pair('2026-11-26T16:00:00Z')]
    expect(computeStreak(msgs, now).days).toBe(3)
  })

  it('acumula una racha larga de 10 días', () => {
    const now = Date.parse('2026-11-27T18:00:00Z')
    const msgs = Array.from({ length: 10 }, (_, i) => pair(new Date(Date.parse('2026-11-27T16:00:00Z') - i * 86_400_000).toISOString())).flat()
    expect(computeStreak(msgs, now).days).toBe(10)
  })
})

describe('Zonas horarias', () => {
  const lateNightMx = '2026-11-28T03:30:00Z'

  it('el mismo mensaje cae en días distintos según la zona horaria del usuario', () => {
    const msgs = [...pair('2026-11-27T16:00:00Z'), ...pair(lateNightMx)]
    const now = Date.parse('2026-11-28T18:00:00Z')

    setTz('America/Mexico_City') 
    expect(computeStreak(msgs, now)).toMatchObject({ days: 1, doneToday: false })

    setTz('UTC')
    expect(computeStreak(msgs, now)).toMatchObject({ days: 2, doneToday: true })
  })

  it('medianoche local separa los días: 23:59 y 00:01 no son el mismo día', () => {
    setTz('America/Mexico_City')
    const msgs = [at('2026-11-27T05:59:00Z', 'me'), at('2026-11-27T06:01:00Z', 'them')]
    expect(computeStreak(msgs, Date.parse('2026-11-27T18:00:00Z'))).toMatchObject({ days: 0, doneToday: false })
  })

  it('personas en husos distintos: cada quien cuenta con su día local', () => {
    const msgs = [at('2026-11-27T01:00:00Z', 'me'), at('2026-11-27T03:00:00Z', 'them')]
    const now = Date.parse('2026-11-27T13:00:00Z')
    setTz('Asia/Tokyo') 
    expect(computeStreak(msgs, now).doneToday).toBe(true)
    setTz('America/Mexico_City') 
    expect(computeStreak(msgs, now)).toMatchObject({ doneToday: false, days: 1 })
  })

  it('el cambio de horario de invierno (día de 25 horas) no rompe la racha', () => {
    setTz('America/New_York') 
    const msgs = [
      ...pair('2026-10-31T16:00:00Z'), ...pair('2026-11-01T17:00:00Z'), ...pair('2026-11-02T17:00:00Z'),
    ]
    expect(computeStreak(msgs, Date.parse('2026-11-02T20:00:00Z')).days).toBe(3)
  })

  it('el cambio de horario de verano (día de 23 horas) no rompe la racha', () => {
    setTz('America/New_York') 
    const msgs = [...pair('2026-03-07T17:00:00Z'), ...pair('2026-03-08T17:00:00Z'), ...pair('2026-03-09T17:00:00Z')]
    expect(computeStreak(msgs, Date.parse('2026-03-09T20:00:00Z')).days).toBe(3)
  })

  it('cruzar fin de mes y de año cuenta días consecutivos', () => {
    setTz('America/Mexico_City')
    const msgs = [...pair('2026-12-30T18:00:00Z'), ...pair('2026-12-31T18:00:00Z'), ...pair('2027-01-01T18:00:00Z')]
    expect(computeStreak(msgs, Date.parse('2027-01-01T20:00:00Z')).days).toBe(3)
  })
})