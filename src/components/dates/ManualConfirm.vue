<template>
  <section v-if="invitation" class="manual" aria-live="polite">
    <template v-if="invitation.attendance === 'gps_failed'">
      <h3>Confirma manualmente</h3>
      <p class="text">
        Si los dos sí fueron a la cita, pueden confirmarlo sin GPS. Las dos personas deben confirmar.
      </p>

      <label class="check">
        <input v-model="agree" type="checkbox" />
        <span>Confirmo que asistí a la cita en el lugar y la hora acordados.</span>
      </label>

      <button type="button" class="btn-primary" :disabled="!agree" @click="confirm">Confirmar asistencia</button>
    </template>

    <template v-else-if="invitation.attendance === 'manual_pending'">
      <h3>Esperando la confirmación de {{ name }}</h3>

      <ul class="steps">
        <li class="step ok">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>Tú ya confirmaste</span>
        </li>
        <li class="step wait">
          <span class="spinner" aria-hidden="true" />
          <span>{{ name }} aún no confirma</span>
        </li>
      </ul>

      <p class="text">{{ name }} tiene 24 horas para confirmar. Te avisaremos cuando lo haga.</p>
    </template>

    <template v-else-if="invitation.attendance === 'manual_confirmed'">
      <h3 class="done">¡Asistencia confirmada!</h3>
      <p class="text">Ambos confirmaron manualmente que la cita se realizó.</p>
      <!-- RM-58: aquí va el botón de calificar -->
      <router-link to="/citas" class="btn-secondary">Volver a mis citas</router-link>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useDatesStore } from '../../stores/dates'

const props = defineProps<{ invitationId: string }>()

const dates = useDatesStore()
const chat = useChatStore()

const agree = ref(false)
const invitation = computed(() => dates.getById(props.invitationId))
const name = computed(() => {
  const inv = invitation.value
  return (inv && chat.getById(inv.conversationId)?.name) || 'tu match'
})

const confirm = () => {
  if (!agree.value) return
  dates.confirmManually(props.invitationId)
}
</script>

<style scoped>
.manual {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.manual h3 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 26px;
  line-height: 1.1;
}
.manual h3.done {
  color: var(--rm-success);
}
.text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--rm-text-body);
}

.check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  font-size: 13px;
  line-height: 1.45;
  cursor: pointer;
}
.check input {
  width: 18px;
  height: 18px;
  margin-top: 1px;
  accent-color: var(--rm-accent);
  flex-shrink: 0;
}

.steps {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid var(--rm-border);
  background: var(--rm-bg);
  font-size: 14px;
}
.step.ok {
  border-color: var(--rm-success);
  background: var(--rm-success-bg);
  color: var(--rm-success);
  font-weight: 600;
}
.spinner {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid var(--rm-border);
  border-top-color: var(--rm-accent);
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
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
  transition: background 0.2s, opacity 0.2s;
}
.btn-primary {
  background: var(--rm-text);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: #000;
}
.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-secondary {
  background: var(--rm-btn-secondary);
  color: var(--rm-text);
}
.btn-secondary:hover {
  background: #f3bdb8;
  color: var(--rm-text);
}
</style>