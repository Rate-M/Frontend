// @vitest-environment jsdom
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import ReviewView from '../views/ReviewView.vue'
import { useChatStore } from '../stores/chat'
import { useDatesStore } from '../stores/dates'
import type { DateInvitation, DateReview } from '../types/dates'
import { reviewState } from '../utils/reviews'

const review = (over: Partial<DateReview> = {}): DateReview => ({ rating: 4, tags: [], comment: 'Bien', createdAt: 1, ...over })
const inv = (over: Partial<DateInvitation> = {}): DateInvitation => ({
  id: 'x', conversationId: 'c4', direction: 'sent', placeId: 'p1', startsAt: 0, note: '', status: 'accepted',
  createdAt: 0, attendance: 'verified', ...over,
})

describe('reviewState', () => {
  it('"to_write" si aún no calificas, aunque la otra persona ya lo haya hecho', () => {
    expect(reviewState(inv())).toBe('to_write')
    expect(reviewState(inv({ theirReview: review() }))).toBe('to_write')
  })
  it('"waiting" si solo tú calificaste', () => {
    expect(reviewState(inv({ review: review() }))).toBe('waiting')
  })
  it('"published" solo cuando ambos calificaron', () => {
    expect(reviewState(inv({ review: review(), theirReview: review() }))).toBe('published')
  })
})

describe('Publicación simultánea (store)', () => {
  const setup = () => {
    const pinia = createPinia()
    useChatStore(pinia).conversations = [{ id: 'c4', name: 'Sofía', photo: '', online: false, unread: 0, messages: [] }]
    return useDatesStore(pinia)
  }
  const fresh = (dates: ReturnType<typeof useDatesStore>) => {
    const i = dates.getById('d-seed-6')!
    delete i.theirReview
    return i
  }

  it('al calificar primero tú, la reseña queda en espera y la de la otra persona no existe', () => {
    const dates = setup()
    const i = fresh(dates)
    dates.submitReview(i.id, { rating: 5, tags: [], comment: 'Genial' })
    expect(reviewState(i)).toBe('waiting')
    expect(i.theirReview).toBeUndefined()
  })

  it('se publican ambas en cuanto la otra persona califica', () => {
    const dates = setup()
    const i = fresh(dates)
    dates.submitReview(i.id, { rating: 5, tags: [], comment: 'Genial' })
    dates.simulateTheirReview(i.id)
    expect(reviewState(i)).toBe('published')
    expect(i.review!.comment).toBe('Genial')
    expect(i.theirReview).toBeDefined()
  })

  it('la reseña ajena no se registra si tú no has calificado', () => {
    const dates = setup()
    const i = fresh(dates)
    dates.simulateTheirReview(i.id)
    expect(i.theirReview).toBeUndefined()
  })

  it('la reseña ajena no se sobrescribe', () => {
    const dates = setup()
    const i = fresh(dates)
    dates.submitReview(i.id, { rating: 5, tags: [], comment: '' })
    dates.simulateTheirReview(i.id, 'clean')
    const first = i.theirReview
    dates.simulateTheirReview(i.id, 'prohibited')
    expect(i.theirReview).toEqual(first)
  })

  it('las reseñas no se pueden editar una vez publicadas', () => {
    const dates = setup()
    const i = fresh(dates)
    dates.submitReview(i.id, { rating: 5, tags: [], comment: 'Original' })
    dates.simulateTheirReview(i.id)
    expect(dates.submitReview(i.id, { rating: 1, tags: [], comment: 'Cambio' })).toBe(false)
    expect(i.review!.comment).toBe('Original')
  })

  it.todo('una reseña sin contraparte pasa a "expirada" al vencer el plazo y se publica sola')
  it.todo('una reseña expirada ya no se puede escribir')
})

describe('Pantalla: vista de reseñas', () => {
  async function render(prepare: (d: ReturnType<typeof useDatesStore>) => void) {
    const pinia = createPinia()
    useChatStore(pinia).conversations = [{ id: 'c4', name: 'Sofía', photo: '', online: false, unread: 0, messages: [] }]
    const dates = useDatesStore(pinia)
    prepare(dates)
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/cita/:id/calificar', component: ReviewView }] })
    await router.push('/cita/d-seed-6/calificar')
    const wrapper = mount(ReviewView, { global: { plugins: [pinia, router], stubs: { RouterLink: RouterLinkStub } } })
    await flushPromises()
    return { wrapper, dates }
  }

  it('en espera: muestra la tuya como privada y la de la otra persona como pendiente (sellada)', async () => {
    const { wrapper } = await render((d) => {
      delete d.getById('d-seed-6')!.theirReview
      d.submitReview('d-seed-6', { rating: 5, tags: [], comment: 'Mi comentario' })
    })
    expect(wrapper.text()).toContain('Reseña enviada')
    expect(wrapper.text()).toContain('Privada')
    expect(wrapper.text()).toContain('Pendiente')
    expect(wrapper.text()).toContain('Aún no ha calificado')
  })

  it('al simular que la otra persona califica, se publican las dos a la vez', async () => {
    const { wrapper, dates } = await render((d) => {
      delete d.getById('d-seed-6')!.theirReview
      d.submitReview('d-seed-6', { rating: 5, tags: [], comment: 'Mi comentario' })
    })
    await wrapper.findAll('.demo-btn')[0]!.trigger('click')
    await flushPromises()
    expect(reviewState(dates.getById('d-seed-6')!)).toBe('published')
    expect(wrapper.text()).toContain('¡Reseñas publicadas!')
    expect(wrapper.text()).toContain('Mi comentario')
    expect(wrapper.text()).toContain('Me la pasé muy bien')
    expect(wrapper.text()).not.toContain('Aún no ha calificado')
  })

  it('filtra automáticamente las palabras prohibidas de la reseña ajena al publicarla', async () => {
    const { wrapper } = await render((d) => {
      delete d.getById('d-seed-6')!.theirReview
      d.submitReview('d-seed-6', { rating: 5, tags: [], comment: '' })
      d.simulateTheirReview('d-seed-6', 'prohibited')
    })
    const text = wrapper.text()
    expect(text).not.toMatch(/idiota|mierda/)
    expect(text).toContain('i*****')
    expect(text).toContain('Filtrado automáticamente: se ocultaron 2 palabras no permitidas.')
  })

  it('una reseña limpia no muestra el aviso de filtrado', async () => {
    const { wrapper } = await render((d) => { d.submitReview('d-seed-6', { rating: 5, tags: [], comment: 'Todo bien' }) })
    expect(wrapper.text()).toContain('¡Reseñas publicadas!')
    expect(wrapper.find('.filtered').exists()).toBe(false)
  })
})