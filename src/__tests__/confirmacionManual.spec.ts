// @vitest-environment jsdom
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ManualConfirm from '../components/dates/ManualConfirm.vue'
import { useChatStore } from '../stores/chat'
import { useDatesStore } from '../stores/dates'
import { GEOFENCE_M, TIME_TOLERANCE_MIN } from '../types/dates'

const ID = 'd-seed-4'

function setup() {
  const pinia = createPinia()
  useChatStore(pinia).conversations = [{ id: 'c1', name: 'Valeria', photo: '', online: false, unread: 0, messages: [] }]
  return { pinia, dates: useDatesStore(pinia) }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('Verificación GPS (store)', () => {
  it('constantes del geocerco y la tolerancia de hora', () => {
    expect(GEOFENCE_M).toBe(150)
    expect(TIME_TOLERANCE_MIN).toBe(30)
  })

  it('con GPS correcto en ambos queda verificada y no requiere confirmación manual', () => {
    const { dates } = setup()
    dates.verify(ID, 'both')
    expect(dates.getById(ID)!.attendance).toBe('verified')
  })

  it.each(['nosignal', 'far', 'late'] as const)('el escenario "%s" deja la asistencia en gps_failed', (scenario) => {
    const { dates } = setup()
    dates.verify(ID, scenario)
    expect(dates.getById(ID)!.attendance).toBe('gps_failed')
  })

  it('guarda el detalle de cada fallo (sin señal, lejos, tarde)', () => {
    const { dates } = setup()
    dates.verify(ID, 'nosignal')
    expect(dates.getById(ID)!.gps).toMatchObject({ me: { status: 'error' }, them: { status: 'ok' } })
    dates.verify(ID, 'far')
    expect(dates.getById(ID)!.gps!.them.distanceM).toBeGreaterThan(GEOFENCE_M)
    dates.verify(ID, 'late')
    expect(dates.getById(ID)!.gps!.them).toMatchObject({ status: 'late' })
  })

  it('solo verifica citas aceptadas', () => {
    const { dates } = setup()
    dates.verify('d-seed-1', 'both')
    expect(dates.getById('d-seed-1')!.attendance).toBe('unverified')
    dates.verify('no-existe', 'both')
  })
})

describe('Confirmación manual (store)', () => {
  it('no se puede confirmar manualmente si el GPS no ha fallado', () => {
    const { dates } = setup()
    dates.confirmManually(ID)
    expect(dates.getById(ID)!.attendance).toBe('unverified')
    dates.verify(ID, 'both')
    dates.confirmManually(ID)
    expect(dates.getById(ID)!.attendance).toBe('verified')
    expect(dates.getById(ID)!.manual).toBeUndefined()
  })

  it('tu confirmación queda pendiente hasta que la otra persona confirme', () => {
    const { dates } = setup()
    dates.verify(ID, 'nosignal')
    dates.confirmManually(ID)
    expect(dates.getById(ID)!.attendance).toBe('manual_pending')
    expect(dates.getById(ID)!.manual).toEqual({ me: true, them: false })
    vi.advanceTimersByTime(3000)
    expect(dates.getById(ID)!.attendance).toBe('manual_pending')
  })

  it('cuando la otra persona confirma, la asistencia queda confirmada por ambos', () => {
    const { dates } = setup()
    dates.verify(ID, 'far')
    dates.confirmManually(ID)
    vi.advanceTimersByTime(3500)
    expect(dates.getById(ID)!.attendance).toBe('manual_confirmed')
    expect(dates.getById(ID)!.manual).toEqual({ me: true, them: true })
  })

  it('confirmar dos veces no reinicia el proceso', () => {
    const { dates } = setup()
    dates.verify(ID, 'late')
    dates.confirmManually(ID)
    dates.confirmManually(ID)
    expect(dates.getById(ID)!.manual).toEqual({ me: true, them: false })
  })

  it('la confirmación manual habilita calificar', () => {
    const { dates } = setup()
    dates.verify(ID, 'nosignal')
    expect(dates.submitReview(ID, { rating: 5, tags: [], comment: '' })).toBe(false)
    dates.confirmManually(ID)
    expect(dates.submitReview(ID, { rating: 5, tags: [], comment: '' })).toBe(false)
    vi.advanceTimersByTime(3500)
    expect(dates.submitReview(ID, { rating: 5, tags: [], comment: '' })).toBe(true)
  })
})

describe('Componente ManualConfirm', () => {
  const render = (scenario?: 'nosignal') => {
    const { pinia, dates } = setup()
    if (scenario) dates.verify(ID, scenario)
    const wrapper = mount(ManualConfirm, {
      props: { invitationId: ID },
      global: { plugins: [pinia], stubs: { RouterLink: RouterLinkStub } },
    })
    return { wrapper, dates }
  }

  it('pide confirmar con una casilla y mantiene el botón deshabilitado hasta marcarla', async () => {
    const { wrapper } = render('nosignal')
    expect(wrapper.text()).toContain('Confirma manualmente')
    expect(wrapper.text()).toContain('Las dos personas deben confirmar')
    const button = wrapper.get('button.btn-primary')
    expect(button.attributes('disabled')).toBeDefined()
    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('al confirmar pasa a "esperando" con tu paso marcado y el plazo de 24 h', async () => {
    const { wrapper, dates } = render('nosignal')
    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('button.btn-primary').trigger('click')
    expect(dates.getById(ID)!.attendance).toBe('manual_pending')
    expect(wrapper.text()).toContain('Esperando la confirmación de Valeria')
    expect(wrapper.text()).toContain('Tú ya confirmaste')
    expect(wrapper.text()).toContain('Valeria aún no confirma')
    expect(wrapper.text()).toContain('24 horas')
  })

  it('cuando ambos confirman ofrece calificar y volver a las citas', async () => {
    const { wrapper } = render('nosignal')
    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('button.btn-primary').trigger('click')
    await vi.advanceTimersByTimeAsync(3500)
    expect(wrapper.text()).toContain('¡Asistencia confirmada!')
    const links = wrapper.findAllComponents(RouterLinkStub).map((l) => l.props('to'))
    expect(links).toEqual([`/cita/${ID}/calificar`, '/citas'])
  })

  it('no muestra nada si la cita no necesita confirmación manual', () => {
    const { wrapper } = render()
    expect(wrapper.find('h3').exists()).toBe(false)
  })

  it('usa "tu match" si no se conoce el nombre', () => {
    const { pinia, dates } = setup()
    useChatStore(pinia).conversations = []
    dates.verify(ID, 'far')
    dates.confirmManually(ID)
    const wrapper = mount(ManualConfirm, { props: { invitationId: ID }, global: { plugins: [pinia], stubs: { RouterLink: RouterLinkStub } } })
    expect(wrapper.text()).toContain('Esperando la confirmación de tu match')
  })
})