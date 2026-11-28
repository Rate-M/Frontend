// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import SupportReportsView from '../views/SupportReportsView.vue'
import { useAuthStore } from '../stores/auth'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  localStorage.clear()
})

it('filtra reportes, abre únicamente el contenido denunciado y guarda la resolución', async () => {
  const report = {
    id: '507f1f77bcf86cd799439011', type: 'message', reporter: 'person-a', reportedUser: 'person-b',
    reason: 'Acoso', priority: 3, status: 'pending', createdAt: '2026-11-27T12:00:00Z',
  }
  const page = {
    reports: [report], nextPage: null, counts: { pending: 1, in_review: 0, resolved: 0 },
    typeCounts: { message: 1, photo: 0, profile: 0 }, resolvedToday: 0, averageResponseMs: null,
  }
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json(page))
    .mockResolvedValueOnce(Response.json(page))
    .mockResolvedValueOnce(Response.json({ ...report, content: { text: 'Mensaje denunciado' }, audit: [] }))
    .mockResolvedValueOnce(Response.json({
      status: 'resolved', audit: [{ actor: 'staff', status: 'resolved', at: report.createdAt, note: 'Revisado' }],
    }))
    .mockResolvedValueOnce(Response.json({ ...page, reports: [{ ...report, status: 'resolved' }] }))
  vi.stubGlobal('fetch', fetchMock)
  if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: vi.fn() })
  }
  const pinia = createPinia()
  useAuthStore(pinia).login('staff-token', { role: 'moderator' })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/soporte/reportes', component: SupportReportsView }],
  })
  await router.push('/soporte/reportes')
  const view = mount(SupportReportsView, { global: { plugins: [pinia, router] } })
  try {
    await flushPromises()
    await view.get('[aria-label="Buscar reportes"]').setValue('Acoso')
    await view.get('form').trigger('submit')
    await flushPromises()
    expect(fetchMock).toHaveBeenNthCalledWith(2, expect.stringMatching(/page=1&q=Acoso$/), expect.objectContaining({
      headers: { Authorization: 'Bearer staff-token' },
    }))

    await view.get('tbody button').trigger('click')
    await flushPromises()
    expect(view.get('blockquote').text()).toBe('Mensaje denunciado')
    await view.get('textarea').setValue('Revisado')
    await view.findAll('dialog button').find((button) => button.text() === 'Resolver reporte')!.trigger('click')
    await flushPromises()
    expect(fetchMock).toHaveBeenNthCalledWith(4, expect.stringContaining('/reports/' + report.id), expect.objectContaining({
      method: 'PATCH', body: JSON.stringify({ status: 'resolved', note: 'Revisado' }),
    }))
    expect(view.get('dialog').text()).toContain('Historial de decisiones')
    expect(view.get('tbody').text()).toContain('Resuelto')
  } finally {
    view.unmount()
  }
})
