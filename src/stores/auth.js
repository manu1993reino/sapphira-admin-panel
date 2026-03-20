import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminLogin, adminLogout } from '@/services/api'

const USER_KEY = 'sapphira_admin_user'

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function extractUserFromToken(token) {
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  return {
    id: payload.id,
    role: payload.role,
    clinicId: payload.clinicId ?? null,
    username: payload.sub
  }
}

export const useAuthStore = defineStore('auth', () => {
  const savedUser = (() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })()
  const user = ref(savedUser)

  const isAuthenticated = computed(() => !!user.value)
  const isSuper         = computed(() => user.value?.role === 'SUPERADMIN')
  const clinicId        = computed(() => user.value?.clinicId)

  async function login(username, password) {
    const data = await adminLogin({ username, password })
    // Extract user info from the JWT in the response body (cookie is set by the browser)
    user.value = extractUserFromToken(data.token) || { name: data.name, role: data.role, clinicId: data.clinicId }
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
  }

  async function logout() {
    try { await adminLogout() } catch { /* ignore */ }
    user.value = null
    localStorage.removeItem(USER_KEY)
  }

  function clearSession() {
    user.value = null
    localStorage.removeItem(USER_KEY)
  }

  return { user, isAuthenticated, isSuper, clinicId, login, logout, clearSession }
})
