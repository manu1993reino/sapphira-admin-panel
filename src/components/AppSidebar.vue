<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()

const mainLinks = [
  { to: '/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/users',     icon: '◉', label: 'Clientes' },
  { to: '/codes',     icon: '⌗', label: 'Códigos' },
  { to: '/rewards',   icon: '✦', label: 'Recompensas' },
]

const superLinks = [
  { to: '/clinics', icon: '⬡', label: 'Clínicas' },
  { to: '/admins',  icon: '◎', label: 'Admins' },
]

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <span class="logo-text">Sapphira</span>
      <span class="logo-sub">Panel Admin</span>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="link in mainLinks"
        :key="link.to"
        :to="link.to"
        class="nav-link"
        active-class="nav-link--active"
      >
        <span class="nav-icon">{{ link.icon }}</span>
        {{ link.label }}
      </RouterLink>

      <template v-if="auth.isSuper">
        <div class="nav-section-label">SuperAdmin</div>
        <RouterLink
          v-for="link in superLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          active-class="nav-link--active"
        >
          <span class="nav-icon">{{ link.icon }}</span>
          {{ link.label }}
        </RouterLink>
      </template>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <span class="user-name">{{ auth.user?.username }}</span>
        <span class="user-role">{{ auth.user?.role }}</span>
      </div>
      <button class="logout-btn" @click="logout">Salir</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-logo {
  padding: 24px 20px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}
.logo-text { color: var(--gold); font-size: 18px; font-weight: 700; letter-spacing: 1px; }
.logo-sub  { color: var(--dim); font-size: 11px; margin-top: 2px; letter-spacing: 0.5px; }

.sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }

.nav-link {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 8px;
  color: var(--dim); font-size: 14px;
  transition: all 0.15s;
}
.nav-link:hover { color: var(--text); background: var(--bg3); }
.nav-link--active { color: var(--gold); background: rgba(200,169,110,0.1); }
.nav-icon { font-size: 16px; width: 18px; text-align: center; }

.nav-section-label {
  color: var(--dim); font-size: 10px; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: 14px 12px 6px;
}

.sidebar-footer {
  padding: 16px; border-top: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.sidebar-user { display: flex; flex-direction: column; }
.user-name { color: var(--text); font-size: 13px; font-weight: 500; }
.user-role { color: var(--dim); font-size: 11px; margin-top: 1px; }
.logout-btn {
  background: none; border: 1px solid var(--border);
  color: var(--dim); padding: 5px 10px; border-radius: 6px; font-size: 12px;
}
.logout-btn:hover { color: var(--danger); border-color: var(--danger); }
</style>
