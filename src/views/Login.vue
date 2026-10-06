<template>
  <div class="auth-page">
    <section class="auth-brand">
      <div class="brand-content">
        <img :src="logoUrl" alt="RateM Dating" class="logo-img" />

        <div class="brand-copy">
          <h2>Citas reales con <em>gente verificada.</em></h2>
          <ul class="benefits">
            <li>
              <span class="benefit-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
                  <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
                </svg>
              </span>
              Identidad verificada en cada perfil
            </li>
            <li>
              <span class="benefit-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 3.5l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8L12 3.5z" />
                </svg>
              </span>
              Reseñas mutuas después de cada cita
            </li>
            <li>
              <span class="benefit-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
                  <circle cx="12" cy="10" r="2.4" />
                </svg>
              </span>
              Lugares seguros para la primera cita
            </li>
          </ul>
        </div>
      </div>

      <span class="copyright">© RateM Dating</span>
    </section>

    <section class="auth-form-side">
      <img :src="logoUrl" alt="RateM Dating" class="mobile-logo" />

      <div class="auth-form-card">
        <form @submit.prevent="handleLogin" class="auth-form" novalidate>
          <div class="form-header">
            <h1>Bienvenida de vuelta</h1>
            <p>Inicia sesión para ver tus matches y citas.</p>
          </div>

          <p v-if="formError" class="form-alert" role="alert">{{ formError }}</p>

          <div class="field">
            <label for="login-email">Correo electrónico</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M3.5 6.5l8.5 6 8.5-6" />
              </svg>
              <input
                id="login-email"
                v-model="form.email"
                type="email"
                placeholder="tu@correo.com"
                autocomplete="email"
                :class="{ invalid: errors.email }"
                :aria-invalid="!!errors.email"
                aria-describedby="login-email-error"
                @blur="validateEmail"
              />
            </div>
            <span v-if="errors.email" id="login-email-error" class="field-error">{{ errors.email }}</span>
          </div>

          <div class="field">
            <label for="login-password">Contraseña</label>
            <div class="input-wrap password-field">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
                <path d="M8 10.5V7.5a4 4 0 018 0v3" />
              </svg>
              <input
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                :class="{ invalid: errors.password }"
                :aria-invalid="!!errors.password"
                aria-describedby="login-password-error"
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
            <span v-if="errors.password" id="login-password-error" class="field-error">{{ errors.password }}</span>
          </div>

          <router-link to="/recuperar" class="forgot-link">¿Olvidaste tu contraseña?</router-link>

          <div class="actions">
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
            </button>
            <router-link to="/registro" class="btn-secondary">Crear cuenta</router-link>
          </div>
        </form>

        <div class="trust-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
            <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
          </svg>
          <span>Todas las cuentas están verificadas</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import logoUrl from '../assets/logo.png'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)
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

const validatePassword = () => {
  if (!form.password) {
    errors.password = 'La contraseña es requerida'
  } else if (form.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
  } else {
    errors.password = ''
  }
}

const handleLogin = async () => {
  formError.value = ''
  validateEmail()
  validatePassword()

  if (errors.email || errors.password) return

  loading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    authStore.login('fake-token', {
      email: form.email,
      name: 'Usuario',
      verified: true
    })
    router.push('/descubrir')
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    formError.value = 'No pudimos iniciar tu sesión. Verifica tus datos e intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
}

.auth-brand {
  display: none;
}

.logo-img {
  width: 300px;
  height: auto;
  display: block;
}

.mobile-logo {
  display: block;
  width: 220px;
  height: auto;
  margin: 0 auto 4px;
}

.brand-content {
  margin: auto 0;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 480px;
}

.brand-copy h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 44px;
  line-height: 1.08;
}
.brand-copy h2 em {
  font-style: italic;
  color: var(--rm-accent);
}

.benefits {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.benefits li {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 15px;
  color: var(--rm-text-body);
}

.benefit-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid var(--rm-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rm-text);
}

.copyright {
  font-size: 12px;
  color: var(--rm-text-muted);
}

.auth-form-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.auth-form-card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  background: var(--rm-bg);
  border-radius: 28px;
  padding: 28px 22px 24px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;
  text-align: center;
}

.form-header h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 40px;
  line-height: 1.05;
}

.form-header p {
  margin: 0;
  font-size: 15px;
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

.forgot-link {
  align-self: flex-end;
  font-size: 13px;
  color: var(--rm-text-muted);
  text-decoration: none;
}
.forgot-link:hover {
  color: var(--rm-accent-dark);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}

.btn-primary,
.btn-secondary {
  height: 54px;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: 0;
  transition: background 0.2s, opacity 0.2s;
}

.btn-primary {
  background: var(--rm-text);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: #000;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--rm-btn-secondary);
  color: var(--rm-text);
}
.btn-secondary:hover {
  background: #f3bdb8;
}

.trust-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: var(--rm-text-muted);
}
.trust-badge svg {
  color: var(--rm-accent-dark);
  flex-shrink: 0;
}

@media (max-width: 380px) {
  .auth-form-card {
    padding: 24px 18px 20px;
  }
}

@media (min-width: 900px) {
  .auth-page {
    height: 100vh;
    grid-template-columns: 1fr 1fr;
  }

  .auth-brand,
  .auth-form-side {
    height: 100vh;
    overflow-y: auto;
  }

  .auth-brand {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 36px 64px;
  }

  .logo-img {
    width: 340px;
  }

  .brand-copy {
    gap: 18px;
  }

  .brand-copy h2 {
    font-size: clamp(30px, 4vh, 44px);
  }

  .mobile-logo {
    display: none;
  }

  .auth-form-side {
    padding: 24px 48px;
    justify-content: safe center;
  }

  .auth-form-card {
    box-shadow: none;
    padding: 0;
    border-radius: 0;
    gap: 16px;
  }

  .form-header {
    text-align: left;
    gap: 6px;
    margin-bottom: 0;
  }

  .form-header h1 {
    font-size: clamp(28px, 4.2vh, 40px);
  }

  .auth-form {
    gap: 12px;
  }

  .field {
    gap: 6px;
  }

  .input-wrap input {
    height: 46px;
  }

  .toggle-visibility {
    width: 38px;
    height: 38px;
  }

  .actions {
    gap: 8px;
    margin-top: 2px;
  }

  .btn-primary,
  .btn-secondary {
    height: 46px;
  }
}
</style>