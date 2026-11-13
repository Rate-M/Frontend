<template>
  <div class="notif-page">
    <div class="notif-card">
      <header class="head">
        <router-link to="/descubrir" class="back-btn" aria-label="Volver a descubrir">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </router-link>
        <h1>Notificaciones</h1>
        <span class="head-spacer" />
      </header>

      <button v-if="store.unreadCount" type="button" class="mark-read" @click="store.markAllRead()">
        Marcar todas como leídas
      </button>

      <ul v-if="store.items.length" class="list">
        <li v-for="n in store.items" :key="n.id" class="item" :class="{ unread: !n.read }">
          <img v-if="n.avatar" :src="n.avatar" alt="" class="avatar" />
          <span v-else class="avatar avatar-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
              <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
            </svg>
          </span>

          <div class="body">
            <p class="title">
              <svg v-if="n.type === 'match'" class="heart" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 21s-7.5-4.6-9.4-9.3C1.2 8.2 3.1 5 6.3 5c2 0 3.5 1.1 4.2 2.4h3C14.2 6.1 15.7 5 17.7 5c3.2 0 5.1 3.2 3.7 6.7C19.5 16.4 12 21 12 21z" />
              </svg>
              {{ n.title }}
            </p>
            <p class="text">{{ n.text }}</p>
            <span class="time">{{ timeAgo(n.createdAt) }}</span>
          </div>

          <span v-if="!n.read" class="dot" aria-label="Sin leer" />
        </li>
      </ul>

      <div v-else class="empty">
        <h2>Aún no tienes notificaciones</h2>
        <p>Cuando alguien te dé "me gusta" de vuelta, te avisaremos aquí.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '../stores/notifications'

const store = useNotificationsStore()

const timeAgo = (ts: number) => {
  const minutes = Math.floor((Date.now() - ts) / 60000)
  if (minutes < 1) return 'Justo ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
}
</script>

<style scoped>
.notif-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}

.notif-card {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
}
.back-btn {
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: border-color 0.2s;
}
.back-btn:hover {
  border-color: var(--rm-text);
  color: var(--rm-text);
}

.mark-read {
  align-self: flex-end;
  border: 0;
  background: transparent;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--rm-accent-dark);
  cursor: pointer;
  padding: 0;
}
.mark-read:hover {
  color: var(--rm-accent-darker);
  text-decoration: underline;
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 20px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
}
.item.unread {
  background: #fdf3f2;
  border-color: var(--rm-btn-secondary);
}

.avatar {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 999px;
  object-fit: cover;
}
.avatar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--rm-accent);
  color: var(--rm-text);
}

.body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
}
.heart {
  color: var(--rm-accent);
}
.text {
  font-size: 13px;
  line-height: 1.45;
  color: var(--rm-text-body);
}
.time {
  font-size: 12px;
  color: var(--rm-text-muted);
}

.dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--rm-accent);
}

.empty {
  text-align: center;
  padding: 32px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.empty h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 28px;
}
.empty p {
  font-size: 14px;
  color: var(--rm-text-secondary);
}

@media (max-width: 380px) {
  .notif-card {
    padding: 24px 16px 28px;
  }
}
</style>