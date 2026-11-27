// @vitest-environment jsdom
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, expect, it, vi } from 'vitest'
import router from '../router'
import { useAuthStore } from '../stores/auth'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

it('lleva a verificación y luego a crear perfil cuando el backend confirma la aprobación', async () => {
  setActivePinia(createPinia())
  useAuthStore().login('jwt', { id: 'account' })
  const request = vi.fn()
    .mockResolvedValueOnce(Response.json({ verificationStatus: 'pending' }))
    .mockResolvedValueOnce(Response.json({ verificationStatus: 'approved' }))
    .mockResolvedValueOnce(new Response(null, { status: 404 }))
    .mockResolvedValueOnce(Response.json({ verificationStatus: 'approved' }))
  vi.stubGlobal('fetch', request)

  await router.push('/descubrir')
  expect(router.currentRoute.value.path).toBe('/verificacion')
  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/verification-status$/),
    expect.objectContaining({ headers: { Authorization: 'Bearer jwt' } }))

  await router.push('/descubrir')
  expect(router.currentRoute.value.path).toBe('/perfil/crear')
})
