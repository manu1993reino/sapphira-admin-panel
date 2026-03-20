<script setup>
import { ref, onMounted } from 'vue'
import { getRewards, createReward, updateReward, deleteReward, markRedemptionUsed } from '@/services/api'

const rewards   = ref([])
const loading   = ref(false)
const error     = ref('')

// Modal
const modal    = ref(null) // null | { mode: 'create'|'edit', data }
const form     = ref({})
const modalErr = ref('')
const saving   = ref(false)

async function loadRewards() {
  loading.value = true
  error.value = ''
  try {
    rewards.value = await getRewards()
  } catch {
    error.value = 'Error al cargar recompensas'
  } finally {
    loading.value = false
  }
}

onMounted(loadRewards)

function openCreate() {
  form.value = { name: '', description: '', pointsCost: '', minLevel: 'BRONCE', active: true }
  modal.value = { mode: 'create' }
  modalErr.value = ''
}

function openEdit(r) {
  form.value = { ...r }
  modal.value = { mode: 'edit', id: r.id }
  modalErr.value = ''
}

function closeModal() { modal.value = null }

async function submitForm() {
  if (!form.value.name || !form.value.pointsCost) {
    modalErr.value = 'Nombre y coste en puntos son obligatorios'
    return
  }
  saving.value = true
  modalErr.value = ''
  try {
    const body = { ...form.value, pointsCost: Number(form.value.pointsCost) }
    if (modal.value.mode === 'create') {
      await createReward(body)
    } else {
      await updateReward(modal.value.id, body)
    }
    await loadRewards()
    closeModal()
  } catch (e) {
    modalErr.value = e.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('¿Eliminar esta recompensa?')) return
  try {
    await deleteReward(id)
    await loadRewards()
  } catch {
    error.value = 'Error al eliminar'
  }
}

const levels = ['BRONCE', 'PLATA', 'ORO', 'DIAMANTE']
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Recompensas</h1>
        <p class="page-subtitle">Gestión del catálogo de canjes</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">+ Nueva recompensa</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div v-if="loading" style="color:var(--dim)">Cargando...</div>
    <div v-else class="card">
      <div v-if="!rewards.length" style="color:var(--dim)">No hay recompensas configuradas</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Recompensa</th>
              <th>Coste</th>
              <th>Nivel mínimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rewards" :key="r.id">
              <td>
                <div style="font-weight:500">{{ r.name }}</div>
                <div v-if="r.description" style="color:var(--dim);font-size:12px">{{ r.description }}</div>
              </td>
              <td><span style="color:var(--gold);font-weight:600">{{ r.pointsCost }} pts</span></td>
              <td>{{ r.minLevel }}</td>
              <td>
                <span :class="r.active ? 'badge badge-green' : 'badge badge-gray'">
                  {{ r.active ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-sm btn-secondary" @click="openEdit(r)">Editar</button>
                  <button class="btn btn-sm btn-danger"    @click="handleDelete(r.id)">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2 class="modal-title">{{ modal.mode === 'create' ? 'Nueva recompensa' : 'Editar recompensa' }}</h2>
        <div v-if="modalErr" class="alert alert-error">{{ modalErr }}</div>
        <div class="form-group">
          <label class="form-label">Nombre</label>
          <input v-model="form.name" class="form-input" placeholder="Diagnóstico Facial Premium" />
        </div>
        <div class="form-group">
          <label class="form-label">Descripción (opcional)</label>
          <input v-model="form.description" class="form-input" placeholder="Breve descripción..." />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Coste en puntos</label>
            <input v-model="form.pointsCost" class="form-input" type="number" min="1" placeholder="200" />
          </div>
          <div class="form-group">
            <label class="form-label">Nivel mínimo</label>
            <select v-model="form.minLevel" class="form-input">
              <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input type="checkbox" v-model="form.active" />
            <span class="form-label" style="margin:0">Activa</span>
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitForm">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
