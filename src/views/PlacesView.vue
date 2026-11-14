<template>
  <div class="places-page">
    <div class="places-shell">
      <header class="head">
        <router-link to="/descubrir" class="back-btn" aria-label="Volver a descubrir">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </router-link>
        <h1>Lugares para citas</h1>
        <span class="head-spacer" />
      </header>

      <p class="lead">Lugares públicos y concurridos, ideales para una primera cita segura.</p>

      <ul class="filters" role="group" aria-label="Filtrar por tipo de lugar">
        <li v-for="f in filters" :key="f.key">
          <button type="button" class="chip" :class="{ active: category === f.key }" @click="category = f.key">
            {{ f.label }}
          </button>
        </li>
      </ul>

      <PlacesMap :places="filtered" :selected-id="selected ? selected.id : null" @select="toggle" />

      <PlaceCard v-if="selected" :place="selected">
        <template #actions>
                      <button type="button" class="btn-primary" @click="inviteSelected">Invitar a una cita aquí</button>
          <a class="btn-secondary" :href="selected ? mapsUrl(selected) : '#'" target="_blank" rel="noopener">Cómo llegar</a>
        </template>
      </PlaceCard>
      <p v-else class="tip">Toca un pin del mapa para ver los detalles del lugar.</p>

      <section class="block">
        <h2 class="section-title">
          Cerca de ti
          <span class="count">{{ sorted.length }}</span>
        </h2>

        <ul class="list">
          <li v-for="p in sorted" :key="p.id">
            <button type="button" class="row" :class="{ active: selected && selected.id === p.id }" @click="toggle(p.id)">
              <span class="row-icon"><CategoryIcon :category="p.category" :size="20" /></span>
              <span class="row-text">
                <strong>{{ p.name }}</strong>
                <small>{{ categoryLabels[p.category] }} · a {{ p.distanceKm }} km</small>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PlacesMap from '../components/places/PlacesMap.vue'
import PlaceCard from '../components/places/PlaceCard.vue'
import CategoryIcon from '../components/places/CategoryIcon.vue'
import { places, categoryLabels } from '../types/places'
import type { Place, PlaceCategory } from '../types/places'

const category = ref<PlaceCategory | 'all'>('all')
const selectedId = ref<string | null>(null)
    const router = useRouter()

const inviteSelected = () => {
  if (selected.value) router.push({ path: '/cita/nueva', query: { lugar: selected.value.id } })
}

const filters: { key: PlaceCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  ...(Object.keys(categoryLabels) as PlaceCategory[]).map((key) => ({ key, label: categoryLabels[key] }))
]

const filtered = computed(() =>
  category.value === 'all' ? places : places.filter((p) => p.category === category.value)
)
const sorted = computed(() => [...filtered.value].sort((a, b) => a.distanceKm - b.distanceKm))
const selected = computed(() => filtered.value.find((p) => p.id === selectedId.value) ?? null)

const toggle = (id: string) => {
  selectedId.value = selectedId.value === id ? null : id
}

const mapsUrl = (p: Place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.address}`)}`
</script>

<style scoped>
.places-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}
.places-shell {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: var(--rm-bg);
  border-radius: 28px;
  padding: 28px 24px 32px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.head h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 32px;
  line-height: 1.1;
  text-align: center;
}
.back-btn,
.head-spacer {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}
.back-btn {
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: border-color 0.2s;
}
.back-btn:hover {
  border-color: var(--rm-text);
  color: var(--rm-text);
}

.lead {
  text-align: center;
  font-size: 14px;
  color: var(--rm-text-secondary);
}

.filters {
  list-style: none;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.chip {
  white-space: nowrap;
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--rm-text-body);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.chip:hover {
  border-color: var(--rm-text);
}
.chip.active {
  background: var(--rm-text);
  border-color: var(--rm-text);
  color: #fff;
}

.tip {
  text-align: center;
  font-size: 13px;
  color: var(--rm-text-muted);
}

.block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rm-text-muted);
}
.count {
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  font-size: 11px;
  letter-spacing: 0;
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  font-family: var(--font-body);
  color: var(--rm-text);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.row:hover {
  border-color: var(--rm-text);
}
.row.active {
  background: #fdf3f2;
  border-color: var(--rm-accent);
}
.row-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.row-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.row-text strong {
  font-size: 14px;
}
.row-text small {
  font-size: 12px;
  color: var(--rm-text-secondary);
}
.row svg {
  color: var(--rm-text-muted);
}

.btn-primary,
.btn-secondary {
  height: 50px;
  border: 0;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-primary {
  background: var(--rm-accent);
  color: #fff;
}
.btn-primary:hover {
  background: var(--rm-accent-dark);
  color: #fff;
}
.btn-secondary {
  background: var(--rm-btn-secondary);
  color: var(--rm-text);
}
.btn-secondary:hover {
  background: #f3bdb8;
  color: var(--rm-text);
}

@media (max-width: 380px) {
  .places-shell {
    padding: 24px 16px 28px;
  }
}
</style>