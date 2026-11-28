<template>
  <button type="button" class="show-reviews" @click="open">Ver reseñas</button>
  <Teleport to="body">
    <dialog ref="dialog" aria-label="Reseñas del perfil">
      <h2>Reseñas</h2>
      <p v-if="loading" role="status">Cargando reseñas…</p>
      <p v-else-if="error" role="alert">{{ error }}</p>
      <template v-else-if="result">
        <p v-if="!result.reviewCount">Este perfil todavía no tiene reseñas públicas.</p>
        <p v-else>{{ result.averageRating?.toFixed(1) }} de 5 · {{ result.reviewCount }} reseñas</p>
        <ul>
          <li v-for="review in result.reviews" :key="review.id">
            <strong>{{ review.rating }}/5</strong>
            <p v-if="review.comment">{{ review.comment }}</p>
            <ReportButton type="review" :target-id="review.id" label="Reportar reseña" />
          </li>
        </ul>
      </template>
      <button type="button" @click="dialog?.close()">Cerrar</button>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import ReportButton from '../ReportButton.vue'

const props = defineProps<{ profileId: string }>()
const auth = useAuthStore()
const api = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')
const dialog = ref<HTMLDialogElement | null>(null)
const loading = ref(false)
const error = ref('')
const result = ref<{ reviews: { id: string; rating: number; comment: string }[]; averageRating: number | null; reviewCount: number } | null>(null)
let request: AbortController | undefined

async function open() {
  if (!auth.token || loading.value) return
  const controller = new AbortController()
  request = controller
  loading.value = true
  error.value = ''
  result.value = null
  dialog.value?.showModal()
  try {
    const response = await fetch(api + '/profiles/' + encodeURIComponent(props.profileId), {
      headers: { Authorization: 'Bearer ' + auth.token }, signal: controller.signal,
    })
    if (!response.ok) throw new Error()
    result.value = await response.json()
  } catch {
    if (!controller.signal.aborted) error.value = 'No pudimos cargar las reseñas.'
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

onUnmounted(() => request?.abort())
</script>

<style scoped>
.show-reviews { background: none; border: 0; color: var(--rm-accent-dark); font: inherit; text-decoration: underline; cursor: pointer; }
dialog { margin: auto; width: min(450px, calc(100% - 24px)); max-height: 85dvh; border: 1px solid var(--rm-border); border-radius: 16px; padding: 18px; }
dialog::backdrop { background: #14121470; }
dialog h2, dialog p, dialog li { margin-bottom: 8px; overflow-wrap: anywhere; }
dialog ul { list-style: none; }
dialog li { border-top: 1px solid var(--rm-border); padding-top: 8px; }
dialog > button { margin-top: 8px; border: 1px solid var(--rm-border); border-radius: 8px; padding: 6px 12px; background: white; font: inherit; cursor: pointer; }
</style>
