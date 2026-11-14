<template>
  <section v-if="list.length" class="invites" aria-label="Invitaciones a cita">
    <DateCard v-for="i in list" :key="i.id" :invitation="i" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DateCard from './DateCard.vue'
import { useDatesStore } from '../../stores/dates'

const props = defineProps<{ conversationId: string }>()

const dates = useDatesStore()
const list = computed(() => dates.byConversation(props.conversationId).slice(0, 2))
</script>

<style scoped>
.invites {
  margin: 12px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 38vh;
  overflow-y: auto;
}
</style>