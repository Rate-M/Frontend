<template>
  <div class="review-page">
    <div v-if="invitation && place && conv" class="review-shell">
      <header class="head">
        <button type="button" class="back-btn" aria-label="Volver" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1>Calificar</h1>
        <span class="head-spacer" />
      </header>

      <section class="person">
        <img :src="conv.photo" alt="" class="avatar" />
        <h2>Tu cita con <em>{{ conv.name }}</em></h2>
        <p>{{ place.name }} · {{ formatDateTime(invitation.startsAt) }}</p>
      </section>

      <section v-if="!eligible" class="notice">
        <p>Primero verifica que ambos asistieron a la cita para poder calificar.</p>
        <router-link :to="`/cita/${invitation.id}/verificar`" class="btn-primary">Verificar asistencia</router-link>
      </section>

      <template v-else-if="invitation.review">
        <section class="card">
          <h3>Tu reseña</h3>
          <StarRating :model-value="invitation.review.rating" readonly :size="26" />
          <ul v-if="invitation.review.tags.length" class="tags">
            <li v-for="t in invitation.review.tags" :key="t">{{ t }}</li>
          </ul>
          <p v-if="invitation.review.comment" class="comment">“{{ invitation.review.comment }}”</p>
        </section>

        <section v-if="invitation.theirReview" class="card their">
          <h3>Lo que {{ conv.name }} opina de ti</h3>
          <StarRating :model-value="invitation.theirReview.rating" readonly :size="26" />
          <ul v-if="invitation.theirReview.tags.length" class="tags">
            <li v-for="t in invitation.theirReview.tags" :key="t">{{ t }}</li>
          </ul>
          <p v-if="invitation.theirReview.comment" class="comment">“{{ invitation.theirReview.comment }}”</p>
        </section>

        <router-link to="/citas" class="btn-secondary">Volver a mis citas</router-link>
      </template>

      <form v-else class="form" @submit.prevent="submit">
        <fieldset class="block">
          <legend class="label">¿Cómo estuvo la cita?</legend>
          <StarRating v-model="rating" />
          <p class="rating-label" aria-live="polite">{{ ratingLabel }}</p>
        </fieldset>

        <fieldset class="block">
          <legend class="label">¿Qué destacarías? (opcional)</legend>
          <div class="chips">
            <button
              v-for="t in TAGS"
              :key="t"
              type="button"
              class="chip"
              :class="{ active: tags.includes(t) }"
              :aria-pressed="tags.includes(t)"
              @click="toggleTag(t)"
            >
              {{ t }}
            </button>
          </div>
          <p v-if="tags.includes(UNSAFE_TAG)" class="safety">
            Lamentamos que te hayas sentido así. Si estuviste en riesgo, puedes reportar a esta persona.
          </p>
        </fieldset>

        <div class="block">
          <label class="label" for="comment">Comentario (opcional)</label>
          <textarea id="comment" v-model="comment" rows="4" maxlength="300" placeholder="Cuéntanos cómo te fue en la cita..." />
          <span class="counter">{{ comment.length }}/300</span>
        </div>

        <p class="note">Las reseñas son mutuas: la otra persona verá tu calificación y tú verás la suya.</p>

        <button type="submit" class="btn-primary" :disabled="!rating">Enviar reseña</button>
      </form>
    </div>

    <div v-else class="not-found">
      <h1>No encontramos esta cita</h1>
      <router-link to="/citas" class="btn-primary">Ir a mis citas</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StarRating from '../components/dates/StarRating.vue'
import { useChatStore } from '../stores/chat'
import { useDatesStore } from '../stores/dates'
import { getPlace } from '../types/places'
import { formatDateTime } from '../utils/dateFormat'

const route = useRoute()
const router = useRouter()
const chat = useChatStore()
const dates = useDatesStore()

const invitation = computed(() => dates.getById(route.params.id as string))
const place = computed(() => (invitation.value ? getPlace(invitation.value.placeId) : undefined))
const conv = computed(() => (invitation.value ? chat.getById(invitation.value.conversationId) : undefined))

const eligible = computed(() => {
  const a = invitation.value?.attendance
  return a === 'verified' || a === 'manual_confirmed'
})

const UNSAFE_TAG = 'Me sentí incómodo/a'
const TAGS = [
  'Puntual',
  'Amable',
  'Buena conversación',
  'Me sentí seguro/a',
  'Divertido/a',
  'Llegó tarde',
  'Poca conversación',
  UNSAFE_TAG
]
const LABELS = ['', 'Mala', 'Regular', 'Buena', 'Muy buena', 'Excelente']

const rating = ref(0)
const tags = ref<string[]>([])
const comment = ref('')

const ratingLabel = computed(() => LABELS[rating.value] || 'Toca una estrella para calificar')

const toggleTag = (t: string) => {
  tags.value = tags.value.includes(t) ? tags.value.filter((x) => x !== t) : [...tags.value, t]
}

const submit = () => {
  if (!invitation.value || !rating.value) return
  dates.submitReview(invitation.value.id, {
    rating: rating.value,
    tags: tags.value,
    comment: comment.value
  })
}
</script>

<style scoped>
.review-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}
.review-shell {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--rm-bg);
  border-radius: 28px;
  padding: 28px 24px 32px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.head h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 34px;
  line-height: 1.1;
}
.back-btn,
.head-spacer {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}
.back-btn {
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}
.back-btn:hover {
  border-color: var(--rm-text);
}

.person {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}
.avatar {
  width: 84px;
  height: 84px;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 6px 18px rgba(20, 18, 20, 0.15);
}
.person h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 30px;
  line-height: 1.1;
}
.person h2 em {
  font-style: italic;
  color: var(--rm-accent);
}
.person p {
  font-size: 13px;
  color: var(--rm-text-secondary);
}

.notice {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 20px;
  background: #fdf3f2;
  border: 1px solid var(--rm-btn-secondary);
  text-align: center;
  font-size: 14px;
  line-height: 1.5;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.block {
  border: 0;
  padding: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.label {
  padding: 0;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.rating-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--rm-accent-dark);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--rm-text-body);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.chip:hover {
  border-color: var(--rm-text);
}
.chip.active {
  background: var(--rm-text);
  border-color: var(--rm-text);
  color: #fff;
}
.safety {
  padding: 12px 14px;
  border-radius: 14px;
  background: #fdf3f2;
  border: 1px solid var(--rm-accent);
  font-size: 13px;
  line-height: 1.45;
  color: var(--rm-accent-dark);
}

textarea {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid var(--rm-border);
  border-radius: 20px;
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--rm-text);
  resize: none;
  transition: border-color 0.2s;
}
textarea::placeholder {
  color: var(--rm-placeholder);
}
textarea:focus {
  outline: none;
  border-color: var(--rm-text);
}
.counter {
  align-self: flex-end;
  font-size: 12px;
  color: var(--rm-text-muted);
}
.note {
  text-align: center;
  font-size: 12px;
  line-height: 1.5;
  color: var(--rm-text-muted);
}

.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
}
.card.their {
  background: #fdf3f2;
  border-color: var(--rm-btn-secondary);
}
.card h3 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 22px;
  line-height: 1.1;
}
.tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tags li {
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  font-size: 12px;
  font-weight: 600;
}
.comment {
  font-size: 14px;
  font-style: italic;
  line-height: 1.5;
  color: var(--rm-text-body);
}

.btn-primary,
.btn-secondary {
  height: 54px;
  border: 0;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: background 0.2s, opacity 0.2s;
}
.btn-primary {
  background: var(--rm-accent);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: var(--rm-accent-dark);
  color: #fff;
}
.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-secondary {
  background: var(--rm-btn-secondary);
  color: var(--rm-text);
}
.btn-secondary:hover {
  background: #f3bdb8;
  color: var(--rm-text);
}

.not-found {
  margin: auto;
  max-width: 360px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
}
.not-found h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 32px;
  line-height: 1.1;
}

@media (max-width: 380px) {
  .review-shell {
    padding: 24px 16px 28px;
  }
}
</style>