<template>
  <div class="map" role="group" aria-label="Mapa de lugares sugeridos">
    <svg class="bg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="400" height="300" fill="#F7EFEE" />
      <rect x="18" y="28" width="116" height="76" rx="16" fill="#E3F0E6" />
      <rect x="268" y="188" width="116" height="84" rx="16" fill="#E3F0E6" />
      <path d="M-10 238 C 70 200, 150 262, 230 228 S 350 196, 410 212" fill="none" stroke="#DCE7F0" stroke-width="24" stroke-linecap="round" />
      <g fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round">
        <path d="M0 120H400" />
        <path d="M0 190H400" />
        <path d="M150 0V300" />
        <path d="M260 0V300" />
      </g>
      <g fill="none" stroke="#E6D1CE" stroke-width="1" stroke-dasharray="4 6">
        <path d="M0 120H400" />
        <path d="M0 190H400" />
        <path d="M150 0V300" />
        <path d="M260 0V300" />
      </g>
    </svg>

    <span class="me" role="img" aria-label="Tu ubicación"><span class="pulse" /></span>

    <button
      v-for="p in places"
      :key="p.id"
      type="button"
      class="pin"
      :class="{ active: p.id === selectedId }"
      :style="{ left: p.x + '%', top: p.y + '%' }"
      :aria-label="`${p.name}, ${categoryLabels[p.category]}`"
      :aria-pressed="p.id === selectedId"
      @click="$emit('select', p.id)"
    >
      <span class="pin-body"><CategoryIcon :category="p.category" :size="18" /></span>
      <span v-if="p.id === selectedId" class="tag">{{ p.name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import CategoryIcon from './CategoryIcon.vue'
import { categoryLabels } from '../../types/places'
import type { Place } from '../../types/places'

defineProps<{ places: Place[]; selectedId: string | null }>()
defineEmits<{ (e: 'select', id: string): void }>()
</script>

<style scoped>
.map {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--rm-border);
  background: #f7efee;
}
.bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.me {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 14px;
  height: 14px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: var(--rm-text);
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(20, 18, 20, 0.3);
  z-index: 1;
}
.pulse {
  position: absolute;
  inset: -12px;
  border-radius: 999px;
  border: 2px solid var(--rm-text);
  opacity: 0;
  animation: pulse 2s ease-out infinite;
}
@keyframes pulse {
  0% { transform: scale(0.4); opacity: 0.6; }
  100% { transform: scale(1.2); opacity: 0; }
}

.pin {
  position: absolute;
  transform: translate(-50%, -100%);
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  z-index: 2;
}
.pin.active {
  z-index: 4;
}
.pin:focus-visible {
  outline: 2px solid var(--rm-text);
  outline-offset: 4px;
  border-radius: 12px;
}

.pin-body {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: #fff;
  color: var(--rm-accent-dark);
  border: 2px solid var(--rm-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(20, 18, 20, 0.18);
  transition: transform 0.15s, background 0.15s, color 0.15s;
}
.pin-body::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -6px;
  width: 10px;
  height: 10px;
  background: inherit;
  border-right: 2px solid var(--rm-accent);
  border-bottom: 2px solid var(--rm-accent);
  transform: translateX(-50%) rotate(45deg);
}
.pin:hover .pin-body {
  transform: scale(1.08);
}
.pin.active .pin-body {
  background: var(--rm-accent);
  color: #fff;
  transform: scale(1.18);
}

.tag {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--rm-text);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}
</style>