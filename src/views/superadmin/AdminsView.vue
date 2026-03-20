<script setup>
import { ref, onMounted, watch } from 'vue'
import { getAllClinics, getAdminsByClinic, createAdmin, toggleAdminActive, resetAdminPassword } from '@/services/api'

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
const showCreatePwd = ref(false)
const showResetPwd  = ref(false)

onMounted(async () => {
  try {
    clinics.value = await getAllClinics()
    if (clinics.value.length) selClinic.value = clinics.value[0].id
  } catch {
    error.value = 'Error al cargar clínicas'
  }
})

watch(selClinic, async (id) => {
  if (!id) return
  loading.value = true
  try {
    admins.value = await getAdminsByClinic(id)
  } catch {
    error.value = 'Error al cargar admins'
  } finally {
    loading.value = false
  }
})

function openCreate() {
  form.value = { username: '', password: '', clinicId: selClinic.value || '' }
  createErr.value = ''
  showCreatePwd.value = false
  createModal.value = true
}

function validatePassword(pwd) {
  if (pwd.length < 8) return 'Mínimo 8 caracteres'
  if (!/[A-Z]/.test(pwd)) return 'Debe contener al menos una mayúscula'
  if (!/[a-z]/.test(pwd)) return 'Debe contener al menos una minúscula'
  if (!/[0-9]/.test(pwd)) return 'Debe contener al menos un número'
  if (!/[^A-Za-z0-9]/.test(pwd)) return 'Debe contener al menos un símbolo'
  return null
}

async function submitCreate() {
  if (!form.value.username.trim() || !form.value.password || !form.value.clinicId) {
    createErr.value = 'Todos los campos son obligatorios'
    return
  }
  const pwdErr = validatePassword(form.value.password)
  if (pwdErr) {
    createErr.value = pwdErr
    return
  }
  saving.value = true
  createErr.value = ''
  try {
    await createAdmin({ ...form.value, clinicId: Number(form.value.clinicId) })
    admins.value = await getAdminsByClinic(selClinic.value)
    createModal.value = false
  } catch (e) {
    createErr.value = e.message || 'Error al crear'
  } finally {
    saving.value = false
  }
}

async function handleToggle(id) {
  try {
    await toggleAdminActive(id)
    admins.value = await getAdminsByClinic(selClinic.value)
  } catch {
    error.value = 'Error al cambiar estado'
  }
}

function openReset(admin) {
  resetModal.value = { admin }
  newPassword.value = ''
  resetErr.value = ''
  showResetPwd.value = false
}

async function submitReset() {
  const pwdErr = validatePassword(newPassword.value)
  if (pwdErr) {
    resetErr.value = pwdErr
    return
  }
  resetting.value = true
  resetErr.value = ''
  try {
    await resetAdminPassword(resetModal.value.admin.id, { password: newPassword.value })
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
          <div style="position:relative">
            <input v-model="form.password" class="form-input" :type="showCreatePwd ? 'text' : 'password'" placeholder="Mínimo 8 caracteres" style="padding-right:48px" />
            <button type="button" class="eye-btn" @click="showCreatePwd = !showCreatePwd" :aria-label="showCreatePwd ? 'Ocultar' : 'Mostrar'">{{ showCreatePwd ? '🙈' : '👁' }}</button>
          </div>
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
          <div style="position:relative">
            <input v-model="newPassword" class="form-input" :type="showResetPwd ? 'text' : 'password'" placeholder="Mínimo 8 caracteres" style="padding-right:48px" />
            <button type="button" class="eye-btn" @click="showResetPwd = !showResetPwd" :aria-label="showResetPwd ? 'Ocultar' : 'Mostrar'">{{ showResetPwd ? '🙈' : '👁' }}</button>
          </div>
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
