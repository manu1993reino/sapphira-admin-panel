<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getClinicStats, getGlobalStats } from '@/services/api'

const auth    = useAuthStore()
const stats   = ref(null)
const loading = ref(true)
const error   = ref('')

onMounted(async () => {
  if (!auth.isAuthenticated) return
  try {
    stats.value = auth.isSuper
      ? await getGlobalStats()
      : await getClinicStats()
  } catch (e) {
    if (auth.isAuthenticated) error.value = 'No se pudieron cargar las estadísticas'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Resumen de actividad</p>
      </div>
    </div>

    <div v-if="loading" style="color:var(--dim)">Cargando...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    <template v-else-if="stats">
      <!-- SuperAdmin stats -->
      <template v-if="auth.isSuper">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalClinics ?? '—' }}</div>
            <div class="stat-label">Clínicas activas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalUsers ?? '—' }}</div>
            <div class="stat-label">Usuarios totales</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalPoints?.toLocaleString() ?? '—' }}</div>
            <div class="stat-label">Puntos emitidos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.pendingRedemptions ?? '—' }}</div>
            <div class="stat-label">Canjes pendientes</div>
          </div>
        </div>
      </template>

      <!-- Clinic admin stats -->
      <template v-else>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalUsers ?? '—' }}</div>
            <div class="stat-label">Clientes vinculados</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalPointsIssued?.toLocaleString() ?? '—' }}</div>
            <div class="stat-label">Puntos emitidos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.activeRewards ?? '—' }}</div>
            <div class="stat-label">Recompensas activas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.pendingRedemptions ?? '—' }}</div>
            <div class="stat-label">Canjes pendientes</div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
