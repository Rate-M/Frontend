<template>
  <article v-if="place" class="date-card" :class="invitation.status">
    <header class="top">
      <img v-if="conv" :src="conv.photo" alt="" class="avatar" />
      <div class="who">
        <p class="title">{{ title }}</p>
        <span class="badge" :class="invitation.status">{{ statusLabel }}</span>
      </div>
    </header>

    <ul class="details">
      <li>
        <CategoryIcon :category="place.category" :size="16" />
        <span><strong>{{ place.name }}</strong> · {{ place.address }}</span>
      </li>
      <li>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        <span>{{ formatDateTime(invitation.startsAt) }}</span>
      </li>
    </ul>

    <p v-if="invitation.note" class="note">“{{ invitation.note }}”</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CategoryIcon from '../places/CategoryIcon.vue'
import { useChatStore } from '../../stores/chat'
import { getPlace } from '../../types/places'
import type { DateInvitation } from '../../types/dates'
import { formatDateTime } from '../../utils/dateFormat'

const props = defineProps<{ invitation: DateInvitation }>()

const chat = useChatStore()
const conv = computed(() => chat.getById(props.invitation.conversationId))
const place = computed(() => getPlace(props.invitation.placeId))

const title = computed(() => {
  const name = conv.value?.name ?? 'tu match'
  return props.invitation.direction === 'sent'
    ? `Invitaste a ${name} a una cita`
    : `${name} te invitó a una cita`
})

const statusLabel = computed(() => {
  if (props.invitation.status === 'accepted') return 'Cita confirmada'
  if (props.invitation.status === 'declined') return 'Rechazada'
  return props.invitation.direction === 'sent' ? 'Esperando respuesta' : 'Pendiente de tu respuesta'
})
</script>

<style scoped>
.date-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid var(--rm-btn-secondary);
  background: #fdf3f2;
}
.date-card.accepted {
  background: var(--rm-success-bg);
  border-color: var(--rm-success);
}
.date-card.declined {
  background: #f6f3f3;
  border-color: var(--rm-border);
}

.top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
}
.who {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
}
.title {
  font-size: 14px;
  font-weight: 600;
}
.badge {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  font-size: 11px;
  font-weight: 600;
}
.badge.accepted {
  background: var(--rm-success);
  color: #fff;
}
.badge.declined {
  background: var(--rm-border);
  color: var(--rm-text-secondary);
}

.details {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.details li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--rm-text-body);
}
.details svg {
  flex-shrink: 0;
  color: var(--rm-accent-dark);
}

.note {
  font-size: 13px;
  font-style: italic;
  color: var(--rm-text-secondary);
}
</style>