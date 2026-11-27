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

    
      <template v-else-if="state === 'published' && invitation.review && invitation.theirReview">
        <div class="banner ok" role="status">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <div>
            <strong>¡Reseñas publicadas!</strong>
            <p>Ambos calificaron, así que ya puedes ver las dos reseñas.</p>
          </div>
        </div>

        <section class="card">
          <h3>Tu reseña</h3>
          <StarRating :model-value="invitation.review.rating" readonly :size="26" />
          <ul v-if="invitation.review.tags.length" class="tags">
            <li v-for="t in invitation.review.tags" :key="t">{{ t }}</li>
          </ul>
          <p v-if="invitation.review.comment" class="comment">“{{ invitation.review.comment }}”</p>
        </section>

        <section class="card their">
          <h3>Lo que {{ conv.name }} opina de ti</h3>
          <StarRating :model-value="invitation.theirReview.rating" readonly :size="26" />
          <ul v-if="invitation.theirReview.tags.length" class="tags">
            <li v-for="t in invitation.theirReview.tags" :key="t">{{ t }}</li>
          </ul>
          <p v-if="invitation.theirReview.comment" class="comment">“{{ theirComment.text }}”</p>

          <p v-if="theirComment.count > 0" class="filtered" role="note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
              <path d="M9 12h6" />
            </svg>
            Filtrado automáticamente: se ocultaron {{ theirComment.count }}
            {{ theirComment.count === 1 ? 'palabra no permitida' : 'palabras no permitidas' }}.
          </p>
        </section>

        <router-link to="/citas" class="btn-secondary">Volver a mis citas</router-link>
      </template>

    
      <template v-else-if="state === 'waiting' && invitation.review">
        <div class="banner wait" role="status">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
            <path d="M8 10.5V8a4 4 0 018 0v2.5" />
          </svg>
          <div>
            <strong>Reseña enviada</strong>
            <p>Se publicará cuando {{ conv.name }} también califique. Hasta entonces nadie la puede ver.</p>
          </div>
        </div>

        <section class="card">
          <div class="card-head">
            <h3>Tu reseña</h3>
            <span class="lock-badge">Privada</span>
          </div>
          <StarRating :model-value="invitation.review.rating" readonly :size="26" />
          <ul v-if="invitation.review.tags.length" class="tags">
            <li v-for="t in invitation.review.tags" :key="t">{{ t }}</li>
          </ul>
          <p v-if="invitation.review.comment" class="comment">“{{ invitation.review.comment }}”</p>
        </section>

        <section class="card sealed">
          <div class="card-head">
            <h3>La reseña de {{ conv.name }}</h3>
            <span class="lock-badge">Pendiente</span>
          </div>
          <p class="sealed-text">Aún no ha calificado. Aparecerá aquí en cuanto lo haga.</p>
        </section>

        <div class="demo">
          <p class="demo-title">Solo diseño · Simular que {{ conv.name }} califica</p>
          <div class="demo-actions">
            <button type="button" class="demo-btn" @click="dates.simulateTheirReview(invitation.id, 'clean')">
              Con comentario normal
            </button>
            <button type="button" class="demo-btn" @click="dates.simulateTheirReview(invitation.id, 'prohibited')">
              Con palabras prohibidas
            </button>
          </div>
        </div>

        <router-link to="/citas" class="btn-secondary">Volver a mis citas</router-link>
      </template>

      <!-- Formulario para calificar -->
      <form v-else class="form" @submit.prevent="submit">
        <div v-if="invitation.theirReview" class="banner wait" role="status">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
            <path d="M8 10.5V8a4 4 0 018 0v2.5" />
          </svg>
          <div>
            <strong>{{ conv.name }} ya calificó</strong>
            <p>Verás su reseña en cuanto envíes la tuya.</p>
          </div>
        </div>

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
          <textarea
            id="comment"
            v-model="comment"
            rows="4"
            maxlength="300"
            placeholder="Cuéntanos cómo te fue en la cita..."
            :class="{ invalid: blocked }"
            :aria-invalid="blocked"
            aria-describedby="comment-help"
          />
          <div class="comment-meta">
            <span class="counter">{{ comment.length }}/300</span>
          </div>

          <p v-if="blocked" id="comment-help" class="field-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5v5M12 16v.01" />
            </svg>
            <span>
              Tu comentario contiene palabras no permitidas ({{ badWordsMasked }}). Quítalas para poder enviar tu reseña.
            </span>
          </p>
          <p v-else id="comment-help" class="field-help">
            Filtro automático: no se permiten insultos ni lenguaje ofensivo.
          </p>
        </div>

        <p class="note">
          Las reseñas se publican solo cuando ambos hayan calificado. Antes de eso, nadie puede ver la tuya.
        </p>

        <button type="submit" class="btn-primary" :disabled="!rating || blocked">Enviar reseña</button>
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
import { reviewState } from '../utils/reviews'
import { findProhibited, maskProhibited, maskWord } from '../utils/moderation'

const route = useRoute()
const router = useRouter()
const chat = useChatStore()
const dates = useDatesStore()

const invitation = computed(() => dates.getById(route.params.id as string))
const place = computed(() => (invitation.value ? getPlace(invitation.value.placeId) : undefined))
const conv = computed(() => (invitation.value ? chat.getById(invitation.value.conversationId) : undefined))
const state = computed(() => (invitation.value ? reviewState(invitation.value) : 'to_write'))

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

const badWords = computed(() => findProhibited(comment.value))
const blocked = computed(() => badWords.value.length > 0)
const badWordsMasked = computed(() => badWords.value.map(maskWord).join(', '))

const theirComment = computed(() => maskProhibited(invitation.value?.theirReview?.comment ?? ''))

const toggleTag = (t: string) => {
  tags.value = tags.value.includes(t) ? tags.value.filter((x) => x !== t) : [...tags.value, t]
}

const submit = () => {
  if (!invitation.value || !rating.value || blocked.value) return
  const ok = dates.submitReview(invitation.value.id, {
    rating: rating.value,
    tags: tags.value,
    comment: comment.value
  })
  if (ok) window.scrollTo({ top: 0, behavior: 'smooth' })
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

.banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid var(--rm-border);
  font-size: 14px;
  line-height: 1.45;
}
.banner svg {
  flex-shrink: 0;
  margin-top: 1px;
}
.banner strong {
  display: block;
  margin-bottom: 2px;
}
.banner p {
  color: var(--rm-text-body);
}
.banner.ok {
  background: var(--rm-success-bg);
  border-color: var(--rm-success);
}
.banner.ok svg,
.banner.ok strong {
  color: var(--rm-success);
}
.banner.wait {
  background: #fdf3f2;
  border-color: var(--rm-btn-secondary);
}
.banner.wait svg {
  color: var(--rm-accent-dark);
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
textarea.invalid {
  border-color: var(--rm-accent);
  background: #fdf3f2;
}
.comment-meta {
  display: flex;
  justify-content: flex-end;
}
.counter {
  font-size: 12px;
  color: var(--rm-text-muted);
}
.field-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fdf3f2;
  border: 1px solid var(--rm-accent);
  font-size: 13px;
  line-height: 1.45;
  color: var(--rm-accent-dark);
}
.field-error svg {
  flex-shrink: 0;
  margin-top: 1px;
}
.field-help {
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
.card.sealed {
  background: #f6f3f3;
  border-style: dashed;
}
.card-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.card h3 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 22px;
  line-height: 1.1;
}
.lock-badge {
  flex-shrink: 0;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  font-size: 11px;
  font-weight: 600;
}
.sealed-text {
  font-size: 14px;
  color: var(--rm-text-secondary);
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
.filtered {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--rm-bg);
  border: 1px solid var(--rm-border);
  font-size: 12px;
  line-height: 1.45;
  color: var(--rm-text-secondary);
}
.filtered svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--rm-accent-dark);
}

.demo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px dashed var(--rm-placeholder);
}
.demo-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rm-text-muted);
}
.demo-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.demo-btn {
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--rm-text);
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--rm-text);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.demo-btn:hover {
  background: var(--rm-text);
  color: #fff;
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