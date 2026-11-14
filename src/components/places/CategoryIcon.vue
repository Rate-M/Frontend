<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="category === 'cafe'">
      <path d="M5 9h11v5a4 4 0 01-4 4H9a4 4 0 01-4-4V9z" />
      <path d="M16 10h1.5a2 2 0 010 4H16" />
      <path d="M8 4v2M12 4v2" />
    </template>
    <template v-else-if="category === 'parque'">
      <path d="M12 21v-6" />
      <path d="M12 15c-3.5 0-6-2.2-6-5 0-2.2 1.5-3.8 3.5-4.2C10 3.8 11 3 12 3s2 .8 2.5 2.800C16.500 6.200 18 7.800 18 10c0 2.800-2.500 5-6 5z" />
    </template>
    <template v-else-if="category === 'restaurante'">
      <path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10" />
      <path d="M17 3c-2 1.500-3 4-3 7h3v11" />
    </template>
    <template v-else>
      <path d="M3 10l9-6 9 6" />
      <path d="M5 10v8M9.500 10v8M14.500 10v8M19 10v8" />
      <path d="M3 20h18" />
    </template>
  </svg>
</template>

<script setup lang="ts">
import type { PlaceCategory } from '../../types/places'

withDefaults(defineProps<{ category: PlaceCategory; size?: number }>(), { size: 20 })
</script>