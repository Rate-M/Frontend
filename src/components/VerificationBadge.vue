<script setup lang="ts">
import { computed } from 'vue'
import StatusIcon from './StatusIcon.vue'
import { useVerificationStore } from '../stores/verification'
import type { VerificationStatus } from '../types/verification'

<VerificationBadge status-override="approved" />
const props = defineProps<{ statusOverride?: VerificationStatus }>()

const store = useVerificationStore()

const STATES: Record<VerificationStatus, { label: string; icon: 'shield' | 'shield-check' | 'shield-x' | 'clock' }> = {
  idle: { label: 'Sin verificar', icon: 'shield' },
  pending: { label: 'Verificación pendiente', icon: 'clock' },
  approved: { label: 'Verificada', icon: 'shield-check' },
  rejected: { label: 'Verificación rechazada', icon: 'shield-x' }
}

const status = computed(() => props.statusOverride ?? store.status)
const current = computed(() => (status.value ? STATES[status.value] : null))
</script>

<template>
  <span v-if="current" class="v-badge" :class="`v-badge-${status}`">
    <StatusIcon :name="current.icon" :size="14" />
    {{ current.label }}
  </span>
</template>

<style scoped>
.v-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  background: var(--rm-bg);
  border: 1px solid var(--rm-border);
  color: var(--rm-text-muted);
}

.v-badge-approved {
  color: var(--rm-accent-dark);
  border-color: var(--rm-accent);
}

.v-badge-rejected {
  color: #fff;
  background: var(--rm-accent);
  border-color: var(--rm-accent);
}
</style>