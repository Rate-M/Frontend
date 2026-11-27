<template>
  <router-link
    v-if="last"
    :to="`/chat/${conversation.id}`"
    class="item"
    :class="{ unread: conversation.unread > 0 }"
  >
    <div class="avatar-wrap">
      <img :src="conversation.photo" :alt="conversation.name" class="avatar" />
      <span v-if="conversation.online" class="online-dot" aria-label="En línea" />
    </div>

    <div class="body">
      <div class="top">
        <div class="name-row">
          <h3>{{ conversation.name }}</h3>
          <span
            v-if="streak.days > 0"
            class="streak-chip"
            :class="{ hot: streak.doneToday }"
            :title="streakTitle"
            :aria-label="streakTitle"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 3c.8 3.4 4.5 5.2 4.5 9.8a4.5 4.5 0 01-9 0c0-1.7.7-2.9 1.8-3.9.2 1.2.9 1.8 1.7 2C11.2 9 11 6 12 3z" />
            </svg>
            {{ streak.days }}
          </span>
        </div>
        <span class="time">{{ formatListTime(last.sentAt) }}</span>
      </div>
      <div class="bottom">
        <p class="preview">{{ last.from === 'me' ? 'Tú: ' : '' }}{{ last.text }}</p>
        <span v-if="conversation.unread" class="badge" :aria-label="`${conversation.unread} mensajes sin leer`">
          {{ conversation.unread }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Conversation } from '../../types/chat'
import { formatListTime } from '../../utils/chatTime'
import { computeStreak } from '../../utils/streak'

const props = defineProps<{ conversation: Conversation }>()

const last = computed(() => props.conversation.messages[props.conversation.messages.length - 1])
const streak = computed(() => computeStreak(props.conversation.messages))

const streakTitle = computed(() => {
  const d = streak.value.days
  const base = `Racha de ${d} ${d === 1 ? 'día' : 'días'}`
  return streak.value.doneToday ? `${base} (hoy ya cumplieron)` : `${base} (escribe hoy para mantenerla)`
})
</script>

<style scoped>
.item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 20px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  text-decoration: none;
  color: var(--rm-text);
  transition: border-color 0.2s, background 0.2s;
}
.item:hover {
  border-color: var(--rm-text);
  color: var(--rm-text);
}
.item.unread {
  background: #fdf3f2;
  border-color: var(--rm-btn-secondary);
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  object-fit: cover;
  display: block;
}
.online-dot {
  position: absolute;
  right: 1px;
  bottom: 1px;
  width: 13px;
  height: 13px;
  border-radius: 999px;
  background: var(--rm-success);
  border: 2px solid var(--rm-bg);
}

.body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.top,
.bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.top h3 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 22px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.streak-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px 2px 6px;
  border-radius: 999px;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  font-size: 12px;
  font-weight: 600;
}
.streak-chip.hot {
  background: var(--rm-accent);
  color: #fff;
}

.time {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--rm-text-muted);
}
.preview {
  font-size: 14px;
  color: var(--rm-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item.unread .preview {
  color: var(--rm-text);
  font-weight: 600;
}
.badge {
  flex-shrink: 0;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--rm-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>