<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getClinicConfig, createTeamMember, updateTeamMember, deleteTeamMember } from '@/services/api'

const auth = useAuthStore()
const members = ref([])
const loading = ref(false)
const error = ref('')

const modal = ref(null)
const form = ref({})
const modalErr = ref('')
const saving = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const config = await getClinicConfig()
    members.value = config.team || []
  } catch {
    error.value = 'Error al cargar equipo'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openCreate() {
  form.value = { name: '', role: '', tag: '', initials: '', color: '#C8A96E', photoUrl: '', experience: '', bio: '', sortOrder: 0, specialties: '' }
  modal.value = { mode: 'create' }
  modalErr.value = ''
}

function openEdit(m) {
  form.value = { ...m, specialties: (m.specialties || []).map(s => s.name || s).join(', ') }
  modal.value = { mode: 'edit', id: m.id }
  modalErr.value = ''
}

function closeModal() { modal.value = null }

async function submitForm() {
  if (!form.value.name?.trim()) { modalErr.value = 'El nombre es obligatorio'; return }
  saving.value = true
  modalErr.value = ''
  try {
    const body = {
      ...form.value,
      sortOrder: Number(form.value.sortOrder) || 0,
      specialties: form.value.specialties ? form.value.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
    }
    if (modal.value.mode === 'create') {
      await createTeamMember(body)
    } else {
      await updateTeamMember(modal.value.id, body)
    }
    await load()
    closeModal()
  } catch (e) {
    modalErr.value = e.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('¿Eliminar este miembro?')) return
  try { await deleteTeamMember(id); await load() } catch { error.value = 'Error al eliminar' }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Equipo</h1>
        <p class="page-subtitle">Miembros del equipo de la clinica</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">+ Nuevo miembro</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <div v-else class="card">
      <div v-if="!members.length" style="color:var(--dim)">No hay miembros del equipo</div>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Rol</th><th>Tag</th><th>Acciones</th></tr></thead>
          <tbody>
            <tr v-for="m in members" :key="m.id">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;flex-shrink:0"
                       :style="{ background: m.color || '#C8A96E' }">
                    {{ m.initials || m.name?.charAt(0) }}
                  </div>
                  <span style="font-weight:500">{{ m.name }}</span>
                </div>
              </td>
              <td style="color:var(--dim)">{{ m.role }}</td>
              <td><span v-if="m.tag" class="badge badge-gold">{{ m.tag }}</span></td>
              <td>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-sm btn-secondary" @click="openEdit(m)">Editar</button>
                  <button class="btn btn-sm btn-danger" @click="handleDelete(m.id)">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2 class="modal-title">{{ modal.mode === 'create' ? 'Nuevo miembro' : 'Editar miembro' }}</h2>
        <div v-if="modalErr" class="alert alert-error">{{ modalErr }}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Nombre *</label><input v-model="form.name" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Rol</label><input v-model="form.role" class="form-input" placeholder="Directora medica" /></div>
          <div class="form-group"><label class="form-label">Tag</label><input v-model="form.tag" class="form-input" placeholder="Dra." /></div>
          <div class="form-group"><label class="form-label">Iniciales</label><input v-model="form.initials" class="form-input" placeholder="MC" /></div>
          <div class="form-group"><label class="form-label">Color</label><input v-model="form.color" class="form-input" type="color" style="height:44px;padding:4px" /></div>
          <div class="form-group"><label class="form-label">Orden</label><input v-model="form.sortOrder" class="form-input" type="number" /></div>
        </div>
        <div class="form-group"><label class="form-label">URL foto</label><input v-model="form.photoUrl" class="form-input" placeholder="https://..." /></div>
        <div class="form-group"><label class="form-label">Experiencia</label><input v-model="form.experience" class="form-input" placeholder="15 anos de experiencia" /></div>
        <div class="form-group"><label class="form-label">Bio</label><textarea v-model="form.bio" class="form-input" rows="3" style="resize:vertical"></textarea></div>
        <div class="form-group"><label class="form-label">Especialidades (separadas por coma)</label><input v-model="form.specialties" class="form-input" placeholder="Medicina estetica, Laser" /></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitForm">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
