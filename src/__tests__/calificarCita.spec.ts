// @vitest-environment jsdom
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import StarRating from '../components/dates/StarRating.vue'
import ReviewView from '../views/ReviewView.vue'
import { useChatStore } from '../stores/chat'
import { useDatesStore } from '../stores/dates'

afterEach(() => vi.useRealTimers())

const ELIGIBLE = 'd-seed-6'
const VALID = { rating: 4, tags: ['Puntual'], comment: 'Muy buena plática' }

function setup() {
  const pinia = createPinia()
  useChatStore(pinia).conversations = [
    { id: 'c4', name: 'Sofía', photo: '', online: false, unread: 0, messages: [] },
    { id: 'c1', name: 'Valeria', photo: '', online: false, unread: 0, messages: [] },
  ]
  return { pinia, dates: useDatesStore(pinia) }
}

describe('Store: enviar reseña', () => {
  it('guarda calificación, etiquetas y comentario sin espacios sobrantes', () => {
    const { dates } = setup()
    expect(dates.submitReview(ELIGIBLE, { rating: 5, tags: ['Amable'], comment: '  Excelente  ' })).toBe(true)
    expect(dates.getById(ELIGIBLE)!.review).toMatchObject({ rating: 5, tags: ['Amable'], comment: 'Excelente' })
    expect(dates.getById(ELIGIBLE)!.review!.createdAt).toBeGreaterThan(0)
  })

  it('acepta reseñas sin comentario ni etiquetas', () => {
    const { dates } = setup()
    expect(dates.submitReview(ELIGIBLE, { rating: 3, tags: [], comment: '' })).toBe(true)
  })

  it('no permite calificar una cita sin asistencia verificada', () => {
    const { dates } = setup()
    expect(dates.submitReview('d-seed-4', VALID)).toBe(false)
    expect(dates.getById('d-seed-4')!.review).toBeUndefined()
  })

  it('no permite calificar dos veces la misma cita', () => {
    const { dates } = setup()
    expect(dates.submitReview(ELIGIBLE, VALID)).toBe(true)
    expect(dates.submitReview(ELIGIBLE, { ...VALID, rating: 1 })).toBe(false)
    expect(dates.getById(ELIGIBLE)!.review!.rating).toBe(4)
  })

  it('rechaza una cita inexistente', () => {
    const { dates } = setup()
    expect(dates.submitReview('nada', VALID)).toBe(false)
  })

  it('rechaza comentarios con lenguaje prohibido y no guarda la reseña', () => {
    const { dates } = setup()
    expect(dates.submitReview(ELIGIBLE, { ...VALID, comment: 'Qué persona tan idiota' })).toBe(false)
    expect(dates.getById(ELIGIBLE)!.review).toBeUndefined()
  })

  it.todo('permite calificar dentro de los 7 días posteriores a la cita')
  it.todo('rechaza calificar después de 7 días desde la cita')
})

describe('StarRating', () => {
  it('emite la calificación elegida', async () => {
    const w = mount(StarRating, { props: { modelValue: 0 } })
    const stars = w.findAll('button')
    expect(stars).toHaveLength(5)
    await stars[3]!.trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual([4])
  })

  it('en modo solo lectura no emite ni permite clics', async () => {
    const w = mount(StarRating, { props: { modelValue: 3, readonly: true } })
    for (const b of w.findAll('button')) await b.trigger('click')
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('Pantalla "Calificar"', () => {
  async function render(id: string, mutate?: (d: ReturnType<typeof useDatesStore>) => void) {
    const { pinia, dates } = setup()
    mutate?.(dates)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/cita/:id/calificar', component: ReviewView }],
    })
    await router.push(`/cita/${id}/calificar`)
    const wrapper = mount(ReviewView, { global: { plugins: [pinia, router], stubs: { RouterLink: RouterLinkStub } } })
    await flushPromises()
    return { wrapper, dates }
  }
  const submitBtn = (w: ReturnType<typeof mount>) => w.get('button[type="submit"]')

  it('si la cita no existe muestra "No encontramos esta cita"', async () => {
    const { wrapper } = await render('nada')
    expect(wrapper.text()).toContain('No encontramos esta cita')
  })

  it('si la asistencia no está verificada invita a verificar y no muestra el formulario', async () => {
    const { wrapper } = await render('d-seed-4')
    expect(wrapper.text()).toContain('Primero verifica que ambos asistieron')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/cita/d-seed-4/verificar')
  })

  it('el botón de enviar requiere elegir una calificación', async () => {
    const { wrapper } = await render(ELIGIBLE, (d) => { delete d.getById(ELIGIBLE)!.theirReview })
    expect(submitBtn(wrapper).attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Toca una estrella para calificar')
    await wrapper.findAllComponents(StarRating)[0]!.findAll('button')[4]!.trigger('click')
    expect(submitBtn(wrapper).attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).toContain('Excelente')
  })

  it('muestra el contador del comentario y bloquea el envío si trae groserías', async () => {
    const { wrapper } = await render(ELIGIBLE, (d) => { delete d.getById(ELIGIBLE)!.theirReview })
    await wrapper.findAllComponents(StarRating)[0]!.findAll('button')[2]!.trigger('click')
    await wrapper.get('#comment').setValue('Hola')
    expect(wrapper.get('.counter').text()).toBe('4/300')
    await wrapper.get('#comment').setValue('qué pendejo')
    expect(wrapper.get('[role="alert"]').text()).not.toBe('')
    expect(submitBtn(wrapper).attributes('disabled')).toBeDefined()
    await wrapper.get('#comment').setValue('qué amable')
    expect(submitBtn(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('al enviar guarda la reseña y pasa a "Reseña enviada" (privada hasta que la otra persona califique)', async () => {
    const { wrapper, dates } = await render(ELIGIBLE, (d) => { delete d.getById(ELIGIBLE)!.theirReview })
    await wrapper.findAllComponents(StarRating)[0]!.findAll('button')[3]!.trigger('click')
    await wrapper.get('#comment').setValue('Muy padre todo')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(dates.getById(ELIGIBLE)!.review).toMatchObject({ rating: 4, comment: 'Muy padre todo' })
    expect(wrapper.text()).toContain('Reseña enviada')
    expect(wrapper.text()).toContain('Privada')
  })

  it('avisa cuando la otra persona ya calificó, sin mostrar su reseña todavía', async () => {
    const { wrapper } = await render(ELIGIBLE)
    expect(wrapper.text()).toContain('ya calificó')
    expect(wrapper.text()).not.toContain('gracias por la buena plática')
  })
})