<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import StatusIcon from '../components/StatusIcon.vue'
import VerificationBadge from '../components/VerificationBadge.vue'
import { useVerificationStore } from '../stores/verification'
import type { VerificationStatus } from '../types/verification'

const CAPTURE_PATH = '/verificacion' 
const HOME_PATH = '/discover'

const router = useRouter()
const store = useVerificationStore()
const { status, loading, error } = storeToRefs(store)

type IconName = 'shield' | 'shield-check' | 'shield-x' | 'clock'

const CONTENT: Record<VerificationStatus, { icon: IconName; title: string; text: string }> = {
  idle: {
    icon: 'shield',
    title: 'Verifica tu identidad',
    text: 'Para usar RateM necesitamos confirmar quién eres. Solo toma unos minutos: una foto de tu identificación y una selfie.'
  },
  pending: {
    icon: 'clock',
    title: 'Estamos revisando tu identidad',
    text: 'Normalmente tarda poco. Mientras tanto, algunas secciones estarán bloqueadas. Te avisaremos aquí en cuanto haya una respuesta.'
  },
  approved: {
    icon: 'shield-check',
    title: '¡Tu cuenta está verificada!',
    text: 'Ya puedes ver perfiles, hacer match y chatear con gente verificada.'
  },
  rejected: {
    icon: 'shield-x',
    title: 'No pudimos verificar tu identidad',
    text: 'Revisa que tu identificación y tu selfie se vean claras y vuelve a intentarlo.'
  }
}

const current = computed(() => CONTENT[status.value ?? 'pending'])

onMounted(async () => {
  await store.fetchStatus()
  if (store.status === 'pending') store.startPolling()
})

onBeforeUnmount(() => store.stopPolling())
</script>

<template>
  <main class="status-page">
    <div class="status-card">
      <div class="status-icon" :class="`status-icon-${status ?? 'pending'}`">
        <StatusIcon :name="current.icon" :size="32" />
      </div>

      <h1>{{ current.title }}</h1>
      <p class="status-text">{{ current.text }}</p>

      <VerificationBadge />

      <div class="status-actions">
        <button
          v-if="status === 'pending'"
          type="button"
          class="btn-secondary"
          :disabled="loading"
          @click="store.fetchStatus()"
        >
          {{ loading ? 'Revisando...' : 'Actualizar estado' }}
        </button>

        <button
          v-if="status === 'idle' || status === 'rejected'"
          type="button"
          class="btn-primary"
          @click="router.push(CAPTURE_PATH)"
        >
          {{ status === 'rejected' ? 'Volver a intentar' : 'Verificar identidad' }}
        </button>

        <button
          v-if="status === 'approved'"
          type="button"
          class="btn-primary"
          @click="router.push(HOME_PATH)"
        >
          Empezar a conocer gente
        </button>
      </div>

      <p v-if="error === 'network'" class="status-error" role="alert">
        No pudimos conectar con el servidor. Intenta de nuevo.
      </p>
    </div>
  </main>
</template>

<style scoped>
.status-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  font-family: var(--font-body);
  color: var(--rm-text);
}

.status-card {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  background: var(--rm-bg);
  border-radius: 28px;
  padding: 40px 28px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

.status-icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  border: 1px solid var(--rm-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rm-text);
}

.status-icon-idle,
.status-icon-pending {
  border-color: var(--rm-border);
  color: var(--rm-text-muted);
}

h1 {
  margin: 8px 0 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 32px;
  line-height: 1.1;
}

.status-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--rm-text-secondary);
}

.status-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.btn-primary,
.btn-secondary {
  height: 50px;
  border: 0;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
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
.btn-secondary:hover:not(:disabled) {
  background: #f3bdb8;
}
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-error {
  margin: 0;
  font-size: 13px;
  color: var(--rm-accent);
}
</style>