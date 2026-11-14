<template>
  <div v-if="invitation.status === 'accepted'" class="attend">
    <p v-if="invitation.attendance === 'verified'" class="line ok">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
      Verificado: ambos en el lugar a la hora acordada
    </p>

    <template v-else-if="invitation.attendance === 'gps_failed'">
      <p class="line warn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5M12 16v.01" />
        </svg>
        No pudimos verificar por GPS
      </p>
      <router-link :to="`/cita/${invitation.id}/verificar`" class="btn">Ver detalles</router-link>
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
import type { DateInvitation } from '../../types/dates'

const props = defineProps<{ invitation: DateInvitation }>()

const canVerify = computed(() => Date.now() >= props.invitation.startsAt - 30 * 60 * 1000)
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
.line.muted {
  font-weight: 400;
  color: var(--rm-text-muted);
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