<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { searchUsers, assignPoints, deductPoints } from '@/services/api'

const auth    = useAuthStore()
const users   = ref([])
const search  = ref('')
const loading = ref(false)
const error   = ref('')

// Points modal
const modal     = ref(null) // null | { user, mode: 'assign'|'deduct' }
const points    = ref('')
const reason    = ref('')
const modalErr  = ref('')
const saving    = ref(false)

async function loadUsers() {
  loading.value = true
  error.value   = ''
  try {
    users.value = await searchUsers(auth.token, { search: search.value })
  } catch {
    error.value = 'Error al cargar clientes'
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)

function openModal(user, mode) {
  modal.value   = { user, mode }
  points.value  = ''
  reason.value  = ''
  modalErr.value = ''
}

function closeModal() { modal.value = null }

async function submitPoints() {
  if (!points.value || isNaN(points.value) || Number(points.value) <= 0) {
    modalErr.value = 'Introduce un número válido de puntos'
    return
  }
  saving.value = true
  modalErr.value = ''
  try {
    const body = { points: Number(points.value), reason: reason.value || undefined }
    const fn   = modal.value.mode === 'assign' ? assignPoints : deductPoints
    const updated = await fn(auth.token, modal.value.user.userClinicId, body)
    // Update user in list
    const idx = users.value.findIndex(u => u.userClinicId === modal.value.user.userClinicId)
    if (idx !== -1) users.value[idx] = updated
    closeModal()
  } catch (e) {
    modalErr.value = e.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

const levelColors = { BRONCE: '#CD7F32', PLATA: '#C0C0C0', ORO: '#C8A96E', DIAMANTE: '#B9F2FF' }
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Clientes</h1>
        <p class="page-subtitle">Gestión de puntos y niveles</p>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div style="display:flex;gap:12px">
        <input
          v-model="search"
          class="form-input"
          placeholder="Buscar por nombre o email..."
          style="max-width:360px"
          @keyup.enter="loadUsers"
        />
        <button class="btn btn-primary" @click="loadUsers">Buscar</button>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="card">
      <div v-if="loading" style="color:var(--dim);padding:20px 0">Cargando...</div>
      <div v-else-if="!users.length" style="color:var(--dim);padding:20px 0">No se encontraron clientes</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Nivel</th>
              <th>Puntos totales</th>
              <th>Disponibles</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.userClinicId">
              <td>
                <div style="font-weight:500">{{ u.name }}</div>
                <div style="color:var(--dim);font-size:12px">{{ u.email }}</div>
              </td>
              <td>
                <span class="badge" :style="{ color: levelColors[u.level], background: levelColors[u.level] + '22' }">
                  {{ u.level }}
                </span>
              </td>
              <td>{{ u.totalPoints?.toLocaleString() }}</td>
              <td>{{ u.availablePoints?.toLocaleString() }}</td>
              <td>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-sm btn-secondary" @click="openModal(u, 'assign')">+ Puntos</button>
                  <button class="btn btn-sm btn-danger"    @click="openModal(u, 'deduct')">− Puntos</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal puntos -->
    <div v-if="modal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2 class="modal-title">
          {{ modal.mode === 'assign' ? 'Asignar puntos' : 'Restar puntos' }} — {{ modal.user.name }}
        </h2>
        <div v-if="modalErr" class="alert alert-error">{{ modalErr }}</div>
        <div class="form-group">
          <label class="form-label">Puntos</label>
          <input v-model="points" class="form-input" type="number" min="1" placeholder="50" />
        </div>
        <div class="form-group">
          <label class="form-label">Motivo (opcional)</label>
          <input v-model="reason" class="form-input" type="text" placeholder="Tratamiento facial" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitPoints">
            {{ saving ? 'Guardando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
