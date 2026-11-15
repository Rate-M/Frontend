<template>
  <div class="dates-page">
    <div class="dates-shell">
      <header class="head">
        <router-link to="/chats" class="back-btn" aria-label="Volver a mensajes">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </router-link>
        <h1>Mis citas</h1>
        <span class="head-spacer" />
      </header>

      <ul class="tabs" role="tablist" aria-label="Estado de las citas">
        <li v-for="t in tabs" :key="t.key">
          <button
            type="button"
            role="tab"
            class="tab"
            :class="{ active: tab === t.key }"
            :aria-selected="tab === t.key"
            @click="tab = t.key"
          >
            {{ t.label }}
            <span class="count">{{ counts[t.key] }}</span>
          </button>
        </li>
      </ul>

      <ul v-if="list.length" class="list">
        <li v-for="i in list" :key="i.id">
          <DateCard :invitation="i" />
        </li>
      </ul>

      <div v-else class="empty">
        <div class="empty-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
          </svg>
        </div>
        <h2>{{ emptyText.title }}</h2>
        <p>{{ emptyText.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DateCard from '../components/dates/DateCard.vue'
import { useChatStore } from '../stores/chat'
import { useDatesStore } from '../stores/dates'
import type { DateInvitation } from '../types/dates'

type Tab = 'received' | 'sent' | 'accepted' | 'declined'

const chat = useChatStore()
const dates = useDatesStore()

const tabs: { key: Tab; label: string }[] = [
  { key: 'received', label: 'Por responder' },
  { key: 'sent', label: 'Enviadas' },
  { key: 'accepted', label: 'Confirmadas' },
  { key: 'declined', label: 'Rechazadas' }
]

const tab = ref<Tab>('received')

const inTab = (i: DateInvitation, t: Tab) => {
  if (t === 'received') return i.direction === 'received' && i.status === 'pending'
  if (t === 'sent') return i.direction === 'sent' && i.status === 'pending'
  return i.status === t
}

const visible = computed(() => dates.invitations.filter((i) => chat.getById(i.conversationId)))

const counts = computed(() => ({
  received: visible.value.filter((i) => inTab(i, 'received')).length,
  sent: visible.value.filter((i) => inTab(i, 'sent')).length,
  accepted: visible.value.filter((i) => inTab(i, 'accepted')).length,
  declined: visible.value.filter((i) => inTab(i, 'declined')).length
}))

const list = computed(() =>
  visible.value.filter((i) => inTab(i, tab.value)).sort((a, b) => a.startsAt - b.startsAt)
)

const emptyMessages: Record<Tab, { title: string; text: string }> = {
  received: { title: 'Nada por responder', text: 'Cuando alguien te invite a una cita, la verás aquí.' },
  sent: { title: 'Sin invitaciones enviadas', text: 'Invita a un match desde su chat cuando desbloquees el botón.' },
  accepted: { title: 'Aún no hay citas confirmadas', text: 'Las invitaciones aceptadas aparecerán aquí.' },
  declined: { title: 'Sin invitaciones rechazadas', text: 'Aquí verás las que decidiste no aceptar.' }
}

const emptyText = computed(() => emptyMessages[tab.value])
</script>

<style scoped>
.dates-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}
.dates-shell {
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
  flex-shrink: 0;
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

.tabs {
  list-style: none;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--rm-text-body);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.tab:hover {
  border-color: var(--rm-text);
}
.tab.active {
  background: var(--rm-text);
  border-color: var(--rm-text);
  color: #fff;
}
.count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tab.active .count {
  background: #fff;
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  padding: 28px 8px;
}
.empty-icon {
  width: 64px;
  height: 64px;
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

@media (max-width: 380px) {
  .dates-shell {
    padding: 24px 16px 28px;
  }
}
</style>