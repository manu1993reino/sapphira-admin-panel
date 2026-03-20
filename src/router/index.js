import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { setOnUnauthorized } from '@/services/api'

const routes = [
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard',     component: () => import('@/views/DashboardView.vue') },
      { path: 'users',         component: () => import('@/views/UsersView.vue') },
      { path: 'codes',         component: () => import('@/views/CodesView.vue') },
      { path: 'rewards',       component: () => import('@/views/RewardsView.vue') },
      { path: 'redemptions',   component: () => import('@/views/RedemptionsView.vue') },
      // Content management
      { path: 'clinic-config', component: () => import('@/views/content/ClinicConfigView.vue') },
      { path: 'team',          component: () => import('@/views/content/TeamView.vue') },
      { path: 'categories',    component: () => import('@/views/content/CategoriesView.vue') },
      { path: 'promotions',    component: () => import('@/views/content/PromotionsView.vue') },
      { path: 'testimonials',  component: () => import('@/views/content/TestimonialsView.vue') },
      { path: 'gallery',       component: () => import('@/views/content/GalleryView.vue') },
      { path: 'blog',          component: () => import('@/views/content/BlogView.vue') },
      { path: 'hours',         component: () => import('@/views/content/HoursView.vue') },
      // SuperAdmin only
      { path: 'clinics',       component: () => import('@/views/superadmin/ClinicsView.vue'), meta: { superOnly: true } },
      { path: 'admins',        component: () => import('@/views/superadmin/AdminsView.vue'),  meta: { superOnly: true } },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Wire up auto-logout on 401 API responses (session expired)
  setOnUnauthorized(() => {
    auth.clearSession()
    router.push('/login?expired=1')
  })

  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)
  if (requiresAuth && !auth.isAuthenticated) return '/login'
  if (to.path === '/login' && auth.isAuthenticated) return '/dashboard'
  if (to.matched.some(r => r.meta.superOnly) && !auth.isSuper) return '/dashboard'
})

export default router
