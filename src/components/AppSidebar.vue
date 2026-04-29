<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { getAllClinics } from '@/services/api'

const auth   = useAuthStore()
const router = useRouter()

const clinics = ref([])

onMounted(async () => {
  if (auth.isSuper) {
    try { clinics.value = await getAllClinics() } catch { /* ignore */ }
  }
})

function onClinicChange(e) {
  const id = Number(e.target.value)
  const clinic = clinics.value.find(c => c.id === id)
  if (clinic) auth.selectClinic({ id: clinic.id, name: clinic.name })
}

const mainLinks = [
  { to: '/dashboard',    icon: '◈', label: 'Dashboard' },
  { to: '/users',        icon: '◉', label: 'Clientes' },
  { to: '/codes',        icon: '⌗', label: 'Códigos' },
  { to: '/rewards',      icon: '✦', label: 'Recompensas' },
  { to: '/redemptions',  icon: '↩', label: 'Canjes' },
]

const contentLinks = [
  { to: '/clinic-config', icon: '⚙', label: 'Config clínica' },
  { to: '/team',          icon: '☺', label: 'Equipo' },
  { to: '/categories',    icon: '▤', label: 'Categorías' },
  { to: '/promotions',    icon: '★', label: 'Promociones' },
  { to: '/testimonials',  icon: '❝', label: 'Testimonios' },
  { to: '/gallery',       icon: '◫', label: 'Galería' },
  { to: '/blog',          icon: '✎', label: 'Blog' },
  { to: '/hours',         icon: '◷', label: 'Horarios' },
]

const superLinks = [
  { to: '/clinics', icon: '⬡', label: 'Clínicas' },
  { to: '/admins',  icon: '◎', label: 'Admins' },
]

async function logout() {
  await auth.logout()
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
      <template v-if="auth.isSuper">
        <div class="clinic-selector">
          <label class="clinic-selector-label">Gestionando clínica</label>
          <select
            class="clinic-select"
            :value="auth.selectedClinic?.id ?? ''"
            @change="onClinicChange"
          >
            <option value="" disabled>Seleccionar clínica...</option>
            <option v-for="c in clinics" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </template>

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

      <div class="nav-section-label">Contenido</div>
      <RouterLink
        v-for="link in contentLinks"
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

.clinic-selector {
  padding: 0 8px 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
}
.clinic-selector-label {
  display: block; color: var(--dim); font-size: 10px; font-weight: 600;
  letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;
}
.clinic-select {
  width: 100%; padding: 7px 10px; border-radius: 8px;
  background: var(--bg3); border: 1px solid var(--border);
  color: var(--gold); font-size: 13px; cursor: pointer;
}
.clinic-select:focus { outline: none; border-color: var(--gold); }
.clinic-select option { background: var(--bg2); color: var(--text); }

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
