// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChatInvitations from '../components/dates/ChatInvitations.vue'
import { listInvitations, respondToInvitation, InvitationError } from '../services/dateInvitations'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { useDatesStore } from '../stores/dates'

const base = {
  id: 'cita', direction: 'received', placeId: 'venue', startsAt: '2026-12-01T19:00:00.000Z',
  note: '', status: 'pending', revision: 3, awaitingYourResponse: true,
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  localStorage.clear()
})

describe('Servicio de invitaciones', () => {
  it('lista las invitaciones del match con el token', async () => {
    const fetchMock = vi.fn(async () => Response.json({ invitations: [base] }))
    vi.stubGlobal('fetch', fetchMock)
    const result = await listInvitations('m 1', 'jwt', new AbortController().signal)
    expect(result.invitations).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/matches\/m%201\/invitations$/), expect.objectContaining({
      method: 'GET', headers: { Authorization: 'Bearer jwt' },
    }))
  })

  it.each([
    [{ action: 'accept', revision: 3 }],
    [{ action: 'decline', revision: 3 }],
    [{ action: 'propose', revision: 3, startsAt: '2026-12-02T19:00:00.000Z' }],
  ] as const)('manda PATCH con la acción %j', async (body) => {
    const fetchMock = vi.fn(async () => Response.json({ ...base }))
    vi.stubGlobal('fetch', fetchMock)
    await respondToInvitation('m', 'jwt', new AbortController().signal, 'cita', body)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/matches\/m\/invitations\/cita$/), expect.objectContaining({
      method: 'PATCH', body: JSON.stringify(body),
      headers: { Authorization: 'Bearer jwt', 'Content-Type': 'application/json' },
    }))
  })

  it('expone el status HTTP en InvitationError (p. ej. conflicto de revisión)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ message: 'Ya fue respondida' }, { status: 409 })))
    const error = await respondToInvitation('m', 'jwt', new AbortController().signal, 'cita', { action: 'accept', revision: 1 }).catch((e) => e)
    expect(error).toBeInstanceOf(InvitationError)
    expect(error).toMatchObject({ message: 'Ya fue respondida', status: 409 })
  })

  it('usa mensaje genérico si la respuesta no es JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('x', { status: 500 })))
    await expect(listInvitations('m', 'jwt', new AbortController().signal)).rejects.toThrow('No pudimos consultar o actualizar la cita.')
  })
})

describe('Componente ChatInvitations', () => {
  function mountWith(responses: Array<Response | Error>) {
    const fetchMock = vi.fn()
    responses.forEach((r) => r instanceof Error ? fetchMock.mockRejectedValueOnce(r) : fetchMock.mockResolvedValueOnce(r))
    vi.stubGlobal('fetch', fetchMock)
    const pinia = createPinia()
    useAuthStore(pinia).login('jwt', { id: 'yo' })
    const wrapper = mount(ChatInvitations, { props: { matchId: 'match' }, global: { plugins: [pinia], stubs: ['DateCheckin'] } })
    return { wrapper, fetchMock }
  }
  const button = (w: ReturnType<typeof mount>, text: string) => w.findAll('button').find((b) => b.text() === text)!
  const lastBody = (m: ReturnType<typeof vi.fn>) => JSON.parse((m.mock.calls.at(-1)![1] as RequestInit).body as string)

  it('rechaza la invitación y muestra "Cita rechazada" sin más botones', async () => {
    const { wrapper, fetchMock } = mountWith([
      Response.json({ invitations: [base] }),
      Response.json({ ...base, status: 'declined', revision: 4, awaitingYourResponse: false }),
    ])
    await flushPromises()
    await button(wrapper, 'Rechazar').trigger('click')
    await flushPromises()
    expect(lastBody(fetchMock)).toEqual({ action: 'decline', revision: 3 })
    expect(wrapper.text()).toContain('Cita rechazada')
    expect(wrapper.find('button').exists()).toBe(false)
    wrapper.unmount()
  })

  it('ofrece las tres opciones solo cuando la respuesta está en tu lado', async () => {
    const { wrapper } = mountWith([Response.json({ invitations: [base] })])
    await flushPromises()
    expect(wrapper.findAll('button').map((b) => b.text())).toEqual(['Aceptar', 'Rechazar', 'Proponer otra hora'])
    wrapper.unmount()
  })

  it('en una invitación enviada por ti solo avisa que espera respuesta', async () => {
    const sent = { ...base, direction: 'sent', awaitingYourResponse: false }
    const { wrapper } = mountWith([Response.json({ invitations: [sent] })])
    await flushPromises()
    expect(wrapper.text()).toContain('Esperando respuesta de la otra persona.')
    expect(wrapper.find('button').exists()).toBe(false)
    wrapper.unmount()
  })

  it('propone otra hora futura: manda ISO + revisión y actualiza la tarjeta', async () => {
    const future = new Date(Date.now() + 3 * 86_400_000)
    future.setSeconds(0, 0)
    const local = new Date(future.getTime() - future.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
    const { wrapper, fetchMock } = mountWith([
      Response.json({ invitations: [base] }),
      Response.json({ ...base, startsAt: future.toISOString(), revision: 4, awaitingYourResponse: false }),
    ])
    await flushPromises()
    await button(wrapper, 'Proponer otra hora').trigger('click')
    await wrapper.get('input[type="datetime-local"]').setValue(local)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(lastBody(fetchMock)).toEqual({ action: 'propose', revision: 3, startsAt: future.toISOString() })
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain('Esperando respuesta de la otra persona.')
    wrapper.unmount()
  })

  it('no envía una propuesta con fecha pasada o vacía y avisa', async () => {
    const { wrapper, fetchMock } = mountWith([Response.json({ invitations: [base] })])
    await flushPromises()
    await button(wrapper, 'Proponer otra hora').trigger('click')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Elige una fecha y hora futura.')
    await wrapper.get('input[type="datetime-local"]').setValue('2020-01-01T10:00')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Elige una fecha y hora futura.')
    expect(fetchMock).toHaveBeenCalledTimes(1) 
    wrapper.unmount()
  })

  it('cancelar la propuesta cierra el formulario sin llamar a la API', async () => {
    const { wrapper, fetchMock } = mountWith([Response.json({ invitations: [base] })])
    await flushPromises()
    await button(wrapper, 'Proponer otra hora').trigger('click')
    expect(wrapper.find('form').exists()).toBe(true)
    await button(wrapper, 'Cancelar').trigger('click')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('ante un 409 muestra el mensaje y recarga la invitación actualizada por la otra persona', async () => {
    const updated = { ...base, status: 'accepted', revision: 4, awaitingYourResponse: false }
    const { wrapper, fetchMock } = mountWith([
      Response.json({ invitations: [base] }),
      Response.json({ message: 'La invitación cambió' }, { status: 409 }),
      Response.json({ invitations: [updated] }),
    ])
    await flushPromises()
    await button(wrapper, 'Aceptar').trigger('click')
    await flushPromises()
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(wrapper.text()).toContain('La invitación cambió')
    expect(wrapper.text()).toContain('Cita aceptada')
    wrapper.unmount()
  })

  it('un error de red al responder deja la invitación intacta y avisa', async () => {
    const { wrapper } = mountWith([Response.json({ invitations: [base] }), new TypeError('offline')])
    await flushPromises()
    await button(wrapper, 'Aceptar').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('No pudimos enviar tu respuesta.')
    expect(wrapper.text()).toContain('Invitación a cita')
    expect(button(wrapper, 'Aceptar').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it('muestra error si no se pueden cargar las invitaciones', async () => {
    const { wrapper } = mountWith([new Response(null, { status: 500 })])
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('No pudimos cargar las invitaciones.')
    wrapper.unmount()
  })
})

describe('Store de citas (modo demo): responder', () => {
  const setup = () => {
    const pinia = createPinia()
    const chat = useChatStore(pinia)
    chat.conversations = [{ id: 'c4', name: 'Sofía', photo: '', online: false, unread: 0, messages: [] }]
    return { dates: useDatesStore(pinia), chat }
  }

  it('acepta una invitación recibida y avisa en el chat', () => {
    const { dates, chat } = setup()
    dates.respond('d-seed-1', 'accepted')
    expect(dates.getById('d-seed-1')!.status).toBe('accepted')
    expect(chat.getById('c4')!.messages.at(-1)!.text).toContain('Acepté tu invitación a Café Aroma')
  })

  it('rechaza una invitación recibida con un mensaje cortés', () => {
    const { dates, chat } = setup()
    dates.respond('d-seed-1', 'declined')
    expect(dates.getById('d-seed-1')!.status).toBe('declined')
    expect(chat.getById('c4')!.messages.at(-1)!.text).toContain('no podré ir')
  })

  it('al responder baja el contador de pendientes recibidas', () => {
    const { dates } = setup()
    const before = dates.pendingReceivedCount
    dates.respond('d-seed-1', 'accepted')
    expect(dates.pendingReceivedCount).toBe(before - 1)
  })

  it('no permite responder dos veces, ni a invitaciones enviadas ni inexistentes', () => {
    const { dates, chat } = setup()
    dates.respond('d-seed-1', 'accepted')
    const messages = chat.getById('c4')!.messages.length
    dates.respond('d-seed-1', 'declined')
    expect(dates.getById('d-seed-1')!.status).toBe('accepted')
    dates.respond('d-seed-3', 'declined') 
    expect(dates.getById('d-seed-3')!.status).toBe('accepted')
    dates.respond('no-existe', 'accepted')
    expect(chat.getById('c4')!.messages).toHaveLength(messages)
  })
})