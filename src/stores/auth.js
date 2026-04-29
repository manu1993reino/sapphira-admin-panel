import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminLogin, adminLogout } from '@/services/api'

const USER_KEY = 'sapphira_admin_user'
const SELECTED_CLINIC_KEY = 'sapphira_admin_selected_clinic'

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
  const savedClinic = (() => {
    try { return JSON.parse(localStorage.getItem(SELECTED_CLINIC_KEY)) } catch { return null }
  })()

  const user = ref(savedUser)
  const selectedClinic = ref(savedClinic)

  const isAuthenticated = computed(() => !!user.value)
  const isSuper         = computed(() => user.value?.role === 'SUPERADMIN')
  const clinicId        = computed(() =>
    isSuper.value ? selectedClinic.value?.id ?? null : user.value?.clinicId
  )
  const needsClinicSelection = computed(() => isSuper.value && !selectedClinic.value)

  async function login(username, password) {
    const data = await adminLogin({ username, password })
    user.value = extractUserFromToken(data.token) || { name: data.name, role: data.role, clinicId: data.clinicId }
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
  }

  function selectClinic(clinic) {
    selectedClinic.value = clinic
    localStorage.setItem(SELECTED_CLINIC_KEY, JSON.stringify(clinic))
  }

  function clearClinicSelection() {
    selectedClinic.value = null
    localStorage.removeItem(SELECTED_CLINIC_KEY)
  }

  async function logout() {
    try { await adminLogout() } catch { /* ignore */ }
    user.value = null
    selectedClinic.value = null
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(SELECTED_CLINIC_KEY)
  }

  function clearSession() {
    user.value = null
    selectedClinic.value = null
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(SELECTED_CLINIC_KEY)
  }

  return {
    user, isAuthenticated, isSuper, clinicId,
    selectedClinic, needsClinicSelection,
    login, logout, clearSession,
    selectClinic, clearClinicSelection,
  }
})
