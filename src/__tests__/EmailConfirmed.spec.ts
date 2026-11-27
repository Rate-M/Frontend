// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import EmailConfirmedView from '../views/EmailConfirmedView.vue'

afterEach(() => vi.unstubAllGlobals())

it.each([
  [200, 'Correo confirmado'],
  [400, 'Enlace inválido o vencido'],
  [503, 'No pudimos confirmar tu correo'],
])('muestra el estado que corresponde a la respuesta %s de la API', async (status, title) => {
  const token = 'a'.repeat(64)
  const request = vi.fn().mockResolvedValue(new Response(null, { status }))
  vi.stubGlobal('fetch', request)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/confirmar-correo/:token', component: EmailConfirmedView }],
  })
  await router.push(`/confirmar-correo/${token}`)
  const view = mount(EmailConfirmedView, { global: { plugins: [createPinia(), router] } })
  try {
    await flushPromises()
    expect(request).toHaveBeenCalledWith(expect.stringContaining(`/auth/verify-email?token=${token}`))
    expect(view.get('h1').text()).toBe(title)
  } finally {
    view.unmount()
  }
})
