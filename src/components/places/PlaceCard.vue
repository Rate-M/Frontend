<template>
  <article class="place-card">
    <div class="head">
      <span class="icon"><CategoryIcon :category="place.category" :size="22" /></span>
      <div class="titles">
        <h3>{{ place.name }}</h3>
        <p>{{ categoryLabels[place.category] }} · a {{ place.distanceKm }} km</p>
      </div>
    </div>

    <ul class="facts">
      <li>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
          <circle cx="12" cy="10" r="2.4" />
        </svg>
        {{ place.address }}
      </li>
      <li>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
        {{ place.hours }}
      </li>
    </ul>

    <p class="safe">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
        <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
      </svg>
      {{ place.safetyTip }}
    </p>

    <div class="actions"><slot name="actions" /></div>
  </article>
</template>

<script setup lang="ts">
import CategoryIcon from './CategoryIcon.vue'
import { categoryLabels } from '../../types/places'
import type { Place } from '../../types/places'

defineProps<{ place: Place }>()
</script>

<style scoped>
.place-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
}
.head {
  display: flex;
  align-items: center;
  gap: 14px;
}
.icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid var(--rm-accent);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
}
.titles h3 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 26px;
  line-height: 1.1;
}
.titles p {
  font-size: 13px;
  color: var(--rm-text-secondary);
}
.facts {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.facts li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--rm-text-body);
}
.facts svg {
  color: var(--rm-accent-dark);
  flex-shrink: 0;
}
.safe {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--rm-success-bg);
  color: var(--rm-text-body);
  font-size: 13px;
  line-height: 1.45;
}
.safe svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--rm-success);
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>