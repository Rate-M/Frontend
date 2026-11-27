<template>
  <div class="chats-page">
    <div class="chats-shell">
      <header class="head">
        <router-link to="/descubrir" class="back-btn" aria-label="Volver a descubrir">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </router-link>
        <h1>Mensajes</h1>
        <span class="head-spacer" />
      </header>

      <div class="search">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" />
        </svg>
        <input v-model="query" type="search" placeholder="Buscar conversación" aria-label="Buscar conversación" />
      </div>

      <section v-if="store.newMatches.length && !query.trim()" class="block">
        <h2 class="section-title">Nuevos matches</h2>
        <ul class="matches-row">
          <li v-for="m in store.newMatches" :key="m.id">
            <router-link :to="`/chat/${m.id}`" class="match">
              <span class="ring"><img :src="m.photo" :alt="m.name" /></span>
              <span class="match-name">{{ m.name }}</span>
            </router-link>
          </li>
        </ul>
      </section>

      <section class="block">
        <h2 class="section-title">
          Conversaciones
          <span class="count">{{ filtered.length }}</span>
        </h2>

        <ul v-if="filtered.length" class="list">
          <li v-for="c in filtered" :key="c.id">
            <ConversationItem :conversation="c" />
          </li>
        </ul>

        <div v-else class="empty">
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-7l-4.500 3.500V17H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
          </div>
          <h2>{{ query.trim() ? 'Sin resultados' : 'Aún no tienes conversaciones' }}</h2>
          <p>
            {{ query.trim() ? 'No encontramos a nadie con ese nombre.' : 'Cuando hagas match, podrás escribirle desde aquí.' }}
          </p>
          <router-link v-if="!query.trim()" to="/descubrir" class="btn-primary">Descubrir perfiles</router-link>
        </div>
      </section>
    </div>

    <p v-if="store.notice" class="toast" role="status">{{ store.notice }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ConversationItem from '../components/chat/ConversationItem.vue'
import { useChatStore } from '../stores/chat'

const store = useChatStore()
const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? store.active.filter((c) => c.name.toLowerCase().includes(q)) : store.active
})
</script>

<style scoped>
.chats-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}

.chats-shell {
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

.search {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 18px;
  color: var(--rm-text-muted);
  pointer-events: none;
}
.search input {
  width: 100%;
  height: 50px;
  padding: 0 18px 0 48px;
  border: 1px solid var(--rm-border);
  border-radius: 999px;
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--rm-text);
  transition: border-color 0.2s;
}
.search input::placeholder {
  color: var(--rm-placeholder);
}
.search input:focus {
  outline: none;
  border-color: var(--rm-text);
}

.block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.section-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rm-text-muted);
}
.count {
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  font-size: 11px;
  letter-spacing: 0;
}

.matches-row {
  list-style: none;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.match {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--rm-text);
}
.match:hover {
  color: var(--rm-text);
}
.ring {
  width: 70px;
  height: 70px;
  padding: 3px;
  border-radius: 999px;
  border: 2px solid var(--rm-accent);
  display: block;
}
.ring img {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
  display: block;
}
.match-name {
  font-size: 13px;
  font-weight: 600;
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 24px 8px;
}
.empty-icon {
  width: 68px;
  height: 68px;
  border-radius: 999px;
  border: 1px solid var(--rm-accent);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
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
.btn-primary {
  width: 100%;
  height: 54px;
  margin-top: 4px;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #000;
  color: #fff;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  max-width: calc(100% - 40px);
  padding: 14px 22px;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-size: 14px;
  box-shadow: 0 10px 30px rgba(20, 18, 20, 0.25);
  z-index: 40;
}

@media (max-width: 380px) {
  .chats-shell {
    padding: 24px 16px 28px;
  }
}
</style>