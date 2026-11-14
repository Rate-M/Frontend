<template>
  <div class="chat-page">
    <div v-if="conv" class="chat-shell">
      <header class="chat-head">
        <button type="button" class="icon-btn" aria-label="Volver" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <div class="who">
          <div class="avatar-wrap">
            <img :src="conv.photo" :alt="conv.name" class="avatar" />
            <span v-if="conv.online" class="online-dot" aria-hidden="true" />
          </div>
          <div class="who-text">
            <h1>{{ conv.name }}</h1>
            <span class="status" :class="{ live: conv.online }">{{ statusText }}</span>
          </div>
        </div>

        <div class="menu-wrap">
          <button
            type="button"
            class="icon-btn"
            aria-label="Más opciones"
            aria-haspopup="menu"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="5.500" r="1.600" />
              <circle cx="12" cy="12" r="1.600" />
              <circle cx="12" cy="18.500" r="1.600" />
            </svg>
          </button>

          <div v-if="menuOpen" class="menu-backdrop" @click="menuOpen = false" />
          <ul v-if="menuOpen" class="menu" role="menu">
            <li role="none">
              <button type="button" role="menuitem" class="menu-item danger" @click="askUnmatch">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 20s-7-4.400-8.800-8.800C2 8 3.800 5 6.800 5c1.900 0 3.200 1 4 2.300" />
                  <path d="M14.800 5.400C15.500 5.100 16.200 5 16.800 5c3 0 4.800 3 3.600 6.200-.5 1.200-1.400 2.400-2.500 3.500" />
                  <path d="M4 4l16 16" />
                </svg>
                Deshacer match
              </button>
            </li>
          </ul>
        </div>
      </header>

      <div ref="listEl" class="messages" aria-live="polite">
        <div v-if="!conv.messages.length" class="icebreaker">
          <img :src="conv.photo" alt="" class="ice-avatar" />
          <h2>Hiciste match con <em>{{ conv.name }}</em></h2>
          <p>Rompe el hielo con un primer mensaje.</p>
        </div>

        <div v-for="m in conv.messages" :key="m.id" class="row" :class="m.from">
          <div class="bubble">
            <p>{{ m.text }}</p>
            <span class="meta">
              {{ formatHour(m.sentAt) }}
              <svg v-if="m.from === 'me'" class="tick" :class="{ read: m.status === 'read' }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 12.5l4 4L16 8" />
                <path v-if="m.status === 'read'" d="M12 14.5l1.5 1.5L21 8" />
              </svg>
            </span>
          </div>
        </div>

        <div v-if="typing" class="row them">
          <div class="bubble typing" aria-label="Escribiendo">
            <span /><span /><span />
          </div>
        </div>
      </div>

      <form class="composer" @submit.prevent="send">
        <input
          v-model="text"
          type="text"
          maxlength="500"
          placeholder="Escribe un mensaje..."
          aria-label="Mensaje"
          autocomplete="off"
        />
        <button type="submit" class="send-btn" :disabled="!text.trim()" aria-label="Enviar mensaje">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>

      <UnmatchModal v-if="confirming" :name="conv.name" @cancel="confirming = false" @confirm="doUnmatch" />
    </div>

    <div v-else class="not-found">
      <h1>Esta conversación ya no existe</h1>
      <button type="button" class="btn-primary" @click="router.push('/chats')">Ir a mis mensajes</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UnmatchModal from '../components/chat/UnmatchModal.vue'
import { useChatStore } from '../stores/chat'
import { formatHour } from '../utils/chatTime'

const route = useRoute()
const router = useRouter()
const store = useChatStore()

const conv = computed(() => store.getById(route.params.id as string))
const typing = computed(() => !!conv.value && store.typingId === conv.value.id)

const text = ref('')
const listEl = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const confirming = ref(false)

const statusText = computed(() => {
  if (typing.value) return 'Escribiendo...'
  return conv.value?.online ? 'En línea' : 'Fuera de línea'
})

const scrollToBottom = async (smooth = true) => {
  await nextTick()
  listEl.value?.scrollTo({ top: listEl.value.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
}

const send = () => {
  if (!conv.value || !text.value.trim()) return
  store.sendMessage(conv.value.id, text.value)
  text.value = ''
  scrollToBottom()
}

const askUnmatch = () => {
  menuOpen.value = false
  confirming.value = true
}

const doUnmatch = async () => {
  const id = conv.value?.id
  if (!id) return
  confirming.value = false
  await router.replace('/chats')
  store.unmatch(id)
}

watch(
  () => [conv.value?.messages.length, typing.value],
  () => {
    if (conv.value) store.markRead(conv.value.id)
    scrollToBottom()
  }
)

onMounted(() => {
  if (conv.value) {
    store.markRead(conv.value.id)
    scrollToBottom(false)
  }
})
</script>

<style scoped>
.chat-page {
  height: 100vh;
  height: 100dvh;
  display: flex;
  justify-content: center;
}

.chat-shell {
  width: 100%;
  max-width: 560px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--rm-border);
}

.icon-btn {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}
.icon-btn:hover {
  border-color: var(--rm-text);
}

.who {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.avatar {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  object-fit: cover;
  display: block;
}
.online-dot {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--rm-success);
  border: 2px solid var(--rm-bg);
}
.who-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.who-text h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 26px;
  line-height: 1.05;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.status {
  font-size: 12px;
  color: var(--rm-text-muted);
}
.status.live {
  color: var(--rm-success);
}

.menu-wrap {
  position: relative;
  flex-shrink: 0;
}
.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
}
.menu {
  position: absolute;
  top: 52px;
  right: 0;
  z-index: 11;
  min-width: 210px;
  list-style: none;
  padding: 6px;
  border-radius: 18px;
  background: var(--rm-bg);
  border: 1px solid var(--rm-border);
  box-shadow: 0 10px 30px rgba(20, 18, 20, 0.12);
}
.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}
.menu-item.danger {
  color: var(--rm-accent);
}
.menu-item:hover {
  background: #fdf3f2;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.icebreaker {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  padding: 24px;
}
.ice-avatar {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 6px 18px rgba(20, 18, 20, 0.15);
}
.icebreaker h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 30px;
  line-height: 1.1;
}
.icebreaker h2 em {
  font-style: italic;
  color: var(--rm-accent);
}
.icebreaker p {
  font-size: 14px;
  color: var(--rm-text-secondary);
}

.row {
  display: flex;
}
.row.me {
  justify-content: flex-end;
}
.row.them {
  justify-content: flex-start;
}

.bubble {
  max-width: 78%;
  padding: 10px 14px 6px;
  border-radius: 20px;
  font-size: 15px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
.row.me .bubble {
  background: var(--rm-accent);
  color: #fff;
  border-bottom-right-radius: 6px;
}
.row.them .bubble {
  background: #f4eeed;
  color: var(--rm-text);
  border-bottom-left-radius: 6px;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 2px;
  font-size: 11px;
  opacity: 0.75;
}
.tick {
  opacity: 0.7;
}
.tick.read {
  opacity: 1;
}

.bubble.typing {
  display: flex;
  gap: 5px;
  padding: 14px 16px;
}
.bubble.typing span {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--rm-placeholder);
  animation: blink 1.2s infinite ease-in-out;
}
.bubble.typing span:nth-child(2) {
  animation-delay: 0.15s;
}
.bubble.typing span:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes blink {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

.composer {
  display: flex;
  gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--rm-border);
  background: var(--rm-bg);
}
.composer input {
  flex: 1;
  height: 48px;
  padding: 0 20px;
  border: 1px solid var(--rm-border);
  border-radius: 999px;
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--rm-text);
  transition: border-color 0.2s;
}
.composer input::placeholder {
  color: var(--rm-placeholder);
}
.composer input:focus {
  outline: none;
  border-color: var(--rm-text);
}
.send-btn {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border: 0;
  border-radius: 999px;
  background: var(--rm-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}
.send-btn:hover:not(:disabled) {
  background: var(--rm-accent-dark);
}
.send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.not-found {
  margin: auto;
  max-width: 360px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
}
.not-found h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 32px;
  line-height: 1.1;
}
.btn-primary {
  height: 54px;
  border: 0;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #000;
}
</style>