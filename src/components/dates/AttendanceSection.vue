<template>
  <div v-if="invitation.status === 'accepted'" class="attend">
    <template v-if="attended">
      <p class="line ok">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        {{ attendedText }}
      </p>


      <div v-if="rState === 'published' && invitation.review" class="reviewed">
        <div class="mine">
          <span class="mine-label">Tu calificación · reseñas publicadas</span>
          <StarRating :model-value="invitation.review.rating" readonly :size="16" />
        </div>
        <router-link :to="`/cita/${invitation.id}/calificar`" class="link">Ver reseñas</router-link>
      </div>

      
      <div v-else-if="rState === 'waiting'" class="reviewed">
        <p class="line wait">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
            <path d="M8 10.5V8a4 4 0 018 0v2.5" />
          </svg>
          Reseña enviada · se publicará cuando {{ name }} califique
        </p>
        <router-link :to="`/cita/${invitation.id}/calificar`" class="link">Ver estado</router-link>
      </div>

    
      <template v-else>
        <router-link :to="`/cita/${invitation.id}/calificar`" class="btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3.5l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8L12 3.5z" />
          </svg>
          Calificar a {{ name }}
        </router-link>
        <p v-if="invitation.theirReview" class="hint">{{ name }} ya calificó. Verás su reseña cuando envíes la tuya.</p>
      </template>
    </template>

    <template v-else-if="invitation.attendance === 'manual_pending'">
      <p class="line wait">
        <span class="spinner" aria-hidden="true" />
        Esperando que {{ name }} confirme
      </p>
      <router-link :to="`/cita/${invitation.id}/verificar`" class="btn">Ver estado</router-link>
    </template>

    <template v-else-if="invitation.attendance === 'gps_failed'">
      <p class="line warn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5M12 16v.01" />
        </svg>
        No pudimos verificar por GPS
      </p>
      <router-link :to="`/cita/${invitation.id}/verificar`" class="btn">Confirmar manualmente</router-link>
    </template>

    <router-link v-else-if="canVerify" :to="`/cita/${invitation.id}/verificar`" class="btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
        <circle cx="12" cy="10" r="2.4" />
      </svg>
      Verificar asistencia
    </router-link>

    <p v-else class="line muted">Podrás verificar tu asistencia desde 30 min antes de la hora acordada.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StarRating from './StarRating.vue'
import { useChatStore } from '../../stores/chat'
import type { DateInvitation } from '../../types/dates'
import { reviewState } from '../../utils/reviews'

const props = defineProps<{ invitation: DateInvitation }>()

const chat = useChatStore()
const name = computed(() => chat.getById(props.invitation.conversationId)?.name ?? 'tu match')
const canVerify = computed(() => Date.now() >= props.invitation.startsAt - 30 * 60 * 1000)
const rState = computed(() => reviewState(props.invitation))

const attended = computed(
  () => props.invitation.attendance === 'verified' || props.invitation.attendance === 'manual_confirmed'
)
const attendedText = computed(() =>
  props.invitation.attendance === 'verified'
    ? 'Verificado: ambos en el lugar a la hora acordada'
    : 'Asistencia confirmada manualmente por ambos'
)
</script>

<style scoped>
.attend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px dashed var(--rm-border);
}
.line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}
.line.ok {
  color: var(--rm-success);
}
.line.warn {
  color: var(--rm-accent-dark);
}
.line.wait {
  color: var(--rm-text-secondary);
}
.line.muted {
  font-weight: 400;
  color: var(--rm-text-muted);
}
.line svg {
  flex-shrink: 0;
}
.hint {
  font-size: 12px;
  line-height: 1.4;
  color: var(--rm-text-secondary);
}
.spinner {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid var(--rm-border);
  border-top-color: var(--rm-accent);
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.reviewed {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.mine {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mine-label {
  font-size: 12px;
  color: var(--rm-text-secondary);
}
.link {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--rm-accent-dark);
}

.btn {
  height: 44px;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  transition: background 0.2s;
}
.btn:hover {
  background: #000;
  color: #fff;
}
</style>