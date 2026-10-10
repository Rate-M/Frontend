<template>
  <div class="email-page">
    <div class="email-card">
      <img :src="logoUrl" alt="RateM Dating" class="logo-img" />

      <div class="form-header">
        <h1>Revisa tu correo</h1>
        <p>
          Te enviamos un enlace de confirmación a
          <strong class="email-address">{{ email }}</strong>
        </p>
      </div>

      <article class="mail" aria-label="Correo simulado">
        <header class="mail-head">
          <div class="mail-row">
            <span class="mail-label">De</span>
            <span>RateM Dating &lt;no-reply@ratem.com&gt;</span>
          </div>
          <div class="mail-row">
            <span class="mail-label">Para</span>
            <span>{{ email }}</span>
          </div>
          <div class="mail-row">
            <span class="mail-label">Asunto</span>
            <strong>Confirma tu correo en RateM</strong>
          </div>
        </header>

        <div class="mail-body">
          <p>Hola, {{ firstName }}.</p>
          <p>
            Para terminar de crear tu cuenta, confirma que este correo es tuyo. El enlace es válido
            por 24 horas.
          </p>

          <router-link :to="confirmLink" class="mail-button">Confirmar mi correo</router-link>

          <p class="mail-small">
            Si el botón no funciona, copia este enlace en tu navegador:
            <span class="mail-link">ratem.com/confirmar-correo/{{ token.slice(0, 8) }}...</span>
          </p>
          <p class="mail-small">Si no creaste una cuenta en RateM, ignora este mensaje.</p>
        </div>
      </article>

      <div class="resend">
        <p v-if="resent" class="resent-ok" role="status">
          Enviamos un enlace nuevo. El anterior ya no sirve.
        </p>
        <button type="button" class="btn-ghost" :disabled="cooldown > 0" @click="resend">
          {{ cooldown > 0 ? `Reenviar correo en ${cooldown} s` : 'Reenviar correo' }}
        </button>
        <button type="button" class="link-btn" @click="useAnotherEmail">Usar otro correo</button>
        <router-link to="/confirmar-correo/expirado" class="link-btn demo-link">
          Ver cómo se ve un enlace vencido
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '../assets/logo.png'
import { useAuthStore } from '../stores/auth'

const COOLDOWN_SECONDS = 30

const router = useRouter()
const authStore = useAuthStore()

const email = computed(() => authStore.user?.email ?? 'tu@correo.com')
const firstName = computed(() => {
  const name: string = authStore.user?.name ?? ''
  return name.trim().split(' ')[0] || 'bienvenida'
})

const token = ref(crypto.randomUUID())
const confirmLink = computed(() => `/confirmar-correo/${token.value}`)

const cooldown = ref(0)
const resent = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const stopTimer = () => {
  if (timer) clearInterval(timer)
  timer = null
}

const startCooldown = () => {
  stopTimer()
  cooldown.value = COOLDOWN_SECONDS
  timer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0) stopTimer()
  }, 1000)
}

const resend = () => {
  token.value = crypto.randomUUID()
  resent.value = true
  startCooldown()
}

const useAnotherEmail = () => {
  authStore.logout()
  router.push('/registro')
}

onMounted(() => {
  if (authStore.user?.emailVerified) {
    router.replace('/verificacion')
    return
  }
  startCooldown()
})

onBeforeUnmount(stopTimer)
</script>

<style scoped>
.email-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}

.email-card {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--rm-bg);
  border-radius: 28px;
  padding: 40px 32px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

@media (max-width: 380px) {
  .email-card {
    padding: 32px 20px;
  }
}

.logo-img {
  align-self: center;
  width: 160px;
  height: auto;
}

.form-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
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
.email-address {
  color: var(--rm-text);
  word-break: break-all;
}

.mail {
  border: 1px solid var(--rm-border);
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
}
.mail-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px;
  background: #fbf7f6;
  border-bottom: 1px solid var(--rm-border);
  font-size: 13px;
  color: var(--rm-text-body);
}
.mail-row {
  display: flex;
  gap: 12px;
}
.mail-label {
  flex-shrink: 0;
  width: 52px;
  color: var(--rm-text-muted);
}
.mail-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 20px 24px;
}
.mail-body p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--rm-text-body);
}
.mail-button {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 28px;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-decoration: none;
}
.mail-button:hover {
  background: #000;
  color: #fff;
}
.mail-body .mail-small {
  font-size: 12px;
  color: var(--rm-text-muted);
}
.mail-link {
  display: block;
  margin-top: 2px;
  color: var(--rm-accent-dark);
  word-break: break-all;
}

.resend {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.resent-ok {
  margin: 0;
  font-size: 13px;
  color: var(--rm-success);
}

.btn-ghost {
  align-self: stretch;
  height: 54px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: transparent;
  color: var(--rm-text);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
}
.btn-ghost:hover:not(:disabled) {
  border-color: var(--rm-text);
}
.btn-ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link-btn {
  border: 0;
  background: transparent;
  padding: 4px 0;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--rm-accent-dark);
  text-decoration: none;
  cursor: pointer;
}
.link-btn:hover {
  color: var(--rm-accent-darker);
}
.demo-link {
  font-weight: 400;
  color: var(--rm-text-muted);
}
</style>