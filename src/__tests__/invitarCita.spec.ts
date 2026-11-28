// @vitest-environment jsdom
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import DateInviteView from '../views/DateInviteView.vue'
import { createInvitation, InvitationError } from '../services/dateInvitations'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { useDatesStore } from '../stores/dates'
import type { Conversation } from '../types/chat'

const threshold = ref<number | null>(3)
vi.mock('../composables/useStreakThreshold', () => ({
  useStreakThreshold: () => ({ threshold, loading: ref(false) }),
}))
vi.mock('../services/datePlaces', () => ({
  loadDatePlaces: vi.fn(async () => [{ id: 'g-1', name: 'Café Central', category: 'cafe', address: 'Calle 1' }]),
}))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  localStorage.clear()
  threshold.value = 3
})

describe('Servicio createInvitation', () => {
  const payload = { placeId: 'g-1', startsAt: '2026-12-01T19:00:00.000Z', note: 'Nos vemos' }

  it('envía POST con token, JSON y los datos de la cita', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    await createInvitation('match 1', 'jwt', payload)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/matches\/match%201\/invitations$/), {
      method: 'POST',
      headers: { Authorization: 'Bearer jwt', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  })

  it('propaga el mensaje y el status del backend cuando rechaza la invitación', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ message: 'Racha insuficiente' }, { status: 403 })))
    const error = await createInvitation('m', 'jwt', payload).catch((e) => e)
    expect(error).toBeInstanceOf(InvitationError)
    expect(error).toMatchObject({ message: 'Racha insuficiente', status: 403 })
  })

  it('usa un mensaje genérico si el backend no responde JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>', { status: 502 })))
    await expect(createInvitation('m', 'jwt', payload)).rejects.toThrow('No pudimos enviar la invitación.')
  })
})

describe('Store de citas: enviar invitación', () => {
  const setup = () => {
    const pinia = createPinia()
    const chat = useChatStore(pinia)
    chat.conversations = [{ id: 'c1', name: 'Alex', photo: '', online: false, unread: 0, messages: [] },
      { id: 'c9', name: 'Luz', photo: '', online: false, unread: 0, messages: [] }]
    return { dates: useDatesStore(pinia), chat }
  }

  it('crea la invitación pendiente al inicio de la lista, con la nota sin espacios sobrantes', () => {
    const { dates } = setup()
    const startsAt = new Date(2026, 11, 1, 19).getTime()
    const invitation = dates.send({ conversationId: 'c1', placeId: 'p1', startsAt, note: '  Café y plática  ' })
    expect(invitation).toMatchObject({
      conversationId: 'c1', placeId: 'p1', startsAt, note: 'Café y plática',
      direction: 'sent', status: 'pending', attendance: 'unverified',
    })
    expect(dates.invitations[0]!.id).toBe(invitation!.id)
    expect(dates.getById(invitation!.id)).toMatchObject({ placeId: 'p1', status: 'pending' })
  })

  it('avisa en el chat con el lugar y la fecha de la cita', () => {
    const { dates, chat } = setup()
    dates.send({ conversationId: 'c1', placeId: 'p1', startsAt: new Date(2026, 11, 1, 19).getTime(), note: '' })
    const [message] = chat.getById('c1')!.messages
    expect(message).toMatchObject({ from: 'me', status: 'sent' })
    expect(message!.text).toContain('Te invité a una cita en Café Aroma')
  })

  it('no crea nada si el lugar no existe', () => {
    const { dates } = setup()
    const before = dates.invitations.length
    expect(dates.send({ conversationId: 'c1', placeId: 'inexistente', startsAt: Date.now(), note: '' })).toBeNull()
    expect(dates.invitations).toHaveLength(before)
  })

  it('aparece en las citas de esa conversación, de más nueva a más vieja', () => {
    const { dates } = setup()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 27, 10))
    const first = dates.send({ conversationId: 'c9', placeId: 'p1', startsAt: 1, note: '' })!
    vi.setSystemTime(new Date(2026, 10, 27, 11))
    const second = dates.send({ conversationId: 'c9', placeId: 'p2', startsAt: 2, note: '' })!
    expect(dates.byConversation('c9').map((i) => i.id)).toEqual([second.id, first.id])
  })
})

describe('Pantalla "Nueva cita"', () => {
  const day = (daysAgo: number, from: 'me' | 'them') => {
    const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(10, from === 'me' ? 0 : 1, 0, 0)
    return { id: `${from}-${daysAgo}`, from, text: 'hola', sentAt: d.getTime() }
  }
  const streakOf = (n: number) => Array.from({ length: n }, (_, i) => [day(i, 'me'), day(i, 'them')]).flat()
  const conv = (id: string, name: string, days: number): Conversation =>
    ({ id, name, photo: '', online: false, unread: 0, messages: streakOf(days) })

  async function render(query = '') {
    const pinia = createPinia()
    useAuthStore(pinia).login('jwt', { id: 'yo' })
    useChatStore(pinia).conversations = [conv('listo', 'Alex', 4), conv('nuevo', 'Sofi', 1)]
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div/>' } }, { path: '/chat/:id', component: { template: '<div/>' } }],
    })
    await router.push('/' + query)
    const replace = vi.spyOn(router, 'replace')
    const wrapper = mount(DateInviteView, {
      global: { plugins: [pinia, router], stubs: { RouterLink: RouterLinkStub } },
    })
    await flushPromises()
    return { wrapper, replace }
  }
  const byText = (w: ReturnType<typeof mount>, selector: string, text: string) =>
    w.findAll(selector).find((el) => el.text().includes(text))!

  it('solo permite invitar a quien alcanzó la racha mínima', async () => {
    const { wrapper } = await render()
    expect(byText(wrapper, '.person', 'Alex').attributes('disabled')).toBeUndefined()
    expect(byText(wrapper, '.person', 'Sofi').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Se desbloquea al llegar a 3 días')
  })

  it('el botón de enviar sigue deshabilitado hasta elegir persona, lugar, día y hora', async () => {
    const { wrapper } = await render()
    const submit = () => wrapper.get('.btn-primary')
    expect(submit().attributes('disabled')).toBeDefined()
    await byText(wrapper, '.person', 'Alex').trigger('click')
    await byText(wrapper, '.place', 'Café Central').trigger('click')
    expect(submit().attributes('disabled')).toBeDefined()
    await wrapper.findAll('.chips')[0]!.findAll('.chip')[1]!.trigger('click')
    expect(submit().attributes('disabled')).toBeDefined()
    await wrapper.findAll('.chips')[1]!.findAll('.chip')[0]!.trigger('click')
    expect(submit().attributes('disabled')).toBeUndefined()
    expect(wrapper.get('.summary').text()).toContain('Alex')
    expect(wrapper.get('.summary').text()).toContain('Café Central')
  })

  it('envía la invitación al backend en ISO y regresa al chat', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, replace } = await render()
    await byText(wrapper, '.person', 'Alex').trigger('click')
    await byText(wrapper, '.place', 'Café Central').trigger('click')
    await wrapper.findAll('.chips')[0]!.findAll('.chip')[1]!.trigger('click')
    await wrapper.findAll('.chips')[1]!.findAll('.chip')[4]!.trigger('click') /
    await wrapper.get('#note').setValue('¡Te va a gustar!')
    await wrapper.get('.btn-primary').trigger('click')
    await flushPromises()
    const [url, init] = fetchMock.mock.calls.at(-1) as unknown as [string, RequestInit]
    expect(url).toMatch(/\/matches\/listo\/invitations$/)
    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({ placeId: 'g-1', note: '¡Te va a gustar!' })
    expect(new Date(body.startsAt).getHours()).toBe(19)
    expect(new Date(body.startsAt).getTime()).toBeGreaterThan(Date.now())
    expect(replace).toHaveBeenCalledWith('/chat/listo')
  })

  it('muestra el error del backend y no navega si falla el envío', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ message: 'Ya tienes una invitación pendiente' }, { status: 409 })))
    const { wrapper, replace } = await render()
    await byText(wrapper, '.person', 'Alex').trigger('click')
    await byText(wrapper, '.place', 'Café Central').trigger('click')
    await wrapper.findAll('.chips')[0]!.findAll('.chip')[1]!.trigger('click')
    await wrapper.findAll('.chips')[1]!.findAll('.chip')[0]!.trigger('click')
    await wrapper.get('.btn-primary').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('[role="alert"]').map((a) => a.text())).toContain('Ya tienes una invitación pendiente')
    expect(replace).not.toHaveBeenCalled()
  })

  it('bloquea a todos si no hay umbral disponible', async () => {
    threshold.value = null
    const { wrapper } = await render()
    expect(byText(wrapper, '.person', 'Alex').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('No se pudo verificar la racha mínima')
  })
})