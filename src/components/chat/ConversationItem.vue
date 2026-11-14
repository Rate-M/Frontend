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
        <h3>{{ conversation.name }}</h3>
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

const props = defineProps<{ conversation: Conversation }>()

const last = computed(() => props.conversation.messages[props.conversation.messages.length - 1])
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
.top h3 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 22px;
  line-height: 1.1;
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