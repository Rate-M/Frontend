
const PROHIBITED = new Set([
  'idiota',
  'estupido',
  'estupida',
  'imbecil',
  'pendejo',
  'pendeja',
  'cabron',
  'cabrona',
  'puto',
  'puta',
  'mierda',
  'culero',
  'culera',
  'maldito',
  'maldita',
  'chinga',
  'chingada',
  'chingado',
  'chingar',
  'verga',
  'zorra'
])

const LEET: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  $: 's'
}

const WORD = /[\p{L}\p{N}@$]+/gu

const normalize = (word: string) =>
  word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[013457@$]/g, (ch) => LEET[ch] ?? ch)
    .replace(/(.)\1+/g, '$1')

const isProhibited = (word: string) => {
  const n = normalize(word)
  return [n, n.replace(/s$/, ''), n.replace(/es$/, '')].some((c) => PROHIBITED.has(c))
}

export const maskWord = (word: string) => word.charAt(0) + '*'.repeat(Math.max(word.length - 1, 2))

export const findProhibited = (text: string): string[] => {
  const found = new Set<string>()
  for (const match of text.matchAll(WORD)) {
    if (isProhibited(match[0])) found.add(match[0].toLowerCase())
  }
  return [...found]
}

export const maskProhibited = (text: string) => {
  let count = 0
  const masked = text.replace(WORD, (word) => {
    if (!isProhibited(word)) return word
    count++
    return maskWord(word)
  })
  return { text: masked, count }
}