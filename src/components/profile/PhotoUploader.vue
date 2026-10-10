<template>
  <div class="photo-uploader">
    <div class="photo-grid">
      <div v-for="(photo, i) in props.modelValue" :key="photo.id" class="photo-slot filled">
        <img :src="photo.url" :alt="`Foto ${i + 1} de tu perfil`" />
        <span v-if="photo.isPrimary" class="badge-primary">Principal</span>

        <div class="slot-actions">
          <button
            v-if="!photo.isPrimary"
            type="button"
            class="icon-btn"
            aria-label="Hacer foto principal"
            @click="makePrimary(photo.id)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5z" />
            </svg>
          </button>
          <button type="button" class="icon-btn" aria-label="Eliminar foto" @click="removePhoto(photo.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <button
        v-if="props.modelValue.length < LIMITS.maxPhotos"
        type="button"
        class="photo-slot add"
        @click="openPicker"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>Agregar</span>
      </button>

      <div v-for="n in emptySlots" :key="`empty-${n}`" class="photo-slot empty" aria-hidden="true"></div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png"
      multiple
      class="file-input"
      @change="onFiles"
    />

    <small class="hint">
      {{ props.modelValue.length }} de {{ LIMITS.maxPhotos }} fotos · JPG o PNG · máx. {{ LIMITS.maxPhotoMB }} MB
    </small>
    <span v-if="localError || props.error" class="field-error" role="alert">
      {{ localError || props.error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { LIMITS, PHOTO_TYPES } from '../../types/profile'
import type { ProfilePhoto } from '../../types/profile'

const props = defineProps<{
  modelValue: ProfilePhoto[]
  error?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProfilePhoto[]): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const localError = ref('')

const ALLOWED = PHOTO_TYPES

const emptySlots = computed(() => {
  const addButton = props.modelValue.length < LIMITS.maxPhotos ? 1 : 0
  return Math.max(0, LIMITS.maxPhotos - props.modelValue.length - addButton)
})

const openPicker = () => fileInput.value?.click()

const onFiles = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  localError.value = ''

  const next = props.modelValue.map((p) => ({ ...p }))
  const room = LIMITS.maxPhotos - next.length

  for (const file of files.slice(0, room)) {
    if (!ALLOWED.includes(file.type)) {
      localError.value = 'Solo se permiten imágenes JPG o PNG'
      continue
    }
    if (file.size > LIMITS.maxPhotoMB * 1024 * 1024) {
      localError.value = `Cada foto debe pesar máximo ${LIMITS.maxPhotoMB} MB`
      continue
    }
    next.push({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      isPrimary: false,
      file
    })
  }

  if (files.length > room) {
    localError.value = `Solo puedes tener ${LIMITS.maxPhotos} fotos`
  }

  if (next.length && !next.some((p) => p.isPrimary)) next[0].isPrimary = true

  emit('update:modelValue', next)
  input.value = '' // permite volver a elegir el mismo archivo
}

const makePrimary = (id: string) => {
  emit('update:modelValue', props.modelValue.map((p) => ({ ...p, isPrimary: p.id === id })))
}

const removePhoto = (id: string) => {
  const removed = props.modelValue.find((p) => p.id === id)
  if (removed?.file) URL.revokeObjectURL(removed.url)

  const next = props.modelValue.filter((p) => p.id !== id).map((p) => ({ ...p }))
  if (next.length && !next.some((p) => p.isPrimary)) next[0].isPrimary = true

  localError.value = ''
  emit('update:modelValue', next)
}

onBeforeUnmount(() => {
  props.modelValue.forEach((p) => {
    if (p.file) URL.revokeObjectURL(p.url)
  })
})
</script>

<style scoped>
.photo-uploader {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.photo-slot {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 18px;
  overflow: hidden;
}

.photo-slot.filled img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-slot.empty {
  border: 1px dashed var(--rm-border);
  background: transparent;
}

.photo-slot.add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px dashed var(--rm-text-muted);
  background: transparent;
  color: var(--rm-text-secondary);
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.photo-slot.add:hover {
  border-color: var(--rm-text);
  color: var(--rm-text);
}

.badge-primary {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.slot-actions {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}
.icon-btn:hover {
  background: #fff;
  color: var(--rm-accent);
}

.file-input {
  display: none;
}

.hint {
  font-size: 12px;
  color: var(--rm-text-muted);
}
.field-error {
  font-size: 12px;
  color: var(--rm-accent);
}
</style>