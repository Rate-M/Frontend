import { describe, expect, it } from 'vitest'
import { findProhibited, maskProhibited, maskWord } from '../utils/moderation'

describe('Modismos y groserías mexicanas que deben bloquearse', () => {
  it.each([
    'idiota', 'estúpido', 'estúpida', 'imbécil', 'pendejo', 'pendeja', 'cabrón', 'cabrona',
    'puto', 'puta', 'mierda', 'culero', 'culera', 'maldito', 'maldita', 'chinga', 'chingada',
    'chingado', 'chingar', 'verga',
  ])('detecta "%s"', (word) => {
    expect(findProhibited(`Es un@ ${word} total`)).toHaveLength(1)
  })

  it.each([
    ['Qué pendejada, no llegó', 0],
    ['No manches, qué culero fue', 1],
    ['Ya valió madres', 0],
    ['Qué poca madre', 0],
    ['Fue un cabrón conmigo', 1],
    ['Me chingó el plan', 0],
    ['Vete a la chingada', 1],
    ['Qué chingón estuvo', 0],
    ['Puro pinche pendejo', 1],
  ])('frase "%s" → %i coincidencia(s) (el diccionario solo coincide con palabras completas)', (phrase, expected) => {
    expect(findProhibited(phrase)).toHaveLength(expected)
  })

  it('detecta varias palabras distintas en un solo comentario', () => {
    expect(findProhibited('Fue un idiota y un culero, qué mierda')).toEqual(['idiota', 'culero', 'mierda'])
  })

  it('no repite la misma palabra aunque aparezca varias veces', () => {
    expect(findProhibited('idiota idiota IDIOTA')).toEqual(['idiota'])
  })
})

describe('Defectos conocidos del filtro (it.fails: pasan a fallar cuando se corrijan; entonces quita ".fails")', () => {
  it.fails('detecta "zorra"', () => {
    expect(findProhibited('Es una zorra')).toHaveLength(1)
  })

  it.fails('detecta acento combinado (NFD): "cabro\u0301n"', () => {
    expect(findProhibited('cabro\u0301n')).toHaveLength(1)
  })
})

describe('Evasiones comunes', () => {
  it.each([
    ['PENDEJO', 'mayúsculas'],
    ['PeNdEjA', 'mayúsculas mezcladas'],
    ['cabrón', 'acento'],
    ['p3nd3j0', 'leetspeak'],
    ['m13rd4', 'leetspeak con números'],
    ['mi3rd@', 'arroba como "a"'],
    ['pu7o', '7 como "t"'],
    ['e$tupido', 'signo $ como "s"'],
    ['pendejooo', 'letras repetidas'],
    ['piiiinche idiotaaaa', 'alargar palabras'],
    ['pendejos', 'plural'],
    ['culeros', 'plural'],
    ['pendejas', 'plural'],
    ['chingadas', 'plural'],
  ])('detecta "%s" (%s)', (word) => {
    expect(findProhibited(word).length).toBeGreaterThan(0)
  })
})

describe('Palabras legítimas que NO deben bloquearse (falsos positivos)', () => {
  it.each([
    'Fue puntual y respetuoso', 'Hablamos de la computadora', 'Compramos un cómputo', 'Me encantó el lugar',
    'La reputación del café', 'Una disputa tonta', 'El estudio fue interesante', 'Escuchamos música',
    'Qué amable', 'Muy buena plática', 'Llegó a tiempo', 'Una persona maravillosa', 'Ya la pasamos padrísimo',
    'Cuarenta minutos de caminata', 'Nos vimos en Coyoacán', 'El puesto de tacos', 'Un pulpo delicioso',
    'Tomamos mezcal', 'Escribió un poema', 'Cumpleaños del abuelo', 'Culebra en el parque',
  ])('"%s" es válido', (text) => {
    expect(findProhibited(text)).toEqual([])
  })

  it('texto vacío, solo espacios o solo emojis no tienen coincidencias', () => {
    expect(findProhibited('')).toEqual([])
    expect(findProhibited('   ')).toEqual([])
    expect(findProhibited('😊👍')).toEqual([])
  })

  it('números y fechas no se confunden con leetspeak de una palabra prohibida', () => {
    expect(findProhibited('Nos vemos 2026-12-01 a las 19:00')).toEqual([])
  })

  it('puntuación pegada a la palabra sí se detecta', () => {
    expect(findProhibited('¡idiota!')).toEqual(['idiota'])
    expect(findProhibited('"mierda",')).toEqual(['mierda'])
  })
})

describe('maskWord / maskProhibited', () => {
  it('conserva la primera letra y oculta el resto', () => {
    expect(maskWord('idiota')).toBe('i*****')
    expect(maskWord('puta')).toBe('p***')
  })

  it('usa al menos dos asteriscos aunque la palabra sea muy corta', () => {
    expect(maskWord('ab')).toBe('a**')
    expect(maskWord('a')).toBe('a**')
  })

  it('enmascara solo las palabras prohibidas y cuenta cuántas fueron', () => {
    expect(maskProhibited('Fue un idiota y la plática fue una mierda.')).toEqual({
      text: 'Fue un i***** y la plática fue una m*****.', count: 2,
    })
  })

  it('enmascara variantes con evasión conservando el texto original alrededor', () => {
    expect(maskProhibited('Qué P3NDEJO, ¡cabrón!')).toEqual({ text: 'Qué P******, ¡c*****!', count: 2 })
  })

  it('no cambia un texto limpio', () => {
    expect(maskProhibited('Una cita muy agradable 😊')).toEqual({ text: 'Una cita muy agradable 😊', count: 0 })
  })

  it('es idempotente: lo ya enmascarado no vuelve a contarse', () => {
    const once = maskProhibited('eres un idiota')
    expect(maskProhibited(once.text)).toEqual({ text: once.text, count: 0 })
  })

  it('cuenta cada aparición repetida', () => {
    expect(maskProhibited('idiota, idiota').count).toBe(2)
  })
})