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
          <img class="avatar" :src="profile.photos[0]" :alt="`Foto de ${profile.name}`" />

          <div class="name-row">
            <h1>{{ profile.name }}, {{ age }}</h1>
            <span v-if="profile.verified" class="verified" title="Identidad verificada">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
                <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
              </svg>
              <span class="sr-only">Identidad verificada</span>
            </span>
          </div>

          <p class="meta">{{ profile.city }} · a {{ profile.distanceKm }} km</p>

          <p v-if="profile.reviewCount > 0" class="rating-pill">
            <span aria-hidden="true">★</span> {{ profile.rating }} · {{ profile.reviewCount }} reseñas
          </p>
          <p v-else class="rating-pill muted">Aún sin reseñas</p>
        </header>
      </aside>

      <main class="profile-main">
        <p v-if="loading" class="loading-text" role="status">Cargando perfil...</p>

        <template v-else-if="profile">
          <section class="block">
            <h2>Sobre mí</h2>
            <p class="bio">{{ profile.bio }}</p>
            <ul class="chips" aria-label="Intereses">
              <li v-for="interest in profile.interests" :key="interest">{{ interest }}</li>
            </ul>
          </section>

          <section v-if="aboutItems.length" class="block">
            <h2>Información</h2>
            <dl class="info-grid">
              <div v-for="item in aboutItems" :key="item.label" class="info-item">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </section>

          <section v-if="lookingItems.length" class="block">
            <h2>Lo que busca</h2>
            <dl class="info-grid">
              <div v-for="item in lookingItems" :key="item.label" class="info-item">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </section>

          <section class="block">
            <h2>Fotos</h2>
            <ul class="photo-grid">
              <li
                v-for="(photo, index) in photoSlots"
                :key="index"
                :class="{ 'slot-empty': !photo }"
                :aria-hidden="!photo"
              >
                <img v-if="photo" :src="photo" :alt="`Foto ${index + 1} de ${profile.name}`" />
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

            <div v-if="profile.reviews.length === 0" class="empty">
              <p>Todavía no tiene reseñas.</p>
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
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logoUrl from '../assets/logo.png'

const MAX_PHOTOS = 6

interface PublicReview {
  id: string
  initials: string
  rating: number
  context: string
  comment: string
}

interface PublicProfile {
  name: string
  birthDate: string
  gender: string
  pronouns: string
  occupation: string
  zodiac: string
  lookingFor: string
  interestedIn: string[]
  ageMin: number
  ageMax: number
  city: string
  distanceKm: number
  verified: boolean
  rating: number
  reviewCount: number
  bio: string
  interests: string[]
  photos: string[]
  reviews: PublicReview[]
}

interface InfoItem {
  label: string
  value: string
}

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const profile = ref<PublicProfile | null>(null)

const placeholderPhoto = (label: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="#e6e1e3"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="#8a8486" text-anchor="middle">${label}</text></svg>`
  )

const stars = (value: number) => '★'.repeat(value) + '☆'.repeat(5 - value)

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

const interestedInLabels: Record<string, string> = {
  male: 'Hombres',
  female: 'Mujeres',
  nonbinary: 'Personas no binarias'
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
const labelFrom = (map: Record<string, string>, key: string) => map[key] ?? capitalize(key)

const ageFrom = (birthDate: string) => {
  const [year, month, day] = birthDate.split('-').map(Number)
  const today = new Date()
  let years = today.getFullYear() - year
  const beforeBirthday =
    today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)
  if (beforeBirthday) years -= 1
  return years
}

const age = computed(() => (profile.value ? ageFrom(profile.value.birthDate) : 0))

const aboutItems = computed<InfoItem[]>(() => {
  const p = profile.value
  if (!p) return []
  const items: InfoItem[] = [
    { label: 'Género', value: p.gender ? labelFrom(genderLabels, p.gender) : '' },
    { label: 'Pronombres', value: p.pronouns ? capitalize(p.pronouns) : '' },
    { label: 'Ocupación', value: p.occupation },
    { label: 'Signo', value: p.zodiac ? capitalize(p.zodiac) : '' }
  ]
  return items.filter((item) => item.value)
})

const lookingItems = computed<InfoItem[]>(() => {
  const p = profile.value
  if (!p) return []
  const items: InfoItem[] = [
    { label: 'Busca', value: p.lookingFor ? labelFrom(lookingForLabels, p.lookingFor) : '' },
    {
      label: 'Le interesan',
      value: p.interestedIn.map((key) => labelFrom(interestedInLabels, key)).join(', ')
    },
    { label: 'Rango de edad', value: p.ageMin && p.ageMax ? `${p.ageMin} a ${p.ageMax} años` : '' }
  ]
  return items.filter((item) => item.value)
})

const photoSlots = computed<(string | null)[]>(() =>
  Array.from({ length: MAX_PHOTOS }, (_, index) => profile.value?.photos[index] ?? null)
)

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const withoutReviews = route.query.demo === 'sinresenas'

  profile.value = {
    name: 'Ana',
    birthDate: '1999-04-12',
    gender: 'female',
    pronouns: 'ella',
    occupation: 'Diseñadora',
    zodiac: 'aries',
    lookingFor: 'relationship',
    interestedIn: ['male'],
    ageMin: 22,
    ageMax: 35,
    city: 'Torreón',
    distanceKm: 3,
    verified: true,
    rating: withoutReviews ? 0 : 4.8,
    reviewCount: withoutReviews ? 0 : 12,
    bio: 'Me gusta el café, el senderismo y los domingos de cine.',
    interests: ['Senderismo', 'Cine', 'Café'],
    photos: [
      placeholderPhoto('Foto 1'),
      placeholderPhoto('Foto 2'),
      placeholderPhoto('Foto 3'),
      placeholderPhoto('Foto 4'),
      placeholderPhoto('Foto 5'),
      placeholderPhoto('Foto 6')
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
.back-btn:focus-visible {
  outline: 2px solid var(--rm-accent);
  outline-offset: 3px;
  border-radius: 6px;
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
.avatar {
  width: min(100%, 200px);
  aspect-ratio: 1;
  height: auto;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--rm-border);
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px dashed var(--rm-border);
  color: var(--rm-placeholder);
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

  .avatar {
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
</style>