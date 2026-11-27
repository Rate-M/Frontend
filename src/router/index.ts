import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
import ProfileCreateView from '../views/ProfileCreateView.vue'
import ProfileEditView from '../views/ProfileEditView.vue'
import VerificationView from '../views/VerificationView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'
import EmailConfirmedView from '../views/EmailConfirmedView.vue'
import Discover from '../views/Discover.vue'
import NotificationsView from '../views/NotificationsView.vue'
import ChatView from '../views/ChatView.vue'
import ChatsView from '../views/ChatsView.vue'
import PlacesView from '../views/PlacesView.vue'
import DateInviteView from '../views/DateInviteView.vue'
import DatesView from '../views/DatesView.vue'
import VerifyDateView from '../views/VerifyDateView.vue'
import { useAuthStore } from '../stores/auth'
import { getVerificationStatus, UnauthorizedError } from '../services/verification.services'
import ReviewView from '../views/ReviewView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/registro', name: 'Register', component: Register },
  { path: '/recuperar', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/cambiar-contrasena/:token', name: 'ResetPassword', component: ResetPassword, alias: '/recuperar/:token' },
  { path: '/confirmar-correo', name: 'VerifyEmail', component: VerifyEmailView },
  { path: '/confirmar-correo/:token', name: 'EmailConfirmed', component: EmailConfirmedView },
  { path: '/verificacion', name: 'Verification', component: VerificationView },
  { path: '/perfil/crear', name: 'ProfileCreate', component: ProfileCreateView },
  { path: '/perfil/editar', name: 'ProfileEdit', component: ProfileEditView },
  { path: '/descubrir', name: 'Discover', component: Discover },
  { path: '/notificaciones', name: 'Notifications', component: NotificationsView },
  { path: '/chats', name: 'Chats', component: ChatsView },
  { path: '/chat/:id', name: 'Chat', component: ChatView },
  { path: '/lugares', name: 'Places', component: PlacesView },
  { path: '/cita/nueva', name: 'DateInvite', component: DateInviteView },
  { path: '/cita/:id/verificar', name: 'VerifyDate', component: VerifyDateView },
  { path: '/cita/:id/calificar', name: 'Review', component: ReviewView },
  { path: '/citas', name: 'Dates', component: DatesView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'
const profileRoutes = new Set(['Discover', 'ProfileCreate', 'ProfileEdit'])

router.beforeEach(async (to) => {
  if (useMocks || typeof to.name !== 'string' || !profileRoutes.has(to.name)) return true
  const auth = useAuthStore()
  if (!auth.token) return { name: 'Login' }

  try {
    if (await getVerificationStatus() !== 'approved') return { name: 'Verification' }
    if (to.name === 'ProfileCreate') return true

    const response = await fetch(apiUrl + '/profiles/me', {
      headers: { Authorization: 'Bearer ' + auth.token },
    })
    if (response.status === 404) return { name: 'ProfileCreate' }
    if (response.status === 401) throw new UnauthorizedError()
    return true
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      auth.logout()
      return { name: 'Login' }
    }
    return { name: 'Verification' }
  }
})

export default router