<template>
  <div class="confirm-page">
    <div class="confirm-card">
      <img :src="logoUrl" alt="RateM Dating" class="logo-img" />

      <section v-if="state === 'checking'" class="state" role="status" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        <div class="form-header">
          <h1>Confirmando tu correo</h1>
          <p>Solo será un momento.</p>
        </div>
      </section>

      <section v-else-if="state === 'success'" class="state" role="status">
        <div class="result-icon success">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <path d="M3.5 6.5l8.5 6 8.5-6" />
          </svg>
        </div>
        <div class="form-header">
          <h1>Correo confirmado</h1>
          <p>
            Ya confirmamos tu correo. El siguiente paso es verificar tu identidad para terminar de
            crear tu cuenta.
          </p>
        </div>
        <button type="button" class="btn-primary" @click="router.push('/verificacion')">
          Continuar
        </button>
      </section>

      <section v-else class="state" role="alert">
        <div class="result-icon error">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5V12l3 2" />
          </svg>
        </div>
        <div class="form-header">
          <h1>Este enlace venció</h1>
          <p>Los enlaces duran 24 horas. Pide uno nuevo y te lo enviamos otra vez.</p>
        </div>
        <button type="button" class="btn-primary" @click="router.push('/confirmar-correo')">
          Pedir un enlace nuevo
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logoUrl from '../assets/logo.png'
import { useAuthStore } from '../stores/auth'

type State = 'checking' | 'success' | 'expired'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const state = ref<State>('checking')

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

onMounted(async () => {
  await wait(1200)

  // Simulación: el token "expirado" muestra el enlace vencido, cualquier otro es válido
  if (route.params.token === 'expirado') {
    state.value = 'expired'
    return
  }

  authStore.setEmailVerified()
  state.value = 'success'
})
</script>

<style scoped>
.confirm-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}

.confirm-card {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: var(--rm-bg);
  border-radius: 28px;
  padding: 40px 32px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

@media (max-width: 380px) {
  .confirm-card {
    padding: 32px 20px;
  }
}

.logo-img {
  align-self: center;
  width: 160px;
  height: auto;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  text-align: center;
}

.form-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-header h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 34px;
  line-height: 1.1;
}
.form-header p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--rm-text-secondary);
}

.spinner {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 3px solid var(--rm-border);
  border-top-color: var(--rm-accent);
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation-duration: 3s;
  }
}

.result-icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.result-icon.success {
  background: var(--rm-success-bg);
  color: var(--rm-success);
}
.result-icon.error {
  background: #fbeaea;
  color: var(--rm-accent);
}

.btn-primary {
  align-self: stretch;
  height: 54px;
  border: 0;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
}
.btn-primary:hover {
  background: #000;
}
</style>