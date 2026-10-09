<template>
  <form class="profile-form" novalidate @submit.prevent="handleSubmit">
    <!-- FOTOS -->
    <section class="form-section">
      <div class="section-head">
        <h2>Tus fotos</h2>
        <p>Agrega de 1 a 6 fotos. La principal es la que veran primero.</p>
      </div>
      <PhotoUploader v-model="form.photos" :error="errors.photos" />
    </section>
    <section class="form-section">
      <div class="section-head">
        <h2>Sobre ti</h2>
      </div>

      <div class="field">
        <label for="pf-name">Nombre para mostrar</label>
        <div class="input-wrap">
          <input
            id="pf-name"
            v-model="form.displayName"
            type="text"
            :maxlength="LIMITS.displayName"
            placeholder="¿Cómo te llamas?"
            autocomplete="given-name"
            :class="{ invalid: errors.displayName }"
            :aria-invalid="!!errors.displayName"
            aria-describedby="pf-name-error"
            @blur="validateName"
          />
        </div>
        <span v-if="errors.displayName" id="pf-name-error" class="field-error">{{ errors.displayName }}</span>
      </div>

      <div class="field">
        <label for="pf-birth">Fecha de nacimiento</label>
        <div class="input-wrap">
          <input
            id="pf-birth"
            v-model="form.birthDate"
            type="date"
            :max="maxBirthDate"
            :disabled="isEdit"
            :class="{ invalid: errors.birthDate }"
            :aria-invalid="!!errors.birthDate"
            aria-describedby="pf-birth-error"
            @blur="validateBirthDate"
          />
        </div>
        <span v-if="errors.birthDate" id="pf-birth-error" class="field-error">{{ errors.birthDate }}</span>
        <small v-else-if="isEdit" class="hint">No se puede cambiar porque viene de tu verificación</small>
        <small v-else class="hint">Debes ser mayor de 18 años</small>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="pf-gender">Género</label>
          <div class="input-wrap select-wrap">
            <select id="pf-gender" v-model="form.gender">
              <option value="">Prefiero no decirlo</option>
              <option v-for="opt in GENDER_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label for="pf-pronouns">Pronombres</label>
          <div class="input-wrap">
            <input id="pf-pronouns" v-model="form.pronouns" type="text" maxlength="20" placeholder="Ej. ella, él, elle" />
          </div>
        </div>
      </div>

      <div class="field">
        <label for="pf-occupation">Ocupación <span class="optional">(opcional)</span></label>
        <div class="input-wrap">
          <input id="pf-occupation" v-model="form.occupation" type="text" maxlength="60" placeholder="¿A qué te dedicas?" />
        </div>
      </div>

      <div class="field">
        <label for="pf-bio">Biografía</label>
        <textarea
          id="pf-bio"
          v-model="form.bio"
          rows="5"
          :maxlength="LIMITS.bio"
          placeholder="Cuéntale a la gente algo sobre ti: qué te gusta hacer, qué buscas..."
          :class="{ invalid: errors.bio }"
          :aria-invalid="!!errors.bio"
          aria-describedby="pf-bio-error"
          @blur="validateBio"
        ></textarea>
        <div class="field-foot">
          <span v-if="errors.bio" id="pf-bio-error" class="field-error">{{ errors.bio }}</span>
          <span v-else></span>
          <small class="hint" :class="{ 'hint-limit': form.bio.length >= LIMITS.bio }">
            {{ form.bio.length }}/{{ LIMITS.bio }}
          </small>
        </div>
      </div>

      <div class="field">
        <label for="pf-interest">Intereses <span class="optional">(opcional)</span></label>
        <div class="input-wrap">
          <input
            id="pf-interest"
            v-model="interestDraft"
            type="text"
            :maxlength="LIMITS.interest"
            :disabled="form.interests.length >= LIMITS.maxInterests"
            placeholder="Ej. Senderismo, cine, café"
            @keydown.enter.prevent="addInterest"
            @keydown="onInterestKey"
          />
        </div>
        <ul v-if="form.interests.length" class="chips" aria-label="Intereses agregados">
          <li v-for="(interest, i) in form.interests" :key="interest" class="chip">
            {{ interest }}
            <button type="button" :aria-label="`Quitar ${interest}`" @click="removeInterest(i)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </li>
        </ul>
        <small class="hint">Presiona Enter para agregar · máx. {{ LIMITS.maxInterests }}</small>
      </div>
    </section>

    <section class="form-section">
      <div class="section-head">
        <h2>Preferencias de búsqueda</h2>
        <p>Con esto te mostraremos perfiles que encajen contigo.</p>
      </div>

      <fieldset class="field fieldset">
        <legend>Me interesan</legend>
        <div class="choice-chips">
          <label v-for="opt in INTERESTED_IN_OPTIONS" :key="opt.value" class="choice-chip">
            <input v-model="form.interestedIn" type="checkbox" :value="opt.value" />
            <span>{{ opt.label }}</span>
          </label>
        </div>
        <span v-if="errors.interestedIn" class="field-error">{{ errors.interestedIn }}</span>
      </fieldset>

      <div class="field">
        <span class="label-like">Rango de edad</span>
        <div class="age-row">
          <div class="input-wrap">
            <input
              v-model.number="form.ageMin"
              type="number"
              min="18"
              max="99"
              inputmode="numeric"
              aria-label="Edad mínima"
              :class="{ invalid: errors.ageRange }"
              @blur="validateAgeRange"
            />
          </div>
          <span class="age-sep">a</span>
          <div class="input-wrap">
            <input
              v-model.number="form.ageMax"
              type="number"
              min="18"
              max="99"
              inputmode="numeric"
              aria-label="Edad máxima"
              :class="{ invalid: errors.ageRange }"
              @blur="validateAgeRange"
            />
          </div>
          <span class="age-unit">años</span>
        </div>
        <span v-if="errors.ageRange" class="field-error">{{ errors.ageRange }}</span>
      </div>

      <div class="field">
        <div class="range-head">
          <label for="pf-distance">Distancia máxima</label>
          <strong>{{ form.maxDistanceKm }} km</strong>
        </div>
        <input
          id="pf-distance"
          v-model.number="form.maxDistanceKm"
          class="range"
          type="range"
          min="1"
          max="100"
          step="1"
        />
      </div>

      <label class="switch-row">
        <span class="switch-text">
          <strong>Mostrar mi perfil</strong>
          <small>Si lo desactivas, no aparecerás en el descubrimiento de otras personas.</small>
        </span>
        <input v-model="form.visible" type="checkbox" role="switch" class="switch" />
      </label>
    </section>

    <div class="actions" :class="{ 'actions-edit': isEdit }">
      <button v-if="isEdit" type="button" class="btn-ghost" :disabled="loading" @click="emit('cancel')">
        Cancelar
      </button>
      <button type="submit" class="btn-primary" :disabled="loading || (isEdit && !isDirty)">
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import PhotoUploader from './PhotoUploader.vue'
import {
  GENDER_OPTIONS,
  INTERESTED_IN_OPTIONS,
  LIMITS,
  cloneProfile,
  emptyProfile
} from '../../types/profile'
import type { ProfileFormData } from '../../types/profile'

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'edit'
    initial?: ProfileFormData
    loading?: boolean
  }>(),
  { loading: false }
)

const emit = defineEmits<{
  (e: 'submit', data: ProfileFormData): void
  (e: 'cancel'): void
}>()

const isEdit = computed(() => props.mode === 'edit')

const form = reactive<ProfileFormData>(cloneProfile(props.initial ?? emptyProfile()))
const interestDraft = ref('')

const errors = reactive({
  photos: '',
  displayName: '',
  birthDate: '',
  bio: '',
  interestedIn: '',
  ageRange: ''
})

const serialize = (d: ProfileFormData) =>
  JSON.stringify({
    ...d,
    photos: d.photos.map((p) => ({ id: p.id, isPrimary: p.isPrimary }))
  })

const snapshot = ref(serialize(form))
const isDirty = computed(() => serialize(form) !== snapshot.value)

watch(
  () => props.initial,
  (value) => {
    if (!value) return
    Object.assign(form, cloneProfile(value))
    snapshot.value = serialize(form)
  }
)

const submitLabel = computed(() => {
  if (props.loading) return 'Guardando...'
  return isEdit.value ? 'Guardar cambios' : 'Crear perfil'
})

const maxBirthDate = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().slice(0, 10)
})

const addInterest = () => {
  const value = interestDraft.value.trim().replace(/,$/, '')
  if (!value) return
  const exists = form.interests.some((i) => i.toLowerCase() === value.toLowerCase())
  if (!exists && form.interests.length < LIMITS.maxInterests) {
    form.interests.push(value)
  }
  interestDraft.value = ''
}

const onInterestKey = (e: KeyboardEvent) => {
  if (e.key === ',') {
    e.preventDefault()
    addInterest()
  }
}

const removeInterest = (index: number) => form.interests.splice(index, 1)

const validatePhotos = () => {
  errors.photos = form.photos.length < 1 ? 'Agrega al menos una foto' : ''
}

const validateName = () => {
  errors.displayName = form.displayName.trim() ? '' : 'Tu nombre es requerido'
}

const validateBirthDate = () => {
  if (isEdit.value) {
    errors.birthDate = ''
    return
  }
  if (!form.birthDate) {
    errors.birthDate = 'Tu fecha de nacimiento es requerida'
  } else if (form.birthDate > maxBirthDate.value) {
    errors.birthDate = 'Debes ser mayor de 18 años'
  } else {
    errors.birthDate = ''
  }
}

const validateBio = () => {
  errors.bio = form.bio.length > LIMITS.bio ? `Máximo ${LIMITS.bio} caracteres` : ''
}

const validateInterestedIn = () => {
  errors.interestedIn = form.interestedIn.length ? '' : 'Elige al menos una opción'
}

const validateAgeRange = () => {
  const { ageMin, ageMax } = form
  if (!Number.isFinite(ageMin) || !Number.isFinite(ageMax)) {
    errors.ageRange = 'Ingresa un rango de edad válido'
  } else if (ageMin < 18 || ageMax > 99) {
    errors.ageRange = 'La edad debe estar entre 18 y 99'
  } else if (ageMin > ageMax) {
    errors.ageRange = 'La edad mínima no puede ser mayor que la máxima'
  } else {
    errors.ageRange = ''
  }
}

watch(() => form.photos.length, validatePhotos)
watch(() => form.interestedIn.length, () => {
  if (errors.interestedIn) validateInterestedIn()
})

const handleSubmit = () => {
  validatePhotos()
  validateName()
  validateBirthDate()
  validateBio()
  validateInterestedIn()
  validateAgeRange()

  if (Object.values(errors).some(Boolean)) return

  emit('submit', cloneProfile(form))
}
</script>

<style scoped>
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.section-head h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 22px;
  line-height: 1.2;
}
.section-head p {
  margin: 0;
  font-size: 13px;
  color: var(--rm-text-secondary);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 480px) {
  .field-row {
    grid-template-columns: 1fr;
  }
}

.field label,
.label-like,
.fieldset legend {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.optional {
  font-weight: 400;
  color: var(--rm-text-muted);
}

.fieldset {
  border: 0;
  padding: 0;
  margin: 0;
}
.fieldset legend {
  padding: 0;
  margin-bottom: 8px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap input,
.input-wrap select {
  width: 100%;
  height: 52px;
  box-sizing: border-box;
  padding: 0 18px;
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
.input-wrap input:focus,
.input-wrap select:focus,
textarea:focus {
  outline: none;
  border-color: var(--rm-text);
}
.input-wrap input.invalid,
textarea.invalid {
  border-color: var(--rm-accent);
}
.input-wrap input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.select-wrap select {
  appearance: none;
  padding-right: 44px;
  cursor: pointer;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>");
  background-repeat: no-repeat;
  background-position: right 16px center;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 18px;
  border: 1px solid var(--rm-border);
  border-radius: 20px;
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.5;
  color: var(--rm-text);
  resize: vertical;
  min-height: 120px;
}
textarea::placeholder {
  color: var(--rm-placeholder);
}

.field-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-error {
  font-size: 12px;
  color: var(--rm-accent);
}
.hint {
  font-size: 12px;
  color: var(--rm-text-muted);
}
.hint-limit {
  color: var(--rm-accent);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  font-size: 13px;
}
.chip button {
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--rm-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
}
.chip button:hover {
  color: var(--rm-accent);
}

.choice-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.choice-chip {
  position: relative;
  cursor: pointer;
}
.choice-chip input {
  position: absolute;
  opacity: 0;
  inset: 0;
  cursor: pointer;
}
.choice-chip span {
  display: inline-block;
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  font-size: 14px;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.choice-chip input:checked + span {
  background: var(--rm-text);
  border-color: var(--rm-text);
  color: #fff;
}
.choice-chip input:focus-visible + span {
  outline: 2px solid var(--rm-text);
  outline-offset: 2px;
}

.age-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
  align-items: center;
  gap: 10px;
}
.age-sep,
.age-unit {
  font-size: 14px;
  color: var(--rm-text-secondary);
}

.range-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}
.range {
  width: 100%;
  accent-color: var(--rm-accent);
  cursor: pointer;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid var(--rm-border);
  border-radius: 20px;
  cursor: pointer;
}
.switch-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}
.switch-text small {
  font-size: 12px;
  color: var(--rm-text-secondary);
  line-height: 1.4;
}
.switch {
  appearance: none;
  flex-shrink: 0;
  position: relative;
  width: 46px;
  height: 28px;
  border-radius: 999px;
  background: var(--rm-border);
  cursor: pointer;
  transition: background 0.2s;
}
.switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}
.switch:checked {
  background: var(--rm-text);
}
.switch:checked::after {
  transform: translateX(18px);
}
.switch:focus-visible {
  outline: 2px solid var(--rm-text);
  outline-offset: 2px;
}

.actions {
  display: flex;
  flex-direction: column;
}
.actions-edit {
  flex-direction: row;
  gap: 12px;
}
.actions-edit .btn-primary,
.actions-edit .btn-ghost {
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
</style>