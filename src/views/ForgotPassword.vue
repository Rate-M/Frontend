<template>
  <div class="simple-auth-page">
    <div class="simple-card">
      <img :src="logoUrl" alt="RateM Dating" class="logo-img" />

      <div class="form-header">
        <h1>Recuperar contraseña</h1>
        <p>Ingresa tu correo y te enviaremos instrucciones para restablecerla</p>
      </div>

      <p v-if="formError" class="form-alert" role="alert">{{ formError }}</p>

      <form v-if="!success" @submit.prevent="handleForgotPassword" class="simple-form" novalidate>
        <div class="field">
          <label for="fp-email">Correo electrónico</label>
          <div class="input-wrap">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2.5" />
              <path d="M3.5 6.5l8.5 6 8.5-6" />
            </svg>
            <input
              id="fp-email"
              v-model="form.email"
              type="email"
              placeholder="tu@correo.com"
              autocomplete="email"
              :class="{ invalid: errors.email }"
              :aria-invalid="!!errors.email"
              aria-describedby="fp-email-error"
              @blur="validateEmail"
            />
          </div>
          <span v-if="errors.email" id="fp-email-error" class="field-error">{{ errors.email }}</span>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar instrucciones' }}
        </button>
      </form>

      <p v-else class="success-message">
        ✓ Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.
      </p>

      <router-link to="/login" class="back-link">← Volver al inicio de sesión</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import logoUrl from '../assets/logo.png'

const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

const loading = ref(false)
const success = ref(false)
const formError = ref('')

const validateEmail = () => {
  if (!form.email) {
    errors.email = 'El correo es requerido'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Ingresa un correo válido'
  } else {
    errors.email = ''
  }
}

const handleForgotPassword = async () => {
  formError.value = ''
  validateEmail()

  if (errors.email) return

  loading.value = true

  try {


    await new Promise((resolve) => setTimeout(resolve, 1000))
    success.value = true
  } catch (error) {
    console.error('Error:', error)
    formError.value = 'No pudimos procesar tu solicitud. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.simple-auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.simple-card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--rm-bg);
  border-radius: 28px;
  padding: 40px 32px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

@media (max-width: 380px) {
  .simple-card {
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

.form-alert {
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fbeaea;
  border: 1px solid var(--rm-accent);
  color: var(--rm-accent-dark);
  font-size: 13px;
}

.simple-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 18px;
  color: var(--rm-text-muted);
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  height: 52px;
  box-sizing: border-box;
  padding: 0 18px 0 48px;
  border: 1px solid var(--rm-border);
  border-radius: 999px;
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--rm-text);
  transition: border-color 0.2s;
}

.input-wrap input::placeholder {
  color: var(--rm-placeholder);
}
.input-wrap input:focus {
  outline: none;
  border-color: var(--rm-text);
}
.input-wrap input.invalid {
  border-color: var(--rm-accent);
}

.field-error {
  font-size: 12px;
  color: var(--rm-accent);
}

.btn-primary {
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
.btn-primary:hover:not(:disabled) {
  background: #000;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  background: var(--rm-success-bg);
  border: 1px solid var(--rm-success);
  color: var(--rm-success);
  padding: 16px;
  border-radius: 14px;
  text-align: center;
  font-size: 14px;
  line-height: 1.5;
}

.back-link {
  align-self: center;
  font-size: 14px;
  color: var(--rm-text-muted);
  text-decoration: none;
}
.back-link:hover {
  color: var(--rm-accent-dark);
}
</style>