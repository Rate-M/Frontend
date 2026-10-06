import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/registro', name: 'Register', component: Register },
  { path: '/recuperar', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/cambiar-contrasena/:token', name: 'ResetPassword', component: ResetPassword },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router