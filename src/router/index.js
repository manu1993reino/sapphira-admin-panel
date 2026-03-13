import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'users',     component: () => import('@/views/UsersView.vue') },
      { path: 'codes',     component: () => import('@/views/CodesView.vue') },
      { path: 'rewards',   component: () => import('@/views/RewardsView.vue') },
      // SuperAdmin only
      { path: 'clinics',   component: () => import('@/views/superadmin/ClinicsView.vue'), meta: { superOnly: true } },
      { path: 'admins',    component: () => import('@/views/superadmin/AdminsView.vue'),  meta: { superOnly: true } },
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
  if (!to.meta.public && !auth.isAuthenticated) return '/login'
  if (to.path === '/login' && auth.isAuthenticated) return '/dashboard'
  if (to.meta.superOnly && !auth.isSuper) return '/dashboard'
})

export default router
