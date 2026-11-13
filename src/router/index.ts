import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
import ProfileCreateView from '../views/ProfileCreateView.vue'
import ProfileEditView from '../views/ProfileEditView.vue'
import VerificationView from '../views/VerificationView.vue'
import VerificationStatusView from '../views/VerificationStatusView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'
import EmailConfirmedView from '../views/EmailConfirmedView.vue'
import Discover from '../views/Discover.vue'
import { verificationGuard } from './guards'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/registro', name: 'Register', component: Register },
  { path: '/recuperar', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/cambiar-contrasena/:token', name: 'ResetPassword', component: ResetPassword },
  { path: '/confirmar-correo', name: 'VerifyEmail', component: VerifyEmailView },
  { path: '/confirmar-correo/:token', name: 'EmailConfirmed', component: EmailConfirmedView },
  { path: '/verificacion', name: 'Verification', component: VerificationView, meta: { requiresAuth: true } },
  { path: '/verificacion/estado', name: 'VerificationStatus', component: VerificationStatusView, meta: { requiresAuth: true } },
  { path: '/perfil/crear', name: 'ProfileCreate', component: ProfileCreateView, meta: { requiresAuth: true } },
  { path: '/perfil/editar', name: 'ProfileEdit', component: ProfileEditView, meta: { requiresAuth: true } },
  { path: '/discover', name: 'Discover', component: Discover, meta: { requiresVerified: true } },
  { path: '/descubrir', redirect: '/discover' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(verificationGuard)

export default router