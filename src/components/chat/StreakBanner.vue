<template>
  <section v-if="streak" class="streak" :class="state" aria-live="polite">
    <div class="row">
      <span class="flame" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c.8 3.4 4.5 5.2 4.5 9.8a4.5 4.5 0 01-9 0c0-1.7.7-2.9 1.8-3.9.2 1.2.9 1.8 1.7 2C11.2 9 11 6 12 3z" />
        </svg>
      </span>

      <div class="text">
        <p class="title">{{ title }}</p>
        <p class="sub">{{ sub }}</p>
      </div>

      <span v-if="streak.days > 0" class="count">{{ streak.days }}</span>
    </div>

    <div class="invite">
      <div
        class="progress"
        role="progressbar"
        :aria-valuenow="Math.min(streak.days, MIN)"
        aria-valuemin="0"
        :aria-valuemax="MIN"
        aria-label="Progreso para desbloquear Invitar a cita"
      >
        <span :style="{ width: percent + '%' }" />
      </div>

      <p class="hint">{{ hint }}</p>

      <button
        type="button"
        class="invite-btn"
        :class="{ pulse: justUnlocked }"
        :disabled="!unlocked"
        @click="open = true"
      >
        <svg v-if="!unlocked" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
          <path d="M8 10.5V8a4 4 0 018 0v2.5" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        Invitar a cita
      </button>

      <p v-if="sentText" class="sent" role="status">{{ sentText }}</p>
    </div>

    <InviteModal v-if="open && conv" :name="conv.name" @close="open = false" @confirm="sendInvite" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import InviteModal from './InviteModal.vue'
import { useChatStore } from '../../stores/chat'
import { INVITE_MIN_STREAK } from '../../utils/streak'

const props = defineProps<{ conversationId: string }>()

const MIN = INVITE_MIN_STREAK
const store = useChatStore()

const conv = computed(() => store.getById(props.conversationId))
const streak = computed(() => store.streakOf(props.conversationId))

const open = ref(false)
const justUnlocked = ref(false)
const sentText = ref('')

const unlocked = computed(() => (streak.value?.days ?? 0) >= MIN)
const percent = computed(() => Math.min(100, ((streak.value?.days ?? 0) / MIN) * 100))

const state = computed(() => {
  if (!streak.value) return 'none'
  if (streak.value.doneToday) return 'done'
  return streak.value.days > 0 ? 'pending' : 'none'
})

const title = computed(() => {
  const d = streak.value?.days ?? 0
  if (!d) return 'Sin racha por ahora'
  return `${d} ${d === 1 ? 'día seguido' : 'días seguidos'} escribiéndose`
})

const sub = computed(() => {
  const s = streak.value
  if (!s) return ''
  if (s.doneToday) return '¡Hoy ya cumplieron! Vuelvan mañana.'
  if (s.days > 0) return 'Escribe hoy para no perder la racha.'
  return 'Intercambien mensajes hoy para empezar una racha.'
})

const hint = computed(() => {
  if (unlocked.value) return '¡Desbloqueado! Ya pueden planear su cita.'
  const left = MIN - (streak.value?.days ?? 0)
  return `Faltan ${left} ${left === 1 ? 'día' : 'días'} de racha para desbloquear "Invitar a cita".`
})

watch(unlocked, (now, before) => {
  if (now && !before) {
    justUnlocked.value = true
    setTimeout(() => (justUnlocked.value = false), 4000)
  }
})

const sendInvite = (p: { day: string; time: string; place: string }) => {
  store.sendMessage(
    props.conversationId,
    `📅 Te invito a una cita: ${p.day} a las ${p.time} en ${p.place}. ¿Qué dices?`
  )
  open.value = false
  sentText.value = 'Invitación enviada ✓'
  setTimeout(() => (sentText.value = ''), 4000)
}
</script>

<style scoped>
.streak {
  margin: 12px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
}
.streak.pending {
  background: #fdf3f2;
  border-color: var(--rm-btn-secondary);
}
.streak.done {
  background: var(--rm-success-bg);
  border-color: var(--rm-success);
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.flame {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid var(--rm-accent);
  color: var(--rm-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.streak.none .flame {
  border-color: var(--rm-border);
  color: var(--rm-placeholder);
}
.streak.done .flame {
  border-color: var(--rm-success);
  color: var(--rm-success);
}
.text {
  flex: 1;
  min-width: 0;
}
.title {
  font-size: 14px;
  font-weight: 600;
}
.sub {
  margin-top: 2px;
  font-size: 12px;
  color: var(--rm-text-secondary);
}
.count {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 34px;
  line-height: 1;
  color: var(--rm-accent);
}
.streak.done .count {
  color: var(--rm-success);
}

.invite {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.progress {
  height: 8px;
  border-radius: 999px;
  background: rgba(20, 18, 20, 0.08);
  overflow: hidden;
}
.progress span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--rm-accent);
  transition: width 0.4s ease;
}
.streak.done .progress span {
  background: var(--rm-success);
}
.hint {
  font-size: 12px;
  color: var(--rm-text-secondary);
}

.invite-btn {
  height: 46px;
  border: 0;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.invite-btn:hover:not(:disabled) {
  background: #000;
}
.invite-btn:disabled {
  background: rgba(20, 18, 20, 0.1);
  color: var(--rm-text-muted);
  cursor: not-allowed;
}
.invite-btn.pulse {
  animation: pulse 1.2s ease-in-out 3;
}

.sent {
  font-size: 13px;
  font-weight: 600;
  color: var(--rm-success);
  text-align: center;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(179, 32, 46, 0.5); }
  50% { box-shadow: 0 0 0 10px rgba(179, 32, 46, 0); }
}
</style>