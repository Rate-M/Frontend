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

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/registro', name: 'Register', component: Register },
  { path: '/recuperar', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/cambiar-contrasena/:token', name: 'ResetPassword', component: ResetPassword },
  { path: '/confirmar-correo', name: 'VerifyEmail', component: VerifyEmailView },
  { path: '/confirmar-correo/:token', name: 'EmailConfirmed', component: EmailConfirmedView },
  { path: '/verificacion', name: 'Verification', component: VerificationView },
  { path: '/perfil/crear', name: 'ProfileCreate', component: ProfileCreateView },
  { path: '/perfil/editar', name: 'ProfileEdit', component: ProfileEditView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router