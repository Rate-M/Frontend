<script setup lang="ts">
type IconName = 'shield' | 'shield-check' | 'shield-x' | 'clock' | 'check-circle' | 'alert-circle' | 'x'

const SHIELD = 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z'
const CIRCLE = 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z'

const PATHS: Record<IconName, string[]> = {
  shield: [SHIELD],
  'shield-check': [SHIELD, 'M8.8 12.2l2.2 2.2 4.4-4.6'],
  'shield-x': [SHIELD, 'M9.5 9.5l5 5', 'M14.5 9.5l-5 5'],
  clock: [CIRCLE, 'M12 7.5V12l3 2'],
  'check-circle': [CIRCLE, 'M8.5 12.2l2.4 2.4 4.6-4.8'],
  'alert-circle': [CIRCLE, 'M12 8v4.5', 'M12 16h.01'],
  x: ['M6 6l12 12', 'M18 6L6 18']
}

withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 20 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="d in PATHS[name]" :key="d" :d="d" />
  </svg>
</template>