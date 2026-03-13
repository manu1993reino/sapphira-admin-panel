const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const { headers: optHeaders, ...rest } = options
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...optHeaders },
    ...rest,
  })
  if (res.status === 401) throw new Error('401')
  if (res.status === 403) throw new Error('403')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

// Auth
export const adminLogin = (body) =>
  request('/api/v1/auth/admin/login', { method: 'POST', body: JSON.stringify(body) })

// Stats
export const getClinicStats = (token) =>
  request('/api/v1/admin/stats', { headers: authHeaders(token) })

export const getGlobalStats = (token) =>
  request('/api/v1/superadmin/stats', { headers: authHeaders(token) })

// Users
export const searchUsers = (token, params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request(`/api/v1/admin/users?${qs}`, { headers: authHeaders(token) })
}

export const assignPoints = (token, userClinicId, body) =>
  request(`/api/v1/admin/users/${userClinicId}/points`, {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(body)
  })

export const deductPoints = (token, userClinicId, body) =>
  request(`/api/v1/admin/users/${userClinicId}/points/deduct`, {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(body)
  })

export const getUserPointsHistory = (token, userClinicId) =>
  request(`/api/v1/admin/users/${userClinicId}/points`, { headers: authHeaders(token) })

// Codes
export const generateCodes = (token, body) =>
  request('/api/v1/admin/codes/generate', {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(body)
  })

export const getCodes = (token, activeOnly = false) =>
  request(`/api/v1/admin/codes?activeOnly=${activeOnly}`, { headers: authHeaders(token) })

// Rewards
export const getRewards = (token) =>
  request('/api/v1/admin/rewards', { headers: authHeaders(token) })  // NOTE: adjust if endpoint differs

export const createReward = (token, body) =>
  request('/api/v1/admin/rewards', {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(body)
  })

export const updateReward = (token, id, body) =>
  request(`/api/v1/admin/rewards/${id}`, {
    method: 'PUT', headers: authHeaders(token), body: JSON.stringify(body)
  })

export const deleteReward = (token, id) =>
  request(`/api/v1/admin/rewards/${id}`, {
    method: 'DELETE', headers: authHeaders(token)
  })

export const getRedemptions = (token) =>
  request('/api/v1/admin/redemptions', { headers: authHeaders(token) })

export const markRedemptionUsed = (token, id) =>
  request(`/api/v1/admin/redemptions/${id}/use`, {
    method: 'PUT', headers: authHeaders(token)
  })

// SuperAdmin — Clinics
export const getAllClinics = (token) =>
  request('/api/v1/superadmin/clinics', { headers: authHeaders(token) })

export const createClinic = (token, body) =>
  request('/api/v1/superadmin/clinics', {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(body)
  })

export const toggleClinicActive = (token, id) =>
  request(`/api/v1/superadmin/clinics/${id}/toggle-active`, {
    method: 'PUT', headers: authHeaders(token)
  })

// SuperAdmin — Admins
export const getAdminsByClinic = (token, clinicId) =>
  request(`/api/v1/superadmin/clinics/${clinicId}/admins`, { headers: authHeaders(token) })

export const createAdmin = (token, body) =>
  request('/api/v1/superadmin/admins', {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(body)
  })

export const toggleAdminActive = (token, id) =>
  request(`/api/v1/superadmin/admins/${id}/toggle-active`, {
    method: 'PUT', headers: authHeaders(token)
  })

export const resetAdminPassword = (token, id, body) =>
  request(`/api/v1/superadmin/admins/${id}/reset-password`, {
    method: 'PUT', headers: authHeaders(token), body: JSON.stringify(body)
  })
