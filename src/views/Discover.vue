<template>
  <div class="discover-page">
    <div class="discover-shell">
      <header class="topbar">
        <img :src="logoUrl" alt="RateM Dating" class="logo-img" />
        <div class="top-actions">
          <NotificationBell />
          
          <router-link to="/lugares" class="icon-btn" aria-label="Lugares para citas">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
          </router-link>
                    <router-link to="/chats" class="icon-btn" aria-label="Mensajes">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-7l-4.500 3.500V17H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
          </router-link>
          <router-link to="/perfil/editar" class="icon-btn" aria-label="Mi perfil">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="8.5" r="3.5" />
              <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
            </svg>
          </router-link>
        </div>
      </header>

      <p v-if="error" role="alert">{{ error }}</p>
      <p v-if="loading" role="status">Buscando perfiles…</p>

      <template v-else-if="current">
        <p class="counter">Perfil {{ currentIndex + 1 }} de {{ profiles.length }}</p>

        <div class="stage" :class="{ 'leave-like': leaving === 'like', 'leave-pass': leaving === 'pass' }">
          <ProfileCard :key="current.id" :profile="current" :stamp="leaving" />
        </div>

        <div class="actions">
          <div class="action">
            <button type="button" class="round-btn pass-btn" :disabled="!!leaving || saving" aria-label="Pasar" @click="act('pass')">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <span>Pasar</span>
          </div>

          <div class="action">
            <button type="button" class="round-btn like-btn" :disabled="!!leaving || saving" aria-label="Me gusta" @click="act('like')">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 21s-7.5-4.6-9.4-9.3C1.2 8.2 3.1 5 6.3 5c2 0 3.5 1.1 4.2 2.4h3C14.2 6.1 15.7 5 17.7 5c3.2 0 5.1 3.2 3.7 6.7C19.5 16.4 12 21 12 21z" />
              </svg>
            </button>
            <span>Me gusta</span>
          </div>
        </div>

        <p class="hint">Tip: usa las flechas ← y → del teclado</p>
      </template>

      <section v-else class="empty">
        <div class="empty-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3.5l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8L12 3.5z" />
          </svg>
        </div>
        <h1>{{ error ? 'No se pudieron cargar los perfiles' : 'Por hoy es todo' }}</h1>
        <p v-if="!error">Ya viste todos los perfiles cerca de ti. Vuelve más tarde para conocer a más personas.</p>
        <button type="button" class="btn-primary" @click="restart">{{ useMocks ? 'Volver a empezar' : 'Actualizar perfiles' }}</button>
        <router-link to="/perfil/editar" class="btn-secondary">Ajustar mis preferencias</router-link>
      </section>
    </div>

    <MatchModal v-if="matched" :profile="matched" @close="matched = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import logoUrl from '../assets/logo.png'
import ProfileCard from '../components/discover/ProfileCard.vue'
import MatchModal from '../components/discover/MatchModal.vue'
import NotificationBell from '../components/notifications/NotificationBell.vue'
import { useAuthStore } from '../stores/auth'
import { DiscoveryError, loadDiscovery, saveSwipe } from '../services/discovery'
import { useNotificationsStore } from '../stores/notifications'
import { mockProfiles } from '../types/discover'
import type { DiscoverProfile } from '../types/discover'

const notifications = useNotificationsStore()
const auth = useAuthStore()
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'
const controller = new AbortController()
const loading = ref(!useMocks)
const saving = ref(false)
const error = ref('')
let animation: ReturnType<typeof setTimeout> | undefined

const profiles = ref<DiscoverProfile[]>(useMocks ? [...mockProfiles] : [])
const currentIndex = ref(0)
const leaving = ref<'like' | 'pass' | null>(null)
const matched = ref<DiscoverProfile | null>(null)

const current = computed(() => profiles.value[currentIndex.value] ?? null)

const showError = (cause: unknown) => {
  if (controller.signal.aborted) return
  error.value = cause instanceof DiscoveryError
    ? cause.message
    : 'No pudimos conectar con el servidor. Intenta de nuevo.'
}

const refresh = async () => {
  if (!auth.token) {
    error.value = 'Inicia sesión para descubrir perfiles.'
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  try {
    profiles.value = await loadDiscovery(auth.token, controller.signal)
    currentIndex.value = 0
  } catch (cause) {
    showError(cause)
  } finally {
    loading.value = false
  }
}

const act = async (type: 'like' | 'pass') => {
  const profile = current.value
  if (!profile || loading.value || saving.value || leaving.value || matched.value) return
  if (!useMocks && !auth.token) return

  saving.value = true
  error.value = ''
  let didMatch = type === 'like' && profile.likesYou
  try {
    if (!useMocks && auth.token) {
      const result = await saveSwipe(auth.token, profile.id, type, controller.signal)
      didMatch = !!result.match
    }
  } catch (cause) {
    if (cause instanceof DiscoveryError && cause.status === 409) await refresh()
    else showError(cause)
    return
  } finally {
    saving.value = false
  }
  if (controller.signal.aborted) return

  leaving.value = type
  animation = setTimeout(() => {
    if (didMatch) {
      matched.value = profile
      notifications.addMatch(profile)
    }
    currentIndex.value++
    leaving.value = null
  }, 320)
}

const restart = () => {
  if (useMocks) currentIndex.value = 0
  else void refresh()
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && matched.value) {
    matched.value = null
    return
  }
  if (matched.value) return
  if (e.key === 'ArrowRight') act('like')
  if (e.key === 'ArrowLeft') act('pass')
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  if (!useMocks) void refresh()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  controller.abort()
  clearTimeout(animation)
})
</script>

<style scoped>
.discover-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 16px 16px 32px;
}

.discover-shell {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo-img {
  width: 120px;
  height: auto;
}
.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: border-color 0.2s;
}
.icon-btn:hover {
  border-color: var(--rm-text);
  color: var(--rm-text);
}

.counter {
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rm-text-muted);
}

.stage {
  transition: transform 0.32s ease, opacity 0.32s ease;
}
.stage.leave-like {
  transform: translateX(120%) rotate(10deg);
  opacity: 0;
}
.stage.leave-pass {
  transform: translateX(-120%) rotate(-10deg);
  opacity: 0;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 4px;
}
.action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--rm-text-secondary);
}
.round-btn {
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s, background 0.2s, opacity 0.2s;
}
.round-btn:hover:not(:disabled) {
  transform: scale(1.06);
}
.round-btn:active:not(:disabled) {
  transform: scale(0.96);
}
.round-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.pass-btn {
  width: 68px;
  height: 68px;
  background: var(--rm-bg);
  border: 1.5px solid var(--rm-border);
  color: var(--rm-text-body);
  box-shadow: 0 6px 18px rgba(20, 18, 20, 0.08);
}
.pass-btn:hover:not(:disabled) {
  border-color: var(--rm-text);
}
.like-btn {
  width: 76px;
  height: 76px;
  background: var(--rm-accent);
  border: 0;
  color: #fff;
  box-shadow: 0 8px 22px rgba(179, 32, 46, 0.35);
}
.like-btn:hover:not(:disabled) {
  background: var(--rm-accent-dark);
}

.hint {
  display: none;
  text-align: center;
  font-size: 12px;
  color: var(--rm-placeholder);
}

.empty {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 40px 24px 28px;
  border-radius: 28px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}
.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  border: 1px solid var(--rm-accent);
  color: var(--rm-text);
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 36px;
  line-height: 1.05;
}
.empty p {
  font-size: 15px;
  line-height: 1.5;
  color: var(--rm-text-secondary);
}
.btn-primary,
.btn-secondary {
  width: 100%;
  height: 54px;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: 0;
  transition: background 0.2s;
}
.btn-primary {
  background: var(--rm-text);
  color: #fff;
}
.btn-primary:hover {
  background: #000;
}
.btn-secondary {
  background: var(--rm-btn-secondary);
  color: var(--rm-text);
}
.btn-secondary:hover {
  background: #f3bdb8;
  color: var(--rm-text);
}

@media (min-width: 900px) {
  .hint {
    display: block;
  }
}
</style>