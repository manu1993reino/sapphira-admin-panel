const BASE = import.meta.env.VITE_API_URL || ''

let onUnauthorized = null

export function setOnUnauthorized(callback) {
  onUnauthorized = callback
}

async function request(path, options = {}) {
  const { headers: optHeaders, ...rest } = options
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...optHeaders },
    ...rest,
  })
  if (res.status === 401) {
    if (onUnauthorized) onUnauthorized()
    throw new Error('401')
  }
  if (res.status === 403) throw new Error('403')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// Auth
export const adminLogin = (body) =>
  request('/api/v1/auth/admin/login', { method: 'POST', body: JSON.stringify(body) })

export const adminLogout = () =>
  request('/api/v1/auth/logout', { method: 'POST' })

// Stats
export const getClinicStats = () =>
  request('/api/v1/admin/stats')

export const getGlobalStats = () =>
  request('/api/v1/superadmin/stats')

// Users
export const searchUsers = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request(`/api/v1/admin/users?${qs}`)
}

export const assignPoints = (userClinicId, body) =>
  request(`/api/v1/admin/users/${userClinicId}/points`, {
    method: 'POST', body: JSON.stringify(body)
  })

export const deductPoints = (userClinicId, body) =>
  request(`/api/v1/admin/users/${userClinicId}/points/deduct`, {
    method: 'POST', body: JSON.stringify(body)
  })

export const getUserPointsHistory = (userClinicId) =>
  request(`/api/v1/admin/users/${userClinicId}/points`)

// Codes
export const generateCodes = (body) =>
  request('/api/v1/admin/codes/generate', {
    method: 'POST', body: JSON.stringify(body)
  })

export const getCodes = (activeOnly = false) =>
  request(`/api/v1/admin/codes?activeOnly=${activeOnly}`)

// Rewards
export const getRewards = () =>
  request('/api/v1/admin/rewards')

export const createReward = (body) =>
  request('/api/v1/admin/rewards', {
    method: 'POST', body: JSON.stringify(body)
  })

export const updateReward = (id, body) =>
  request(`/api/v1/admin/rewards/${id}`, {
    method: 'PUT', body: JSON.stringify(body)
  })

export const deleteReward = (id) =>
  request(`/api/v1/admin/rewards/${id}`, {
    method: 'DELETE',
  })

export const getRedemptions = () =>
  request('/api/v1/admin/redemptions')

export const markRedemptionUsed = (id) =>
  request(`/api/v1/admin/redemptions/${id}/use`, {
    method: 'PUT',
  })

// Clinic Config
export const getClinicConfig = (clinicId) =>
  request(`/api/v1/clinic/${clinicId}/config`)

export const updateClinicConfig = (body) =>
  request('/api/v1/admin/clinic', { method: 'PUT', body: JSON.stringify(body) })

// Hours
export const updateHours = (body) =>
  request('/api/v1/admin/hours', { method: 'PUT', body: JSON.stringify(body) })

// Team
export const createTeamMember = (body) =>
  request('/api/v1/admin/team', { method: 'POST', body: JSON.stringify(body) })

export const updateTeamMember = (id, body) =>
  request(`/api/v1/admin/team/${id}`, { method: 'PUT', body: JSON.stringify(body) })

export const deleteTeamMember = (id) =>
  request(`/api/v1/admin/team/${id}`, { method: 'DELETE' })

// Categories
export const createCategory = (body) =>
  request('/api/v1/admin/categories', { method: 'POST', body: JSON.stringify(body) })

export const updateCategory = (id, body) =>
  request(`/api/v1/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) })

export const deleteCategory = (id) =>
  request(`/api/v1/admin/categories/${id}`, { method: 'DELETE' })

// Treatments
export const createTreatment = (body) =>
  request('/api/v1/admin/treatments', { method: 'POST', body: JSON.stringify(body) })

export const updateTreatment = (id, body) =>
  request(`/api/v1/admin/treatments/${id}`, { method: 'PUT', body: JSON.stringify(body) })

export const deleteTreatment = (id) =>
  request(`/api/v1/admin/treatments/${id}`, { method: 'DELETE' })

// Promotions
export const createPromotion = (body) =>
  request('/api/v1/admin/promotions', { method: 'POST', body: JSON.stringify(body) })

export const updatePromotion = (id, body) =>
  request(`/api/v1/admin/promotions/${id}`, { method: 'PUT', body: JSON.stringify(body) })

export const deletePromotion = (id) =>
  request(`/api/v1/admin/promotions/${id}`, { method: 'DELETE' })

// Testimonials
export const createTestimonial = (body) =>
  request('/api/v1/admin/testimonials', { method: 'POST', body: JSON.stringify(body) })

export const updateTestimonial = (id, body) =>
  request(`/api/v1/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(body) })

export const deleteTestimonial = (id) =>
  request(`/api/v1/admin/testimonials/${id}`, { method: 'DELETE' })

// Gallery
export const createGalleryItem = (body) =>
  request('/api/v1/admin/gallery', { method: 'POST', body: JSON.stringify(body) })

export const updateGalleryItem = (id, body) =>
  request(`/api/v1/admin/gallery/${id}`, { method: 'PUT', body: JSON.stringify(body) })

export const deleteGalleryItem = (id) =>
  request(`/api/v1/admin/gallery/${id}`, { method: 'DELETE' })

// Blog
export const createBlogPost = (body) =>
  request('/api/v1/admin/blog', { method: 'POST', body: JSON.stringify(body) })

export const updateBlogPost = (id, body) =>
  request(`/api/v1/admin/blog/${id}`, { method: 'PUT', body: JSON.stringify(body) })

export const deleteBlogPost = (id) =>
  request(`/api/v1/admin/blog/${id}`, { method: 'DELETE' })

// SuperAdmin — Clinics
export const getAllClinics = () =>
  request('/api/v1/superadmin/clinics')

export const createClinic = (body) =>
  request('/api/v1/superadmin/clinics', {
    method: 'POST', body: JSON.stringify(body)
  })

export const toggleClinicActive = (id) =>
  request(`/api/v1/superadmin/clinics/${id}/toggle`, {
    method: 'PATCH',
  })

// SuperAdmin — Admins
export const getAdminsByClinic = (clinicId) =>
  request(`/api/v1/superadmin/clinics/${clinicId}/admins`)

export const createAdmin = (body) =>
  request('/api/v1/superadmin/admins', {
    method: 'POST', body: JSON.stringify(body)
  })

export const toggleAdminActive = (id) =>
  request(`/api/v1/superadmin/admins/${id}/toggle`, {
    method: 'PATCH',
  })

export const resetAdminPassword = (id, body) =>
  request(`/api/v1/superadmin/admins/${id}/password`, {
    method: 'PATCH', body: JSON.stringify(body)
  })
