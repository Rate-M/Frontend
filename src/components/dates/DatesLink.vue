<template>
  <router-link to="/citas" class="dates-link">
    <span class="icon">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </svg>
    </span>
    <span class="text">
      <strong>Mis citas</strong>
      <small>{{ subtitle }}</small>
    </span>
    <span v-if="dates.pendingReceivedCount" class="badge" :aria-label="`${dates.pendingReceivedCount} por responder`">
      {{ dates.pendingReceivedCount }}
    </span>
    <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDatesStore } from '../../stores/dates'

const dates = useDatesStore()

const subtitle = computed(() => {
  const n = dates.pendingReceivedCount
  if (!n) return 'Invitaciones y citas confirmadas'
  return n === 1 ? '1 invitación por responder' : `${n} invitaciones por responder`
})
</script>

<style scoped>
.dates-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid var(--rm-btn-secondary);
  background: #fdf3f2;
  text-decoration: none;
  color: var(--rm-text);
  transition: border-color 0.2s;
}
.dates-link:hover {
  border-color: var(--rm-accent);
  color: var(--rm-text);
}
.icon {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid var(--rm-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.text strong {
  font-size: 15px;
}
.text small {
  font-size: 12px;
  color: var(--rm-text-secondary);
}
.badge {
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--rm-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chev {
  color: var(--rm-text-muted);
}
</style>