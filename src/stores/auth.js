import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminLogin } from '@/services/api'

const TOKEN_KEY = 'sapphira_admin_token'
const USER_KEY  = 'sapphira_admin_user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || null)
  const user  = ref((() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) ?? null }
    catch { localStorage.removeItem(USER_KEY); return null }
  })())

  const isAuthenticated = computed(() => !!token.value)
  const isSuper         = computed(() => user.value?.role === 'SUPERADMIN')
  const clinicId        = computed(() => user.value?.clinicId)

  async function login(username, password) {
    const data = await adminLogin({ username, password })
    token.value = data.token
    user.value  = data.user
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, user, isAuthenticated, isSuper, clinicId, login, logout }
})
