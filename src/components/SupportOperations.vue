<template>
  <section class="operations">
    <h1>{{ titles[section] }}</h1>
    <form class="controls" @submit.prevent="filter">
      <label v-if="section !== 'activity'">Buscar
        <input v-model.trim="search" maxlength="100" />
      </label>
      <label>{{ section === 'activity' ? 'Categoría' : 'Estado' }}
        <select v-model="draftStatus">
          <option value="">Todos</option>
          <option v-for="(label, value) in filters[section]" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <button>Aplicar filtros</button>
      <button v-if="section === 'activity'" type="button" :disabled="working" @click="exportCsv">Exportar CSV</button>
    </form>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-if="loading" role="status">Cargando…</p>
    <p v-else-if="!rows.length && !error">No hay registros para estos filtros.</p>
    <ul v-if="!loading && rows.length">
      <li v-for="(row, index) in rows" :key="index">
        <div>
          <strong>{{ row.name || row.email || row.action || row.user }}</strong>
          <p v-if="row.status">{{ labels[row.status] ?? row.status }}</p>
          <p v-if="row.address">{{ row.address }} · {{ row.category }} {{ row.hours }}</p>
          <p v-if="section === 'users'">{{ labels[row.verificationStatus ?? 'pending'] }} · {{ row.reportCount ?? 0 }} reportes · {{ row.role }}</p>
          <p v-if="section === 'verifications'">{{ row.provider }} · {{ row.providerStatus || 'Sin resultado del proveedor' }}</p>
          <p v-if="row.supportReview">Revisión registrada · {{ row.supportReview.note }}</p>
          <p v-if="section === 'activity'">{{ row.category }} · {{ row.actor }} · {{ row.note }}</p>
          <time v-if="row.at || row.createdAt">{{ formatDate(row.at || row.createdAt) }}</time>
        </div>
        <button v-if="canEdit(row)" type="button" @click="edit(row)">Abrir acciones</button>
      </li>
    </ul>
    <div v-if="page > 1 || nextPage" class="controls">
      <button :disabled="page === 1 || loading" @click="page--">Anterior</button>
      <span>Página {{ page }}</span>
      <button :disabled="!nextPage || loading" @click="page++">Siguiente</button>
    </div>

    <form v-if="selected" class="decision" @submit.prevent="save">
      <h2>{{ selected.name || selected.email || 'Revisión de verificación' }}</h2>
      <label>Acción
        <select v-model="action">
          <option v-for="(label, value) in actions" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label v-if="action === 'suspend'">Días <input v-model.number="days" type="number" min="1" max="30" required /></label>
      <label v-if="!roleAction">Motivo <textarea v-model.trim="note" maxlength="300" :required="action !== 'approved'" /></label>
      <p v-if="decisionError" role="alert">{{ decisionError }}</p>
      <div class="controls">
        <button :disabled="working || !action">Guardar decisión</button>
        <button type="button" :disabled="working" @click="selected = null">Cancelar</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

type Section = 'places' | 'users' | 'verifications' | 'activity'
interface Row {
  _id: string
  name?: string
  email?: string
  action?: string
  user?: string
  role?: string
  status?: string
  category?: string
  provider?: string
  providerStatus?: string
  verificationStatus?: string
  reportCount?: number
  supportReview?: { note: string }
  address?: string
  hours?: string
  actor?: string
  note?: string
  createdAt?: string
  at?: string
}
const props = defineProps<{ section: Section }>()
const auth = useAuthStore()
const api = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')
const titles = { places: 'Lugares propuestos', users: 'Usuarios', verifications: 'Verificaciones', activity: 'Registro de actividad' }
const labels: Record<string, string> = { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', expired: 'Vencido', active: 'Activa', watch: 'En observación', suspended: 'Suspendida' }
const filters = {
  places: { pending: labels.pending, approved: labels.approved, rejected: labels.rejected },
  users: { active: labels.active, watch: labels.watch, suspended: labels.suspended },
  verifications: { pending: labels.pending, approved: labels.approved, rejected: labels.rejected, expired: labels.expired },
  activity: { reports: 'Reportes', places: 'Lugares', users: 'Usuarios', verifications: 'Verificaciones' },
}
const rows = ref<Row[]>([])
const selected = ref<Row | null>(null)
const search = ref('')
const draftStatus = ref('')
const applied = ref({ q: '', status: '' })
const page = ref(1)
const nextPage = ref<number | null>(null)
const reload = ref(0)
const loading = ref(false)
const working = ref(false)
const error = ref('')
const decisionError = ref('')
const action = ref('')
const note = ref('')
const days = ref(7)
const admin = computed(() => auth.user?.role === 'admin')
const roleAction = computed(() => ['grant', 'revoke'].includes(action.value))
const actions = computed((): Record<string, string> => {
  if (props.section === 'places') return { approved: 'Aprobar y publicar', rejected: 'Rechazar' }
  if (props.section === 'verifications') return { review: 'Registrar revisión' }
  if (selected.value?.role === 'moderator') return { revoke: 'Retirar rol de Soporte' }
  return { warn: 'Registrar advertencia', watch: 'Poner en observación', suspend: 'Suspender temporalmente',
    restore: 'Restaurar cuenta', ...(admin.value ? { ban: 'Bloquear permanentemente', grant: 'Asignar rol de Soporte' } : {}) }
})

function canEdit(row: Row) {
  if (props.section === 'places') return row.status === 'pending'
  if (props.section === 'verifications') return !row.supportReview
  return props.section === 'users' && (row.role === 'user' || (admin.value && row.role === 'moderator'))
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString('es-MX') : ''
}

async function request(path: string, options: RequestInit = {}) {
  if (!auth.token) throw new Error('Inicia sesión para usar Soporte.')
  const response = await fetch(api + '/moderation/' + path, {
    ...options, headers: { Authorization: 'Bearer ' + auth.token, ...options.headers },
  })
  if (!response.ok) {
    const result = await response.json().catch(() => null)
    throw new Error(result?.message ?? 'No pudimos completar la operación.')
  }
  return response
}

function params(number: number) {
  const query = new URLSearchParams({ page: String(number) })
  if (applied.value.status) query.set(props.section === 'activity' ? 'category' : 'status', applied.value.status)
  if (applied.value.q && props.section !== 'activity') query.set('q', applied.value.q)
  return query
}

function filter() {
  applied.value = { q: search.value, status: draftStatus.value }
  page.value = 1
}

watch([page, applied, reload, () => auth.token], async (_, __, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  error.value = ''
  loading.value = true
  try {
    const response = await request(props.section + '?' + params(page.value), { signal: controller.signal })
    const data = await response.json()
    if (!controller.signal.aborted) {
      rows.value = data.items
      nextPage.value = data.nextPage
    }
  } catch (cause) {
    if (!controller.signal.aborted) {
      rows.value = []
      nextPage.value = null
      error.value = cause instanceof Error ? cause.message : 'No pudimos cargar los registros.'
    }
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}, { immediate: true })

function edit(row: Row) {
  selected.value = row
  action.value = Object.keys(actions.value)[0] ?? ''
  note.value = ''
  days.value = 7
  decisionError.value = ''
}

async function save() {
  if (!selected.value || working.value || !action.value) return
  working.value = true
  decisionError.value = ''
  try {
    let path = props.section + '/' + encodeURIComponent(selected.value._id)
    let body: object
    if (roleAction.value) {
      path += '/role'
      body = { role: action.value === 'grant' ? 'moderator' : 'user' }
    } else if (props.section === 'places') {
      body = { status: action.value, reason: note.value }
    } else if (props.section === 'verifications') {
      path += '/review'
      body = { note: note.value }
    } else {
      path += '/status'
      body = { action: action.value, reason: note.value, ...(action.value === 'suspend' ? { days: days.value } : {}) }
    }
    await request(path, { method: 'PATCH', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
    selected.value = null
    reload.value++
  } catch (cause) {
    decisionError.value = cause instanceof Error ? cause.message : 'No pudimos guardar la decisión.'
  } finally {
    working.value = false
  }
}

async function exportCsv() {
  working.value = true
  error.value = ''
  try {
    const filtersAtStart = params(1)
    const parts: string[] = []
    let number = 1
    for (;;) {
      const query = new URLSearchParams(filtersAtStart)
      query.set('page', String(number))
      query.set('format', 'csv')
      const response = await request('activity?' + query)
      const csv = await response.text()
      parts.push(number === 1 ? csv : csv.slice(csv.indexOf('\n') + 1))
      const next = Number(response.headers.get('X-Next-Page'))
      if (next <= number || !Number.isSafeInteger(next)) break
      number = next
    }
    const url = URL.createObjectURL(new Blob(parts, { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'actividad-soporte.csv'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'No pudimos exportar la actividad.'
  } finally {
    working.value = false
  }
}
</script>

<style scoped>
.operations { display: grid; gap: 18px; min-width: 0; }
h1, h2 { font-family: var(--font-heading); }
h1 { font-size: 44px; }
.controls { display: flex; align-items: end; flex-wrap: wrap; gap: 10px; }
label { display: grid; gap: 4px; }
input, select, textarea, button { color: inherit; font: inherit; border: 1px solid var(--rm-border); border-radius: 10px; padding: 8px 12px; background: white; }
button { cursor: pointer; }
button:disabled { opacity: .5; }
ul { list-style: none; display: grid; gap: 8px; }
li, .decision { padding: 14px; border: 1px solid var(--rm-border); border-radius: 14px; overflow-wrap: anywhere; }
li { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
li p, time { color: var(--rm-text-muted); }
.decision { display: grid; gap: 12px; }
[role='alert'] { color: var(--rm-accent-dark); }
</style>
