import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<any>(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  function login(newToken: string, userData: any) {
    token.value = newToken
    user.value = userData
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function setVerified(value = true) {
    if (!user.value) return
    user.value = { ...user.value, verified: value }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function setEmailVerified(value = true) {
    if (!user.value) return
    user.value = { ...user.value, emailVerified: value }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    setVerified,
    setEmailVerified
  }
})