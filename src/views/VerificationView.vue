<template>
  <div class="verify-page">
    <div class="verify-card">
      <img :src="logoUrl" alt="RateM Dating" class="logo-img" />

      <div v-if="showProgress" class="progress">
        <span class="progress-text">Paso {{ stepIndex + 1 }} de {{ flow.length }}</span>
        <div
          class="progress-bar"
          role="progressbar"
          :aria-valuenow="stepIndex + 1"
          aria-valuemin="1"
          :aria-valuemax="flow.length"
        >
          <span :style="{ width: progressPct + '%' }"></span>
        </div>
      </div>

      <!-- CONSENTIMIENTO -->
      <section v-if="step === 'consent'" class="step">
        <div class="form-header">
          <h1>Verifica tu identidad</h1>
          <p>Todas las cuentas de RateM son de personas reales y mayores de 18 años.</p>
        </div>

        <ul class="how-list">
          <li>
            <span class="how-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <circle cx="9" cy="11" r="2" />
                <path d="M6.5 16c.6-1.6 1.6-2.4 2.5-2.4s1.9.8 2.5 2.4M14 10h4M14 13h3" />
              </svg>
            </span>
            <div>
              <strong>Elige un documento oficial</strong>
              <small>INE, pasaporte o licencia de conducir vigentes.</small>
            </div>
          </li>
          <li>
            <span class="how-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 8.5A2.5 2.5 0 016.5 6H8l1.2-1.8h5.6L16 6h1.5A2.5 2.5 0 0120 8.5v8a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-8z" />
                <circle cx="12" cy="12.5" r="3.2" />
              </svg>
            </span>
            <div>
              <strong>Toma una foto de tu documento</strong>
              <small>Con buena luz y todo el texto legible.</small>
            </div>
          </li>
          <li>
            <span class="how-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="8.5" r="3.8" />
                <path d="M4.5 20.5c1.2-3.8 4-5.8 7.5-5.8s6.3 2 7.5 5.8" />
              </svg>
            </span>
            <div>
              <strong>Tómate una selfie</strong>
              <small>La comparamos con la foto de tu documento.</small>
            </div>
          </li>
        </ul>

        <div class="note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
            <path d="M8 10.5V7.5a4 4 0 018 0v3" />
          </svg>
          <p>
            Esta es una versión de prueba: tus fotos se guardan solo de forma temporal en este
            navegador y se eliminan al terminar la verificación.
          </p>
        </div>

        <label for="vf-consent" class="checkbox-row">
          <input
            id="vf-consent"
            v-model="consentChecked"
            type="checkbox"
            :aria-invalid="!!consentError"
            @change="consentError = ''"
          />
          <span>
            Autorizo que RateM use mi selfie y mi documento para verificar mi identidad y mi
            mayoría de edad. Puedo revocar esta autorización cuando quiera. Lee el
            <a href="#" @click.prevent="showLegal = 'privacy'">aviso de privacidad</a>.
          </span>
        </label>
        <span v-if="consentError" class="field-error" role="alert">{{ consentError }}</span>

        <div class="actions">
          <button type="button" class="btn-primary" @click="acceptConsent">Empezar</button>
        </div>
      </section>

      <!-- ELEGIR DOCUMENTO -->
      <section v-else-if="step === 'document'" class="step">
        <div class="form-header">
          <h1>Elige tu documento</h1>
          <p>Usa un documento oficial vigente con tu foto.</p>
        </div>

        <fieldset class="doc-list">
          <legend class="sr-only">Tipo de documento</legend>
          <label v-for="opt in DOCUMENT_OPTIONS" :key="opt.value" class="doc-card">
            <input v-model="selectedType" type="radio" name="vf-document" :value="opt.value" />
            <span class="doc-body">
              <span class="doc-icon">
                <svg v-if="opt.value === 'passport'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="5.5" y="3.5" width="13" height="17" rx="2" />
                  <circle cx="12" cy="10.5" r="3" />
                  <path d="M9.5 16.5h5" />
                </svg>
                <svg v-else-if="opt.value === 'driver_license'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path d="M7 15l1-3h8l1 3M7 15h10M8.5 15v1.5M15.5 15v1.5" />
                </svg>
                <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <circle cx="9" cy="11" r="2" />
                  <path d="M6.5 16c.6-1.6 1.6-2.4 2.5-2.4s1.9.8 2.5 2.4M14 10h4M14 13h3" />
                </svg>
              </span>
              <span class="doc-text">
                <strong>{{ opt.label }}</strong>
                <small>{{ opt.description }}</small>
              </span>
              <span class="doc-radio" aria-hidden="true"></span>
            </span>
          </label>
        </fieldset>

        <div class="actions actions-row">
          <button type="button" class="btn-ghost" @click="back">Atrás</button>
          <button type="button" class="btn-primary" :disabled="!selectedType" @click="next">
            Continuar
          </button>
        </div>
      </section>

      <!-- CAPTURAS -->
      <section v-else-if="step === 'front' || step === 'back' || step === 'selfie'" class="step">
        <div class="form-header">
          <h1>{{ captureCopy.title }}</h1>
          <p>{{ captureCopy.hint }}</p>
        </div>

        <p v-if="storageError" class="form-alert" role="alert">{{ storageError }}</p>

        <CameraCapture
          :key="step"
          :facing="step === 'selfie' ? 'user' : 'environment'"
          :shape="step === 'selfie' ? 'portrait' : 'document'"
          @captured="onCaptured"
        />

        <div class="actions">
          <button type="button" class="btn-ghost" @click="cancelCapture">
            {{ fromReview ? 'Volver a la revisión' : 'Atrás' }}
          </button>
        </div>
      </section>

      <!-- REVISIÓN -->
      <section v-else-if="step === 'review'" class="step">
        <div class="form-header">
          <h1>Revisa tus fotos</h1>
          <p>Confirma que se ven bien antes de enviarlas.</p>
        </div>

        <ul class="review-grid">
          <li v-for="item in reviewItems" :key="item.slot" class="review-item">
            <div class="thumb" :class="item.slot === 'selfie' ? 'portrait' : 'document'">
              <img :src="item.src" :alt="item.label" />
            </div>
            <div class="thumb-foot">
              <span>{{ item.label }}</span>
              <button type="button" class="link-btn" @click="retake(item.slot)">Cambiar</button>
            </div>
          </li>
        </ul>

        <div class="actions">
          <button type="button" class="btn-primary" @click="submitVerification">
            Enviar para verificar
          </button>
          <button type="button" class="btn-ghost" @click="back">Atrás</button>
        </div>
      </section>

      <!-- PROCESANDO -->
      <section v-else-if="step === 'processing'" class="step center" role="status" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        <div class="form-header">
          <h1>Verificando</h1>
          <p>{{ processingMessage }}</p>
        </div>
      </section>

      <!-- RESULTADO -->
      <section v-else class="step center" role="status">
        <div class="result-icon" :class="status">
          <svg v-if="status === 'approved'" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
            <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
          </svg>
          <svg v-else width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5.5M12 16.5v.01" />
          </svg>
        </div>

        <div class="form-header">
          <h1>{{ status === 'approved' ? 'Identidad verificada' : 'No pudimos verificarte' }}</h1>
          <p v-if="status === 'approved'">Ya puedes crear tu perfil y empezar a conocer gente.</p>
          <p v-else>Revisa estos puntos y vuelve a intentarlo con fotos nuevas.</p>
        </div>

        <ul v-if="status === 'rejected'" class="tips">
          <li>El documento se ve completo, sin reflejos ni sombras.</li>
          <li>Tu cara se ve de frente y con buena luz.</li>
          <li>El documento está vigente.</li>
        </ul>

        <p class="deleted-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
            <path d="M8 10.5V7.5a4 4 0 018 0v3" />
          </svg>
          Eliminamos tus fotos de este navegador.
        </p>

        <div class="actions">
          <button v-if="status === 'approved'" type="button" class="btn-primary" @click="goToProfile">
            Crear mi perfil
          </button>
          <button v-else type="button" class="btn-primary" @click="retryAfterReject">
            Intentar de nuevo
          </button>
        </div>
      </section>
    </div>

    <LegalModal :type="showLegal" @close="showLegal = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logoUrl from '../assets/logo.png'
import LegalModal from '../components/LegalModal.vue'
import CameraCapture from '../components/verification/CameraCapture.vue'
import { DOCUMENT_OPTIONS } from '../types/verification'
import type { CaptureSlot, DocumentType, VerificationStatus } from '../types/verification'
import { mockVerificationStorage } from '../services/mockVerificationStorage'
import { useVerificationStore } from '../stores/verification'
import { useAuthStore } from '../stores/auth'
import { LEGAL_VERSIONS } from '../legal/versions'

type Step = 'consent' | 'document' | 'front' | 'back' | 'selfie' | 'review' | 'processing' | 'result'

// Ajusta esta ruta a la de tu formulario de crear perfil
const NEXT_ROUTE = '/perfil/crear'

const PROCESSING_MESSAGES = [
  'Revisando tu documento...',
  'Comparando tu selfie con tu documento...',
  'Confirmando tu mayoría de edad...'
]

const router = useRouter()
const route = useRoute()
const verification = useVerificationStore()
const authStore = useAuthStore()

const step = ref<Step>('consent')
const consentChecked = ref(false)
const consentError = ref('')
const selectedType = ref<DocumentType | ''>('')
const showLegal = ref<'privacy' | 'terms' | null>(null)
const storageError = ref('')
const fromReview = ref(false)
const status = ref<VerificationStatus>('idle')
const processingMessage = ref(PROCESSING_MESSAGES[0])

const captures = ref<Record<CaptureSlot, string | null>>({
  front: null,
  back: null,
  selfie: null
})

const selectedDoc = computed(() => DOCUMENT_OPTIONS.find((d) => d.value === selectedType.value))

const flow = computed<Step[]>(() => [
  'consent',
  'document',
  'front',
  ...(selectedDoc.value?.needsBack ? (['back'] as Step[]) : []),
  'selfie',
  'review'
])

const stepIndex = computed(() => flow.value.indexOf(step.value))
const showProgress = computed(() => stepIndex.value >= 0)
const progressPct = computed(() => ((stepIndex.value + 1) / flow.value.length) * 100)

const next = () => {
  const target = flow.value[stepIndex.value + 1]
  if (target) step.value = target
}

const back = () => {
  const target = flow.value[stepIndex.value - 1]
  if (target) step.value = target
}

const captureCopy = computed(() => {
  const noun = selectedDoc.value?.noun ?? 'documento'
  const needsBack = selectedDoc.value?.needsBack ?? false

  if (step.value === 'selfie') {
    return {
      title: 'Tómate una selfie',
      hint: 'Mira a la cámara con buena luz, sin lentes oscuros ni gorra.'
    }
  }
  if (step.value === 'back') {
    return {
      title: `Reverso de tu ${noun}`,
      hint: 'Voltea el documento y colócalo dentro del marco.'
    }
  }
  return {
    title: needsBack ? `Frente de tu ${noun}` : `Foto de tu ${noun}`,
    hint:
      selectedType.value === 'passport'
        ? 'Abre el pasaporte en la página con tu foto y colócalo dentro del marco.'
        : 'Coloca el documento dentro del marco, sin reflejos y con todo el texto legible.'
  }
})

const reviewItems = computed(() => {
  const noun = selectedDoc.value?.noun ?? 'documento'
  const needsBack = selectedDoc.value?.needsBack ?? false
  const items: { slot: CaptureSlot; label: string; src: string | null }[] = [
    { slot: 'front', label: needsBack ? `Frente de tu ${noun}` : `Tu ${noun}`, src: captures.value.front },
    { slot: 'back', label: `Reverso de tu ${noun}`, src: captures.value.back },
    { slot: 'selfie', label: 'Tu selfie', src: captures.value.selfie }
  ]
  return items.filter((item): item is { slot: CaptureSlot; label: string; src: string } => !!item.src)
})

const discard = (slot: CaptureSlot) => {
  mockVerificationStorage.remove(slot)
  captures.value[slot] = null
}

const discardAll = () => {
  mockVerificationStorage.purgeAll()
  captures.value = { front: null, back: null, selfie: null }
}

watch(selectedType, () => {
  discard('front')
  discard('back')
})

const acceptConsent = () => {
  if (!consentChecked.value) {
    consentError.value = 'Debes dar tu autorización para continuar'
    return
  }
  verification.grantBiometricConsent(LEGAL_VERSIONS.privacy)
  next()
}

const onCaptured = (dataUrl: string) => {
  const slot = step.value as CaptureSlot
  storageError.value = ''

  const saved = mockVerificationStorage.save(slot, dataUrl)
  if (!saved) {
    storageError.value = 'No pudimos guardar la foto de forma temporal. Intenta con otra.'
    return
  }
  captures.value[slot] = dataUrl

  if (fromReview.value) {
    fromReview.value = false
    step.value = 'review'
  } else {
    next()
  }
}

const retake = (slot: CaptureSlot) => {
  discard(slot)
  fromReview.value = true
  step.value = slot
}

const cancelCapture = () => {
  if (fromReview.value) {
    fromReview.value = false
    step.value = 'review'
    return
  }
  back()
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const submitVerification = async () => {
  step.value = 'processing'

  for (const message of PROCESSING_MESSAGES) {
    processingMessage.value = message
    await wait(900)
  }

  // Para ver la pantalla de rechazo en la simulación: /verificacion?demo=rechazo
  const rejected = route.query.demo === 'rechazo'
  status.value = rejected ? 'rejected' : 'approved'

  if (!rejected && selectedType.value) {
    verification.markApproved(selectedType.value)
    authStore.setVerified(true)
  }

  discardAll()
  step.value = 'result'
}

const retryAfterReject = () => {
  status.value = 'idle'
  fromReview.value = false
  step.value = 'front'
}

const goToProfile = () => {
  router.push(NEXT_ROUTE)
}

onBeforeUnmount(discardAll)
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}

.verify-card {
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
  .verify-card {
    padding: 32px 20px;
  }
}

.logo-img {
  align-self: center;
  width: 160px;
  height: auto;
}

.progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.progress-text {
  font-size: 12px;
  color: var(--rm-text-muted);
}
.progress-bar {
  height: 4px;
  border-radius: 999px;
  background: var(--rm-border);
  overflow: hidden;
}
.progress-bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--rm-accent);
  transition: width 0.3s;
}

.step {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.step.center {
  align-items: center;
  text-align: center;
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

.how-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.how-list li {
  display: flex;
  align-items: center;
  gap: 16px;
}
.how-list li div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
}
.how-list small {
  font-size: 13px;
  color: var(--rm-text-secondary);
}
.how-icon {
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

.note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid var(--rm-border);
  border-radius: 16px;
  color: var(--rm-accent-dark);
}
.note svg {
  flex-shrink: 0;
  margin-top: 2px;
}
.note p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--rm-text-secondary);
}

.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.5;
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

.field-error {
  font-size: 12px;
  color: var(--rm-accent);
}

.doc-list {
  border: 0;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.doc-card {
  position: relative;
  display: block;
  cursor: pointer;
}
.doc-card input {
  position: absolute;
  opacity: 0;
  inset: 0;
  cursor: pointer;
}
.doc-body {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--rm-border);
  border-radius: 20px;
  transition: border-color 0.2s, background 0.2s;
}
.doc-card:hover .doc-body {
  border-color: var(--rm-text-muted);
}
.doc-card input:checked + .doc-body {
  border-color: var(--rm-text);
  background: #fbf7f6;
}
.doc-card input:focus-visible + .doc-body {
  outline: 2px solid var(--rm-text);
  outline-offset: 2px;
}
.doc-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}
.doc-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 15px;
}
.doc-text small {
  font-size: 12px;
  color: var(--rm-text-secondary);
}
.doc-radio {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: #fff;
}
.doc-card input:checked + .doc-body .doc-radio {
  border-color: var(--rm-text);
  background: var(--rm-text);
  box-shadow: inset 0 0 0 4px #fff;
}

.review-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.review-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.thumb {
  overflow: hidden;
  border-radius: 18px;
  background: #f4eceb;
}
.thumb.document {
  aspect-ratio: 8 / 5;
}
.thumb.portrait {
  aspect-ratio: 4 / 5;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--rm-text-secondary);
}
.link-btn {
  border: 0;
  background: transparent;
  padding: 4px 0;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--rm-accent-dark);
  cursor: pointer;
}
.link-btn:hover {
  color: var(--rm-accent-darker);
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
.result-icon.approved {
  background: var(--rm-success-bg);
  color: var(--rm-success);
}
.result-icon.rejected {
  background: #fbeaea;
  color: var(--rm-accent);
}

.tips {
  align-self: stretch;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid var(--rm-border);
  border-radius: 16px;
  text-align: left;
  font-size: 13px;
  color: var(--rm-text-secondary);
}

.deleted-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  color: var(--rm-text-muted);
}

.actions {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.actions-row {
  flex-direction: row;
}
.actions-row .btn-primary,
.actions-row .btn-ghost {
  flex: 1;
}

.btn-primary,
.btn-ghost {
  height: 54px;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
}
.btn-primary {
  border: 0;
  background: var(--rm-text);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: #000;
}
.btn-ghost {
  border: 1px solid var(--rm-border);
  background: transparent;
  color: var(--rm-text);
}
.btn-ghost:hover:not(:disabled) {
  border-color: var(--rm-text);
}
.btn-primary:disabled,
.btn-ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>