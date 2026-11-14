<template>
  <div class="verify-page">
    <div v-if="invitation && place && conv" class="verify-shell">
      <header class="head">
        <button type="button" class="back-btn" aria-label="Volver" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1>Verificar asistencia</h1>
        <span class="head-spacer" />
      </header>

      <section class="summary">
        <img :src="conv.photo" alt="" class="avatar" />
        <div class="summary-text">
          <p class="who">Tu cita con <strong>{{ conv.name }}</strong></p>
          <p class="where"><strong>{{ place.name }}</strong> · {{ place.address }}</p>
          <p class="when">
            Hora acordada: <strong>{{ formatDateTime(invitation.startsAt) }}</strong>
          </p>
        </div>
      </section>

      <section class="radar" aria-label="Ubicación de ambos respecto al lugar de la cita">
        <svg viewBox="0 0 320 200" aria-hidden="true">
          <rect width="320" height="200" fill="#F7EFEE" />
          <rect x="14" y="16" width="86" height="54" rx="12" fill="#E3F0E6" />
          <rect x="226" y="132" width="82" height="52" rx="12" fill="#E3F0E6" />
          <g fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round">
            <path d="M0 78H320" />
            <path d="M0 150H320" />
            <path d="M112 0V200" />
            <path d="M214 0V200" />
          </g>
          <circle cx="160" cy="100" r="62" class="fence" />
          <circle v-if="checking" cx="160" cy="100" r="20" class="scan" />
          <circle cx="160" cy="100" r="15" class="pin-bg" />
          <circle cx="160" cy="100" r="5" class="pin-dot" />

          <g v-if="meDot" :transform="`translate(${meDot.x} ${meDot.y})`">
            <circle r="14" class="dot-me" />
            <text y="4" text-anchor="middle" class="dot-text">Tú</text>
          </g>
          <g v-if="themDot" :transform="`translate(${themDot.x} ${themDot.y})`">
            <circle r="14" class="dot-them" />
            <text y="4" text-anchor="middle" class="dot-text">{{ conv.name.charAt(0) }}</text>
          </g>
        </svg>
        <p class="legend">
          Zona del lugar: {{ GEOFENCE_M }} m · Hora acordada: {{ formatTime(invitation.startsAt) }} (±{{ TIME_TOLERANCE_MIN }} min)
        </p>
      </section>

      <ul class="rows">
        <li v-for="r in rows" :key="r.key" class="row" :class="r.state">
          <img v-if="r.photo" :src="r.photo" alt="" class="row-avatar" />
          <span v-else class="row-avatar me-avatar">Tú</span>

          <span class="row-text">
            <strong>{{ r.name }}</strong>
            <small>{{ r.text }}</small>
          </span>

          <span class="state-icon" aria-hidden="true">
            <span v-if="r.state === 'checking'" class="spinner" />
            <svg v-else-if="r.state === 'ok'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            <svg v-else-if="r.state === 'bad'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
        </li>
      </ul>

      <section v-if="attendance === 'verified'" class="result ok" role="status">
        <h2>¡Asistencia verificada!</h2>
        <p>Ambos estuvieron en {{ place.name }} a la hora acordada. Tu cita quedó registrada.</p>
        <!-- RM-58: aquí va el botón de calificar -->
        <router-link to="/citas" class="btn-secondary">Volver a mis citas</router-link>
      </section>

      <section v-else-if="attendance !== 'unverified'" class="result" :class="{ fail: attendance === 'gps_failed' }" role="status">
        <template v-if="attendance === 'gps_failed'">
          <h2>No pudimos verificar por GPS</h2>
          <p>{{ failReason }}</p>
        </template>

                <ManualConfirm :invitation-id="invitation.id" />
      </section>

      <template v-if="canRun">
        <div class="demo">
          <p class="demo-title">Solo diseño · Simular resultado</p>
          <div class="seg" role="radiogroup" aria-label="Simular resultado del GPS">
            <button
              v-for="o in scenarios"
              :key="o.key"
              type="button"
              role="radio"
              class="seg-btn"
              :class="{ active: scenario === o.key }"
              :aria-checked="scenario === o.key"
              @click="scenario = o.key"
            >
              {{ o.label }}
            </button>
          </div>
        </div>

        <button type="button" class="btn-primary" :disabled="checking" @click="run">{{ buttonLabel }}</button>
        <p class="privacy">Usamos tu ubicación solo en este momento para comprobar que estás en el lugar a la hora acordada. No se guarda.</p>
      </template>
    </div>

    <div v-else class="not-found">
      <h1>No encontramos esta cita</h1>
      <router-link to="/citas" class="btn-primary">Ir a mis citas</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useDatesStore } from '../stores/dates'
import ManualConfirm from '../components/dates/ManualConfirm.vue'
import { getPlace } from '../types/places'
import { GEOFENCE_M, TIME_TOLERANCE_MIN } from '../types/dates'
import type { GpsPoint, GpsScenario } from '../types/dates'
import { formatDateTime, formatTime } from '../utils/dateFormat'

const route = useRoute()
const router = useRouter()
const chat = useChatStore()
const dates = useDatesStore()

const invitation = computed(() => dates.getById(route.params.id as string))
const place = computed(() => (invitation.value ? getPlace(invitation.value.placeId) : undefined))
const conv = computed(() => (invitation.value ? chat.getById(invitation.value.conversationId) : undefined))
const attendance = computed(() => invitation.value?.attendance ?? 'unverified')

const checking = ref(false)
const scenario = ref<GpsScenario>('both')
let timer: ReturnType<typeof setTimeout> | undefined

const scenarios: { key: GpsScenario; label: string }[] = [
  { key: 'both', label: 'Ambos llegaron a tiempo' },
  { key: 'nosignal', label: 'Sin señal GPS' },
  { key: 'far', label: 'Match lejos' },
  { key: 'late', label: 'Llegó fuera de hora' }
]

const canRun = computed(() => attendance.value === 'unverified' || attendance.value === 'gps_failed')

const buttonLabel = computed(() => {
  if (checking.value) return 'Verificando...'
  return attendance.value === 'gps_failed' ? 'Reintentar verificación' : 'Verificar mi ubicación'
})

const run = () => {
  if (!invitation.value || checking.value) return
  const id = invitation.value.id
  checking.value = true
  timer = setTimeout(() => {
    dates.verify(id, scenario.value)
    checking.value = false
  }, 2200)
}

onBeforeUnmount(() => clearTimeout(timer))

const POS = {
  ok: { me: { x: 138, y: 122 }, them: { x: 186, y: 80 } },
  far: { me: { x: 262, y: 158 }, them: { x: 56, y: 42 } }
}

const dotFor = (who: 'me' | 'them') => {
  const p = invitation.value?.gps?.[who]
  if (!p || p.status === 'error' || checking.value) return null
  return p.status === 'far' ? POS.far[who] : POS.ok[who]
}
const meDot = computed(() => dotFor('me'))
const themDot = computed(() => dotFor('them'))

const at = (p: GpsPoint) => (p.arrivedAt ? formatTime(p.arrivedAt) : '')

const pointInfo = (who: 'me' | 'them') => {
  if (checking.value) return { state: 'checking', text: 'Buscando ubicación...' }
  const p = invitation.value?.gps?.[who]
  if (!p) return { state: 'idle', text: 'Sin verificar' }
  if (p.status === 'ok') return { state: 'ok', text: `En el lugar a las ${at(p)} · a ${p.distanceM} m` }
  if (p.status === 'late') return { state: 'bad', text: `En el lugar, pero a las ${at(p)} (fuera de la hora acordada)` }
  if (p.status === 'far') return { state: 'bad', text: `Lejos del lugar · a ${p.distanceM} m` }
  return { state: 'bad', text: 'Sin señal de GPS' }
}

const rows = computed(() => [
  { key: 'me', name: 'Tú', photo: '', ...pointInfo('me') },
  { key: 'them', name: conv.value?.name ?? '', photo: conv.value?.photo ?? '', ...pointInfo('them') }
])

const failReason = computed(() => {
  const g = invitation.value?.gps
  const name = conv.value?.name ?? 'Tu match'
  if (!g) return ''
  if (g.me.status === 'error') {
    return 'No pudimos obtener tu ubicación. Revisa que el GPS esté activo e inténtalo de nuevo.'
  }
  if (g.them.status === 'far') return `${name} no aparece dentro de la zona del lugar.`
  if (g.them.status === 'late') {
    return `${name} estuvo en el lugar, pero fuera de la hora acordada (±${TIME_TOLERANCE_MIN} min).`
  }
  if (g.me.status === 'late') {
    return `Estuviste en el lugar, pero fuera de la hora acordada (±${TIME_TOLERANCE_MIN} min).`
  }
  if (g.me.status === 'far') return 'No apareces dentro de la zona del lugar.'
  return 'No pudimos confirmar que ambos estuvieran en el lugar a la hora acordada.'
})
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}
.verify-shell {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: var(--rm-bg);
  border-radius: 28px;
  padding: 28px 24px 32px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.head h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 30px;
  line-height: 1.1;
  text-align: center;
}
.back-btn,
.head-spacer {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}
.back-btn {
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}
.back-btn:hover {
  border-color: var(--rm-text);
}

.summary {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 20px;
  background: #fdf3f2;
  border: 1px solid var(--rm-btn-secondary);
}
.avatar {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
}
.summary-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: var(--rm-text-body);
}
.who {
  font-size: 15px;
  color: var(--rm-text);
}
.when {
  color: var(--rm-text-secondary);
}

.radar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.radar svg {
  width: 100%;
  height: auto;
  border-radius: 20px;
  border: 1px solid var(--rm-border);
  display: block;
}
.fence {
  fill: rgba(179, 32, 46, 0.08);
  stroke: var(--rm-accent);
  stroke-width: 2;
  stroke-dasharray: 6 6;
}
.scan {
  fill: none;
  stroke: var(--rm-accent);
  stroke-width: 2;
  transform-origin: 160px 100px;
  animation: scan 1.4s ease-out infinite;
}
.pin-bg {
  fill: #fff;
  stroke: var(--rm-accent);
  stroke-width: 2.5;
}
.pin-dot {
  fill: var(--rm-accent);
}
.dot-me {
  fill: var(--rm-text);
  stroke: #fff;
  stroke-width: 3;
}
.dot-them {
  fill: var(--rm-accent);
  stroke: #fff;
  stroke-width: 3;
}
.dot-text {
  fill: #fff;
  font-size: 10px;
  font-weight: 600;
  font-family: var(--font-body);
}
.legend {
  text-align: center;
  font-size: 12px;
  line-height: 1.5;
  color: var(--rm-text-muted);
}
@keyframes scan {
  0% { transform: scale(0.8); opacity: 0.9; }
  100% { transform: scale(3.2); opacity: 0; }
}

.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 16px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
}
.row.ok {
  border-color: var(--rm-success);
  background: var(--rm-success-bg);
}
.row.bad {
  border-color: var(--rm-accent);
  background: #fdf3f2;
}
.row-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
}
.me-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  font-size: 12px;
  font-weight: 600;
}
.row-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.row-text strong {
  font-size: 14px;
}
.row-text small {
  font-size: 12px;
  color: var(--rm-text-secondary);
}
.state-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.row.ok .state-icon {
  color: var(--rm-success);
}
.row.bad .state-icon {
  color: var(--rm-accent);
}
.spinner {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid var(--rm-border);
  border-top-color: var(--rm-accent);
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.result {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--rm-border);
  background: #f6f3f3;
}
.result.ok {
  background: var(--rm-success-bg);
  border-color: var(--rm-success);
}
.result.fail {
  background: #fdf3f2;
  border-color: var(--rm-accent);
}
.result h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 28px;
  line-height: 1.1;
}
.result.ok h2 {
  color: var(--rm-success);
}
.result p {
  font-size: 14px;
  line-height: 1.5;
  color: var(--rm-text-body);
}

.demo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px dashed var(--rm-placeholder);
}
.demo-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rm-text-muted);
}
.seg {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.seg-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--rm-text-body);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.seg-btn:hover {
  border-color: var(--rm-text);
}
.seg-btn.active {
  background: var(--rm-text);
  border-color: var(--rm-text);
  color: #fff;
}

.btn-primary,
.btn-secondary {
  height: 54px;
  border: 0;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: background 0.2s, opacity 0.2s;
}
.btn-primary {
  background: var(--rm-accent);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: var(--rm-accent-dark);
  color: #fff;
}
.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.btn-secondary {
  background: var(--rm-btn-secondary);
  color: var(--rm-text);
}
.btn-secondary:hover {
  background: #f3bdb8;
  color: var(--rm-text);
}

.privacy {
  text-align: center;
  font-size: 12px;
  line-height: 1.5;
  color: var(--rm-text-muted);
}

.not-found {
  margin: auto;
  max-width: 360px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
}
.not-found h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 32px;
  line-height: 1.1;
}

@media (max-width: 380px) {
  .verify-shell {
    padding: 24px 16px 28px;
  }
}
</style>