<script setup>
import { ref, onMounted } from 'vue'
import { getAllClinics, createClinic, toggleClinicActive } from '@/services/api'

const clinics = ref([])
const loading = ref(false)
const error   = ref('')

// Modal crear
const showModal = ref(false)
const form      = ref({ name: '', shortName: '', city: '', themeColor: '#C8A96E' })
const modalErr  = ref('')
const saving    = ref(false)

async function loadClinics() {
  loading.value = true
  error.value = ''
  try {
    clinics.value = await getAllClinics()
  } catch {
    error.value = 'Error al cargar clínicas'
  } finally {
    loading.value = false
  }
}

onMounted(loadClinics)

function openModal() {
  form.value   = { name: '', shortName: '', city: '', themeColor: '#C8A96E' }
  modalErr.value = ''
  showModal.value = true
}

async function submitCreate() {
  if (!form.value.name.trim() || !form.value.city.trim()) {
    modalErr.value = 'Nombre y ciudad son obligatorios'
    return
  }
  saving.value = true
  modalErr.value = ''
  try {
    await createClinic(form.value)
    await loadClinics()
    showModal.value = false
  } catch (e) {
    modalErr.value = e.message || 'Error al crear'
  } finally {
    saving.value = false
  }
}

async function handleToggle(id) {
  try {
    await toggleClinicActive(id)
    await loadClinics()
  } catch {
    error.value = 'Error al cambiar estado'
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Clínicas</h1>
        <p class="page-subtitle">Red Sapphira Privé</p>
      </div>
      <button class="btn btn-primary" @click="openModal">+ Nueva clínica</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <div v-else class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Clínica</th><th>Ciudad</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="c in clinics" :key="c.id">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;flex-shrink:0"
                       :style="{ background: c.themeColor || '#C8A96E' }">
                    {{ (c.shortName || c.name)[0] }}
                  </div>
                  <div>
                    <div style="font-weight:500">{{ c.name }}</div>
                    <div v-if="c.shortName" style="color:var(--dim);font-size:12px">{{ c.shortName }}</div>
                  </div>
                </div>
              </td>
              <td style="color:var(--dim)">{{ c.city }}</td>
              <td>
                <span :class="c.active !== false ? 'badge badge-green' : 'badge badge-red'">
                  {{ c.active !== false ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-secondary" @click="handleToggle(c.id)">
                  {{ c.active !== false ? 'Desactivar' : 'Activar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2 class="modal-title">Nueva clínica</h2>
        <div v-if="modalErr" class="alert alert-error">{{ modalErr }}</div>
        <div class="form-group">
          <label class="form-label">Nombre completo</label>
          <input v-model="form.name" class="form-input" placeholder="Sapphira Privé Madrid Centro" />
        </div>
        <div class="form-group">
          <label class="form-label">Nombre corto</label>
          <input v-model="form.shortName" class="form-input" placeholder="Madrid Centro" />
        </div>
        <div class="form-group">
          <label class="form-label">Ciudad</label>
          <input v-model="form.city" class="form-input" placeholder="Madrid" />
        </div>
        <div class="form-group">
          <label class="form-label">Color de marca</label>
          <input v-model="form.themeColor" class="form-input" type="color" style="height:44px;padding:4px" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitCreate">
            {{ saving ? 'Creando...' : 'Crear clínica' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
