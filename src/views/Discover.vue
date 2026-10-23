<template>
  <div class="public-page">
    <div class="public-card">
      <aside class="profile-side">
        <div class="topbar">
          <img :src="logoUrl" alt="RateM Dating" class="logo-img" />
          <router-link to="/perfil" class="me-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="8.5" r="3.8" />
              <path d="M4.5 20.5c1.2-3.8 4-5.8 7.5-5.8s6.3 2 7.5 5.8" />
            </svg>
            Mi perfil
          </router-link>
        </div>

        <div class="tabs">
          <button type="button" class="tab" :class="{ active: tab === 'discover' }" :aria-pressed="tab === 'discover'" @click="tab = 'discover'">
            Recomendados
          </button>
          <button type="button" class="tab" :class="{ active: tab === 'saved' }" :aria-pressed="tab === 'saved'" @click="tab = 'saved'">
            Guardados
            <span v-if="saved.length" class="tab-count">{{ saved.length }}</span>
          </button>
        </div>

        <header v-if="tab === 'discover' && current" class="hero">
          <div class="photo-main">
            <img :src="currentPhoto" :alt="`Foto ${photoIndex + 1} de ${current.name}`" />
          </div>

          <div class="name-row">
            <h1>{{ current.name }}, {{ ageOf(current) }}</h1>
            <span v-if="current.verified" class="verified" title="Identidad verificada">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
                <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
              </svg>
              <span class="sr-only">Identidad verificada</span>
            </span>
          </div>

          <div class="meta-row">
            <p class="meta">{{ current.city }} · a {{ current.distanceKm }} km</p>
            <p v-if="current.reviewCount > 0" class="rating-pill">
              <span aria-hidden="true">★</span> {{ current.rating }} · {{ current.reviewCount }} reseñas
            </p>
            <p v-else class="rating-pill muted">Aún sin reseñas</p>
          </div>
        </header>

        <div v-else class="side-message">
          <h1>{{ tab === 'saved' ? 'Guardados' : 'Por hoy es todo' }}</h1>
          <p v-if="tab === 'saved'">Perfiles que dejaste para decidir después.</p>
          <p v-else>Vuelve mañana para ver nuevas recomendaciones.</p>
        </div>
      </aside>

      <main ref="mainEl" class="profile-main">
        <template v-if="tab === 'discover' && current">
          <section class="reason">
            <svg class="reason-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
              <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
            </svg>
            <div class="reason-text">
              <strong>Recomendado para ti</strong>
              <p>{{ reasonText }}</p>
            </div>
            <span class="remaining">{{ remainingText }}</span>
          </section>

          <section class="block">
            <h2>Sobre {{ current.name }}</h2>
            <p class="bio">{{ current.bio }}</p>
            <ul class="chips" aria-label="Intereses">
              <li v-for="interest in current.interests" :key="interest" :class="{ common: commonInterests.includes(interest) }">
                {{ interest }}
                <span v-if="commonInterests.includes(interest)" class="sr-only">(en común contigo)</span>
              </li>
            </ul>
            <small v-if="commonInterests.length" class="hint">Los intereses oscuros son los que tienen en común.</small>
          </section>

          <section v-if="infoItems.length" class="block">
            <h2>Información</h2>
            <dl class="info-grid">
              <div v-for="item in infoItems" :key="item.label" class="info-item">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </section>

          <section class="block">
            <h2>Fotos</h2>
            <ul class="photo-grid">
              <li v-for="(photo, index) in photoSlots" :key="index" :class="{ 'slot-empty': !photo }" :aria-hidden="!photo">
                <button
                  v-if="photo"
                  type="button"
                  class="photo-thumb"
                  :class="{ active: index === photoIndex }"
                  :aria-pressed="index === photoIndex"
                  :aria-label="`Ver foto ${index + 1} de ${current.name}`"
                  @click="photoIndex = index"
                >
                  <img :src="photo" alt="" />
                </button>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3.5" y="5" width="17" height="14" rx="3" />
                  <circle cx="9" cy="10.5" r="1.6" />
                  <path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" />
                </svg>
              </li>
            </ul>
          </section>

          <section class="block">
            <h2>Reseñas</h2>

            <div v-if="current.reviews.length === 0" class="empty">
              <p>Todavía no tiene reseñas.</p>
              <small>Las reseñas aparecen después de una cita confirmada por ambas personas.</small>
            </div>

            <ul v-else class="review-list">
              <li v-for="review in current.reviews" :key="review.id" class="review">
                <span class="review-avatar" aria-hidden="true">{{ review.initials }}</span>
                <div class="review-body">
                  <span class="review-stars" :aria-label="`${review.rating} de 5 estrellas`">{{ stars(review.rating) }}</span>
                  <small>{{ review.context }}</small>
                  <p>{{ review.comment }}</p>
                </div>
              </li>
            </ul>
          </section>
        </template>

        <template v-else-if="tab === 'saved'">
          <div v-if="saved.length === 0" class="empty-state">
            <h2>Aún no guardas a nadie</h2>
            <p>Cuando quieras pensarlo con calma, toca Guardar en el perfil de alguien y aparecerá aquí.</p>
            <div class="empty-actions">
              <button type="button" class="btn-primary btn-md" @click="tab = 'discover'">Ver recomendados</button>
            </div>
          </div>

          <ul v-else class="saved-grid">
            <li v-for="candidate in saved" :key="candidate.id" class="saved-card">
              <img :src="candidate.photos[0]" :alt="`Foto de ${candidate.name}`" />
              <div class="saved-info">
                <strong>{{ candidate.name }}, {{ ageOf(candidate) }}</strong>
                <small>{{ candidate.city }} · a {{ candidate.distanceKm }} km</small>
              </div>
              <div class="saved-actions">
                <button type="button" class="btn-primary btn-md" @click="reviewSaved(candidate)">Ver perfil</button>
                <button type="button" class="btn-secondary btn-md" @click="removeSaved(candidate)">Quitar</button>
              </div>
            </li>
          </ul>
        </template>

        <div v-else class="empty-state">
          <h2>Ya viste las recomendaciones de hoy</h2>
          <p>Mañana te mostramos personas nuevas. Mientras tanto, puedes revisar a quienes guardaste.</p>
          <div class="empty-actions">
            <button v-if="saved.length" type="button" class="btn-primary btn-md" @click="tab = 'saved'">
              Ver guardados ({{ saved.length }})
            </button>
            <button type="button" class="btn-secondary btn-md" @click="resetDemo">Reiniciar demo</button>
          </div>
        </div>
      </main>

      <div v-if="tab === 'discover' && current" class="actions" role="group" aria-label="Acciones sobre este perfil">
        <button type="button" class="act act-reject" @click="askReject">
          <span class="act-circle">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
          Rechazar
        </button>

        <button type="button" class="act act-save" @click="saveForLater">
          <span class="act-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M7 4h10a1 1 0 011 1v15l-6-4-6 4V5a1 1 0 011-1z" />
            </svg>
          </span>
          Guardar
        </button>

        <button type="button" class="act act-match" @click="doMatch">
          <span class="act-circle">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0112 7.2 4.5 4.5 0 0119.5 10c0 5.4-7.5 10-7.5 10z" />
            </svg>
          </span>
          Hacer match
        </button>
      </div>
    </div>

    <div v-if="dialog" class="overlay" @click.self="closeDialog" @keydown.esc="closeDialog">
      <div v-if="dialog === 'reject' && current" class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">¿Rechazar a {{ current.name }}?</h2>
        <p>No volverás a ver este perfil en tus recomendaciones.</p>
        <div class="dialog-actions">
          <button ref="dialogPrimary" type="button" class="btn-secondary btn-md" @click="closeDialog">Cancelar</button>
          <button type="button" class="btn-primary btn-md" @click="confirmReject">Sí, rechazar</button>
        </div>
      </div>

      <div v-else-if="dialog === 'match' && matchedWith" class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div class="match-photos">
          <img :src="myPhoto" alt="Tu foto de perfil" />
          <img :src="matchedWith.photos[0]" :alt="`Foto de ${matchedWith.name}`" />
        </div>
        <h2 id="dialog-title">¡Es un match!</h2>
        <p>A {{ matchedWith.name }} y a ti se gustaron. Ya pueden empezar a conocerse.</p>
        <div class="dialog-actions single">
          <button ref="dialogPrimary" type="button" class="btn-primary btn-md" @click="closeDialog">Seguir descubriendo</button>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast" role="status" aria-live="polite">
      <span>{{ toast.message }}</span>
      <button v-if="toast.undo" type="button" class="toast-undo" @click="undo">Deshacer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import logoUrl from '../assets/logo.png'

const MAX_PHOTOS = 6
const TOAST_MS = 6000

type Tab = 'discover' | 'saved'
type DialogKind = 'reject' | 'match' | null

interface Review {
  id: string
  initials: string
  rating: number
  context: string
  comment: string
}

interface Candidate {
  id: string
  name: string
  birthDate: string
  city: string
  distanceKm: number
  verified: boolean
  rating: number
  reviewCount: number
  bio: string
  interests: string[]
  gender: string
  occupation: string
  zodiac: string
  lookingFor: string
  likesYou: boolean
  photos: string[]
  reviews: Review[]
}

interface InfoItem {
  label: string
  value: string
}

interface ToastState {
  message: string
  undo: boolean
}

interface HistoryEntry {
  type: 'like' | 'save'
  candidate: Candidate
}

const myProfile = {
  interests: ['Senderismo', 'Cine', 'Café'],
  lookingFor: 'relationship'
}

const placeholderPhoto = (label: string, fill = '#e6e1e3') =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="${fill}"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="#8a8486" text-anchor="middle">${label}</text></svg>`
  )

const makePhotos = (name: string, count: number, fill: string) =>
  Array.from({ length: count }, (_, index) => placeholderPhoto(`${name} ${index + 1}`, fill))

const myPhoto = placeholderPhoto('Tú', '#f8d5d2')

const buildDeck = (): Candidate[] => [
  {
    id: 'c1',
    name: 'Carlos',
    birthDate: '1997-08-03',
    city: 'Torreón',
    distanceKm: 3,
    verified: true,
    rating: 4.8,
    reviewCount: 12,
    bio: 'Ingeniero entre semana y cocinero los domingos. Busco a alguien con quien salir a caminar y probar lugares nuevos.',
    interests: ['Senderismo', 'Cocina', 'Café', 'Música'],
    gender: 'male',
    occupation: 'Ingeniero civil',
    zodiac: 'leo',
    lookingFor: 'relationship',
    likesYou: true,
    photos: makePhotos('Carlos', 6, '#e6e1e3'),
    reviews: [
      { id: 'r1', initials: 'MG', rating: 5, context: 'Café · octubre 2026', comment: 'Muy puntual y atento. La cita fue tal como su perfil.' },
      { id: 'r2', initials: 'LP', rating: 5, context: 'Parque · septiembre 2026', comment: 'Conversación fácil y me hizo sentir segura todo el tiempo.' }
    ]
  },
  {
    id: 'c2',
    name: 'Diego',
    birthDate: '1995-02-19',
    city: 'Gómez Palacio',
    distanceKm: 9,
    verified: true,
    rating: 4.5,
    reviewCount: 6,
    bio: 'Fotógrafo freelance. Me gusta el cine de autor y descubrir cafés escondidos.',
    interests: ['Fotografía', 'Cine', 'Café'],
    gender: 'male',
    occupation: 'Fotógrafo',
    zodiac: 'piscis',
    lookingFor: 'relationship',
    likesYou: false,
    photos: makePhotos('Diego', 5, '#efe0dd'),
    reviews: [
      { id: 'r1', initials: 'SR', rating: 4, context: 'Museo · agosto 2026', comment: 'Muy buena plática, llegó unos minutos tarde pero avisó.' }
    ]
  },
  {
    id: 'c3',
    name: 'Luis',
    birthDate: '2000-11-27',
    city: 'Torreón',
    distanceKm: 5,
    verified: false,
    rating: 0,
    reviewCount: 0,
    bio: 'Estudio medicina y los fines de semana corro en el bosque. Busco conocer gente sin prisa.',
    interests: ['Running', 'Libros', 'Viajes'],
    gender: 'male',
    occupation: 'Estudiante de medicina',
    zodiac: 'sagitario',
    lookingFor: 'unsure',
    likesYou: false,
    photos: makePhotos('Luis', 4, '#e3e0e8'),
    reviews: []
  },
  {
    id: 'c4',
    name: 'Mateo',
    birthDate: '1996-06-08',
    city: 'Lerdo',
    distanceKm: 14,
    verified: true,
    rating: 4.9,
    reviewCount: 8,
    bio: 'Músico y maestro de guitarra. Si me escribes, probablemente te recomiende un disco.',
    interests: ['Música', 'Cine', 'Viajes'],
    gender: 'male',
    occupation: 'Músico',
    zodiac: 'geminis',
    lookingFor: 'friendship',
    likesYou: true,
    photos: makePhotos('Mateo', 5, '#dfe6e1'),
    reviews: [
      { id: 'r1', initials: 'AV', rating: 5, context: 'Cafetería · octubre 2026', comment: 'Amable y muy divertido. Repetiría sin dudarlo.' },
      { id: 'r2', initials: 'DC', rating: 5, context: 'Concierto · julio 2026', comment: 'Una cita muy tranquila y respetuosa.' }
    ]
  },
  {
    id: 'c5',
    name: 'Andrés',
    birthDate: '1994-12-01',
    city: 'Torreón',
    distanceKm: 7,
    verified: true,
    rating: 4.6,
    reviewCount: 4,
    bio: 'Arquitecto y amante de los domingos de senderismo. Tengo un perro llamado Chilaquil.',
    interests: ['Senderismo', 'Arquitectura', 'Perros'],
    gender: 'male',
    occupation: 'Arquitecto',
    zodiac: 'sagitario',
    lookingFor: 'relationship',
    likesYou: false,
    photos: makePhotos('Andrés', 6, '#ebe4d9'),
    reviews: [
      { id: 'r1', initials: 'PH', rating: 5, context: 'Sendero · septiembre 2026', comment: 'Muy respetuoso y puntual. Buena compañía para caminar.' }
    ]
  }
]

const genderLabels: Record<string, string> = {
  female: 'Mujer',
  male: 'Hombre',
  nonbinary: 'No binario',
  other: 'Otro'
}

const lookingForLabels: Record<string, string> = {
  relationship: 'Una relación',
  casual: 'Algo casual',
  friendship: 'Amistad',
  unsure: 'Aún lo está pensando'
}

const zodiacLabels: Record<string, string> = {
  geminis: 'Géminis',
  cancer: 'Cáncer'
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
const labelFrom = (map: Record<string, string>, key: string) => map[key] ?? capitalize(key)
const stars = (value: number) => '★'.repeat(value) + '☆'.repeat(5 - value)

const ageOf = (candidate: Candidate) => {
  const [year, month, day] = candidate.birthDate.split('-').map(Number)
  const today = new Date()
  let years = today.getFullYear() - year
  const beforeBirthday =
    today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)
  if (beforeBirthday) years -= 1
  return years
}

const tab = ref<Tab>('discover')
const deck = ref<Candidate[]>(buildDeck())
const saved = ref<Candidate[]>([])
const photoIndex = ref(0)
const dialog = ref<DialogKind>(null)
const matchedWith = ref<Candidate | null>(null)
const toast = ref<ToastState | null>(null)
const lastAction = ref<HistoryEntry | null>(null)
const mainEl = ref<HTMLElement | null>(null)
const dialogPrimary = ref<HTMLButtonElement | null>(null)

let toastTimer: ReturnType<typeof setTimeout> | undefined

const current = computed(() => deck.value[0] ?? null)

const currentPhoto = computed(() => current.value?.photos[photoIndex.value] ?? current.value?.photos[0])

const photoSlots = computed<(string | null)[]>(() =>
  Array.from({ length: MAX_PHOTOS }, (_, index) => current.value?.photos[index] ?? null)
)

const commonInterests = computed(() =>
  current.value ? current.value.interests.filter((interest) => myProfile.interests.includes(interest)) : []
)

const reasonText = computed(() => {
  const candidate = current.value
  if (!candidate) return ''
  const parts: string[] = []
  const count = commonInterests.value.length
  if (count === 1) parts.push(`Comparten un interés: ${commonInterests.value[0]}.`)
  else if (count > 1) parts.push(`Comparten ${count} intereses: ${commonInterests.value.join(', ')}.`)
  if (candidate.lookingFor === myProfile.lookingFor) parts.push('Los dos buscan lo mismo.')
  parts.push(`Vive a ${candidate.distanceKm} km de ti.`)
  return parts.join(' ')
})

const remainingText = computed(() =>
  deck.value.length === 1 ? 'Última recomendación de hoy' : `${deck.value.length} recomendaciones por ver`
)

const infoItems = computed<InfoItem[]>(() => {
  const candidate = current.value
  if (!candidate) return []
  const items: InfoItem[] = [
    { label: 'Género', value: candidate.gender ? labelFrom(genderLabels, candidate.gender) : '' },
    { label: 'Ocupación', value: candidate.occupation },
    { label: 'Signo', value: candidate.zodiac ? labelFrom(zodiacLabels, candidate.zodiac) : '' },
    { label: 'Busca', value: candidate.lookingFor ? labelFrom(lookingForLabels, candidate.lookingFor) : '' }
  ]
  return items.filter((item) => item.value)
})

const scrollToTop = async () => {
  await nextTick()
  mainEl.value?.scrollTo({ top: 0 })
  window.scrollTo({ top: 0 })
}

const showToast = (message: string, undo = false) => {
  toast.value = { message, undo }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = null
  }, TOAST_MS)
}

const doMatch = () => {
  const candidate = current.value
  if (!candidate) return
  deck.value.shift()

  if (candidate.likesYou) {
    matchedWith.value = candidate
    lastAction.value = null
    toast.value = null
    dialog.value = 'match'
  } else {
    lastAction.value = { type: 'like', candidate }
    showToast(`Te gustó ${candidate.name}. Te avisamos si también quiere conocerte.`, true)
    scrollToTop()
  }
}

const askReject = () => {
  if (current.value) dialog.value = 'reject'
}

const confirmReject = () => {
  const candidate = current.value
  if (!candidate) return
  deck.value.shift()
  dialog.value = null
  lastAction.value = null
  showToast(`Rechazaste a ${candidate.name}.`)
  scrollToTop()
}

const saveForLater = () => {
  const candidate = current.value
  if (!candidate) return
  deck.value.shift()
  saved.value.unshift(candidate)
  lastAction.value = { type: 'save', candidate }
  showToast(`${candidate.name} quedó en Guardados.`, true)
  scrollToTop()
}

const undo = () => {
  const entry = lastAction.value
  if (!entry) return
  if (entry.type === 'save') {
    saved.value = saved.value.filter((candidate) => candidate.id !== entry.candidate.id)
  }
  deck.value.unshift(entry.candidate)
  lastAction.value = null
  toast.value = null
  tab.value = 'discover'
  scrollToTop()
}

const closeDialog = () => {
  const wasMatch = dialog.value === 'match'
  dialog.value = null
  if (wasMatch) {
    matchedWith.value = null
    scrollToTop()
  }
}

const reviewSaved = (candidate: Candidate) => {
  saved.value = saved.value.filter((item) => item.id !== candidate.id)
  deck.value.unshift(candidate)
  tab.value = 'discover'
  scrollToTop()
}

const removeSaved = (candidate: Candidate) => {
  saved.value = saved.value.filter((item) => item.id !== candidate.id)
  showToast(`Quitaste a ${candidate.name} de Guardados.`)
}

const resetDemo = () => {
  deck.value = buildDeck()
  saved.value = []
  lastAction.value = null
  toast.value = null
  tab.value = 'discover'
  scrollToTop()
}

watch(
  () => current.value?.id,
  () => {
    photoIndex.value = 0
  }
)

watch(dialog, async (value) => {
  if (value) {
    await nextTick()
    dialogPrimary.value?.focus()
  }
})

onBeforeUnmount(() => {
  clearTimeout(toastTimer)
})
</script>

<style scoped>
.public-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}

.public-card {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: var(--rm-bg);
  border-radius: 28px;
  padding: 40px 32px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

.profile-side,
.profile-main {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
}

.profile-side {
  gap: 20px;
}

@media (max-width: 380px) {
  .public-card {
    padding: 32px 20px;
  }
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.logo-img {
  width: 140px;
  height: auto;
}

.me-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  color: var(--rm-accent-dark);
}
.me-link:hover {
  color: var(--rm-accent-darker);
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--rm-border);
  border-radius: 999px;
}
.tab {
  flex: 1;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--rm-text-secondary);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.tab:hover:not(.active) {
  background: #fbf7f6;
}
.tab.active {
  background: var(--rm-text);
  color: #fff;
}
.tab-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--rm-accent);
  color: #fff;
  font-size: 11px;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}
.photo-main {
  width: min(100%, 320px);
  aspect-ratio: 4 / 5;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid var(--rm-border);
  background: #f4eceb;
}
.photo-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}
.name-row h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 34px;
  line-height: 1.1;
}
.verified {
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--rm-success-bg);
  color: var(--rm-success);
}
.meta-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}
.meta {
  margin: 0;
  font-size: 14px;
  color: var(--rm-text-secondary);
}
.rating-pill {
  margin: 0;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  font-size: 13px;
  font-weight: 600;
  color: var(--rm-text);
}
.rating-pill span {
  color: var(--rm-accent);
}
.rating-pill.muted {
  font-weight: 500;
  color: var(--rm-text-muted);
}

.side-message {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px 0 8px;
  text-align: center;
}
.side-message h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 38px;
  line-height: 1.08;
}
.side-message p {
  margin: 0;
  font-size: 15px;
  color: var(--rm-text-secondary);
}

.reason {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px 14px;
  padding: 16px 18px;
  border: 1px solid var(--rm-border);
  border-radius: 20px;
  background: #fbf7f6;
}
.reason-icon {
  flex-shrink: 0;
  color: var(--rm-accent);
  margin-top: 2px;
}
.reason-text {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.reason-text strong {
  font-size: 14px;
}
.reason-text p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--rm-text-body);
}
.remaining {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--rm-text-muted);
}

.block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.block h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 24px;
}
.bio {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--rm-text-body);
}
.hint {
  font-size: 12px;
  color: var(--rm-text-muted);
}

.chips {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chips li {
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  font-size: 12px;
  font-weight: 600;
}
.chips li.common {
  background: var(--rm-accent-dark);
  color: #fff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 18px;
  border: 1px solid var(--rm-border);
  border-radius: 20px;
  min-width: 0;
}
.info-item dt {
  font-size: 12px;
  color: var(--rm-text-muted);
}
.info-item dd {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--rm-text);
  overflow-wrap: anywhere;
}

.photo-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.photo-grid li {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 18px;
  background: #f4eceb;
}
.photo-grid li.slot-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px dashed var(--rm-border);
  color: var(--rm-placeholder);
}
.photo-thumb {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.photo-thumb.active::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 18px;
  box-shadow: inset 0 0 0 3px var(--rm-accent);
}

@media (max-width: 480px) {
  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.review-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.review {
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--rm-border);
  border-radius: 20px;
}
.review-avatar {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid var(--rm-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}
.review-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.review-stars {
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--rm-accent);
}
.review-body small {
  font-size: 12px;
  color: var(--rm-text-muted);
}
.review-body p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--rm-text-body);
}

.empty {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px;
  border: 1px dashed var(--rm-border);
  border-radius: 20px;
  text-align: center;
}
.empty p {
  margin: 0;
  font-size: 14px;
  color: var(--rm-text);
}
.empty small {
  font-size: 12px;
  color: var(--rm-text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 36px 20px;
  border: 1px dashed var(--rm-border);
  border-radius: 24px;
  text-align: center;
}
.empty-state h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 28px;
}
.empty-state p {
  margin: 0;
  max-width: 380px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--rm-text-secondary);
}
.empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
}

.saved-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.saved-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--rm-border);
  border-radius: 24px;
}
.saved-card img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 16px;
  display: block;
}
.saved-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 4px;
}
.saved-info strong {
  font-size: 15px;
}
.saved-info small {
  font-size: 12px;
  color: var(--rm-text-secondary);
}
.saved-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-primary,
.btn-secondary {
  border-radius: 999px;
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  transition: background 0.2s, opacity 0.2s;
}
.btn-md {
  height: 44px;
  padding: 0 22px;
  font-size: 14px;
  letter-spacing: 0.03em;
}
.btn-primary {
  background: var(--rm-text);
  color: #fff;
}
.btn-primary:hover {
  background: #000;
}
.btn-secondary {
  background: var(--rm-btn-secondary);
  color: var(--rm-text);
}
.btn-secondary:hover {
  background: #f3bdb8;
}

button:focus-visible,
.me-link:focus-visible {
  outline: 2px solid var(--rm-accent);
  outline-offset: 3px;
}

.actions {
  position: sticky;
  bottom: 12px;
  z-index: 5;
  align-self: center;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 22px;
  padding: 12px 22px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--rm-border);
  border-radius: 32px;
  box-shadow: 0 8px 24px rgba(20, 18, 20, 0.12);
}
.act {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  padding: 0;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--rm-text-secondary);
  cursor: pointer;
}
.act-circle {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
}
.act:active .act-circle {
  transform: scale(0.94);
}
.act-reject .act-circle {
  background: #fff;
  border: 1px solid var(--rm-border);
  color: var(--rm-text);
}
.act-reject:hover .act-circle {
  background: #fbf7f6;
}
.act-save .act-circle {
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
}
.act-save:hover .act-circle {
  background: #f3bdb8;
}
.act-match .act-circle {
  width: 68px;
  height: 68px;
  background: var(--rm-accent);
  color: #fff;
}
.act-match:hover .act-circle {
  background: var(--rm-accent-dark);
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(20, 18, 20, 0.5);
}
.dialog {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 32px 24px 24px;
  border-radius: 28px;
  background: var(--rm-bg);
  text-align: center;
  box-shadow: 0 20px 60px rgba(20, 18, 20, 0.3);
}
.dialog h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 32px;
  line-height: 1.1;
}
.dialog p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--rm-text-secondary);
}
.dialog-actions {
  width: 100%;
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.dialog-actions .btn-md {
  flex: 1;
}
.match-photos {
  display: flex;
  justify-content: center;
}
.match-photos img {
  width: 104px;
  height: 104px;
  border-radius: 999px;
  object-fit: cover;
  border: 4px solid var(--rm-bg);
  box-shadow: 0 2px 10px rgba(20, 18, 20, 0.15);
}
.match-photos img + img {
  margin-left: -18px;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 124px;
  transform: translateX(-50%);
  z-index: 40;
  max-width: calc(100vw - 40px);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px 12px 22px;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(20, 18, 20, 0.25);
}
.toast-undo {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  padding: 6px 4px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  color: var(--rm-btn-secondary);
  text-decoration: underline;
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (min-width: 900px) {
  .public-page {
    display: block;
    min-height: 0;
    padding: 0;
  }

  .public-card {
    max-width: none;
    height: 100vh;
    display: grid;
    grid-template-columns: 5fr 7fr;
    grid-template-rows: minmax(0, 1fr) auto;
    grid-template-areas:
      'side main'
      'actions main';
    gap: 0;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .profile-side {
    grid-area: side;
    overflow-y: auto;
    box-sizing: border-box;
    padding: 24px 64px 8px;
    gap: 16px;
    border-right: 1px solid var(--rm-border);
    scrollbar-width: none;
  }
  .profile-side::-webkit-scrollbar {
    display: none;
  }

  .profile-main {
    grid-area: main;
    height: 100vh;
    overflow-y: auto;
    box-sizing: border-box;
    padding: 48px 64px;
    gap: 36px;
  }

  .profile-main > * {
    width: 100%;
    max-width: 780px;
  }

  .logo-img {
    width: 170px;
  }

  .hero {
    margin: auto 0;
    gap: 12px;
  }

  .photo-main {
    width: max(200px, min(100%, 440px, calc((100vh - 440px) * 0.8)));
  }

  .name-row h1 {
    font-size: clamp(30px, 5vh, 46px);
  }

  .meta {
    font-size: 15px;
  }

  .side-message {
    margin: auto 0;
  }
  .side-message h1 {
    font-size: clamp(36px, 6vh, 52px);
  }

  .actions {
    grid-area: actions;
    position: static;
    align-self: stretch;
    padding: 8px 64px 24px;
    background: transparent;
    border: 0;
    border-right: 1px solid var(--rm-border);
    border-radius: 0;
    box-shadow: none;
    gap: 28px;
  }

  .block h2 {
    font-size: 28px;
  }

  .bio {
    font-size: 15px;
  }

  .chips li {
    font-size: 13px;
  }

  .info-item dd {
    font-size: 15px;
  }

  .review-body p {
    font-size: 14px;
  }

  .toast {
    bottom: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tab,
  .act-circle,
  .btn-primary,
  .btn-secondary {
    transition: none;
  }
}
</style>