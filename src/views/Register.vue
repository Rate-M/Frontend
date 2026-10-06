<template>
  <div class="auth-page">
    <section class="auth-brand">
      <div class="brand-content">
        <img :src="logoUrl" alt="RateM Dating" class="logo-img" />

        <div class="brand-copy">
          <h2>Conoce gente real. <em>Sin sorpresas.</em></h2>
          <p>Verificamos cada identidad y, después de cada cita, ambos dejan una reseña privada. Así la confianza se construye cita por cita.</p>
        </div>
      </div>

      <span class="copyright">© RateM Dating</span>
    </section>

    <section class="auth-form-side">
      <img :src="logoUrl" alt="RateM Dating" class="mobile-logo" />

      <div class="auth-form-card">
        <div class="form-header">
          <h1>Crea tu cuenta</h1>
          <p>Únete y empieza a conocer gente verificada</p>
        </div>

        <p v-if="formError" class="form-alert" role="alert">{{ formError }}</p>

        <form @submit.prevent="handleRegister" class="auth-form" novalidate>
          <div class="field">
            <label for="reg-name">Nombre</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="8.5" r="3.8" />
                <path d="M4.5 20.5c1.2-3.8 4-5.8 7.5-5.8s6.3 2 7.5 5.8" />
              </svg>
              <input
                id="reg-name"
                v-model="form.name"
                type="text"
                placeholder="Tu nombre completo"
                autocomplete="given-name"
                :class="{ invalid: errors.name }"
                :aria-invalid="!!errors.name"
                aria-describedby="reg-name-error"
                @blur="validateName"
              />
            </div>
            <span v-if="errors.name" id="reg-name-error" class="field-error">{{ errors.name }}</span>
          </div>

          <div class="field">
            <label for="reg-email">Correo electrónico</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M3.5 6.5l8.5 6 8.5-6" />
              </svg>
              <input
                id="reg-email"
                v-model="form.email"
                type="email"
                placeholder="tu@correo.com"
                autocomplete="email"
                :class="{ invalid: errors.email }"
                :aria-invalid="!!errors.email"
                aria-describedby="reg-email-error"
                @blur="validateEmail"
              />
            </div>
            <span v-if="errors.email" id="reg-email-error" class="field-error">{{ errors.email }}</span>
          </div>

          <div class="field">
            <label for="reg-password">Contraseña</label>
            <div class="input-wrap password-field">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
                <path d="M8 10.5V7.5a4 4 0 018 0v3" />
              </svg>
              <input
                id="reg-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 8 caracteres"
                autocomplete="new-password"
                :class="{ invalid: errors.password }"
                :aria-invalid="!!errors.password"
                aria-describedby="reg-password-error"
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
            <span v-if="errors.password" id="reg-password-error" class="field-error">{{ errors.password }}</span>
            <small v-else class="hint">Debe tener al menos 8 caracteres</small>
          </div>

          <label for="reg-terms" class="checkbox-row">
            <input
              id="reg-terms"
              v-model="form.acceptTerms"
              type="checkbox"
              :aria-invalid="!!errors.acceptTerms"
            />
            <span>
              Acepto los
              <a href="#" @click.prevent="showLegal = 'terms'">términos</a> y el
              <a href="#" @click.prevent="showLegal = 'privacy'">aviso de privacidad</a>
            </span>
          </label>
          <span v-if="errors.acceptTerms" class="field-error">{{ errors.acceptTerms }}</span>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <div class="divider">
          <span class="line"></span>
          <span>o</span>
          <span class="line"></span>
        </div>

        <button type="button" class="btn-google" @click="registerWithGoogle">
          <span class="google-dot" aria-hidden="true"></span>
          Continuar con Google
        </button>

        <p class="switch-auth">
          ¿Ya tienes cuenta?
          <router-link to="/login">Inicia sesión</router-link>
        </p>
      </div>

      <div v-if="showLegal" class="modal-overlay" @click="showLegal = null">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2>{{ showLegal === 'privacy' ? 'Aviso de Privacidad' : 'Términos de Servicio' }}</h2>
            <button class="close-btn" @click="showLegal = null" aria-label="Cerrar">&times;</button>
          </div>
          <div class="modal-content">
            <LegalDocuments :type="showLegal" />
          </div>
          <div class="modal-footer">
            <button class="btn-modal-secondary" @click="showLegal = null">Cerrar</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LegalDocuments from '../components/LegalDocuments.vue'
import logoUrl from '../assets/logo.png'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  acceptTerms: false
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  acceptTerms: ''
})

const loading = ref(false)
const showPassword = ref(false)
const showLegal = ref<'privacy' | 'terms' | null>(null)
const formError = ref('')

const validateName = () => {
  errors.name = form.name.trim() ? '' : 'El nombre es requerido'
}

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

const handleRegister = async () => {
  formError.value = ''
  validateName()
  validateEmail()
  validatePassword()

  errors.acceptTerms = form.acceptTerms ? '' : 'Debes aceptar los términos y aviso de privacidad'

  if (errors.name || errors.email || errors.password || errors.acceptTerms) return

  loading.value = true

  try {
  
    await new Promise((resolve) => setTimeout(resolve, 1000))
    authStore.login('fake-token', {
      email: form.email,
      name: form.name,
      verified: false,
      privacyPolicyAccepted: 'v1.0',
      consents: {}
    })
    router.push('/verificacion')
  } catch (error) {
    console.error('Error al registrar:', error)
    formError.value = 'No pudimos crear tu cuenta. Intenta de nuevo en unos segundos.'
  } finally {
    loading.value = false
  }
}

const registerWithGoogle = () => {
  console.log('Registro con Google')
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
  gap: 32px;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 460px;
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

.brand-copy p {
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
  color: var(--rm-text-body);
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
  gap: 20px;
  background: var(--rm-bg);
  border-radius: 28px;
  padding: 28px 22px 24px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

.form-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.checkbox-row {
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--rm-text-secondary);
  cursor: pointer;
}

.checkbox-row input[type='checkbox'] {
  width: 20px;
  height: 20px;
  margin: 0;
  flex-shrink: 0;
  accent-color: var(--rm-text);
  cursor: pointer;
}

.checkbox-row a {
  font-weight: 600;
  text-decoration: none;
}

.btn-primary,
.btn-google {
  height: 54px;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  transition: background 0.2s, opacity 0.2s;
}

.btn-primary {
  margin-top: 4px;
  letter-spacing: 0.06em;
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

.divider {
  display: flex;
  align-items: center;
  gap: 14px;
}
.divider .line {
  flex-grow: 1;
  height: 1px;
  background: var(--rm-border);
}
.divider span:not(.line) {
  font-size: 13px;
  color: var(--rm-text-muted);
}

.btn-google {
  gap: 10px;
  letter-spacing: 0.02em;
  border: 1px solid var(--rm-text);
  background: transparent;
  color: var(--rm-text);
}
.btn-google:hover {
  background: #fafafa;
}

.google-dot {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1px dashed var(--rm-placeholder);
  box-sizing: border-box;
}

.switch-auth {
  text-align: center;
  font-size: 14px;
  color: var(--rm-text-secondary);
}
.switch-auth a {
  font-weight: 600;
  text-decoration: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 18, 20, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: var(--rm-bg);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--rm-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 22px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  color: var(--rm-text-muted);
}

.modal-content {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--rm-border);
  text-align: right;
}

.btn-modal-secondary {
  padding: 10px 22px;
  background: var(--rm-btn-secondary);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  color: var(--rm-text);
}
.btn-modal-secondary:hover {
  background: #f3bdb8;
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
    gap: 14px;
  }

  .brand-copy h2 {
    font-size: clamp(30px, 4vh, 44px);
  }

  .brand-copy p {
    font-size: 15px;
  }

  .mobile-logo {
    display: none;
  }

  .auth-form-side {
    padding: 20px 48px;
    justify-content: safe center;
  }

  .auth-form-card {
    box-shadow: none;
    padding: 0;
    border-radius: 0;
    gap: 12px;
  }

  .form-header {
    text-align: left;
  }

  .form-header h1 {
    font-size: clamp(28px, 4.2vh, 40px);
  }

  .auth-form {
    gap: 10px;
  }

  .field {
    gap: 6px;
  }

  .input-wrap input {
    height: 44px;
  }

  .toggle-visibility {
    width: 36px;
    height: 36px;
  }

  .btn-primary,
  .btn-google {
    height: 44px;
  }
}
</style>