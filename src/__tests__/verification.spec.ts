import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'
import { useVerificationStore } from '../stores/verification'
import { verificationGuard } from '../router/guards'

function installFakeLocalStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      data[key] = String(value)
    },
    removeItem: (key: string) => {
      delete data[key]
    }
  })
  return data
}

function mockFetch(status: string | null, httpCode = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      status: httpCode,
      json: async () => ({ verificationStatus: status })
    })
  )
}

beforeEach(() => {
  setActivePinia(createPinia())
  installFakeLocalStorage({ token: 'abc123' })
})

describe('store de verificación', () => {
  it('guarda el estado que responde el backend', async () => {
    mockFetch('approved')
    const store = useVerificationStore()

    const result = await store.fetchStatus()

    expect(result).toBe('approved')
    expect(store.status).toBe('approved')
    expect(store.error).toBeNull()
  })

  it('mantiene sincronizado el flag "verified" de tu flujo de captura', async () => {
    const store = useVerificationStore()

    mockFetch('approved')
    await store.fetchStatus()
    expect(store.verified).toBe(true)

    mockFetch('rejected')
    await store.fetchStatus()
    expect(store.verified).toBe(false)
  })

  it("trata como 'idle' un valor desconocido del backend", async () => {
    mockFetch('algo_raro')
    const store = useVerificationStore()

    await store.fetchStatus()

    expect(store.status).toBe('idle')
  })

  it("marca error 'unauthorized' si el backend responde 401", async () => {
    mockFetch(null, 401)
    const store = useVerificationStore()

    const result = await store.fetchStatus()

    expect(result).toBeNull()
    expect(store.error).toBe('unauthorized')
  })

  it("marca error 'network' si falla la conexión", async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
    const store = useVerificationStore()

    expect(await store.fetchStatus()).toBeNull()
    expect(store.error).toBe('network')
  })

  it('avisa cuando pasa de pendiente a aprobada', async () => {
    const store = useVerificationStore()
    store.status = 'pending'
    mockFetch('approved')

    await store.fetchStatus()

    expect(store.notice?.type).toBe('success')
  })

  it('avisa cuando pasa de pendiente a rechazada', async () => {
    const store = useVerificationStore()
    store.status = 'pending'
    mockFetch('rejected')

    await store.fetchStatus()

    expect(store.notice?.type).toBe('error')
  })

  it('no avisa si el estado no cambió', async () => {
    const store = useVerificationStore()
    store.status = 'pending'
    mockFetch('pending')

    await store.fetchStatus()

    expect(store.notice).toBeNull()
  })

  it('reset() limpia tanto lo tuyo como el estado del backend', () => {
    const store = useVerificationStore()
    store.grantBiometricConsent('v1.0')
    store.markApproved('ine')
    store.status = 'approved'

    store.reset()

    expect(store.biometricConsent).toBeNull()
    expect(store.verified).toBe(false)
    expect(store.documentType).toBeNull()
    expect(store.status).toBeNull()
  })
})

describe('guard de rutas protegidas', () => {
  const protectedRoute = { meta: { requiresVerified: true } } as unknown as RouteLocationNormalized
  const publicRoute = { meta: {} } as unknown as RouteLocationNormalized

  it('deja pasar rutas públicas', async () => {
    expect(await verificationGuard(publicRoute)).toBe(true)
  })

  it('manda a /login si no hay token', async () => {
    installFakeLocalStorage({})

    expect(await verificationGuard(protectedRoute)).toEqual({ path: '/login' })
  })

  it('deja pasar a un usuario verificado', async () => {
    mockFetch('approved')

    expect(await verificationGuard(protectedRoute)).toBe(true)
  })

  it.each(['idle', 'pending', 'rejected'])('manda a /verificacion si el estado es %s', async (s) => {
    mockFetch(s)

    expect(await verificationGuard(protectedRoute)).toEqual({ path: '/verificacion' })
  })

  it('manda a /login y borra el token si el backend responde 401', async () => {
    const storage = installFakeLocalStorage({ token: 'vencido' })
    mockFetch(null, 401)

    expect(await verificationGuard(protectedRoute)).toEqual({ path: '/login' })
    expect(storage.token).toBeUndefined()
  })

  it('no consulta de nuevo al backend si ya tiene el estado', async () => {
    const store = useVerificationStore()
    store.status = 'approved'
    mockFetch('approved')

    await verificationGuard(protectedRoute)

    expect(fetch).not.toHaveBeenCalled()
  })
})