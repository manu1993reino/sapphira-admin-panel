<script setup>
import { ref, onMounted } from 'vue'
import { getRedemptions, markRedemptionUsed } from '@/services/api'

const redemptions = ref([])
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    redemptions.value = await getRedemptions()
  } catch {
    error.value = 'Error al cargar canjes'
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function handleUse(id) {
  try {
    await markRedemptionUsed(id)
    await load()
  } catch {
    error.value = 'Error al marcar como usado'
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const statusBadge = (s) => ({
  PENDING: 'badge badge-gold',
  USED: 'badge badge-green',
  EXPIRED: 'badge badge-red',
})[s] || 'badge badge-gray'

const statusLabel = (s) => ({
  PENDING: 'Pendiente',
  USED: 'Usado',
  EXPIRED: 'Expirado',
})[s] || s
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Canjes</h1>
        <p class="page-subtitle">Gestiona las redenciones de recompensas</p>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <div v-else class="card">
      <div v-if="!redemptions.length" style="color:var(--dim)">No hay canjes registrados</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Recompensa</th>
              <th>Puntos</th>
              <th>Codigo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in redemptions" :key="r.id">
              <td style="font-weight:500">{{ r.rewardName }}</td>
              <td><span style="color:var(--gold);font-weight:600">{{ r.pointsSpent }} pts</span></td>
              <td><code style="color:var(--gold);letter-spacing:1px">{{ r.code }}</code></td>
              <td style="color:var(--dim)">{{ formatDate(r.createdAt) }}</td>
              <td><span :class="statusBadge(r.status)">{{ statusLabel(r.status) }}</span></td>
              <td>
                <button
                  v-if="r.status === 'PENDING'"
                  class="btn btn-sm btn-primary"
                  @click="handleUse(r.id)"
                >Marcar usado</button>
                <span v-else-if="r.status === 'USED'" style="color:var(--dim);font-size:12px">{{ formatDate(r.usedAt) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
