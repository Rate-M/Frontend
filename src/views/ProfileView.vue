<template>
  <div class="public-page">
    <div class="public-card">
      <aside class="profile-side">
        <img :src="logoUrl" alt="RateM Dating" class="logo-img" />

        <button type="button" class="back-btn" @click="router.back()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          Volver
        </button>

        <header v-if="profile" class="hero">
          <div class="avatar-wrap">
            <img class="avatar" :src="avatarUrl" :alt="`Tu foto de perfil`" />
            <button type="button" class="avatar-edit" aria-label="Cambiar foto de perfil" @click="goToPhotos">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 8.5A2.5 2.5 0 016.5 6h1.2l1.3-2h6l1.3 2h1.2A2.5 2.5 0 0120 8.5v8a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-8z" />
                <circle cx="12" cy="12.5" r="3.2" />
              </svg>
            </button>
          </div>

          <div class="name-row">
            <h1>{{ profile.name || 'Tu nombre' }}, {{ age }}</h1>
            <span v-if="profile.verified" class="verified" title="Identidad verificada">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
                <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
              </svg>
              <span class="sr-only">Identidad verificada</span>
            </span>
          </div>

          <p class="meta">{{ profile.city || 'Sin ciudad' }}</p>

          <p v-if="profile.reviewCount > 0" class="rating-pill">
            <span aria-hidden="true">★</span> {{ profile.rating }} · {{ profile.reviewCount }} reseñas
          </p>
          <p v-else class="rating-pill muted">Aún sin reseñas</p>
        </header>
      </aside>

      <main class="profile-main">
        <p v-if="loading" class="loading-text" role="status">Cargando tu perfil...</p>

        <template v-else-if="profile">
          <div class="toolbar">
            <div class="visibility">
              <div class="visibility-text">
                <strong>Perfil visible</strong>
                <small>
                  {{ profile.visible
                    ? 'Otras personas pueden encontrarte en Descubrir.'
                    : 'Tu perfil está oculto. Nadie nuevo puede verlo.' }}
                </small>
              </div>
              <button
                type="button"
                class="switch"
                role="switch"
                :aria-checked="profile.visible"
                aria-label="Perfil visible"
                @click="toggleVisible"
              >
                <span class="switch-thumb"></span>
              </button>
            </div>
          </div>

          <section class="block">
            <div class="block-head">
              <h2>Sobre mí</h2>
              <button v-if="editing !== 'about'" type="button" class="edit-btn" @click="startEdit('about')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16v4z" />
                </svg>
                Editar
              </button>
            </div>

            <template v-if="editing !== 'about'">
              <p class="bio" :class="{ muted: !profile.bio }">{{ profile.bio || 'Cuenta algo sobre ti para que otras personas te conozcan.' }}</p>
              <ul v-if="profile.interests.length" class="chips" aria-label="Intereses">
                <li v-for="interest in profile.interests" :key="interest">{{ interest }}</li>
              </ul>
              <p v-else class="bio muted">Aún no agregas intereses.</p>
            </template>

            <form v-else class="edit-form" novalidate @submit.prevent="saveSection('about')">
              <div class="field">
                <label for="about-bio">Biografía</label>
                <textarea
                  id="about-bio"
                  v-model="aboutDraft.bio"
                  rows="4"
                  :maxlength="BIO_MAX"
                  placeholder="Me gusta el café, el senderismo..."
                  :class="{ invalid: errors.bio }"
                ></textarea>
                <span class="hint counter">{{ aboutDraft.bio.length }}/{{ BIO_MAX }}</span>
                <span v-if="errors.bio" class="field-error">{{ errors.bio }}</span>
              </div>

              <div class="field">
                <label for="about-interest">Intereses</label>
                <ul v-if="aboutDraft.interests.length" class="chips editable" aria-label="Intereses agregados">
                  <li v-for="interest in aboutDraft.interests" :key="interest">
                    {{ interest }}
                    <button type="button" class="chip-remove" :aria-label="`Quitar ${interest}`" @click="removeInterest(interest)">×</button>
                  </li>
                </ul>
                <div class="inline-add">
                  <input
                    id="about-interest"
                    v-model="newInterest"
                    type="text"
                    maxlength="24"
                    placeholder="Ej. Senderismo"
                    :disabled="aboutDraft.interests.length >= INTERESTS_MAX"
                    @keydown.enter.prevent="addInterest"
                  />
                  <button
                    type="button"
                    class="btn-secondary btn-sm"
                    :disabled="!newInterest.trim() || aboutDraft.interests.length >= INTERESTS_MAX"
                    @click="addInterest"
                  >
                    Agregar
                  </button>
                </div>
                <span class="hint">{{ aboutDraft.interests.length }}/{{ INTERESTS_MAX }} intereses</span>
                <span v-if="errors.interests" class="field-error">{{ errors.interests }}</span>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary btn-sm" @click="cancelEdit">Cancelar</button>
                <button type="submit" class="btn-primary btn-sm" :disabled="saving">
                  {{ saving ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          </section>

          <section class="block">
            <div class="block-head">
              <h2>Información</h2>
              <button v-if="editing !== 'info'" type="button" class="edit-btn" @click="startEdit('info')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16v4z" />
                </svg>
                Editar
              </button>
            </div>

            <dl v-if="editing !== 'info'" class="info-grid">
              <div v-for="item in infoItems" :key="item.label" class="info-item">
                <dt>{{ item.label }}</dt>
                <dd :class="{ muted: !item.value }">{{ item.value || 'Sin agregar' }}</dd>
              </div>
            </dl>

            <form v-else class="edit-form" novalidate @submit.prevent="saveSection('info')">
              <div class="form-grid">
                <div class="field">
                  <label for="info-name">Nombre</label>
                  <input id="info-name" v-model="infoDraft.name" type="text" autocomplete="given-name" :class="{ invalid: errors.name }" />
                  <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
                </div>

                <div class="field">
                  <label for="info-birth">Fecha de nacimiento</label>
                  <input id="info-birth" v-model="infoDraft.birthDate" type="date" :max="todayIso" min="1900-01-01" :class="{ invalid: errors.birthDate }" />
                  <span v-if="errors.birthDate" class="field-error">{{ errors.birthDate }}</span>
                </div>

                <div class="field">
                  <label for="info-gender">Género</label>
                  <select id="info-gender" v-model="infoDraft.gender">
                    <option value="">Prefiero no decirlo</option>
                    <option v-for="option in genderOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                  </select>
                </div>

                <div class="field">
                  <label for="info-pronouns">Pronombres</label>
                  <select id="info-pronouns" v-model="infoDraft.pronouns">
                    <option value="">Prefiero no decirlo</option>
                    <option v-for="option in pronounOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                  </select>
                </div>

                <div class="field">
                  <label for="info-occupation">Ocupación</label>
                  <input id="info-occupation" v-model="infoDraft.occupation" type="text" maxlength="40" placeholder="Ej. Diseñadora" />
                </div>

                <div class="field">
                  <label for="info-zodiac">Signo</label>
                  <select id="info-zodiac" v-model="infoDraft.zodiac">
                    <option value="">Sin especificar</option>
                    <option v-for="option in zodiacOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                  </select>
                </div>

                <div class="field span-2">
                  <label for="info-city">Ciudad</label>
                  <input id="info-city" v-model="infoDraft.city" type="text" maxlength="60" autocomplete="address-level2" placeholder="Ej. Torreón" />
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary btn-sm" @click="cancelEdit">Cancelar</button>
                <button type="submit" class="btn-primary btn-sm" :disabled="saving">
                  {{ saving ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          </section>

          <section class="block">
            <div class="block-head">
              <h2>Lo que busco</h2>
              <button v-if="editing !== 'looking'" type="button" class="edit-btn" @click="startEdit('looking')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16v4z" />
                </svg>
                Editar
              </button>
            </div>

            <dl v-if="editing !== 'looking'" class="info-grid">
              <div v-for="item in lookingItems" :key="item.label" class="info-item">
                <dt>{{ item.label }}</dt>
                <dd :class="{ muted: !item.value }">{{ item.value || 'Sin agregar' }}</dd>
              </div>
            </dl>

            <form v-else class="edit-form" novalidate @submit.prevent="saveSection('looking')">
              <div class="field">
                <label for="look-for">Busco</label>
                <select id="look-for" v-model="lookingDraft.lookingFor">
                  <option value="">Sin especificar</option>
                  <option v-for="option in lookingForOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </div>

              <fieldset class="field">
                <legend>Me interesan</legend>
                <div class="choices">
                  <label v-for="option in interestedInOptions" :key="option.value" class="choice" :class="{ on: lookingDraft.interestedIn.includes(option.value) }">
                    <input v-model="lookingDraft.interestedIn" type="checkbox" class="sr-only" :value="option.value" />
                    {{ option.label }}
                  </label>
                </div>
                <span v-if="errors.interestedIn" class="field-error">{{ errors.interestedIn }}</span>
              </fieldset>

              <div class="form-grid">
                <div class="field">
                  <label for="look-min">Edad mínima</label>
                  <input id="look-min" v-model.number="lookingDraft.ageMin" type="number" inputmode="numeric" min="18" max="99" :class="{ invalid: errors.ageRange }" />
                </div>
                <div class="field">
                  <label for="look-max">Edad máxima</label>
                  <input id="look-max" v-model.number="lookingDraft.ageMax" type="number" inputmode="numeric" min="18" max="99" :class="{ invalid: errors.ageRange }" />
                </div>
                <span v-if="errors.ageRange" class="field-error span-2">{{ errors.ageRange }}</span>
              </div>

              <div class="field">
                <label for="look-distance">Distancia máxima: {{ lookingDraft.maxDistanceKm }} km</label>
                <input id="look-distance" v-model.number="lookingDraft.maxDistanceKm" type="range" min="1" max="100" step="1" class="range" />
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary btn-sm" @click="cancelEdit">Cancelar</button>
                <button type="submit" class="btn-primary btn-sm" :disabled="saving">
                  {{ saving ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          </section>

          <section id="mis-fotos" class="block">
            <div class="block-head">
              <h2>Mis fotos</h2>
              <span class="count">{{ profile.photos.length }}/{{ MAX_PHOTOS }}</span>
            </div>
            <p class="hint">La foto marcada como principal es la que ve la gente primero.</p>

            <ul class="photo-grid">
              <li
                v-for="(photo, index) in photoSlots"
                :key="photo ? photo.id : `empty-${index}`"
                :class="{ 'slot-empty': !photo }"
              >
                <template v-if="photo">
                  <img :src="photo.url" :alt="`Tu foto ${index + 1}`" />
                  <span v-if="photo.isPrimary" class="badge-primary">Principal</span>
                  <div class="photo-actions">
                    <button
                      v-if="!photo.isPrimary"
                      type="button"
                      class="photo-btn"
                      :aria-label="`Hacer principal la foto ${index + 1}`"
                      title="Hacer principal"
                      @click="setPrimary(photo.id)"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M12 3.5l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8L12 3.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="photo-btn"
                      :aria-label="`Eliminar la foto ${index + 1}`"
                      title="Eliminar"
                      @click="removePhoto(photo.id)"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />
                      </svg>
                    </button>
                  </div>
                </template>

                <label v-else class="slot-add">
                  <input type="file" accept="image/*" class="sr-only" @change="addPhoto" />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span>Agregar foto</span>
                </label>
              </li>
            </ul>
            <span v-if="photoError" class="field-error" role="alert">{{ photoError }}</span>
          </section>

          <section class="block">
            <div class="block-head">
              <h2>Reseñas que he recibido</h2>
            </div>

            <div v-if="profile.reviews.length === 0" class="empty">
              <p>Todavía no tienes reseñas.</p>
              <small>Las reseñas aparecen después de una cita confirmada por ambas personas.</small>
            </div>

            <ul v-else class="review-list">
              <li v-for="review in profile.reviews" :key="review.id" class="review">
                <span class="review-avatar" aria-hidden="true">{{ review.initials }}</span>
                <div class="review-body">
                  <span class="review-stars" :aria-label="`${review.rating} de 5 estrellas`">
                    {{ stars(review.rating) }}
                  </span>
                  <small>{{ review.context }}</small>
                  <p>{{ review.comment }}</p>
                </div>
              </li>
            </ul>
            <small v-if="profile.reviews.length" class="hint">Las reseñas no se pueden editar ni eliminar.</small>
          </section>
        </template>
      </main>
    </div>

    <p v-if="notice" class="toast" role="status" aria-live="polite">{{ notice }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logoUrl from '../assets/logo.png'

const MAX_PHOTOS = 6
const MAX_PHOTO_MB = 5
const BIO_MAX = 300
const INTERESTS_MAX = 10

type SectionKey = 'about' | 'info' | 'looking'

interface OwnPhoto {
  id: string
  url: string
  isPrimary: boolean
  local?: boolean
}

interface OwnReview {
  id: string
  initials: string
  rating: number
  context: string
  comment: string
}

interface OwnProfile {
  id: string
  name: string
  birthDate: string
  gender: string
  pronouns: string
  occupation: string
  zodiac: string
  city: string
  lookingFor: string
  interestedIn: string[]
  ageMin: number
  ageMax: number
  maxDistanceKm: number
  visible: boolean
  verified: boolean
  rating: number
  reviewCount: number
  bio: string
  interests: string[]
  photos: OwnPhoto[]
  reviews: OwnReview[]
}

interface InfoItem {
  label: string
  value: string
}

interface Option {
  value: string
  label: string
}

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const profile = ref<OwnProfile | null>(null)
const editing = ref<SectionKey | null>(null)
const saving = ref(false)
const notice = ref('')
const photoError = ref('')
const newInterest = ref('')

let noticeTimer: ReturnType<typeof setTimeout> | undefined

const genderOptions: Option[] = [
  { value: 'female', label: 'Mujer' },
  { value: 'male', label: 'Hombre' },
  { value: 'nonbinary', label: 'No binario' },
  { value: 'other', label: 'Otro' }
]

const pronounOptions: Option[] = [
  { value: 'ella', label: 'Ella' },
  { value: 'el', label: 'Él' },
  { value: 'elle', label: 'Elle' }
]

const zodiacOptions: Option[] = [
  { value: 'aries', label: 'Aries' },
  { value: 'tauro', label: 'Tauro' },
  { value: 'geminis', label: 'Géminis' },
  { value: 'cancer', label: 'Cáncer' },
  { value: 'leo', label: 'Leo' },
  { value: 'virgo', label: 'Virgo' },
  { value: 'libra', label: 'Libra' },
  { value: 'escorpio', label: 'Escorpio' },
  { value: 'sagitario', label: 'Sagitario' },
  { value: 'capricornio', label: 'Capricornio' },
  { value: 'acuario', label: 'Acuario' },
  { value: 'piscis', label: 'Piscis' }
]

const lookingForOptions: Option[] = [
  { value: 'relationship', label: 'Una relación' },
  { value: 'casual', label: 'Algo casual' },
  { value: 'friendship', label: 'Amistad' },
  { value: 'unsure', label: 'Aún lo estoy pensando' }
]

const interestedInOptions: Option[] = [
  { value: 'male', label: 'Hombres' },
  { value: 'female', label: 'Mujeres' },
  { value: 'nonbinary', label: 'Personas no binarias' }
]

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
const optionLabel = (options: Option[], value: string) =>
  options.find((option) => option.value === value)?.label ?? capitalize(value)

const stars = (value: number) => '★'.repeat(value) + '☆'.repeat(5 - value)

const placeholderPhoto = (label: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="#e6e1e3"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="#8a8486" text-anchor="middle">${label}</text></svg>`
  )

const pad = (value: number) => String(value).padStart(2, '0')
const todayIso = (() => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
})()

const ageFrom = (birthDate: string) => {
  const [year, month, day] = birthDate.split('-').map(Number)
  const today = new Date()
  let years = today.getFullYear() - year
  const beforeBirthday =
    today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)
  if (beforeBirthday) years -= 1
  return years
}

const formatDate = (birthDate: string) => {
  if (!birthDate) return ''
  const [year, month, day] = birthDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const age = computed(() => (profile.value?.birthDate ? ageFrom(profile.value.birthDate) : 0))

const infoItems = computed<InfoItem[]>(() => {
  const p = profile.value
  if (!p) return []
  return [
    { label: 'Nombre', value: p.name },
    { label: 'Fecha de nacimiento', value: formatDate(p.birthDate) },
    { label: 'Género', value: p.gender ? optionLabel(genderOptions, p.gender) : '' },
    { label: 'Pronombres', value: p.pronouns ? optionLabel(pronounOptions, p.pronouns) : '' },
    { label: 'Ocupación', value: p.occupation },
    { label: 'Signo', value: p.zodiac ? optionLabel(zodiacOptions, p.zodiac) : '' },
    { label: 'Ciudad', value: p.city }
  ]
})

const lookingItems = computed<InfoItem[]>(() => {
  const p = profile.value
  if (!p) return []
  return [
    { label: 'Busco', value: p.lookingFor ? optionLabel(lookingForOptions, p.lookingFor) : '' },
    {
      label: 'Me interesan',
      value: p.interestedIn.map((key) => optionLabel(interestedInOptions, key)).join(', ')
    },
    { label: 'Rango de edad', value: `${p.ageMin} a ${p.ageMax} años` },
    { label: 'Distancia máxima', value: `${p.maxDistanceKm} km` }
  ]
})

const avatarUrl = computed(() => {
  const photos = profile.value?.photos ?? []
  return (photos.find((photo) => photo.isPrimary) ?? photos[0])?.url ?? placeholderPhoto('Sin foto')
})

const photoSlots = computed<(OwnPhoto | null)[]>(() =>
  Array.from({ length: MAX_PHOTOS }, (_, index) => profile.value?.photos[index] ?? null)
)

const aboutDraft = reactive({ bio: '', interests: [] as string[] })
const infoDraft = reactive({
  name: '',
  birthDate: '',
  gender: '',
  pronouns: '',
  occupation: '',
  zodiac: '',
  city: ''
})
const lookingDraft = reactive({
  lookingFor: '',
  interestedIn: [] as string[],
  ageMin: 18,
  ageMax: 99,
  maxDistanceKm: 30
})
const errors = reactive<Record<string, string>>({})

const clearErrors = () => {
  Object.keys(errors).forEach((key) => delete errors[key])
}

const startEdit = (section: SectionKey) => {
  const p = profile.value
  if (!p) return
  clearErrors()
  newInterest.value = ''

  if (section === 'about') {
    aboutDraft.bio = p.bio
    aboutDraft.interests = [...p.interests]
  } else if (section === 'info') {
    Object.assign(infoDraft, {
      name: p.name,
      birthDate: p.birthDate,
      gender: p.gender,
      pronouns: p.pronouns,
      occupation: p.occupation,
      zodiac: p.zodiac,
      city: p.city
    })
  } else {
    Object.assign(lookingDraft, {
      lookingFor: p.lookingFor,
      interestedIn: [...p.interestedIn],
      ageMin: p.ageMin,
      ageMax: p.ageMax,
      maxDistanceKm: p.maxDistanceKm
    })
  }

  editing.value = section
}

const cancelEdit = () => {
  clearErrors()
  editing.value = null
}

const addInterest = () => {
  const value = capitalize(newInterest.value.trim())
  if (!value) return
  const exists = aboutDraft.interests.some((item) => item.toLowerCase() === value.toLowerCase())
  if (!exists && aboutDraft.interests.length < INTERESTS_MAX) {
    aboutDraft.interests.push(value)
  }
  newInterest.value = ''
}

const removeInterest = (interest: string) => {
  aboutDraft.interests = aboutDraft.interests.filter((item) => item !== interest)
}

const validate = (section: SectionKey) => {
  clearErrors()

  if (section === 'about') {
    if (aboutDraft.bio.length > BIO_MAX) errors.bio = `La biografía puede tener hasta ${BIO_MAX} caracteres`
  } else if (section === 'info') {
    if (!infoDraft.name.trim()) errors.name = 'El nombre es requerido'
    if (!infoDraft.birthDate) {
      errors.birthDate = 'La fecha de nacimiento es requerida'
    } else if (infoDraft.birthDate > todayIso) {
      errors.birthDate = 'La fecha no puede ser futura'
    } else if (ageFrom(infoDraft.birthDate) < 18) {
      errors.birthDate = 'Debes ser mayor de 18 años'
    }
  } else {
    if (lookingDraft.interestedIn.length === 0) errors.interestedIn = 'Elige al menos una opción'
    const { ageMin, ageMax } = lookingDraft
    if (!ageMin || !ageMax || ageMin < 18 || ageMax > 99) {
      errors.ageRange = 'El rango debe estar entre 18 y 99 años'
    } else if (ageMin > ageMax) {
      errors.ageRange = 'La edad mínima no puede ser mayor que la máxima'
    }
  }

  return Object.keys(errors).length === 0
}

const showNotice = (message: string) => {
  notice.value = message
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value = ''
  }, 3000)
}

const saveSection = async (section: SectionKey) => {
  const p = profile.value
  if (!p || !validate(section)) return

  saving.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 600))

    if (section === 'about') {
      p.bio = aboutDraft.bio.trim()
      p.interests = [...aboutDraft.interests]
    } else if (section === 'info') {
      Object.assign(p, {
        name: infoDraft.name.trim(),
        birthDate: infoDraft.birthDate,
        gender: infoDraft.gender,
        pronouns: infoDraft.pronouns,
        occupation: infoDraft.occupation.trim(),
        zodiac: infoDraft.zodiac,
        city: infoDraft.city.trim()
      })
    } else {
      Object.assign(p, {
        lookingFor: lookingDraft.lookingFor,
        interestedIn: [...lookingDraft.interestedIn],
        ageMin: lookingDraft.ageMin,
        ageMax: lookingDraft.ageMax,
        maxDistanceKm: lookingDraft.maxDistanceKm
      })
    }

    editing.value = null
    showNotice('Cambios guardados')
  } catch (error) {
    console.error('Error al guardar:', error)
    errors.form = 'No pudimos guardar los cambios. Intenta de nuevo.'
    showNotice(errors.form)
  } finally {
    saving.value = false
  }
}

const toggleVisible = () => {
  const p = profile.value
  if (!p) return
  p.visible = !p.visible
  showNotice(p.visible ? 'Tu perfil ahora es visible' : 'Tu perfil ahora está oculto')
}

const goToPhotos = () => {
  document.getElementById('mis-fotos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const addPhoto = (event: Event) => {
  const p = profile.value
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  photoError.value = ''

  if (!p || !file) return
  if (!file.type.startsWith('image/')) {
    photoError.value = 'El archivo debe ser una imagen'
    return
  }
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
    photoError.value = `La imagen no puede pesar más de ${MAX_PHOTO_MB} MB`
    return
  }
  if (p.photos.length >= MAX_PHOTOS) {
    photoError.value = `Puedes tener hasta ${MAX_PHOTOS} fotos`
    return
  }

  p.photos.push({
    id: `local-${Date.now()}`,
    url: URL.createObjectURL(file),
    isPrimary: p.photos.length === 0,
    local: true
  })
  showNotice('Foto agregada')
}

const removePhoto = (id: string) => {
  const p = profile.value
  if (!p) return
  photoError.value = ''

  if (p.photos.length === 1) {
    photoError.value = 'Necesitas al menos una foto en tu perfil'
    return
  }

  const target = p.photos.find((photo) => photo.id === id)
  if (!target) return
  if (target.local) URL.revokeObjectURL(target.url)

  p.photos = p.photos.filter((photo) => photo.id !== id)
  if (!p.photos.some((photo) => photo.isPrimary)) p.photos[0].isPrimary = true
  showNotice('Foto eliminada')
}

const setPrimary = (id: string) => {
  const p = profile.value
  if (!p) return
  p.photos.forEach((photo) => {
    photo.isPrimary = photo.id === id
  })
  showNotice('Foto principal actualizada')
}

onBeforeUnmount(() => {
  clearTimeout(noticeTimer)
  profile.value?.photos.forEach((photo) => {
    if (photo.local) URL.revokeObjectURL(photo.url)
  })
})

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const withoutReviews = route.query.demo === 'sinresenas'

  profile.value = {
    id: 'me',
    name: 'Ana',
    birthDate: '1999-04-12',
    gender: 'female',
    pronouns: 'ella',
    occupation: 'Diseñadora',
    zodiac: 'aries',
    city: 'Torreón',
    lookingFor: 'relationship',
    interestedIn: ['male'],
    ageMin: 22,
    ageMax: 35,
    maxDistanceKm: 30,
    visible: true,
    verified: true,
    rating: withoutReviews ? 0 : 4.8,
    reviewCount: withoutReviews ? 0 : 12,
    bio: 'Me gusta el café, el senderismo y los domingos de cine.',
    interests: ['Senderismo', 'Cine', 'Café'],
    photos: [
      { id: 'p1', url: placeholderPhoto('Foto 1'), isPrimary: true },
      { id: 'p2', url: placeholderPhoto('Foto 2'), isPrimary: false },
      { id: 'p3', url: placeholderPhoto('Foto 3'), isPrimary: false },
      { id: 'p4', url: placeholderPhoto('Foto 4'), isPrimary: false }
    ],
    reviews: withoutReviews
      ? []
      : [
          {
            id: 'r1',
            initials: 'AB',
            rating: 5,
            context: 'Café · octubre 2026',
            comment: 'Llegó puntual y fue muy amable. Todo coincidió con su perfil.'
          },
          {
            id: 'r2',
            initials: 'CD',
            rating: 4,
            context: 'Parque · septiembre 2026',
            comment: 'Muy buena conversación y se sintió como una cita segura.'
          }
        ]
  }

  loading.value = false
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

@media (max-width: 380px) {
  .public-card {
    padding: 32px 20px;
  }
}

.logo-img {
  align-self: center;
  width: 160px;
  height: auto;
}

.back-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  padding: 4px 0;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--rm-accent-dark);
  cursor: pointer;
}
.back-btn:hover {
  color: var(--rm-accent-darker);
}

.loading-text {
  text-align: center;
  font-size: 14px;
  color: var(--rm-text-secondary);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.avatar-wrap {
  position: relative;
  width: min(100%, 200px);
  aspect-ratio: 1;
}
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--rm-border);
  display: block;
}
.avatar-edit {
  position: absolute;
  right: 4%;
  bottom: 4%;
  width: 44px;
  height: 44px;
  border: 3px solid var(--rm-bg);
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}
.avatar-edit:hover {
  background: #000;
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
.meta {
  margin: 0;
  font-size: 14px;
  color: var(--rm-text-secondary);
}
.rating-pill {
  margin: 0;
  padding: 8px 16px;
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

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--rm-border);
  border-radius: 20px;
}
.visibility {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.visibility-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.visibility-text strong {
  font-size: 14px;
}
.visibility-text small {
  font-size: 12px;
  line-height: 1.4;
  color: var(--rm-text-secondary);
}

.switch {
  position: relative;
  flex-shrink: 0;
  width: 48px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: var(--rm-border);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}
.switch[aria-checked='true'] {
  background: var(--rm-text);
}
.switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #fff;
  transition: transform 0.2s;
}
.switch[aria-checked='true'] .switch-thumb {
  transform: translateX(20px);
}

.block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-margin-top: 24px;
}
.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.block h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 24px;
}
.count {
  font-size: 13px;
  font-weight: 600;
  color: var(--rm-text-muted);
}

.edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  padding: 8px 4px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--rm-accent-dark);
  cursor: pointer;
}
.edit-btn:hover {
  color: var(--rm-accent-darker);
}

.bio {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--rm-text-body);
}
.muted {
  color: var(--rm-text-muted);
}

.chips {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chips li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  font-size: 12px;
  font-weight: 600;
}
.chips.editable li {
  padding-right: 6px;
}
.chip-remove {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--rm-accent-dark);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}
.chip-remove:hover {
  background: rgba(142, 22, 34, 0.12);
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
.info-item dd.muted {
  font-weight: 500;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
  border: 1px solid var(--rm-border);
  border-radius: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.span-2 {
  grid-column: 1 / -1;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  border: 0;
}
.field label,
.field legend {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 0;
}
.field input[type='text'],
.field input[type='date'],
.field input[type='number'],
.field select,
.field textarea {
  width: 100%;
  height: 46px;
  padding: 0 18px;
  border: 1px solid var(--rm-border);
  border-radius: 999px;
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--rm-text);
  transition: border-color 0.2s;
}
.field textarea {
  height: auto;
  padding: 14px 18px;
  border-radius: 20px;
  line-height: 1.5;
  resize: vertical;
}
.field select {
  appearance: none;
  padding-right: 44px;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236E6368' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>");
  background-repeat: no-repeat;
  background-position: right 16px center;
}
.field input::placeholder,
.field textarea::placeholder {
  color: var(--rm-placeholder);
}
.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--rm-text);
}
.field .invalid {
  border-color: var(--rm-accent);
}
.field-error {
  font-size: 12px;
  color: var(--rm-accent);
}
.hint {
  font-size: 12px;
  color: var(--rm-text-muted);
}
.hint.counter {
  align-self: flex-end;
}

.inline-add {
  display: flex;
  gap: 10px;
}
.inline-add input {
  flex: 1;
  min-width: 0;
}

.choices {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.choice {
  position: relative;
  padding: 10px 18px;
  border: 1px solid var(--rm-border);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600 !important;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.choice.on {
  background: var(--rm-btn-secondary);
  border-color: var(--rm-accent);
  color: var(--rm-accent-dark);
}
.choice:focus-within {
  outline: 2px solid var(--rm-text);
  outline-offset: 2px;
}

.range {
  width: 100%;
  accent-color: var(--rm-accent);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
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
.btn-sm {
  height: 44px;
  padding: 0 22px;
  font-size: 14px;
  letter-spacing: 0.04em;
}
.btn-primary {
  background: var(--rm-text);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: #000;
}
.btn-secondary {
  background: var(--rm-btn-secondary);
  color: var(--rm-text);
}
.btn-secondary:hover:not(:disabled) {
  background: #f3bdb8;
}
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

button:focus-visible,
.slot-add:focus-within {
  outline: 2px solid var(--rm-accent);
  outline-offset: 3px;
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
.photo-grid img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.photo-grid li.slot-empty {
  background: transparent;
  border: 1px dashed var(--rm-border);
  overflow: visible;
}
.slot-add {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 18px;
  color: var(--rm-text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.slot-add:hover {
  background: #fbf7f6;
  color: var(--rm-accent-dark);
}
.badge-primary {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}
.photo-actions {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  gap: 6px;
}
.photo-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  box-shadow: 0 1px 3px rgba(20, 18, 20, 0.2);
}
.photo-btn:hover {
  background: #fff;
  color: var(--rm-accent);
}

@media (max-width: 480px) {
  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .inline-add {
    flex-direction: column;
  }
  .edit-form {
    padding: 16px;
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

.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 20;
  max-width: calc(100vw - 40px);
  margin: 0;
  padding: 12px 22px;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(20, 18, 20, 0.25);
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
    gap: 0;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .profile-side,
  .profile-main {
    height: 100vh;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .profile-side {
    padding: 24px 64px;
    gap: 16px;
    border-right: 1px solid var(--rm-border);
    scrollbar-width: none;
  }
  .profile-side::-webkit-scrollbar {
    display: none;
  }

  .logo-img {
    align-self: flex-start;
    width: 190px;
  }

  .hero {
    margin: auto 0;
    padding-bottom: 0;
    gap: 14px;
  }

  .avatar-wrap {
    width: max(180px, min(100%, 480px, calc(100vh - 370px)));
  }

  .name-row h1 {
    font-size: clamp(34px, 5.5vh, 52px);
  }

  .meta {
    font-size: 16px;
  }

  .rating-pill {
    font-size: 14px;
    padding: 10px 20px;
  }

  .profile-main {
    padding: 48px 64px;
    gap: 36px;
  }

  .profile-main > * {
    width: 100%;
    max-width: 780px;
  }

  .toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .visibility {
    flex: 1;
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
}

@media (prefers-reduced-motion: reduce) {
  .switch,
  .switch-thumb,
  .slot-add,
  .choice {
    transition: none;
  }
}
</style>