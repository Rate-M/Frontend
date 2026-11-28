<template>
  <button type="button" class="report-button" @click="open">{{ label }}</button>
  <Teleport to="body">
    <dialog ref="dialog" aria-label="Enviar reporte">
      <form @submit.prevent="submit">
        <h2>{{ label }}</h2>
        <p v-if="sent" role="status">Enviamos tu reporte a Soporte.</p>
        <template v-else>
          <label>Motivo <textarea v-model.trim="reason" maxlength="300" rows="3" required /></label>
          <p v-if="error" role="alert">{{ error }}</p>
          <button type="submit" :disabled="sending || !reason">{{ sending ? 'Enviando…' : 'Enviar reporte' }}</button>
        </template>
        <button type="button" @click="dialog?.close()">Cerrar</button>
      </form>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{ type: 'message' | 'profile' | 'photo' | 'review'; targetId: string; label: string; photo?: string }>()
const auth = useAuthStore()
const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')
const dialog = ref<HTMLDialogElement | null>(null)
const reason = ref('')
const error = ref('')
const sending = ref(false)
const sent = ref(false)
let reportedTarget: { type: string; targetId: string; photo?: string }

function open() {
  if (sending.value) return
  reportedTarget = { type: props.type, targetId: props.targetId, ...(props.photo ? { photo: props.photo } : {}) }
  error.value = ''
  reason.value = ''
  sent.value = false
  dialog.value?.showModal()
}

async function submit() {
  if (!reason.value || sending.value || sent.value) return
  if (!auth.token) {
    error.value = 'Inicia sesión para enviar el reporte.'
    return
  }
  sending.value = true
  error.value = ''
  try {
    const response = await fetch(apiUrl + '/reports', {
      method: 'POST', headers: { Authorization: 'Bearer ' + auth.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...reportedTarget, reason: reason.value }),
    })
    if (!response.ok) {
      const result = await response.json().catch(() => null)
      error.value = result?.message ?? 'No pudimos enviar tu reporte.'
      return
    }
    sent.value = true
  } catch {
    error.value = 'No pudimos conectar con Soporte. Intenta de nuevo.'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.report-button { border: 0; background: transparent; color: var(--rm-accent-dark); text-decoration: underline; cursor: pointer; font: inherit; }
dialog { margin: auto; width: min(420px, calc(100% - 24px)); border: 1px solid var(--rm-border); border-radius: 16px; padding: 20px; color: var(--rm-text); }
dialog::backdrop { background: #14121470; }
form, label { display: grid; gap: 10px; }
textarea, form button { font: inherit; border: 1px solid var(--rm-border); border-radius: 8px; padding: 8px; }
form button { cursor: pointer; background: var(--rm-bg); }
</style>
