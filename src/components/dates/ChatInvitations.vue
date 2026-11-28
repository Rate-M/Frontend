<template>
  <section v-if="invitations.length || error || loadError" class="invites" aria-label="Invitaciones a cita">
    <p v-if="error || loadError" role="alert">{{ error || loadError }}</p>
    <article v-for="invitation in invitations" :key="invitation.id" class="invitation">
      <strong>{{ labels[invitation.status] }}</strong>
      <time :datetime="invitation.startsAt">{{ formatDateTime(Date.parse(invitation.startsAt)) }}</time>
      <a :href="mapLink(invitation.placeId)" target="_blank" rel="noopener">Ver lugar en el mapa</a>
      <p v-if="invitation.note">{{ invitation.note }}</p>
      <template v-if="invitation.awaitingYourResponse">
        <div class="actions">
          <button type="button" :disabled="saving" @click="respond(invitation, 'accept')">Aceptar</button>
          <button type="button" :disabled="saving" @click="respond(invitation, 'decline')">Rechazar</button>
          <button type="button" :disabled="saving" @click="openProposal(invitation)">Proponer otra hora</button>
        </div>
        <form v-if="proposalId === invitation.id" class="actions" @submit.prevent="respond(invitation, 'propose')">
          <label>Nueva fecha y hora <input v-model="proposalDate" type="datetime-local" required /></label>
          <button type="submit" :disabled="saving">Enviar propuesta</button>
          <button type="button" :disabled="saving" @click="proposalId = null">Cancelar</button>
        </form>
      </template>
      <p v-else-if="invitation.status === 'pending'">Esperando respuesta de la otra persona.</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { formatDateTime } from '../../utils/dateFormat'
import { InvitationError, listInvitations, respondToInvitation } from '../../services/dateInvitations'
import type { ChatInvitation, InvitationResponse } from '../../services/dateInvitations'

const props = defineProps<{ matchId: string }>()
const auth = useAuthStore()
const invitations = ref<ChatInvitation[]>([])
const error = ref('')
const loadError = ref('')
const saving = ref(false)
const proposalId = ref<string | null>(null)
const proposalDate = ref('')
const labels = { pending: 'Invitación a cita', accepted: 'Cita aceptada', declined: 'Cita rechazada' }
let controller: AbortController | undefined
let loading = false
let writes = 0

function mapLink(placeId: string) {
  return 'https://www.google.com/maps/search/?api=1&query=Lugar&query_place_id=' + encodeURIComponent(placeId)
}

async function refresh() {
  const token = auth.token
  const signal = controller?.signal
  if (!token || !signal || loading || saving.value) return
  loading = true
  const writeCount = writes
  try {
    const result = await listInvitations(props.matchId, token, signal)
    if (!signal.aborted && writes === writeCount) {
      invitations.value = result.invitations
      loadError.value = ''
    }
  } catch {
    if (!signal.aborted && writes === writeCount) loadError.value = 'No pudimos cargar las invitaciones.'
  } finally {
    if (!signal.aborted) loading = false
  }
}

function openProposal(invitation: ChatInvitation) {
  proposalId.value = invitation.id
  proposalDate.value = ''
}

async function respond(invitation: ChatInvitation, action: InvitationResponse['action']) {
  const token = auth.token
  const signal = controller?.signal
  if (!token || !signal || saving.value) return
  let body: InvitationResponse
  if (action === 'propose') {
    const date = new Date(proposalDate.value)
    if (!(date.getTime() > Date.now())) {
      error.value = 'Elige una fecha y hora futura.'
      return
    }
    body = { action, revision: invitation.revision, startsAt: date.toISOString() }
  } else {
    body = { action, revision: invitation.revision }
  }

  error.value = ''
  writes++
  saving.value = true
  let changed = false
  try {
    const updated = await respondToInvitation(props.matchId, token, signal, invitation.id, body)
    if (signal.aborted) return
    invitations.value = invitations.value.map((entry) => entry.id === updated.id ? updated : entry)
    proposalId.value = null
  } catch (cause) {
    if (signal.aborted) return
    error.value = cause instanceof InvitationError ? cause.message : 'No pudimos enviar tu respuesta.'
    changed = cause instanceof InvitationError && cause.status === 409
  } finally {
    if (!signal.aborted) saving.value = false
  }
  if (changed) await refresh()
}

watch([() => props.matchId, () => auth.token], ([, token], _, onCleanup) => {
  invitations.value = []
  error.value = ''
  loadError.value = ''
  saving.value = false
  loading = false
  proposalId.value = null
  if (!token) return
  const connection = new AbortController()
  controller = connection
  void refresh()
  const timer = setInterval(() => {
    if (!document.hidden) void refresh()
  }, 15000)
  onCleanup(() => {
    connection.abort()
    controller = undefined
    clearInterval(timer)
  })
}, { immediate: true })
</script>

<style scoped>
.invites {
  margin: 12px 16px 0;
  max-height: 30dvh;
  overflow-y: auto;
  display: grid;
  gap: 8px;
}
.invitation {
  display: grid;
  gap: 6px;
  padding: 10px;
  border: 1px solid var(--rm-border);
  border-radius: 12px;
  overflow-wrap: anywhere;
}
.invitation p {
  margin: 0;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
</style>
