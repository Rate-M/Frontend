<template>
  <section class="review" aria-label="Reseña de la cita">
    <p v-if="error" role="alert">{{ error }}</p>
    <form v-if="status?.canReview" @submit.prevent="submit">
      <label>Calificación
        <select v-model.number="rating" required>
          <option :value="0" disabled>Elige de 1 a 5</option>
          <option v-for="score in 5" :key="score" :value="score">{{ score }}</option>
        </select>
      </label>
      <label>Comentario (opcional)
        <textarea v-model.trim="comment" maxlength="300" rows="2" />
      </label>
      <button :disabled="busy || !rating">Enviar reseña</button>
    </form>
    <template v-if="status?.yourReview">
      <p>Tu reseña · {{ status.yourReview.rating }}/5</p>
      <p v-if="status.yourReview.comment">{{ status.yourReview.comment }}</p>
      <p v-if="status.yourReview.status === 'hidden'">Tu reseña sigue privada hasta que ambos hayan calificado.</p>
    </template>
    <template v-if="status?.otherReview">
      <p>Reseña de la otra persona · {{ status.otherReview.rating }}/5</p>
      <p v-if="status.otherReview.comment">{{ status.otherReview.comment }}</p>
    </template>
    <p v-if="status && !status.canReview && !status.yourReview">Ya terminó el plazo para calificar esta cita.</p>
    <button v-if="error || status?.yourReview?.status === 'hidden'" type="button" :disabled="busy" @click="refresh">Actualizar reseñas</button>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

interface Review {
  rating: number
  comment: string
  status: 'hidden' | 'published'
}

interface ReviewStatus {
  canReview: boolean
  yourReview: Review | null
  otherReview: Review | null
}

const props = defineProps<{ matchId: string; invitationId: string }>()
const auth = useAuthStore()
const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')
const status = ref<ReviewStatus | null>(null)
const busy = ref(false)
const error = ref('')
const rating = ref(0)
const comment = ref('')

async function request<T>(token: string, body?: { rating: number; comment: string }): Promise<T> {
  const path = '/matches/' + encodeURIComponent(props.matchId) + '/invitations/' + encodeURIComponent(props.invitationId) + '/review'
  const response = await fetch(apiUrl + path, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data) throw new Error(data?.message ?? 'No pudimos consultar o guardar la reseña.')
  return data
}

async function run(submitReview = false) {
  const token = auth.token
  if (busy.value || !token) return
  busy.value = true
  error.value = ''
  try {
    if (submitReview && status.value) {
      const review = await request<Review>(token, { rating: rating.value, comment: comment.value })
      if (token !== auth.token) return
      status.value = { ...status.value, canReview: false, yourReview: review }
    }
    const result = await request<ReviewStatus>(token)
    if (token === auth.token) status.value = result
  } catch (cause) {
    if (token === auth.token) error.value = cause instanceof Error ? cause.message : 'No pudimos completar la solicitud.'
  } finally {
    busy.value = false
  }
}

const refresh = () => run()
const submit = () => run(true)
onMounted(refresh)
</script>

<style scoped>
.review { flex-basis: 100%; border-top: 1px solid var(--rm-border); margin-top: 8px; padding-top: 8px; display: grid; gap: 6px; }
.review form, label { display: grid; gap: 6px; }
button, select, textarea { width: fit-content; max-width: 100%; border: 1px solid var(--rm-border); border-radius: 8px; padding: 6px 10px; font: inherit; background: var(--rm-bg); }
</style>
