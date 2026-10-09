import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
import ProfileCreateView from '../views/ProfileCreateView.vue'
import ProfileEditView from '../views/ProfileEditView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/registro', name: 'Register', component: Register },
  { path: '/recuperar', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/cambiar-contrasena/:token', name: 'ResetPassword', component: ResetPassword },
  { path: '/perfil/crear', name: 'ProfileCreate', component: ProfileCreateView },
  { path: '/perfil/editar', name: 'ProfileEdit', component: ProfileEditView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router