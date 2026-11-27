<template>
  <div class="overlay" role="dialog" aria-modal="true" aria-labelledby="invite-title" @click.self="$emit('close')">
    <div class="modal">
      <div class="head">
        <h2 id="invite-title">Invita a <em>{{ name }}</em> a una cita</h2>
        <p>Elige cuándo y dónde. Te recomendamos un lugar público para la primera cita.</p>
      </div>

      <fieldset class="group">
        <legend>Día</legend>
        <div class="chips">
          <button
            v-for="d in days"
            :key="d.key"
            type="button"
            class="chip"
            :class="{ active: day?.key === d.key }"
            @click="day = d"
          >
            {{ d.label }}
          </button>
        </div>
      </fieldset>

      <fieldset class="group">
        <legend>Hora</legend>
        <div class="chips">
          <button
            v-for="t in times"
            :key="t"
            type="button"
            class="chip"
            :class="{ active: time === t }"
            @click="time = t"
          >
            {{ t }}
          </button>
        </div>
      </fieldset>

      <fieldset class="group">
        <legend>Lugar</legend>
        <div class="chips">
          <button
            v-for="p in places"
            :key="p"
            type="button"
            class="chip"
            :class="{ active: place === p }"
            @click="place = p"
          >
            {{ p }}
          </button>
        </div>
      </fieldset>

      <div class="actions">
        <button type="button" class="btn-primary" :disabled="!ready" @click="confirm">Enviar invitación</button>
        <button type="button" class="btn-secondary" @click="$emit('close')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

defineProps<{ name: string }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', payload: { day: string; time: string; place: string }): void
}>()

interface DayOption {
  key: string
  label: string
  full: string
}

const days = computed<DayOption[]>(() =>
  Array.from({ length: 5 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return {
      key: d.toDateString(),
      label: d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
      full: d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
    }
  })
)

const times = ['14:00', '17:00', '19:00', '21:00']
const places = ['Cafetería', 'Parque público', 'Restaurante', 'Museo']

const day = ref<DayOption | null>(null)
const time = ref('')
const place = ref('')

const ready = computed(() => !!day.value && !!time.value && !!place.value)

const confirm = () => {
  if (!ready.value || !day.value) return
  emit('confirm', { day: day.value.full, time: time.value, place: place.value })
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(20, 18, 20, 0.6);
  animation: fade 0.25s ease;
}

.modal {
  width: 100%;
  max-width: 420px;
  max-height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 30px 24px 24px;
  border-radius: 28px;
  background: var(--rm-bg);
  box-shadow: 0 20px 60px rgba(142, 22, 34, 0.25);
  animation: pop 0.3s cubic-bezier(0.2, 1.2, 0.4, 1);
}

.head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}
.head h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 32px;
  line-height: 1.1;
}
.head h2 em {
  font-style: italic;
  color: var(--rm-accent);
}
.head p {
  font-size: 14px;
  line-height: 1.5;
  color: var(--rm-text-secondary);
}

.group {
  border: 0;
  padding: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.group legend {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--rm-text-body);
  cursor: pointer;
  text-transform: capitalize;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.chip:hover {
  border-color: var(--rm-text);
}
.chip.active {
  background: var(--rm-text);
  border-color: var(--rm-text);
  color: #fff;
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
  border: 0;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}
.btn-primary {
  background: var(--rm-accent);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: var(--rm-accent-dark);
}
.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-secondary {
  background: var(--rm-btn-secondary);
  color: var(--rm-text);
}
.btn-secondary:hover {
  background: #f3bdb8;
}

@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pop {
  from { opacity: 0; transform: scale(0.92) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>