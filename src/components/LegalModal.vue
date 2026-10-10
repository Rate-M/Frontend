<template>
  <Teleport to="body">
    <div v-if="type" class="modal-overlay" @click="emit('close')">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        @click.stop
      >
        <div class="modal-header">
          <h2 id="legal-modal-title">{{ title }}</h2>
          <button
            ref="closeBtn"
            type="button"
            class="close-btn"
            aria-label="Cerrar"
            @click="emit('close')"
          >
            &times;
          </button>
        </div>
        <div class="modal-content">
          <LegalDocuments :type="type" hide-title />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-secondary" @click="emit('close')">Cerrar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import LegalDocuments from './LegalDocuments.vue'

const props = defineProps<{
  type: 'privacy' | 'terms' | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const closeBtn = ref<HTMLButtonElement | null>(null)

const title = computed(() => (props.type === 'privacy' ? 'Aviso de privacidad' : 'Términos de uso'))

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.type,
  async (value) => {
    if (value) {
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      closeBtn.value?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
    }
  }
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 18, 20, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: var(--rm-bg);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--rm-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 22px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  color: var(--rm-text-muted);
}
.close-btn:hover {
  color: var(--rm-text);
}

.modal-content {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--rm-border);
  text-align: right;
}

.btn-modal-secondary {
  padding: 10px 22px;
  background: var(--rm-btn-secondary);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  color: var(--rm-text);
}
.btn-modal-secondary:hover {
  background: #f3bdb8;
}
</style>