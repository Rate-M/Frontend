<template>
  <div class="simple-auth-page">
    <div class="simple-card">
      <img :src="logoUrl" alt="RateM Dating" class="logo-img" />

      <div class="form-header">
        <h1>Cambiar contraseña</h1>
        <p>Ingresa tu nueva contraseña</p>
      </div>

      <p v-if="formError" class="form-alert" role="alert">{{ formError }}</p>

      <form v-if="!success" @submit.prevent="handleResetPassword" class="simple-form" novalidate>
        <div class="field">
          <label for="rp-password">Nueva contraseña</label>
          <div class="input-wrap password-field">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
              <path d="M8 10.5V7.5a4 4 0 018 0v3" />
            </svg>
            <input
              id="rp-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres"
              autocomplete="new-password"
              :class="{ invalid: errors.password }"
              :aria-invalid="!!errors.password"
              aria-describedby="rp-password-error"
              @blur="validatePassword"
            />
            <button
              type="button"
              class="toggle-visibility"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPassword = !showPassword"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                <circle cx="12" cy="12" r="2.8" />
              </svg>
            </button>
          </div>
          <span v-if="errors.password" id="rp-password-error" class="field-error">{{ errors.password }}</span>
          <small v-else class="hint">Debe tener al menos 8 caracteres</small>
        </div>

        <div class="field">
          <label for="rp-confirm">Confirmar contraseña</label>
          <div class="input-wrap password-field">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
              <path d="M8 10.5V7.5a4 4 0 018 0v3" />
            </svg>
            <input
              id="rp-confirm"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Repite tu contraseña"
              autocomplete="new-password"
              :class="{ invalid: errors.confirmPassword }"
              :aria-invalid="!!errors.confirmPassword"
              aria-describedby="rp-confirm-error"
              @blur="validateConfirmPassword"
            />
            <button
              type="button"
              class="toggle-visibility"
              :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                <circle cx="12" cy="12" r="2.8" />
              </svg>
            </button>
          </div>
          <span v-if="errors.confirmPassword" id="rp-confirm-error" class="field-error">{{ errors.confirmPassword }}</span>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Cambiando...' : 'Cambiar contraseña' }}
        </button>
      </form>

      <p v-else class="success-message">
        ✓ Contraseña cambiada exitosamente. Redirigiendo al login...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logoUrl from '../assets/logo.png'

const router = useRouter()
const route = useRoute()

const form = reactive({
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const success = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const formError = ref('')

const validatePassword = () => {
  if (!form.password) {
    errors.password = 'La contraseña es requerida'
  } else if (form.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
  } else {
    errors.password = ''
  }
}

const validateConfirmPassword = () => {
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Debes confirmar la contraseña'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
  } else {
    errors.confirmPassword = ''
  }
}

const handleResetPassword = async () => {
  formError.value = ''
  validatePassword()
  validateConfirmPassword()

  if (errors.password || errors.confirmPassword) return

  loading.value = true

  try {
    const token = route.params.token
    // Aquí iría la llamada real a la API
    // await axios.post(`/api/auth/reset-password/${token}`, { password: form.password })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    success.value = true

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error('Error:', error)
    formError.value = 'No pudimos cambiar tu contraseña. Intenta de nuevo.'
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

.password-field input {
  padding-right: 52px;
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

.toggle-visibility {
  position: absolute;
  right: 4px;
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  color: var(--rm-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.field-error {
  font-size: 12px;
  color: var(--rm-accent);
}
.hint {
  font-size: 12px;
  color: var(--rm-text-muted);
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
</style>