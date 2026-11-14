<template>
  <div class="overlay" role="alertdialog" aria-modal="true" aria-labelledby="unmatch-title" @click.self="$emit('cancel')">
    <div class="modal">
      <div class="icon" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20s-7-4.400-8.800-8.800C2 8 3.800 5 6.800 5c1.900 0 3.200 1 4 2.300" />
          <path d="M14.800 5.400C15.500 5.100 16.200 5 16.800 5c3 0 4.800 3 3.600 6.200-.5 1.200-1.400 2.400-2.500 3.500" />
          <path d="M4 4l16 16" />
        </svg>
      </div>

      <div class="copy">
        <h2 id="unmatch-title">¿Deshacer match con <em>{{ name }}</em>?</h2>
        <p>Se eliminará la conversación y ya no podrán escribirse. Esta acción no se puede deshacer.</p>
      </div>

      <div class="actions">
        <button type="button" class="btn-danger" @click="$emit('confirm')">Sí, deshacer match</button>
        <button type="button" class="btn-secondary" @click="$emit('cancel')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

defineProps<{ name: string }>()
const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('cancel')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
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
  gap: 22px;
  padding: 32px 24px 24px;
  border-radius: 28px;
  background: var(--rm-bg);
  text-align: center;
  box-shadow: 0 20px 60px rgba(142, 22, 34, 0.25);
  animation: pop 0.3s cubic-bezier(0.2, 1.2, 0.4, 1);
}

.icon {
  width: 68px;
  height: 68px;
  border-radius: 999px;
  border: 1px solid var(--rm-accent);
  color: var(--rm-accent);
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 32px;
  line-height: 1.1;
}
.copy h2 em {
  font-style: italic;
  color: var(--rm-accent);
}
.copy p {
  font-size: 14px;
  line-height: 1.5;
  color: var(--rm-text-secondary);
}

.actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.btn-danger,
.btn-secondary {
  height: 54px;
  border: 0;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-danger {
  background: var(--rm-accent);
  color: #fff;
}
.btn-danger:hover {
  background: var(--rm-accent-dark);
}
.btn-secondary {
  background: var(--rm-btn-secondary);
  color: var(--rm-text);
}
.btn-secondary:hover {
  background: #f3bdb8;
}

@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pop {
  from { opacity: 0; transform: scale(0.92) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>