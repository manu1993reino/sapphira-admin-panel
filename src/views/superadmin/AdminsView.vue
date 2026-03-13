<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getAllClinics, getAdminsByClinic, createAdmin, toggleAdminActive, resetAdminPassword } from '@/services/api'

const auth     = useAuthStore()
const clinics  = ref([])
const selClinic = ref(null)
const admins   = ref([])
const loading  = ref(false)
const error    = ref('')

// Modals
const createModal = ref(false)
const form        = ref({ username: '', password: '', clinicId: '' })
const createErr   = ref('')
const saving      = ref(false)

const resetModal  = ref(null) // { admin }
const newPassword = ref('')
const resetErr    = ref('')
const resetting   = ref(false)

onMounted(async () => {
  try {
    clinics.value = await getAllClinics(auth.token)
    if (clinics.value.length) selClinic.value = clinics.value[0].id
  } catch {
    error.value = 'Error al cargar clínicas'
  }
})

watch(selClinic, async (id) => {
  if (!id) return
  loading.value = true
  try {
    admins.value = await getAdminsByClinic(auth.token, id)
  } catch {
    error.value = 'Error al cargar admins'
  } finally {
    loading.value = false
  }
})

function openCreate() {
  form.value = { username: '', password: '', clinicId: selClinic.value || '' }
  createErr.value = ''
  createModal.value = true
}

async function submitCreate() {
  if (!form.value.username.trim() || !form.value.password || !form.value.clinicId) {
    createErr.value = 'Todos los campos son obligatorios'
    return
  }
  saving.value = true
  createErr.value = ''
  try {
    await createAdmin(auth.token, { ...form.value, clinicId: Number(form.value.clinicId) })
    admins.value = await getAdminsByClinic(auth.token, selClinic.value)
    createModal.value = false
  } catch (e) {
    createErr.value = e.message || 'Error al crear'
  } finally {
    saving.value = false
  }
}

async function handleToggle(id) {
  try {
    await toggleAdminActive(auth.token, id)
    admins.value = await getAdminsByClinic(auth.token, selClinic.value)
  } catch {
    error.value = 'Error al cambiar estado'
  }
}

function openReset(admin) {
  resetModal.value = { admin }
  newPassword.value = ''
  resetErr.value = ''
}

async function submitReset() {
  if (newPassword.value.length < 8) {
    resetErr.value = 'Mínimo 8 caracteres'
    return
  }
  resetting.value = true
  resetErr.value = ''
  try {
    await resetAdminPassword(auth.token, resetModal.value.admin.id, { newPassword: newPassword.value })
    resetModal.value = null
  } catch (e) {
    resetErr.value = e.message || 'Error al resetear'
  } finally {
    resetting.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Administradores</h1>
        <p class="page-subtitle">Gestión de acceso al panel</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">+ Nuevo admin</button>
    </div>

    <!-- Selector clínica -->
    <div class="card" style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:12px">
        <label class="form-label" style="margin:0;white-space:nowrap">Clínica:</label>
        <select v-model="selClinic" class="form-input" style="max-width:300px">
          <option v-for="c in clinics" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <div v-else class="card">
      <div v-if="!admins.length" style="color:var(--dim)">No hay admins en esta clínica</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="a in admins" :key="a.id">
              <td style="font-weight:500">{{ a.username }}</td>
              <td><span class="badge badge-gold">{{ a.role }}</span></td>
              <td>
                <span :class="a.active ? 'badge badge-green' : 'badge badge-red'">
                  {{ a.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-sm btn-secondary" @click="openReset(a)">Reset pwd</button>
                  <button class="btn btn-sm btn-danger"    @click="handleToggle(a.id)">
                    {{ a.active ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal crear admin -->
    <div v-if="createModal" class="modal-overlay" @click.self="createModal = false">
      <div class="modal">
        <h2 class="modal-title">Nuevo administrador</h2>
        <div v-if="createErr" class="alert alert-error">{{ createErr }}</div>
        <div class="form-group">
          <label class="form-label">Usuario (email)</label>
          <input v-model="form.username" class="form-input" type="email" placeholder="admin@miclinica" />
        </div>
        <div class="form-group">
          <label class="form-label">Contraseña inicial</label>
          <input v-model="form.password" class="form-input" type="password" placeholder="Mínimo 8 caracteres" />
        </div>
        <div class="form-group">
          <label class="form-label">Clínica</label>
          <select v-model="form.clinicId" class="form-input">
            <option value="">Selecciona clínica</option>
            <option v-for="c in clinics" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="createModal = false">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitCreate">
            {{ saving ? 'Creando...' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal reset password -->
    <div v-if="resetModal" class="modal-overlay" @click.self="resetModal = null">
      <div class="modal">
        <h2 class="modal-title">Resetear contraseña — {{ resetModal.admin.username }}</h2>
        <div v-if="resetErr" class="alert alert-error">{{ resetErr }}</div>
        <div class="form-group">
          <label class="form-label">Nueva contraseña</label>
          <input v-model="newPassword" class="form-input" type="password" placeholder="Mínimo 8 caracteres" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="resetModal = null">Cancelar</button>
          <button class="btn btn-primary" :disabled="resetting" @click="submitReset">
            {{ resetting ? 'Guardando...' : 'Resetear' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
