<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import StatusIcon from './StatusIcon.vue'
import { useVerificationStore } from '../stores/verification'

const store = useVerificationStore()
const { notice } = storeToRefs(store)

let hideTimer: ReturnType<typeof setTimeout> | undefined

// Cada aviso nuevo se oculta solo a los 6 segundos
watch(notice, (value) => {
  clearTimeout(hideTimer)
  if (value) hideTimer = setTimeout(store.clearNotice, 6000)
})

onBeforeUnmount(() => clearTimeout(hideTimer))
</script>

<template>
  <transition name="toast">
    <div v-if="notice" class="toast" :class="`toast-${notice.type}`" role="status">
      <StatusIcon :name="notice.type === 'success' ? 'check-circle' : 'alert-circle'" />
      <span>{{ notice.message }}</span>
      <button type="button" class="toast-close" aria-label="Cerrar" @click="store.clearNotice()">
        <StatusIcon name="x" :size="16" />
      </button>
    </div>
  </transition>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 16px;
  background: var(--rm-bg);
  border: 1px solid var(--rm-border);
  box-shadow: 0 8px 24px rgba(20, 18, 20, 0.1);
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--rm-text);
}

.toast-success {
  border-color: var(--rm-accent);
}

.toast-error {
  background: #fbeaea;
  border-color: var(--rm-accent);
  color: var(--rm-accent-dark);
}

.toast-close {
  border: 0;
  background: transparent;
  padding: 0;
  display: flex;
  cursor: pointer;
  color: var(--rm-text-muted);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>