<template>
  <div class="checkin">
    <p v-if="error" role="alert">{{ error }}</p>
    <template v-if="confirmation">
      <p v-if="confirmation.status === 'confirmed'">Asistencia confirmada por {{ confirmation.confirmationMethod === 'manual' ? 'ambas personas' : 'ubicación' }}.</p>
      <p v-else-if="confirmation.status === 'scheduled'">
        La verificación por ubicación abre el {{ formatDateTime(Date.parse(confirmation.windowOpensAt)) }}.
      </p>
      <template v-else-if="confirmation.status === 'open'">
        <p v-if="confirmation.yourCheckin?.withinRadius">Tu asistencia quedó registrada. Esperando a la otra persona.</p>
        <template v-else>
          <p>Comparte tu ubicación para comprobar que estás cerca del lugar durante la cita.</p>
          <button type="button" :disabled="busy" @click="checkIn">Autorizar y verificar ubicación</button>
        </template>
      </template>
      <template v-else-if="confirmation.manual?.available">
        <p v-if="confirmation.manual.me">Ya confirmaste. Falta la otra persona.</p>
        <button v-else type="button" :disabled="busy" @click="manual">Confirmo que asistí a la cita</button>
      </template>
    </template>
    <button type="button" :disabled="busy" @click="refresh">Actualizar asistencia</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { formatDateTime } from '../../utils/dateFormat'

const props = defineProps<{ matchId: string; invitationId: string }>()
const auth = useAuthStore()
const api = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')
interface Confirmation {
  status: 'confirmed' | 'scheduled' | 'open' | 'failed' | 'not_applicable'
  windowOpensAt: string
  confirmationMethod: 'location' | 'manual' | null
  yourCheckin: { withinRadius: boolean } | null
  manual?: { me: boolean; available: boolean }
}
const confirmation = ref<Confirmation | null>(null)
const error = ref('')
const busy = ref(false)
const path = () => '/matches/' + encodeURIComponent(props.matchId) + '/invitations/' + encodeURIComponent(props.invitationId)

async function request(route: string, token: string, method = 'GET', body?: object) {
  const response = await fetch(api + route, {
    method,
    headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message ?? 'No pudimos actualizar tu asistencia.')
  return data
}

async function run(operation: (token: string, invitation: string) => Promise<Confirmation | null>) {
  const token = auth.token
  const invitation = path()
  if (!token || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const result = await operation(token, invitation)
    if (token === auth.token && invitation === path() && result) confirmation.value = result
  } catch (cause) {
    if (token === auth.token && invitation === path()) {
      error.value = cause instanceof Error ? cause.message : 'No pudimos actualizar tu asistencia.'
    }
  } finally {
    busy.value = false
  }
}

const refresh = () => run((token, invitation) => request(invitation + '/confirmation', token))
const manual = () => run((token, invitation) => request(invitation + '/manual-confirmations', token, 'POST'))
const checkIn = () => run(async (token, invitation) => {
  if (!navigator.geolocation) throw new Error('Abre RateM en un navegador con ubicación disponible.')
  const { coords } = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error('No pudimos obtener tu ubicación. Revisa los permisos del navegador.')), {
      enableHighAccuracy: true, maximumAge: 0, timeout: 12000,
    })
  })
  if (token !== auth.token || invitation !== path()) return null
  await request('/consents/location', token, 'POST')
  if (token !== auth.token || invitation !== path()) return null
  const result: Confirmation = await request(invitation + '/check-ins', token, 'POST', {
    latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy,
  })
  if (result.yourCheckin && !result.yourCheckin.withinRadius) {
    throw new Error('Estás fuera del radio de la cita. Puedes reintentar cuando estés más cerca.')
  }
  return result
})

watch(() => props.invitationId, () => { void refresh() }, { immediate: true })
</script>

<style scoped>
.checkin { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.checkin p { flex-basis: 100%; }
button { background: var(--rm-bg); border: 1px solid var(--rm-border); border-radius: 8px; padding: 6px 10px; font: inherit; cursor: pointer; }
[role="alert"] { color: var(--rm-accent-dark); }
</style>
