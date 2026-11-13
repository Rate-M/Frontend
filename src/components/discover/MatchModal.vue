<template>
  <div class="overlay" role="dialog" aria-modal="true" aria-labelledby="match-title" @click.self="$emit('close')">
    <div class="modal">
      <div class="avatars" aria-hidden="true">
        <div class="avatar avatar-me">Tú</div>
        <div class="heart">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21s-7.5-4.6-9.4-9.3C1.2 8.2 3.1 5 6.3 5c2 0 3.5 1.1 4.2 2.4h3C14.2 6.1 15.7 5 17.7 5c3.2 0 5.1 3.2 3.7 6.7C19.5 16.4 12 21 12 21z" />
          </svg>
        </div>
        <img class="avatar" :src="profile.photos[0]" :alt="profile.name" />
      </div>

      <div class="copy">
        <h2 id="match-title">¡Es un <em>match!</em></h2>
        <p>Tú y {{ profile.name }} se gustaron mutuamente. Ahora pueden empezar a conocerse.</p>
      </div>

      <div class="actions">
        <button type="button" class="btn-primary" @click="$emit('close')">Seguir descubriendo</button>
        <router-link to="/notificaciones" class="btn-secondary">Ver notificaciones</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiscoverProfile } from '../../types/discover'

defineProps<{ profile: DiscoverProfile }>()
defineEmits<{ (e: 'close'): void }>()
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(20, 18, 20, 0.6);
  animation: fade 0.25s ease;
}

.modal {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 36px 24px 28px;
  border-radius: 28px;
  background: var(--rm-bg);
  text-align: center;
  box-shadow: 0 20px 60px rgba(142, 22, 34, 0.25);
  animation: pop 0.35s cubic-bezier(0.2, 1.2, 0.4, 1);
}

.avatars {
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar {
  width: 104px;
  height: 104px;
  border-radius: 999px;
  object-fit: cover;
  border: 4px solid var(--rm-bg);
  box-shadow: 0 6px 18px rgba(20, 18, 20, 0.15);
}
.avatar-me {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
  font-family: var(--font-heading);
  font-size: 30px;
  font-weight: 600;
}
.heart {
  width: 48px;
  height: 48px;
  margin: 0 -14px;
  z-index: 1;
  border-radius: 999px;
  background: var(--rm-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid var(--rm-bg);
  animation: beat 1.4s ease-in-out infinite;
}

.copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.copy h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 44px;
  line-height: 1.05;
}
.copy h2 em {
  font-style: italic;
  color: var(--rm-accent);
}
.copy p {
  font-size: 15px;
  line-height: 1.5;
  color: var(--rm-text-secondary);
}

.actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.btn-primary,
.btn-secondary {
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

@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pop {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes beat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}
</style>