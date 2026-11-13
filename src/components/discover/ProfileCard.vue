<template>
  <article class="pcard">
    <div class="photo">
      <img :src="profile.photos[photoIndex]" :alt="`Foto ${photoIndex + 1} de ${profile.name}`" />

      <div v-if="profile.photos.length > 1" class="bars" aria-hidden="true">
        <span v-for="(_, i) in profile.photos" :key="i" :class="{ active: i === photoIndex }" />
      </div>

      <button type="button" class="tap tap-prev" aria-label="Foto anterior" @click="prev" />
      <button type="button" class="tap tap-next" aria-label="Foto siguiente" @click="next" />

      <div v-if="stamp" class="stamp" :class="`stamp-${stamp}`">
        {{ stamp === 'like' ? 'Me gusta' : 'Pasar' }}
      </div>

      <div class="photo-overlay">
        <h2>{{ profile.name }}, <span>{{ profile.age }}</span></h2>
        <span v-if="profile.verified" class="verified-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
            <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
          </svg>
          Verificado
        </span>
      </div>
    </div>

    <div class="info">
      <ul class="meta">
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="7" width="18" height="12" rx="2.5" />
            <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7" />
          </svg>
          {{ profile.occupation }}
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
            <circle cx="12" cy="10" r="2.4" />
          </svg>
          A {{ profile.distanceKm }} km de ti
        </li>
      </ul>

      <p class="bio">{{ profile.bio }}</p>

      <ul class="chips" aria-label="Intereses">
        <li v-for="interest in profile.interests" :key="interest">{{ interest }}</li>
      </ul>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DiscoverProfile } from '../../types/discover'

const props = defineProps<{
  profile: DiscoverProfile
  stamp?: 'like' | 'pass' | null
}>()

const photoIndex = ref(0)

const next = () => {
  if (photoIndex.value < props.profile.photos.length - 1) photoIndex.value++
}
const prev = () => {
  if (photoIndex.value > 0) photoIndex.value--
}
</script>

<style scoped>
.pcard {
  background: var(--rm-bg);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

.photo {
  position: relative;
  aspect-ratio: 4 / 5;
  max-height: 540px;
  width: 100%;
  background: var(--rm-border);
}
.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bars {
  position: absolute;
  top: 12px;
  left: 14px;
  right: 14px;
  display: flex;
  gap: 6px;
  z-index: 3;
}
.bars span {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.45);
}
.bars span.active {
  background: #fff;
}

.tap {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  border: 0;
  background: transparent;
  cursor: pointer;
  z-index: 2;
}
.tap-prev {
  left: 0;
}
.tap-next {
  right: 0;
}

.photo-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 56px 22px 20px;
  background: linear-gradient(to top, rgba(20, 18, 20, 0.78), rgba(20, 18, 20, 0));
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  z-index: 1;
  pointer-events: none;
}
.photo-overlay h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 38px;
  line-height: 1;
}
.photo-overlay h2 span {
  font-weight: 500;
  opacity: 0.9;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--rm-accent-dark);
  font-size: 12px;
  font-weight: 600;
}

.stamp {
  position: absolute;
  top: 36px;
  z-index: 4;
  padding: 6px 16px;
  border: 3px solid;
  border-radius: 12px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.85);
  pointer-events: none;
}
.stamp-like {
  left: 22px;
  color: var(--rm-success);
  border-color: var(--rm-success);
  transform: rotate(-10deg);
}
.stamp-pass {
  right: 22px;
  color: var(--rm-accent);
  border-color: var(--rm-accent);
  transform: rotate(10deg);
}

.info {
  padding: 22px 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meta {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meta li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--rm-text-secondary);
}
.meta svg {
  color: var(--rm-accent-dark);
  flex-shrink: 0;
}

.bio {
  font-size: 15px;
  line-height: 1.6;
  color: var(--rm-text-body);
}

.chips {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chips li {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  font-size: 13px;
  color: var(--rm-text-body);
}
</style>