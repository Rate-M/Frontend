<template>
  <div class="invite-page">
    <div class="invite-shell">
      <header class="head">
        <button type="button" class="back-btn" aria-label="Volver" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1>Nueva cita</h1>
        <span class="head-spacer" />
      </header>

      <section class="block">
        <h2 class="label">¿A quién invitas?</h2>
        <ul class="people">
          <li v-for="c in chat.conversations" :key="c.id">
            <button
              type="button"
              class="person"
              :class="{ active: convId === c.id }"
              :disabled="!isUnlocked(c)"
              @click="convId = c.id"
            >
              <img :src="c.photo" alt="" />
              <span class="pname">{{ c.name }}</span>
              <span v-if="!isUnlocked(c)" class="lock">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
                  <path d="M8 10.5V8a4 4 0 018 0v2.5" />
                </svg>
                {{ streakDays(c) }}/{{ MIN }}
              </span>
            </button>
          </li>
        </ul>
        <p class="hint">Se desbloquea al llegar a {{ MIN }} días de racha escribiéndose.</p>
      </section>

      <section class="block">
        <div class="label-row">
          <h2 class="label">Lugar</h2>
          <router-link to="/lugares" class="map-link">Ver en el mapa</router-link>
        </div>
        <ul class="places">
          <li v-for="p in sortedPlaces" :key="p.id">
            <button type="button" class="place" :class="{ active: placeId === p.id }" @click="placeId = p.id">
              <span class="place-icon"><CategoryIcon :category="p.category" :size="18" /></span>
              <span class="place-text">
                <strong>{{ p.name }}</strong>
                <small>{{ categoryLabels[p.category] }} · a {{ p.distanceKm }} km</small>
              </span>
              <svg v-if="placeId === p.id" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.500 4.500L19 7.500" />
              </svg>
            </button>
          </li>
        </ul>
      </section>

      <section class="block">
        <h2 class="label">Día</h2>
        <div class="chips">
          <button
            v-for="d in days"
            :key="d.key"
            type="button"
            class="chip"
            :class="{ active: dayKey === d.key }"
            @click="dayKey = d.key"
          >
            {{ d.label }}
          </button>
        </div>
      </section>

      <section class="block">
        <h2 class="label">Hora</h2>
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
      </section>

      <section class="block">
        <label class="label" for="note">Mensaje (opcional)</label>
        <textarea id="note" v-model="note" rows="3" maxlength="140" placeholder="Ej. ¡Te va a encantar este lugar!" />
        <span class="counter">{{ note.length }}/140</span>
      </section>

      <p v-if="ready && person && place" class="summary">
        Invitarás a <strong>{{ person.name }}</strong> a <strong>{{ place.name }}</strong>
        el <strong>{{ formatDateTime(startsAt) }}</strong>.
      </p>

      <button type="button" class="btn-primary" :disabled="!ready" @click="submit">Enviar invitación</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CategoryIcon from '../components/places/CategoryIcon.vue'
import { useChatStore } from '../stores/chat'
import { useDatesStore } from '../stores/dates'
import { places, categoryLabels, getPlace } from '../types/places'
import type { Conversation } from '../types/chat'
import { computeStreak, INVITE_MIN_STREAK } from '../utils/streak'
import { formatDateTime } from '../utils/dateFormat'

const route = useRoute()
const router = useRouter()
const chat = useChatStore()
const dates = useDatesStore()

const MIN = INVITE_MIN_STREAK

const streakDays = (c: Conversation) => computeStreak(c.messages).days
const isUnlocked = (c: Conversation) => streakDays(c) >= MIN

const qCon = typeof route.query.con === 'string' ? route.query.con : ''
const qLugar = typeof route.query.lugar === 'string' ? route.query.lugar : ''

const initialConv = chat.getById(qCon)
const convId = ref(initialConv && isUnlocked(initialConv) ? initialConv.id : '')
const placeId = ref(getPlace(qLugar)?.id ?? '')
const dayKey = ref('')
const time = ref('')
const note = ref('')

interface DayOption {
  key: string
  label: string
  date: Date
}

const days: DayOption[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i + 1)
  d.setHours(0, 0, 0, 0)
  return {
    key: d.toDateString(),
    label: d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
    date: d
  }
})

const times = ['12:00', '14:00', '16:00', '18:00', '19:00', '20:00', '21:00', '22:00']

const sortedPlaces = computed(() => [...places].sort((a, b) => a.distanceKm - b.distanceKm))

const person = computed(() => chat.getById(convId.value))
const place = computed(() => getPlace(placeId.value))

const startsAt = computed(() => {
  const d = days.find((x) => x.key === dayKey.value)
  if (!d || !time.value) return 0
  const [h, m] = time.value.split(':').map(Number)
  const start = new Date(d.date)
  start.setHours(h, m, 0, 0)
  return start.getTime()
})

const ready = computed(() => !!person.value && !!place.value && startsAt.value > 0)

const submit = () => {
  const p = person.value
  const pl = place.value
  if (!p || !pl || !startsAt.value) return

  dates.send({
    conversationId: p.id,
    placeId: pl.id,
    startsAt: startsAt.value,
    note: note.value
  })
  router.replace(`/chat/${p.id}`)
}
</script>

<style scoped>
.invite-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}
.invite-shell {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 22px;
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
  font-size: 34px;
  line-height: 1.1;
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

.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.label {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.map-link {
  font-size: 13px;
  color: var(--rm-accent-dark);
}
.hint {
  font-size: 12px;
  color: var(--rm-text-muted);
}

.people {
  list-style: none;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.person {
  width: 78px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  border: 1px solid var(--rm-border);
  border-radius: 18px;
  background: var(--rm-bg);
  font-family: var(--font-body);
  color: var(--rm-text);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.person img {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  object-fit: cover;
}
.pname {
  font-size: 12px;
  font-weight: 600;
}
.person.active {
  border-color: var(--rm-accent);
  background: #fdf3f2;
}
.person:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.lock {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--rm-text-muted);
}

.places {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.place {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--rm-border);
  border-radius: 16px;
  background: var(--rm-bg);
  font-family: var(--font-body);
  color: var(--rm-text);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.place:hover {
  border-color: var(--rm-text);
}
.place.active {
  border-color: var(--rm-accent);
  background: #fdf3f2;
}
.place-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.place-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.place-text strong {
  font-size: 14px;
}
.place-text small {
  font-size: 12px;
  color: var(--rm-text-secondary);
}
.place svg {
  color: var(--rm-accent);
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

textarea {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid var(--rm-border);
  border-radius: 20px;
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--rm-text);
  resize: none;
  transition: border-color 0.2s;
}
textarea::placeholder {
  color: var(--rm-placeholder);
}
textarea:focus {
  outline: none;
  border-color: var(--rm-text);
}
.counter {
  align-self: flex-end;
  font-size: 12px;
  color: var(--rm-text-muted);
}

.summary {
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--rm-success-bg);
  font-size: 14px;
  line-height: 1.5;
  color: var(--rm-text-body);
}

.btn-primary {
  height: 54px;
  border: 0;
  border-radius: 999px;
  background: var(--rm-accent);
  color: #fff;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}
.btn-primary:hover:not(:disabled) {
  background: var(--rm-accent-dark);
}
.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 380px) {
  .invite-shell {
    padding: 24px 16px 28px;
  }
}
</style>