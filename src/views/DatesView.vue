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

      <p v-if="loading" role="status">Cargando tus citas…</p>
      <div v-if="loadError" role="alert">
        <p>{{ loadError }}</p>
        <button type="button" class="tab" :disabled="loading" @click="refresh">Reintentar</button>
      </div>
      <ul v-if="!useMocks && remoteList.length" class="list">
        <li v-for="{ invitation, match } in remoteList" :key="invitation.id">
          <router-link :to="{ name: 'Chat', params: { id: match.id } }">
            {{ match.name }} · {{ formatDateTime(Date.parse(invitation.startsAt)) }}
          </router-link>
          <p v-if="invitation.note">{{ invitation.note }}</p>
        </li>
      </ul>
      <ul v-else-if="useMocks && list.length" class="list">
        <li v-for="i in list" :key="i.id">
          <DateCard :invitation="i" />
        </li>
      </ul>

      <div v-else-if="!loading && !loadError" class="empty">
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
import { ref, computed, watch } from 'vue'
import DateCard from '../components/dates/DateCard.vue'
import { useChatStore } from '../stores/chat'
import { useDatesStore } from '../stores/dates'
import type { DateInvitation } from '../types/dates'
import { useAuthStore } from '../stores/auth'
import { listInvitations, type ChatInvitation } from '../services/dateInvitations'
import { loadConversations } from '../services/conversations'
import { formatDateTime } from '../utils/dateFormat'

type Tab = 'received' | 'sent' | 'accepted' | 'declined'

const chat = useChatStore()
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'
const dates = useMocks ? useDatesStore() : undefined
const auth = useAuthStore()
const loading = ref(false)
const loadError = ref('')
const entries = ref<{ invitation: ChatInvitation; match: { id: string; name: string } }[]>([])
let request: AbortController | undefined

async function refresh() {
  const token = auth.token
  const userId = auth.user?.id
  if (!token || typeof userId !== 'string') return
  request?.abort()
  const controller = new AbortController()
  request = controller
  loading.value = true
  loadError.value = ''
  try {
    const matches = await loadConversations(token, userId, controller.signal)
    const results = await Promise.allSettled(matches.map(async (match) => {
      const { invitations } = await listInvitations(match.id, token, controller.signal)
      return invitations.map((invitation) => ({ match, invitation }))
    }))
    if (controller.signal.aborted) return
    entries.value = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
    if (results.some((result) => result.status === 'rejected')) {
      loadError.value = 'No pudimos cargar todas tus citas.'
    }
  } catch {
    if (!controller.signal.aborted) loadError.value = 'No pudimos cargar tus citas.'
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

if (!useMocks) {
  watch([() => auth.token, () => auth.user?.id], (_, __, onCleanup) => {
    entries.value = []
    loading.value = false
    loadError.value = ''
    void refresh()
    onCleanup(() => request?.abort())
  }, { immediate: true })
}

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

const visible = computed(() => dates?.invitations.filter((i) => chat.getById(i.conversationId)) ?? [])

function inRemoteTab(invitation: ChatInvitation, selected: Tab) {
  if (selected === 'received') return invitation.status === 'pending' && invitation.awaitingYourResponse
  if (selected === 'sent') return invitation.status === 'pending' && !invitation.awaitingYourResponse
  return invitation.status === selected
}

const counts = computed(() => Object.fromEntries(tabs.map(({ key }) => [key, useMocks
  ? visible.value.filter((invitation) => inTab(invitation, key)).length
  : entries.value.filter(({ invitation }) => inRemoteTab(invitation, key)).length])))

const remoteList = computed(() => entries.value.filter(({ invitation }) => inRemoteTab(invitation, tab.value))
  .sort((a, b) => Date.parse(a.invitation.startsAt) - Date.parse(b.invitation.startsAt)))

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