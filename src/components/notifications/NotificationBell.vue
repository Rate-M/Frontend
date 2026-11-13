<template>
  <router-link
    to="/notificaciones"
    class="bell"
    :aria-label="
      store.unreadCount
        ? `Notificaciones, ${store.unreadCount} sin leer`
        : 'Notificaciones'
    "
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M6 16.5V11a6 6 0 1112 0v5.5l1.5 2h-15l1.5-2z" />
      <path d="M10 20.5a2 2 0 004 0" />
    </svg>
    <span v-if="store.unreadCount" class="badge">{{ store.unreadCount > 9 ? '9+' : store.unreadCount }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '../../stores/notifications'

const store = useNotificationsStore()
</script>

<style scoped>
.bell {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: border-color 0.2s;
}
.bell:hover {
  border-color: var(--rm-text);
  color: var(--rm-text);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--rm-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--rm-bg);
  box-sizing: content-box;
}
</style>