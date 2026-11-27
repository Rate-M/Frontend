<template>
  <section v-if="streak" class="streak" :class="state" aria-live="polite">
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
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '../../stores/chat'

const props = defineProps<{ conversationId: string }>()

const store = useChatStore()
const streak = computed(() => store.streakOf(props.conversationId))

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
</script>

<style scoped>
.streak {
  margin: 12px 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
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
</style>