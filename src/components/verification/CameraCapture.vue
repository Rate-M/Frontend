<template>
  <div class="camera">
    <div class="viewport" :class="shape">
      <video
        v-show="streaming"
        ref="video"
        class="video"
        :class="{ mirror: facing === 'user' }"
        autoplay
        playsinline
        muted
      ></video>

      <img v-if="preview" :src="preview" alt="Vista previa de la foto" class="preview" />

      <div v-if="!streaming && !preview" class="placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 8.5A2.5 2.5 0 016.5 6H8l1.2-1.8h5.6L16 6h1.5A2.5 2.5 0 0120 8.5v8a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-8z" />
          <circle cx="12" cy="12.5" r="3.2" />
        </svg>
        <span>La cámara está apagada</span>
      </div>

      <div v-if="streaming" class="guide" :class="shape" aria-hidden="true"></div>
    </div>

    <p v-if="error" class="field-error" role="alert">{{ error }}</p>

    <div class="controls">
      <template v-if="preview">
        <button type="button" class="btn-ghost" @click="retake">Repetir</button>
        <button type="button" class="btn-primary" @click="confirm">Usar esta foto</button>
      </template>
      <template v-else-if="streaming">
        <button type="button" class="btn-primary" @click="snap">Tomar foto</button>
      </template>
      <template v-else>
        <button type="button" class="btn-primary" @click="startCamera">Abrir cámara</button>
        <button type="button" class="btn-ghost" @click="openFile">Subir una foto</button>
      </template>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png"
      class="file-input"
      @change="onFile"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    facing?: 'user' | 'environment'
    shape?: 'portrait' | 'document'
  }>(),
  { facing: 'user', shape: 'portrait' }
)

const emit = defineEmits<{
  (e: 'captured', dataUrl: string): void
}>()

const MAX_SIDE = 1280
const MAX_MB = 5
const ALLOWED = ['image/jpeg', 'image/png']

const video = ref<HTMLVideoElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const streaming = ref(false)
const preview = ref<string | null>(null)
const error = ref('')

let stream: MediaStream | null = null

const stopCamera = () => {
  stream?.getTracks().forEach((track) => track.stop())
  stream = null
  streaming.value = false
}

const startCamera = async () => {
  error.value = ''

  if (!navigator.mediaDevices?.getUserMedia) {
    error.value = 'Tu navegador no permite usar la cámara. Sube una foto.'
    return
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: props.facing,
        width: { ideal: 1280 },
        height: { ideal: 1280 }
      },
      audio: false
    })
    streaming.value = true
    await nextTick()
    if (video.value) {
      video.value.srcObject = stream
      await video.value.play()
    }
  } catch (err) {
    console.error('Error de cámara:', err)
    stopCamera()
    error.value = 'No pudimos acceder a la cámara. Revisa los permisos del navegador o sube una foto.'
  }
}

const drawScaled = (source: CanvasImageSource, width: number, height: number) => {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.8)
}

const snap = () => {
  const el = video.value
  if (!el || !el.videoWidth) return
  preview.value = drawScaled(el, el.videoWidth, el.videoHeight)
  stopCamera()
}

const openFile = () => fileInput.value?.click()

const onFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  error.value = ''

  if (!ALLOWED.includes(file.type)) {
    error.value = 'Solo se permiten imágenes JPG o PNG'
    return
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    error.value = `La foto debe pesar máximo ${MAX_MB} MB`
    return
  }

  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    preview.value = drawScaled(img, img.naturalWidth, img.naturalHeight)
    URL.revokeObjectURL(url)
  }
  img.onerror = () => {
    error.value = 'No pudimos leer esa imagen. Prueba con otra.'
    URL.revokeObjectURL(url)
  }
  img.src = url
}

const retake = () => {
  preview.value = null
  error.value = ''
}

const confirm = () => {
  if (preview.value) emit('captured', preview.value)
}

onBeforeUnmount(stopCamera)
</script>

<style scoped>
.camera {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.viewport {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #f4eceb;
  display: flex;
  align-items: center;
  justify-content: center;
}
.viewport.portrait {
  aspect-ratio: 4 / 5;
  border-radius: 28px;
  max-width: 380px;
  margin: 0 auto;
}
.viewport.document {
  aspect-ratio: 8 / 5;
  border-radius: 20px;
}

.video,
.preview {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.video.mirror {
  transform: scaleX(-1);
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--rm-text-muted);
}

.guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid #fff;
  box-shadow: 0 0 0 9999px rgba(20, 18, 20, 0.38);
  pointer-events: none;
}
.guide.portrait {
  width: 62%;
  height: 74%;
  border-radius: 50%;
}
.guide.document {
  width: 86%;
  height: 78%;
  border-radius: 14px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
.btn-primary:hover {
  background: #000;
}
.btn-ghost {
  border: 1px solid var(--rm-border);
  background: transparent;
  color: var(--rm-text);
}
.btn-ghost:hover {
  border-color: var(--rm-text);
}

.field-error {
  font-size: 12px;
  color: var(--rm-accent);
  text-align: center;
}

.file-input {
  display: none;
}
</style>