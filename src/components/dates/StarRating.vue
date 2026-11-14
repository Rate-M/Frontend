<template>
  <div
    class="stars"
    :role="readonly ? 'img' : 'radiogroup'"
    :aria-label="readonly ? `${modelValue} de 5 estrellas` : 'Calificación de 1 a 5 estrellas'"
  >
    <template v-if="readonly">
      <svg
        v-for="n in 5"
        :key="n"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        class="star"
        :class="{ on: n <= modelValue }"
        aria-hidden="true"
      >
        <path d="M12 3.5l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8L12 3.5z" />
      </svg>
    </template>

    <template v-else>
      <button
        v-for="n in 5"
        :key="n"
        type="button"
        role="radio"
        class="star-btn"
        :aria-checked="modelValue === n"
        :aria-label="`${n} ${n === 1 ? 'estrella' : 'estrellas'}`"
        @click="$emit('update:modelValue', n)"
        @mouseenter="hover = n"
        @mouseleave="hover = 0"
      >
        <svg :width="size" :height="size" viewBox="0 0 24 24" class="star" :class="{ on: n <= (hover || modelValue) }" aria-hidden="true">
          <path d="M12 3.5l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8L12 3.5z" />
        </svg>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{ modelValue: number; readonly?: boolean; size?: number }>(), {
  readonly: false,
  size: 32
})
defineEmits<{ (e: 'update:modelValue', value: number): void }>()

const hover = ref(0)
</script>

<style scoped>
.stars {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.star-btn {
  padding: 2px;
  border: 0;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  transition: transform 0.12s;
}
.star-btn:hover {
  transform: scale(1.12);
}
.star-btn:focus-visible {
  outline: 2px solid var(--rm-text);
  outline-offset: 2px;
}
.star {
  fill: none;
  stroke: var(--rm-placeholder);
  stroke-width: 1.4;
  stroke-linejoin: round;
  transition: fill 0.15s, stroke 0.15s;
}
.star.on {
  fill: var(--rm-accent);
  stroke: var(--rm-accent);
}
</style>