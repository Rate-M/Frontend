<template>
  <div class="support">
    <aside class="sidebar">
      <img :src="logo" alt="RateM Dating" class="brand" />
      <span class="support-label">Soporte</span>
      <nav aria-label="Soporte">
        <button v-for="item in navigation" :key="item.label" type="button"
          :class="{ selected: item.type === selectedType && !item.unavailable }"
          :disabled="item.unavailable" @click="selectType(item.type)">
          <img :src="item.icon" alt="" /><span>{{ item.label }}</span>
          <span v-if="item.label === 'Reportes' && result">{{ result.counts.pending }}</span>
          <span v-if="item.type && result">{{ result.typeCounts[item.type] }}</span>
        </button>
      </nav>
      <button type="button" class="sign-out" @click="signOut">Cerrar sesión</button>
    </aside>

    <main class="workspace">
      <header class="header">
        <div>
          <h1>Reportes</h1>
          <p>Soporte solo ve el contenido que la comunidad reportó.</p>
        </div>
        <form class="search" @submit.prevent="search">
          <img :src="searchIcon" alt="" />
          <input v-model="input" aria-label="Buscar reportes" type="search" maxlength="100" placeholder="Buscar por ID, usuario o motivo" />
        </form>
      </header>

      <dl class="metrics">
        <div v-for="metric in metrics" :key="metric.label">
          <dt>{{ metric.label }}</dt><dd>{{ metric.value }}</dd>
        </div>
      </dl>

      <div class="filters">
        <div class="chips" aria-label="Tipo de reporte">
          <button type="button" :aria-pressed="!selectedType" @click="selectType('')">Todos{{ totalLabel }}</button>
          <button v-for="(label, value) in reportTypes" :key="value" type="button"
            :aria-pressed="selectedType === value" @click="selectType(value)">
            {{ label }}<template v-if="result"> · {{ result.typeCounts[value] }}</template>
          </button>
        </div>
        <label class="status-filter">Estado
          <select v-model="selectedStatus" @change="page = 1">
            <option value="">Todos</option>
            <option v-for="(label, value) in reportStatuses" :key="value" :value="value">{{ label }}</option>
          </select>
        </label>
        <span>Ordenado por <strong>prioridad</strong></span>
      </div>

      <p v-if="loading" role="status">Cargando reportes…</p>
      <p v-else-if="error" role="alert">{{ error }} <button type="button" @click="reload++">Reintentar</button></p>
      <p v-else-if="!result?.reports.length">No hay reportes con estos filtros.</p>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Tipo</th><th>Motivo</th><th>Reportado</th><th>Reportó</th><th>Fecha</th><th>Prioridad</th><th>Estado</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in result.reports" :key="row.id">
              <td><button class="report-link" type="button" @click="openReport(row)" :aria-label="'Abrir reporte ' + row.id">#{{ row.id.slice(-8) }}</button></td>
              <td><span class="pill">{{ reportTypes[row.type] }}</span></td>
              <td>{{ row.reason }}</td>
              <td>{{ row.reportedUserName ?? row.reportedUser }}</td><td>{{ row.reporterName ?? row.reporter }}</td>
              <td><time :datetime="row.createdAt">{{ date(row.createdAt) }}</time></td>
              <td><span class="priority"><img :src="row.priority === 3 ? highIcon : normalIcon" alt="" />{{ priorities[row.priority] }}</span></td>
              <td><span class="pill" :class="row.status">{{ reportStatuses[row.status] }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav v-if="page > 1 || result?.nextPage" class="pagination" aria-label="Páginas de reportes">
        <button type="button" :disabled="page === 1 || loading" @click="page--">Anterior</button>
        <span>Página {{ page }}</span>
        <button type="button" :disabled="!result?.nextPage || loading" @click="page++">Siguiente</button>
      </nav>
    </main>

    <dialog ref="dialog" aria-labelledby="report-title" @close="closeReport">
      <div class="detail-head"><h2 id="report-title">Detalle del reporte</h2><button type="button" @click="dialog?.close()">Cerrar</button></div>
      <p v-if="detailLoading" role="status">Cargando detalle…</p>
      <p v-if="detailError" role="alert">{{ detailError }}</p>
      <template v-if="detail">
        <p><strong>{{ reportTypes[detail.type] }} · {{ reportStatuses[detail.status] }}</strong></p>
        <p>ID <code>{{ detail.id }}</code></p>
        <p>{{ detail.reason }}</p>
        <blockquote v-if="detail.content?.text">{{ detail.content.text }}</blockquote>
        <div v-else-if="detail.content?.name"><strong>{{ detail.content.name }}</strong><p>{{ detail.content.bio }}</p></div>
        <a v-else-if="photoLink" :href="photoLink" target="_blank" rel="noopener noreferrer">Abrir foto reportada</a>
        <p v-else>El contenido reportado ya no está disponible.</p>
        <section v-if="detail.audit.length" class="audit">
          <h3>Historial de decisiones</h3>
          <ul><li v-for="(entry, index) in detail.audit" :key="index">
            {{ date(entry.at) }} · {{ reportStatuses[entry.status] }} · {{ entry.actor }}
            <p v-if="entry.note">{{ entry.note }}</p>
          </li></ul>
        </section>
        <div v-if="detail.status !== 'resolved'" class="decision">
          <label>Nota de moderación <textarea v-model="note" maxlength="500" rows="3" /></label>
          <div class="detail-actions">
            <button v-if="detail.status === 'pending'" type="button" :disabled="saving" @click="decide('in_review')">Marcar en revisión</button>
            <button type="button" :disabled="saving" @click="decide('resolved')">Resolver reporte</button>
          </div>
        </div>
      </template>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getReport, listReports, reportPhotoUrl, reportStatuses, reportTypes, updateReport } from '../services/moderation'
import type { ReportDetail, ReportRow, ReportStatus, ReportType, ReportsPage } from '../services/moderation'
import logo from '../assets/support/logo.png'
import reportsIcon from '../assets/support/reports.svg'
import reviewsIcon from '../assets/support/reviews.svg'
import messagesIcon from '../assets/support/messages.svg'
import placesIcon from '../assets/support/places.svg'
import usersIcon from '../assets/support/users.svg'
import verificationIcon from '../assets/support/verification.svg'
import activityIcon from '../assets/support/activity.svg'
import searchIcon from '../assets/support/search.svg'
import highIcon from '../assets/support/high.svg'
import normalIcon from '../assets/support/normal.svg'

const router = useRouter()
const auth = useAuthStore()
const navigation: { label: string; icon: string; type: ReportType | ''; unavailable?: boolean }[] = [
  { label: 'Reportes', icon: reportsIcon, type: '' }, { label: 'Reseñas', icon: reviewsIcon, type: '', unavailable: true },
  { label: 'Mensajes', icon: messagesIcon, type: 'message' }, { label: 'Lugares', icon: placesIcon, type: '', unavailable: true },
  { label: 'Usuarios', icon: usersIcon, type: '', unavailable: true }, { label: 'Verificaciones', icon: verificationIcon, type: '', unavailable: true },
  { label: 'Registro de actividad', icon: activityIcon, type: '', unavailable: true },
]
const priorities: Record<number, string> = { 1: 'Baja', 2: 'Media', 3: 'Alta' }
const result = ref<ReportsPage | null>(null)
const loading = ref(false)
const error = ref('')
const selectedType = ref<ReportType | ''>('')
const selectedStatus = ref<ReportStatus | ''>('')
const input = ref('')
const query = ref('')
const page = ref(1)
const reload = ref(0)

const metrics = computed(() => [
  { label: 'Pendientes', value: result.value?.counts.pending ?? '—' },
  { label: 'En revisión', value: result.value?.counts.in_review ?? '—' },
  { label: 'Resueltos hoy', value: result.value?.resolvedToday ?? '—' },
  { label: 'Tiempo medio de respuesta', value: result.value?.averageResponseMs == null
    ? '—' : Math.round(result.value.averageResponseMs / 60000) + ' min' },
])
const totalLabel = computed(() => result.value ? ' · ' + Object.values(result.value.typeCounts).reduce((a, b) => a + b, 0) : '')
const formatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' })
const date = (value: string) => formatter.format(new Date(value))
const selectType = (type: ReportType | '') => { selectedType.value = type; page.value = 1 }
const search = () => { query.value = input.value.trim(); page.value = 1 }
const signOut = () => { auth.logout(); void router.replace('/login') }

watch([selectedType, selectedStatus, query, page, reload, () => auth.token], async ([type, status, q, number, , token], _, onCleanup) => {
  if (!token) return
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  loading.value = true
  error.value = ''
  const params = new URLSearchParams({ page: String(number) })
  if (type) params.set('type', type)
  if (status) params.set('status', status)
  if (q) params.set('q', q)
  try {
    const data = await listReports(token, params, controller.signal)
    if (!controller.signal.aborted) result.value = data
  } catch (cause) {
    if (!controller.signal.aborted) error.value = cause instanceof Error ? cause.message : 'No pudimos cargar los reportes.'
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}, { immediate: true })

const dialog = ref<HTMLDialogElement | null>(null)
const detail = ref<ReportDetail | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const saving = ref(false)
const note = ref('')
const photoLink = computed(() => detail.value?.content?.photo ? reportPhotoUrl(detail.value.content.photo) : '')
let detailRequest: AbortController | undefined

function closeReport() {
  detailRequest?.abort()
  detail.value = null
  reload.value++
}

async function openReport(row: ReportRow) {
  const token = auth.token
  if (!token) return
  detailRequest?.abort()
  const controller = new AbortController()
  detailRequest = controller
  detail.value = null
  detailError.value = ''
  note.value = ''
  detailLoading.value = true
  saving.value = false
  dialog.value?.showModal()
  try {
    const data = await getReport(token, row.id, controller.signal)
    if (!controller.signal.aborted) detail.value = data
  } catch (cause) {
    if (!controller.signal.aborted) detailError.value = cause instanceof Error ? cause.message : 'No pudimos abrir el reporte.'
  } finally {
    if (!controller.signal.aborted) detailLoading.value = false
  }
}

async function decide(status: 'in_review' | 'resolved') {
  const token = auth.token
  const current = detail.value
  const signal = detailRequest?.signal
  if (!token || !current || !signal || saving.value) return
  saving.value = true
  detailError.value = ''
  try {
    const updated = await updateReport(token, current.id, status, note.value.trim(), signal)
    if (!signal.aborted) {
      detail.value = { ...current, ...updated }
      note.value = ''
      reload.value++
    }
  } catch (cause) {
    if (!signal.aborted) detailError.value = cause instanceof Error ? cause.message : 'No pudimos guardar la decisión.'
  } finally {
    if (!signal.aborted) saving.value = false
  }
}

onUnmounted(() => detailRequest?.abort())
</script>

<style scoped>
.support { display:grid; grid-template-columns: 220px minmax(0,1fr); min-height:100dvh; font:14px/1.5 var(--font-body); }
.sidebar { display:flex; align-items:center; flex-direction:column; gap:14px; padding:20px 16px; border-right:1px solid var(--rm-border); }
.brand { width:150px; height:auto; }
.support-label { border:1px solid; border-radius:999px; padding:4px 16px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.18em; }
.sidebar nav { width:100%; display:grid; gap:4px; margin-top:16px; }
.sidebar nav button { display:flex; align-items:center; gap:12px; text-align:left; border:0; border-radius:30px; padding:10px 14px; background:transparent; }
.sidebar nav button span:nth-child(2) { flex:1; }
.sidebar nav button.selected { background:var(--rm-accent); color:white; }
.sidebar nav button:disabled { opacity:.5; }
.selected img { filter:brightness(0) invert(1); }
.sign-out { margin-top:auto; align-self:start; }
.workspace { padding:clamp(18px,3.3vw,48px); min-width:0; }
.header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; }
h1, h2, dd { font-family:var(--font-heading); }
h1 { font-size:44px; line-height:1.15; }
.header p, dt, .filters, time { color:var(--rm-text-muted); }
.search { display:flex; align-items:center; gap:10px; padding:10px 14px; border:1px solid var(--rm-border); border-radius:999px; width:min(100%,340px); }
.search input { min-width:0; width:100%; border:0; background:transparent; font:inherit; }
.metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin:24px 0; }
.metrics div { border:1px solid var(--rm-border); border-radius:16px; padding:16px 20px; }
dd { margin-top:4px; font-size:36px; font-weight:600; }
.metrics div:first-child dd { color:var(--rm-accent); }
.filters, .chips, .pagination, .detail-actions { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
.filters { margin-bottom:20px; }
.chips { margin-right:auto; }
button, select { font:inherit; color:inherit; }
button { cursor:pointer; }
button:disabled { cursor:default; }
.chips button, .pagination button, .sign-out, .detail-head button, .detail-actions button { border:1px solid; border-radius:999px; background:white; padding:7px 12px; }
.chips button[aria-pressed="true"] { background:var(--rm-text); color:white; }
.status-filter select { border:1px solid var(--rm-border); border-radius:7px; padding:4px; background:white; }
.table-wrap { overflow:auto; border:1px solid var(--rm-border); border-radius:16px; }
table { width:100%; border-collapse:collapse; min-width:760px; text-align:left; }
th, td { padding:12px 14px; border-bottom:1px solid var(--rm-border); overflow-wrap:anywhere; }
th { background:#f5f3f2; color:var(--rm-text-muted); font-weight:500; white-space:nowrap; }
tr:last-child td { border-bottom:0; }
.report-link { border:0; background:none; text-decoration:underline; font-weight:600; white-space:nowrap; }
.pill { display:inline-block; border:1px solid var(--rm-border); padding:3px 8px; border-radius:999px; white-space:nowrap; font-size:12px; }
.pill.pending { background:var(--rm-accent); color:white; border-color:transparent; }
.pill.in_review { background:var(--rm-text); color:white; border-color:transparent; }
.pill.resolved { background:#f1efee; }
.priority { display:inline-flex; align-items:center; gap:6px; }
.pagination { justify-content:flex-end; margin-top:16px; }
dialog { margin:auto; width:min(560px, calc(100% - 24px)); max-height:85dvh; border:1px solid var(--rm-border); border-radius:18px; color:var(--rm-text); padding:20px; }
dialog::backdrop { background:#14121470; }
.detail-head { display:flex; justify-content:space-between; align-items:center; gap:12px; }
dialog p, blockquote, .audit, .decision { margin-top:12px; overflow-wrap:anywhere; }
blockquote { padding:10px; border-left:3px solid var(--rm-accent); }
.audit ul { padding-left:20px; }
.decision textarea { display:block; width:100%; resize:vertical; margin:6px 0 10px; padding:8px; border:1px solid var(--rm-border); border-radius:8px; font:inherit; }
.detail-actions button:last-child { background:var(--rm-accent); color:white; }
@media (max-width: 820px) {
  .support { grid-template-columns:1fr; }
  .sidebar { flex-direction:row; flex-wrap:wrap; border-right:0; border-bottom:1px solid var(--rm-border); }
  .sidebar nav { display:flex; flex-wrap:wrap; margin-top:0; }
  .sidebar nav button:disabled { display:none; }
  .brand { width:90px; }
  .sign-out { margin:0 0 0 auto; }
  .metrics { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
</style>
